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
  type Etiquette,
  logoutUser
} from "@/api/api"
import type { SortieData } from "@/types"
import { useRouter } from "next/navigation"

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
  
  const [clients, setClients] = useState<Client[]>([])
  const [versements, setVersements] = useState<Versement[]>([])
  

  // UI state
  const [selectedStation, setSelectedStation] = useState("")
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

 const router = useRouter() 
  // Sortie controls state


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
        const [sortiesData,  clientsData, versementsData] = await Promise.all([
          fetchSortiesByPoste([selectedStation]),
          fetchClients(),
          fetchVersements()]) 
        setSorties(prev => ({
          ...prev,
          [selectedStation]: sortiesData
        }))
        
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


  // Essential handlers
  

  const handleLogout = async() => {
    await logoutUser()
    router.push("/login")
    setSelectedStation("")
    setSelectedClient("")
    setShowLogoutDialog(false)

  }

  const handleStationChange = (stationId: string) => {
    setSelectedStation(stationId)
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
    versements={versements}  // Pass versements here
    error={error}
  />

            </>
        
          ))
        }
      </div>
    </div>
  )
}