import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Box, ChevronLeft, ChevronRight, Edit, Eye, Printer } from "lucide-react"
import { Calibre, fetchEtiquettes, type Client, type Etiquette, type Versement } from "@/api/api"
import type { SortieData, Template } from "@/types"
import { useEffect, useState } from "react"
import { ModificationDialog } from "./ModificationDialog"
import { PreviewDialog } from "./PreviewDialog"
interface SortieCardProps {
   sortie: SortieData
  clients: Client[]
   calibres:Calibre[]
  versements:Versement[]
}

export function SortieCard({
  sortie,
  clients,
calibres,
  versements
 // Add this prop
}: SortieCardProps) {
  const [currentVersementIndex, setCurrentVersementIndex] = useState(0)
  const [currentPasIndex, setcurrentPasIndex] = useState(0)
  const [selectedEttiquete,setSelectedEttiquete] = useState<string>()
  const [selectedClient,setSelectedClient] = useState<string>()
  const [etiquettes, setEtiquettes] = useState<Etiquette[]>([])
  const [showModificationDialog, setShowModificationDialog] = useState<string | null>(null)
   const [showPreviewDialog, setShowPreviewDialog] = useState<string | null>(null)
  // Get current versement
  const currentVersement = versements[currentVersementIndex]
  const listeDesPas= sortie.listedespas.split(';')
  const nombreEtt = listeDesPas[currentPasIndex]
  function handleClientChange(idClient:string){
   setSelectedClient(idClient)
  }
  const handlePrintEttiquete = (htmlGenerated: string, printQuantity: number) => {
  const printContent = Array(printQuantity).fill(htmlGenerated).map((ett,index)=>ett.replace('{{ numero_batch }}',index)).join(
    '<div style="page-break-after: always; height: 20px;"></div>'
  );

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head><title>Print</title></head>
        <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }
};
    useEffect(() => {
    const fetchClientEtiquettes = async () => {
      if (!selectedClient) return

      try {
        const etiquettesData = await fetchEtiquettes([parseInt(selectedClient)])
        setEtiquettes(etiquettesData)
      } catch (err) {
        // setError(err instanceof Error ? err.message : 'Failed to fetch etiquettes')
      }
    }

    fetchClientEtiquettes()
  }, [selectedClient])
  return (
    <>
    <Card className="flex-shrink-0 w-80 border border-gray-200 shadow-sm bg-white">
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <Badge variant="outline" className="text-sm font-medium bg-white border-gray-300">
          Sortie N° {sortie.numlig}
        </Badge>
        <div className="flex items-center gap-2">
          <Box className="h-4 w-4 text-gray-600" />
          <span className="font-semibold text-gray-800">{sortie.code_emballage}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-gray-100 ml-1"
            onClick={() => setShowModificationDialog(sortie.id)}
          >
            <Edit className="h-3 w-3 text-gray-600" />
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
       <div className="text-center mb-4">
          <h3 className="text-2xl font-bold text-gray-800 mb-1">
            {currentVersement?.nom_producteur || "Non sélectionné"}
          </h3>
          <p className="text-gray-600">{currentVersement?.nom_variete || "Aucune variété"}</p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Marque</div>
            <div className="font-semibold text-sm">{sortie.nom_marque}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Calibre</div>
            <div className="font-semibold text-sm">{sortie.code_calibre}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Nbr de fruit</div>
            <div className="font-semibold text-sm">{sortie.nbrfruit}</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Client</div>
          <Select 
            value={selectedClient} 
            onValueChange={(value) => handleClientChange(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner un client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.idclfin.toString()} value={client.idclfin.toString()}>
                  {client.nom_client}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
    {/* Template Selection */}
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Modèle d'Étiquette</div>
          <Select
            value={selectedEttiquete}
            onValueChange={(value) => setSelectedEttiquete(value)}
            disabled={!selectedClient}
          >
            <SelectTrigger className="w-full h-10">
              <SelectValue
                placeholder={
                  selectedClient ? "Sélectionner un modèle" : "Sélectionnez d'abord un client"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {etiquettes.map((template) => (
                <SelectItem key={template.idtabetq} value={template.idtabetq.toString()}>
                  {template.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Controls */}
        <div className="space-y-4 mb-4">
          {/* Nombre d'étiquettes */}
          <div>
            <div className="text-sm text-gray-600 mb-2">Nombre d'étiquettes</div>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="lg"
                className="h-12 w-12 p-0 rounded-full border-2 hover:bg-red-50 hover:border-red-300 bg-transparent"
                onClick={() => {
                   const newIndex = (currentPasIndex- 1 + listeDesPas.length) % listeDesPas.length
                  setcurrentPasIndex(newIndex)}
                }
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="text-2xl font-bold text-gray-800 min-w-[60px] text-center">
                {nombreEtt}
              </div>
              <Button
                variant="outline"
                size="lg"
                className="h-12 w-12 p-0 rounded-full border-2 hover:bg-green-50 hover:border-green-300 bg-transparent"
                onClick={() => {
                   const newIndex = (currentPasIndex + 1) % listeDesPas.length
                
                  setcurrentPasIndex(newIndex)}}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Numero De Versement */}
          <div>
            <div className="text-sm text-gray-600 mb-2">Numero De Versement</div>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="lg"
                className="h-12 w-12 p-0 rounded-full border-2 hover:bg-red-50 hover:border-red-300 bg-transparent"
                onClick={() => {
                  const newIndex = (currentVersementIndex - 1 + versements.length) % versements.length
                  setCurrentVersementIndex(newIndex)
                  // onVersementChange(sortie.id, false)
                }}
                disabled={versements.length === 0}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="text-2xl font-bold text-gray-800 min-w-[80px] text-center">
                {currentVersement?.numver || "N/A"}
              </div>
              <Button
                variant="outline"
                size="lg"
                className="h-12 w-12 p-0 rounded-full border-2 hover:bg-green-50 hover:border-green-300 bg-transparent"
                onClick={() => {
                  const newIndex = (currentVersementIndex + 1) % versements.length
                  setCurrentVersementIndex(newIndex)
                  // onVersementChange(sortie.id, true)
                }}
                disabled={versements.length === 0}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            {/* Date Badge */}
            <div className="flex justify-center mt-2">
              <Badge variant="outline" className="text-sm font-medium bg-white border-gray-300">
                {currentVersement?.dte_versement || new Date().toLocaleDateString("fr-FR")}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="default"
            className="flex-1 bg-[#015571] hover:bg-[#21A8D5] text-white"
            disabled={!selectedClient || !selectedEttiquete}
            onClick={handlePrintEttiquete}
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-10 w-10 p-0 bg-transparent"
            disabled={!selectedClient || !selectedEttiquete}
            onClick={() => setShowPreviewDialog(sortie.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
      {selectedEttiquete}
    </Card>
          {/* ModificationDialog */}
              {showModificationDialog && (
                <ModificationDialog
                  isOpen={!!showModificationDialog}
                  onClose={() => setShowModificationDialog(null)}
                  sortie={sortie}
                  initialData={{ caliber: calibres.find((c)=> c.codcal == sortie.code_calibre)?.idcalib.toString() || "", fruitCount: +sortie.nbrfruit }}
                  availableCalibers={calibres}

                />
              )} 
                  {/* PreviewDialog */}
                
              {showPreviewDialog && (
                <PreviewDialog
                  isOpen={!!showPreviewDialog}
                  onClose={() => setShowPreviewDialog(null)}
                  sortie={sortie}
                  template={etiquettes
                    .find(e => e.idtabetq.toString() === selectedEttiquete)
                    ? {
                        id: selectedEttiquete ? selectedEttiquete : "",
                        name: etiquettes.find(e => e.idtabetq.toString() === selectedClient)?.nom ??  "N/A",
                        preview: "/placeholder.svg",
                        dimensions: "10cm x 7cm",
                        fileType: "PDF"
                      }
                    : null
                  }
                  ettiquetteCount={+nombreEtt}
                  printInfo={{
                    etiquette_id:selectedEttiquete ? +selectedEttiquete : 0, 
                  product_name: "",
    variete:currentVersement.nom_variete,
    date_palettisation: "",
    emballage: sortie.code_emballage,
    categorie:"",
    versement_name:currentVersement.numver,
    versement_date:currentVersement.dte_versement
                  }}

                />
              )}
    </>
  )
}