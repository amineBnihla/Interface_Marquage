"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Eye } from "lucide-react"
import parse from 'html-react-parser'
import type { SortieData, Template } from "@/types"

import { DialogTitle } from "@radix-ui/react-dialog"
import { useRef, useState } from "react"
interface PreviewDialogProps {
  isOpen: boolean
  onClose: () => void
  sortie: SortieData | null
  template: Template | null  // Updated to use Template type
  ettiquetteCount:number,
  printInfo: {
    etiquette_id :number,
    product_name: string,
    variete:string,
    date_palettisation: string,
    emballage: string,
    categorie:string,
     versement_name:string,
    versement_date:string
  }
  loading?: boolean
  error:string
  stateEtiquetteHtml:string | null
  
}

export function PreviewDialog({
  isOpen,
  onClose,
  sortie,
  ettiquetteCount,
  template,
  printInfo,
  stateEtiquetteHtml,
  loading,
  error
}: PreviewDialogProps) {

 const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState('top left');

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setTransformOrigin(`${x}% ${y}%`);
  };

  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[80vh] min-w-[800px] min-h-[500px] bg-white rounded-lg shadow-xl border-0 p-0 overflow-hidden">
        <div className="p-6 h-full flex flex-col overflow-hidden">
          <DialogTitle className="flex items-center justify-center mb-6 flex-shrink-0">
            <Eye className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Aperçu de l'Étiquette</h2>
          </DialogTitle>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : !sortie || !template ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p>Aucun aperçu disponible</p>
            </div>
          ) : (
            <div className="flex gap-6 flex-1 min-h-0 overflow-hidden">
              {/* Left Side - Template Preview */}
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="flex-1  bg-gray-50 rounded-lg  min-h-0 overflow-hidden"
                   ref={containerRef}
      onMouseEnter={() => setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      onMouseMove={handleMouseMove}
                >
                 

            {stateEtiquetteHtml && (
                 <div
          className={`w-full h-full flex justify-center items-center  transition-transform duration-200 ease-out ${
            zoom ? 'scale-[1.5] cursor-zoom-out' : 'scale-100 cursor-zoom-in'
          }`}
          style={{
            transformOrigin: transformOrigin,
            pointerEvents: zoom ? 'auto' : 'none', // allows interaction when zoomed
          }}
                      dangerouslySetInnerHTML={{ __html: stateEtiquetteHtml }}
                    />
                  )}
                    {/* {stateEtiquetteHtml ? parse(stateEtiquetteHtml) : <p>No content to display</p>} */}
            
                </div>
              </div>

              {/* Right Side - Details */}
              <div className="flex-1 flex flex-col min-w-0">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Modèle</div>
                    
                      <div className="font-semibold">{template.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Dimensions</div>
                      <div className="font-semibold">{template.dimensions || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Format</div>
                      <div className="font-semibold">{template.fileType || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Sortie</div>
                      <div className="font-semibold">{sortie.code_emballage || "N/A"}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-700 mb-2 font-medium">Informations d'impression</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Nombre d'étiquettes:</span>
                        <span className="font-semibold">{ettiquetteCount || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Versement:</span>
                        <span className="font-semibold">{printInfo.versement_name || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date Versement:</span>
                        <span className="font-semibold">{printInfo.versement_date || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}