import { defineWidgetConfig } from "@medusajs/admin-sdk"
import React from "react"

const ProductionFileWidget = ({ data: order }: { data: any }) => {
  // Filter all items that have production_file in their metadata
  const itemsWithFiles = order.items?.filter(
    (item: any) => item.metadata?.production_file
  )

  if (!itemsWithFiles || itemsWithFiles.length === 0) {
    return null
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden my-4 shadow-sm font-sans">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900 leading-none">Produktionsdateien</h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200 uppercase tracking-tight">
          {itemsWithFiles.length} Datei{itemsWithFiles.length > 1 ? 'en' : ''} für den Druck
        </span>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 gap-4">
          {itemsWithFiles.map((item: any) => (
            <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 bg-white border border-gray-100 p-4 rounded-xl hover:border-blue-200 hover:bg-blue-50/10 transition-all group">
              {/* Preview Thumbnail */}
              <div className="flex-shrink-0 w-24 h-24 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center p-2 overflow-hidden shadow-sm group-hover:shadow transition-all bg-white relative">
                {item.metadata.production_file.includes('.svg') || item.metadata.production_file.startsWith('data:image/svg+xml') ? (
                  <img 
                    src={item.metadata.production_file} 
                    alt={item.title} 
                    className="max-h-full max-w-full object-contain drop-shadow-sm"
                  />
                ) : (
                  <div className="text-gray-400 text-[10px] text-center font-bold uppercase tracking-widest px-2">
                    Keine Vorschau
                  </div>
                )}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
              </div>
              
              {/* Item Info */}
              <div className="flex-grow text-center sm:text-left flex flex-col gap-1">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                   <h3 className="text-md font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{item.title}</h3>
                </div>
                
                <p className="text-xs text-gray-500 font-medium">
                   {item.metadata.Dateiname || (item.metadata.Quelle === "Datei-Upload" ? "Kunden-Upload" : "Generierte SVG")}
                </p>
                
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-1">
                   <div className="text-[9px] bg-white py-1 px-2 rounded border border-gray-200 uppercase font-black text-gray-600 shadow-sm leading-none tabular-nums">
                      {item.metadata.Breite || "?"} x {item.metadata.Höhe || "?"} mm
                   </div>
                   <div className={`text-[9px] py-1 px-2 rounded border uppercase font-black shadow-sm leading-none ${
                      item.metadata.Ausführung === "Negative" 
                        ? "bg-black text-white border-black" 
                        : "bg-gray-100 text-gray-800 border-gray-300"
                   }`}>
                      {item.metadata.Ausführung || "Standard"}
                   </div>
                   {item.metadata.Overspray > 0 && (
                      <div className="text-[9px] bg-amber-50 text-amber-900 py-1 px-2 rounded border border-amber-200 uppercase font-black shadow-sm leading-none">
                         {item.metadata.Overspray}mm Overspray
                      </div>
                   )}
                </div>
              </div>
              
              {/* Action Button */}
              <div className="flex-shrink-0 flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <a 
                  href={item.metadata.production_file} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98] ring-offset-2 focus:ring-2 focus:ring-gray-900"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                  Datei öffnen
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default ProductionFileWidget
