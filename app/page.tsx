"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LogOut, Tv2Icon } from "lucide-react"
import { Logo } from "@/components/logo"
import { ModificationDialog } from "@/components/ModificationDialog"
import { PreviewDialog } from "@/components/PreviewDialog"
import { SortiesSection } from "@/components/SortieSelection"
import { 
  fetchPostes, 
  fetchSortiesByPoste,
  fetchCalibres,
  fetchClients,
  fetchVersements,
  fetchEtiquettes,
  updateLigneCalibre,
  type Poste,
  type LigneMarquage,
  type Client,
  type Calibre,
  type Versement,
  type Etiquette
} from "@/api/api"
import type { SortieData } from "@/types"

interface Template {
  id: string
  name: string
  preview: string
  dimensions: string
  fileType: string
}



export default function LabelingInterface() {
  // Essential state

  const [loading, setLoading] = useState(true)
  const [loadingSorties, setloadingSorties] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Data state
  const [postes, setPostes] = useState<Poste[]>([])
  const [sorties, setSorties] = useState<Record<string, LigneMarquage[]>>({})
  const [calibres, setCalibres] = useState<Calibre[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [versements, setVersements] = useState<Versement[]>([])
  const [etiquettes, setEtiquettes] = useState<Etiquette[]>([])

  // UI state
  const [selectedStation, setSelectedStation] = useState("")
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [showModificationDialog, setShowModificationDialog] = useState<string | null>(null)
  const [showPreviewDialog, setShowPreviewDialog] = useState<string | null>(null)

  // Sortie controls state
  const [sortieLabels, setSortieLabels] = useState<Record<string, number>>({})
  const [sortieVersements, setSortieVersements] = useState<Record<string, string>>({})
  const [sortieTemplates, setSortieTemplates] = useState<Record<string, string>>({})
  const [modificationData, setModificationData] = useState<Record<string, { caliber: string; fruitCount: number }>>({})

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        const postesData = await fetchPostes()
   console.log(postesData)
        setPostes(postesData)
   
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch initial data')
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  // Fetch sorties when station changes
  useEffect(() => {
    const fetchSorties = async () => {
      if (!selectedStation) return

      try {
        setloadingSorties(true)
        const [sortiesData, calibresData, clientsData, versementsData] = await Promise.all([
          fetchSortiesByPoste([selectedStation]),
        fetchCalibres(),
          fetchClients(),
          fetchVersements()]) 
        setSorties(prev => ({
          ...prev,
          [selectedStation]: sortiesData
        }))
             setCalibres(calibresData)
        setClients(clientsData)
        setVersements(versementsData)
        setloadingSorties(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch sorties')
        setloadingSorties(false)
      }
    }

    fetchSorties()
  }, [selectedStation])

  // Fetch etiquettes when client changes
  useEffect(() => {
    const fetchClientEtiquettes = async () => {
      if (!selectedClient) return

      try {
        const etiquettesData = await fetchEtiquettes([parseInt(selectedClient)])
        setEtiquettes(etiquettesData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch etiquettes')
      }
    }

    fetchClientEtiquettes()
  }, [selectedClient])

  // Essential handlers
  

  const handleLogout = () => {
    setSelectedStation("")
    setSelectedClient("")
    setSortieLabels({})
    setSortieVersements({})
    setSortieTemplates({})
    setShowLogoutDialog(false)
  }

  const handleStationChange = (stationId: string) => {
    setSelectedStation(stationId)
  }

  const handleClientChange = (sortieId: string, clientId: string) => {
    setSelectedClient(clientId)
    setSortieTemplates(prev => ({
      ...prev,
      [sortieId]: ""
    }))
  }

  const handleModificationSave = async (sortieId: string, data: { caliber: string; fruitCount: number }) => {
    try {
      const calibre = calibres.find(c => c.codcal === data.caliber)
      if (!calibre) throw new Error('Invalid caliber')

      await updateLigneCalibre({
        idligne_marquage: parseInt(sortieId),
        idcalib: calibre.idcalib,
        nbrfruit: data.fruitCount
      })

      setModificationData(prev => ({
        ...prev,
        [sortieId]: data
      }))
      setShowModificationDialog(null)

      // Refresh sorties
      if (selectedStation) {
        const sortiesData = await fetchSortiesByPoste([selectedStation])
        setSorties(prev => ({
          ...prev,
          [selectedStation]: sortiesData
        }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sortie')
    }
  }

  const getCurrentSorties = (): SortieData[] => {
    const currentSorties = sorties[selectedStation] || []
    return currentSorties.map(sortie => ({
      ...sortie,
      id: sortie.idligne_marquage.toString(),
      details: {
        quantity: sortie.poids,
        weight: `${sortie.poids} tonnes`,
        destination: "",
        createdAt: new Date().toISOString()
      }
    }))
  }
// Add these new handlers after existing handlers
const handleTemplateChange = (sortieId: string, templateId: string) => {
  setSortieTemplates(prev => ({
    ...prev,
    [sortieId]: templateId
  }))
}

// const handleLabelCountChange = (sortieId: string, increment: boolean) => {
//   setSortieLabels(prev => {
//     const current = prev[sortieId] || 8
//     const newValue = increment ? current + 1 : current - 1
//     return {
//       ...prev,
//       [sortieId]: Math.max(1, Math.min(999, newValue))
//     }
//   })
// }

// const handleVersementChange = (sortieId: string, increment: boolean) => {
//   setSortieVersements(prev => {
//     const current = parseInt((prev[sortieId] || "10").replace("Nº ", ""))
//     const newValue = increment ? current + 1 : current - 1
//     return {
//       ...prev,
//       [sortieId]: `Nº ${Math.max(1, newValue)}`
//     }
//   })
// }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#007297] to-[#E68F59] text-white">
        <div className="flex items-center justify-between px-6 py-4">
          <Logo variant="header" />
          <div className="flex items-center space-x-4">
            <span className="text-sm">Bonjour Admin !</span>
            <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-gray-500/20 hover:text-white px-4 py-2 rounded-none"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white rounded-lg shadow-xl border-0">
                <div className="flex flex-col items-center text-center p-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <LogOut className="h-8 w-8 text-red-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Confirmer la déconnexion</h2>
                  <p className="text-gray-600 mb-6 text-sm">
                    Êtes-vous sûr de vouloir vous déconnecter ?
                  </p>
                  <div className="flex space-x-3 w-full">
                    <Button
                      variant="outline"
                      onClick={() => setShowLogoutDialog(false)}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleLogout}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      Se déconnecter
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="px-6 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            {/* Station Selection */}
            <div className="mb-6">
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="max-w-md">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-gray-800 font-semibold">Poste Sélectionné</h4>
                        <p className="text-sm text-gray-500">Configuration du poste</p>
                      </div>
                      <Tv2Icon className="h-5 w-5 text-orange-600" />
                    </div>
                    <Select value={selectedStation} onValueChange={handleStationChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner un poste" />
                      </SelectTrigger>
                      <SelectContent>
                        {postes.map((poste) => (
                          <SelectItem key={poste.numposte} value={poste.numposte}>
                            Poste {poste.numposte}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {
         selectedStation !== "" && (loadingSorties ?
          (  <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>):(
            <>
        <SortiesSection
                sorties={getCurrentSorties()}
                clients={clients}
                selectedClient={selectedClient}
                sortieLabels={sortieLabels}
                sortieVersements={sortieVersements}
                sortieTemplates={sortieTemplates}
                availableTemplates={etiquettes.map(e => ({
                  id: e.idtabetq.toString(),
                  name: e.nom,
                  preview: "/placeholder.svg",
                  dimensions: "10cm x 7cm",
                  fileType: "PDF"
                }))}
                onClientChange={handleClientChange}
                onModificationClick={(id) => setShowModificationDialog(id)}
                onPreviewClick={(id) => setShowPreviewDialog(id)}
                sortieVersementDates={{}}
                versements={versements}
                loading={loadingSorties}
                error={error}
              />

              {/* ModificationDialog */}
              {showModificationDialog && (
                <ModificationDialog
                  isOpen={!!showModificationDialog}
                  onClose={() => setShowModificationDialog(null)}
                  onSave={handleModificationSave}
                  sortieId={showModificationDialog}
                  initialData={modificationData[showModificationDialog] || { caliber: "", fruitCount: 0 }}
                  availableCalibers={calibres.map(c => c.codcal)}
                  loading={loading}
                  error={error}
                />
              )}

              {/* PreviewDialog */}
              {showPreviewDialog && (
                <PreviewDialog
                  isOpen={!!showPreviewDialog}
                  onClose={() => setShowPreviewDialog(null)}
                  sortie={getCurrentSorties().find(s => s.id === showPreviewDialog) || null}
                  template={etiquettes
                    .find(e => e.idtabetq.toString() === sortieTemplates[showPreviewDialog || ""])
                    ? {
                        id: etiquettes.find(e => e.idtabetq.toString() === sortieTemplates[showPreviewDialog || ""])!.idtabetq.toString(),
                        name: etiquettes.find(e => e.idtabetq.toString() === sortieTemplates[showPreviewDialog || ""])!.nom,
                        preview: "/placeholder.svg",
                        dimensions: "10cm x 7cm",
                        fileType: "PDF"
                      }
                    : null
                  }
                  printInfo={{
                    labelCount: sortieLabels[showPreviewDialog || ""] || 8,
                    versement: sortieVersements[showPreviewDialog || ""] || "Nº 10",
                    date: new Date().toLocaleDateString("fr-FR")
                  }}
                  loading={loading}
                  error={error}
                />
              )}
            </>
        
          ))
        }
      </div>
    </div>
  )
}