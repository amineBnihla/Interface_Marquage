
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Box, ChevronLeft, ChevronRight, Edit, Eye, LoaderCircle, Printer } from "lucide-react"
import { Calibre, fetchEtiquettes, generateEtiquette, type Client, type Etiquette, type Versement } from "@/api/api"
import type { SortieData, Template } from "@/types"
import { useEffect, useState } from "react"
import { ModificationDialog } from "./ModificationDialog"
import { PreviewDialog } from "./PreviewDialog"
import { toast } from "sonner"

import { getProduct } from "@/lib/getProductData"
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
  const [products, setProducts] = useState<{[key:string] :string}>({})
  const [showModificationDialog, setShowModificationDialog] = useState<string | null>(null)
   const [showPreviewDialog, setShowPreviewDialog] = useState<string | null>(null)
       const [htmlGenerated,setHtmlGenerated] = useState<string | null>("")
 const [tempCaliber, setTempCaliber] = useState("")
         const [loading,setLoading] = useState<boolean>()
         const [loadingImprimer,setLoadingImrimer] = useState<boolean>()
         const [Ettiloading,setEttiloading] = useState<boolean>()
    const [error,setError] = useState<string>("")
  // Get current versement
  const currentVersement = versements[currentVersementIndex]
  const listeDesPas= sortie.listedespas.split(';')
  const nombreEtt = listeDesPas[currentPasIndex]
  // const printInfo = {
  //                   etiquette_id:selectedEttiquete ? +selectedEttiquete : 0, 
  //                   emballage_marque: sortie.code_emballage,
  //                   origin:"",
  //                   caliber:tempCaliber,
  //                   numero_batch:"",
  //                   barcode_value:sortie.codebarre || "",
  //                   variete:currentVersement.nom_variete,
  //                   client:clients.find(c => c.idclfin.toString() === selectedClient)?.nom_client || "",
  //                    poids_net: +sortie.poids || 0,
  //                    categorie:"",
  //                     producteur_code: currentVersement.code_producteur || "", 
  // station_code: "",
  // station_nom: "",
  // ggn: "",
  // emballage:sortie.code_emballage,
  //   date_recolte: currentVersement.dte_versement,
  // date_palettisation: "",
  // traitement_description:sortie.traitement || "",
  //                 product_name: products[currentVersement.nom_variete] || "" ,
  //                 produit:"",
  //                 num_lot:"",
  //                 calibre:sortie.code_calibre,
  //                 versement_name:currentVersement.numver,
  //   versement_date:currentVersement.dte_versement
  //                 }
   const currentEtti = etiquettes.find(e => e.idtabetq.toString() === selectedEttiquete)
  const printInfo = {
                    etiquette_id:selectedEttiquete ? +selectedEttiquete : 0, 
                    ...sortie,
                    ...currentVersement,
                    ...clients.find(c => c.idclfin.toString() === selectedClient),
                    ...calibres.find((c)=> c.codcal == sortie.code_calibre),
                    ...currentEtti

                  }
