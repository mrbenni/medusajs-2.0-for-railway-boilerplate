import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { addToCartWorkflow } from "@medusajs/core-flows"
import { Modules } from "@medusajs/framework/utils"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const cartId = req.params.id
    const { variant_id, width, height, quantity, metadata, production_file } = req.body as any

    if (!variant_id || !width || !height) {
        return res.status(400).json({ message: "Missing required fields: variant_id, width, height" })
    }

    const query = req.scope.resolve("query")

    // Fetch the variant AND its parent product to safely read metadata from either
    const { data: [variant] } = await query.graph({
        entity: "variant",
        fields: ["id", "metadata", "product.metadata"],
        filters: { id: variant_id }
    })

    if (!variant) {
        return res.status(404).json({ message: "Variant not found" })
    }

    // Read new metadata key from Variant, fallback to Product metadata, default to 100 EUR
    const basePriceEur = Number(variant.metadata?.price_per_m2 || variant.product?.metadata?.price_per_m2) || 100

    // Calculate area in square meters (width and height are provided in cm)
    const areaInM2 = (width * height) / 10000

    // MEDUSA V2 CRITICAL FIX: Medusa V2 does NOT use cents. It uses exact decimal values.
    // So 100 EUR must be passed as 100, not 10000 (which it interprets as 10,000 EUR).
    let finalPriceEur = Number((areaInM2 * basePriceEur).toFixed(2))

    // Minimum Guard: Ensure price is NEVER lower than 0.50 EUR (50 cents) for Stripe
    if (finalPriceEur < 0.50) finalPriceEur = 0.50

    // Build human-readable title for Medusa Admin visibility
    // (subtitle is overwritten by Admin UI with variant option values, so we pack everything into title)
    const text = metadata?.Text || ''
    const font = metadata?.Schriftart || ''
    const executionType = metadata?.Ausführung || ''
    const cleanText = text.replace(/\n/g, ' ').substring(0, 30)

    const lineItemTitle = `Lackierschablone (${width}x${height}cm) | ${font} | ${executionType} | "${cleanText}..."`

    let productionFileUrl = production_file

    // Handle File Upload if production_file is a data URL
    if (production_file && production_file.startsWith("data:")) {
        try {
            const fileService = req.scope.resolve(Modules.FILE)
            
            // Extract MIME type and base64 content
            const matches = production_file.match(/^data:([^;]+);base64,(.+)$/)
            if (matches && matches.length === 3) {
                const mimeType = matches[1]
                const base64Data = matches[2]
                const buffer = Buffer.from(base64Data, 'base64')
                
                // Determine extension
                let extension = '.png'
                if (mimeType === 'image/svg+xml') extension = '.svg'
                else if (mimeType === 'image/jpeg') extension = '.jpg'
                else if (mimeType === 'application/pdf') extension = '.pdf'
                
                const filename = `production-file-${Date.now()}${extension}`
                
                // Medusa 2.0 uses createFiles for module-level uploads
                // We cast the whole input as any to ensure the minio-file provider 
                // receives the fields it expects (filename, content, mimeType)
                const uploadedFiles: any = await fileService.createFiles({
                    filename,
                    mimeType,
                    content: buffer
                } as any)
                
                if (uploadedFiles && uploadedFiles.length > 0) {
                    productionFileUrl = uploadedFiles[0].url
                }
            }
        } catch (uploadError) {
            console.error("File Upload Error (ignoring and using base64 as fallback):", uploadError)
        }
    }

    try {
        // We use the Medusa V2 addToCart workflow, overriding the unit_price directly
        await addToCartWorkflow(req.scope).run({
            input: {
                cart_id: cartId,
                items: [
                    {
                        variant_id,
                        quantity: quantity || 1,
                        unit_price: finalPriceEur,
                        title: lineItemTitle,
                        metadata: {
                            ...metadata,
                            ...(productionFileUrl ? { production_file: productionFileUrl } : {})
                        }
                    }
                ]
            }
        })

        // Fetch the updated cart with full pricing query (similar to Store Cart response)
        const query = req.scope.resolve("query")
        const { data: [cart] } = await query.graph({
            entity: "cart",
            fields: [
                "id", "region_id", "customer_id", "total", "subtotal", "tax_total", "discount_total", "shipping_total", "item_subtotal", "item_total",
                "items.*",
                "items.tax_lines.*",
                "items.adjustments.*",
                "items.variant.*",
                "items.variant.product.*",
            ],
            filters: { id: cartId },
        })

        if (!cart) {
            return res.status(404).json({ message: "Cart not found after update" })
        }

        res.json({ cart })
    } catch (error: any) {
        console.error("Dynamic Stencil Pricing Error:", error)
        res.status(500).json({ message: error.message })
    }
}

export const AUTHENTICATE = false
