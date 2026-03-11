import { defineWidgetConfig } from "@medusajs/admin-sdk"
import React from "react"

const ProductionFileWidget = ({ data: order }: { data: any }) => {
  const itemsWithFiles = order.items?.filter(
    (item: any) => item.metadata?.production_file
  )

  if (!itemsWithFiles || itemsWithFiles.length === 0) {
    return null
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden my-4 shadow-sm">
      {/* Header - Matching Medusa Details Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-900">Produktionsdateien</h2>
        <span className="inline-flex items-center px-[6px] py-[2px] rounded-[6px] text-[12px] font-medium bg-[#FAFAFA] text-[#52525B] border border-[#E4E4E7] leading-none tabular-nums shadow-sm">
          {itemsWithFiles.length} Datei{itemsWithFiles.length > 1 ? 'en' : ''}
        </span>
      </div>

      <div className="divide-y divide-gray-100 font-sans">
        {itemsWithFiles.map((item: any) => (
          <div key={item.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Minimalist Preview Box */}
            <div className="flex-shrink-0 w-20 h-20 bg-gray-50 rounded-md border border-gray-100 flex items-center justify-center p-2 overflow-hidden shadow-inner">
              {item.metadata.production_file.includes('.svg') || item.metadata.production_file.startsWith('data:image/svg+xml') ? (
                <img 
                  src={item.metadata.production_file} 
                  alt={item.title} 
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Image</div>
              )}
            </div>
            
            {/* Info Section - Clean Typography */}
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-medium text-gray-900 leading-none">
                  <span className="tabular-nums">{item.quantity}x</span> {item.title}
                </h3>
                <span className="text-[11px] text-gray-400 font-normal leading-none">
                  — {item.metadata.Dateiname || "Druckdatei"}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1.5 mt-3">
                <div className="inline-flex items-center px-[6px] py-[2px] rounded-[6px] bg-[#FAFAFA] text-[#52525B] border border-[#E4E4E7] text-[12px] font-medium leading-none tabular-nums">
                  {item.metadata.Breite || "?"} × {item.metadata.Höhe || "?"} mm
                </div>
                
                {item.metadata.Ausführung && (
                  <div className="inline-flex items-center px-[6px] py-[2px] rounded-[6px] bg-[#FAFAFA] text-[#52525B] border border-[#E4E4E7] text-[12px] font-medium leading-none">
                    {item.metadata.Ausführung}
                  </div>
                )}
                
                {item.metadata.Overspray > 0 && (
                  <div className="inline-flex items-center px-[6px] py-[2px] rounded-[6px] bg-[#FAFAFA] text-[#52525B] border border-[#E4E4E7] text-[12px] font-medium leading-none">
                    {item.metadata.Overspray}mm Overspray
                  </div>
                )}
              </div>
            </div>
            
            {/* Standard Medusa Button Style */}
            <div className="flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0 font-sans">
              <a 
                href={item.metadata.production_file} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors w-full sm:w-auto"
              >
                <svg className="w-3.5 h-3.5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Bestell-Datei öffnen
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default ProductionFileWidget