useEffect(()=>{
console.log("Temp caliber changed:", tempCaliber)
},[tempCaliber])

  function handleClientChange(idClient:string){
   setSelectedClient(idClient)
  }
  const handlePrintEttiquete = async () => {
    try {
       setHtmlGenerated("")
         setError("")
        setLoadingImrimer(true)
      const htlmGene = await generateEtiquetteSorie()
      if (!htlmGene.success) {
        toast.error(htlmGene.message)
        setLoadingImrimer(false)
        return
      }
      setHtmlGenerated(htlmGene.data)
      
     const tickets = Array(+nombreEtt)
      .fill(null)
      .map((_, index) => {
         let ticketHtml = htlmGene.data.replace('{{ numero_batch }}', index + 1);
    
        return ticketHtml;
      });

    // Detect orientation


    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Print Tickets</title>
          <style>
          <style>
            @page {
              margin: 10mm;
              size: auto;
            }
            
            html, body {
              font-family: sans-serif;
              margin: 0 !important;
              padding: 0 !important;
              width: 100%;
                  display: flex !important;
    justify-content: center !important;
    align-items: center !important;
              flex-direction: column !important;
              background-color: white !important;
            }
            
            .ticket-page {
            height:100vh;
              padding: 20px;
              page-break-after: always;
              page-break-inside: avoid;
              display: flex !important;
              justify-content: center;
              align-items: center;
              box-sizing: border-box;
             
              margin: 0 auto;
            }
            
            .ticket-page:last-child {
              page-break-after: auto;
            }
            
            @media print {
              @page {
                margin: 10mm;
                size: auto;
              }
              
              .
            }
          </style>
          </style>
        </head>
        <body>
          ${tickets.map(ticket => `
            <div class="ticket-page">${ticket}</div>
          `).join('')}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    // Create blob and open in new window
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    
    if (!printWindow) {
      toast.error("Impossible d'ouvrir la fenêtre d'impression");
      setLoadingImrimer(false);
      return;
    }

    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(url);
      setLoadingImrimer(false);
    }, 2000);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to Preview etiquettes')
      setLoadingImrimer(false)
    }
};
    useEffect(() => {
    const fetchClientEtiquettes = async () => {
      if (!selectedClient) return
        setEttiloading(true)
      try {
        const etiquettesData = await fetchEtiquettes([parseInt(selectedClient)])
        setEtiquettes(etiquettesData)
                setEttiloading(false)

      } catch (err) {
        console.log(err)
         setEttiloading(false)
         toast.error(err instanceof Error ? err.message : 'Failed to fetch etiquettes')
      }
    }

    fetchClientEtiquettes()
  }, [selectedClient])

  useEffect(()=>{
     
   async function fetchProducts(){
    const productsRes =  await getProduct()
    console.log(productsRes)
    setProducts(productsRes)
    }

    fetchProducts()
  },[])
   
  const generateEtiquetteSorie = async () => {
    console.log("Generating etiquette with info:", printInfo)
const etiquetteHtml = await generateEtiquette(printInfo)
return etiquetteHtml
  }   
     const displayEttiquette = async () => {
        setHtmlGenerated("")
         setError("")
      setShowPreviewDialog(sortie.id)
       try {
        setLoading(true)
         const etiquetteHtml = await generateEtiquetteSorie()
         if(!etiquetteHtml.success){
          toast.error(etiquetteHtml.message)
             setShowPreviewDialog("")
          setLoading(false)
          return
         }
         setHtmlGenerated(etiquetteHtml.data)
         setLoading(false)
         setError("")
        } catch (err) {
       
            setError(err instanceof Error ? err.message : 'Failed to Preview etiquettes')
               setShowPreviewDialog("")
         setLoading(false)
       }
     }
    function handleClosePreview(){
    setShowPreviewDialog(null)
    setError("")
    }
   
    console.log(currentEtti)
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
              
              {Ettiloading ? 
               <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-900" />
            </div>
              : etiquettes.map((template) => (
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
            {
              loadingImprimer ?
              <LoaderCircle className={`h-4 w-4 mr-2 animate-spin`} />
              :
              <>
                <Printer className="h-4 w-4 mr-2" />
            Imprimer
              </>
            }
          
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-10 w-10 p-0 bg-transparent"
            disabled={!selectedClient || !selectedEttiquete}
            onClick={displayEttiquette}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
     
    </Card>
          {/* ModificationDialog */}
              {showModificationDialog && (
                <ModificationDialog
                  isOpen={!!showModificationDialog}
                  onClose={() => setShowModificationDialog(null)}
                  sortie={sortie}
                  tempCaliber={tempCaliber}
                  setTempCaliber={setTempCaliber}
                  initialData={{ caliber: tempCaliber || calibres.find((c)=> c.codcal == sortie.code_calibre)?.idcalib.toString() || "", fruitCount: +sortie.nbrfruit }}
                  availableCalibers={calibres}

                />
              )} 
                  {/* PreviewDialog */}
                
              {showPreviewDialog && (
                <PreviewDialog
                  isOpen={!!showPreviewDialog}
                  onClose={handleClosePreview}
                  sortie={sortie}
                  template={currentEtti
                    ? {
                        id: selectedEttiquete ? selectedEttiquete : "",
                        name: currentEtti.nom ?? "N/A",
                        preview: "/placeholder.svg",
                        dimensions: "10cm x 7cm",
                        fileType: "PDF"
                      }
                    : null
                  }
                  stateEtiquetteHtml={htmlGenerated}
                  ettiquetteCount={+nombreEtt}
                  printInfo={printInfo}
                  loading={loading}
                  error={error}

                />
              )}
    </>
  )
}