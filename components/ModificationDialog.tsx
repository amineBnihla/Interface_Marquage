"use client"

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Edit, RotateCcw } from "lucide-react"
import { useState, useEffect } from "react"
import { updateLigneCalibre, type Calibre } from "@/api/api"
import { SortieData } from "@/types"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { formatDate } from "@/lib/helpers"
import { DialogTitle } from "@radix-ui/react-dialog"

interface ModificationDialogProps {
  isOpen: boolean
  onClose: () => void
    setTempCaliber:(value:string)=>void
    dateRecolte:string
    setDateRecolte:(value:string)=>void
       dateVersement:string
    setDateVersement:(value:string)=>void
    poidsRecolte:string,
    setPoidsRecolte:(value:string)=>void
    resetData:()=>void
  tempCaliber:string
  calibr:string
  setCalibr:(value:string)=>void
    codeProducteur:string
  setCodeProducteur:(value:string)=>void
     ggn:string,
  setGgn:(value:string)=>void
     variete:string
  setVariete:(value:string)=>void
  sortie: SortieData
  initialData: {
    caliber: string
    fruitCount: number
  }
  availableCalibers: Calibre[]
  loading?: boolean
  error?: string | null
}

export function ModificationDialog({
  isOpen,
  onClose,
  setTempCaliber,
  tempCaliber,
  dateRecolte,
  setDateRecolte,
    dateVersement,
  setDateVersement,
  calibr,
  setCalibr,
  resetData,
   codeProducteur,
  setCodeProducteur,
   ggn,
  setGgn,
  variete,
  setVariete,
  poidsRecolte,
  setPoidsRecolte,
  sortie,
  initialData,
  availableCalibers,
  loading
}: ModificationDialogProps) {
  // const [tempCaliber, setTempCaliber] = useState(initialData.caliber)
  const [tempFruitCount, setTempFruitCount] = useState(initialData.fruitCount)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setTempCaliber(initialData.caliber)
    setTempFruitCount(initialData.fruitCount)
    
  }, [initialData])
useEffect(()=>{
  resetData()
},[isOpen])
// const [openCalender, setOpenCalender] = useState<boolean>(false)
// function isValidDate(date: Date | undefined) {
//   if (!date) {
//     return false
//   }
//   return !isNaN(date.getTime())
// }


 const handleModificationSave = async () => {
    try {
      const calibre = availableCalibers.find(c => c.idcalib === +tempCaliber)
      if (!calibre) throw new Error('Invalid caliber')

      await updateLigneCalibre({
        idligne_marquage: parseInt(sortie.id),
        idcalib: +tempCaliber,
        nbrfruit: +tempFruitCount
      })
      sortie.code_calibre = calibre.codcal
      sortie.nbrfruit = tempFruitCount.toString()
  
      onClose()
    } catch (err) {
      // console.log(err.message)
      setError(err instanceof Error ? err?.message : 'Failed to update sortie')
    }
  }
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
   
      <DialogContent className="sm:max-w-md bg-white rounded-lg shadow-xl border-0 p-6">

        <DialogHeader>
             <DialogTitle>
         <div className="flex items-center justify-center mb-6">
        
            <Edit className="h-5 w-5 text-[#015571] mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Modifier les Paramètres</h2>
          </div>
      </DialogTitle>
        </DialogHeader>
        <div className="h-full flex flex-col">
         

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div className="hidden">
              <label className="block text-sm font-medium text-gray-700 mb-2">Calibre</label>
              <Select 
                value={tempCaliber} 
                onValueChange={setTempCaliber}
                disabled={loading || isSaving}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un calibre" />
                </SelectTrigger>
                <SelectContent>
                  {availableCalibers.map((caliber) => (
                    <SelectItem key={caliber.idcalib} value={caliber.idcalib.toString()}>
                      {caliber.codcal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
 <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Calibre</label>
              <Input
                type="text"
                value={calibr}
                onChange={(e) => setCalibr(e.target.value)}
                className="w-full"
                disabled={loading || isSaving}
              />
            </div>
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GGN</label>
              <Input
                type="text"
                value={ggn}
                onChange={(e) => setGgn(e.target.value)}
                className="w-full"
            
                disabled={loading || isSaving}
              />
            </div>
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sous Variété</label>
              <Input
                type="text"
                value={variete}
                onChange={(e) => setVariete(e.target.value)}
                className="w-full"
               
                disabled={loading || isSaving}
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Code Producteur</label>
              <Input
                type="text"
                value={codeProducteur}
                onChange={(e) => setCodeProducteur(e.target.value)}
                className="w-full"
              
                disabled={loading || isSaving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de Fruits</label>
              <Input
                type="number"
                value={tempFruitCount}
                onChange={(e) => setTempFruitCount(Number(e.target.value))}
                className="w-full"
                min="1"
                disabled={loading || isSaving}
              />
            </div>
            <div className="">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Récolte</label>
               <div className="relative">
               <Input
          id="dateRecolte"
          type="text"
          value={dateRecolte}
          placeholder="2025-01-30"
          className="bg-background pr-10"
          onChange={(e) => {
            setDateRecolte(e.target.value)
          }}
        />
            </div>
            </div>
             <div className="">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Versement</label>
               <div className="relative">
               <Input
          id="dateVersement"
          type="text"
          value={dateVersement}
          placeholder="2025-01-30"
          className="bg-background pr-10"
          onChange={(e) => {
            setDateVersement(e.target.value)
          }}
        />
            </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Poid Net (kg)</label>
              <Input
                type="text"
                value={poidsRecolte}
                onChange={(e) => setPoidsRecolte(e.target.value)}
                placeholder="Ex: 120"
                className="w-full"
                min="1"
                disabled={loading || isSaving}
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={()=>{
                onClose()
                      resetData()
              }}
              className="flex-1 border-orange-400 text-orange-600 bg-transparent hover:bg-orange-50"
              disabled={loading || isSaving}
            >
              Annuler
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                resetData()
                setTempCaliber(initialData.caliber)
                setTempFruitCount(initialData.fruitCount)
              }}
              className="flex-1 text-[#015571] hover:bg-transparent border-0 bg-transparent"
              disabled={loading || isSaving}
            >
              <RotateCcw className="h-4 w-4 mr-2 text-[#015571]" />
              Réinitialiser
            </Button>
            <Button
              onClick={()=>handleModificationSave()}
              className="flex-1 bg-[#015571] hover:bg-[#21A8D5] text-white"
              disabled={loading || isSaving}
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                "Modifier"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}