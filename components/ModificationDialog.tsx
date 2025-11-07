"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Edit, RotateCcw } from "lucide-react"
import { useState, useEffect } from "react"
import { updateLigneCalibre, type Calibre } from "@/api/api"
import { SortieData } from "@/types"

interface ModificationDialogProps {
  isOpen: boolean
  onClose: () => void
    setTempCaliber:(value:string)=>void,
  tempCaliber:string,
  sortie: SortieData
  initialData: {
    caliber: string
    fruitCount: number
  },

  availableCalibers: Calibre[]
  loading?: boolean
  error?: string | null
}

export function ModificationDialog({
  isOpen,
  onClose,
  setTempCaliber,
  tempCaliber,
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
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-center mb-6">
            <Edit className="h-5 w-5 text-[#015571] mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Modifier les Paramètres</h2>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de Fruits</label>
              <Input
                type="number"
                value={tempFruitCount}
                onChange={(e) => setTempFruitCount(Number(e.target.value))}
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
              onClick={onClose}
              className="flex-1 border-orange-400 text-orange-600 bg-transparent hover:bg-orange-50"
              disabled={loading || isSaving}
            >
              Annuler
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
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