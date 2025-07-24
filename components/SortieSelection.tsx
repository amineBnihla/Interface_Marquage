import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react"
import { useRef, useEffect, useState } from "react"
import { SortieCard } from "./SortieCard"
import type { Client, Etiquette, Versement } from "@/api/api"
import type { SortieData, Template } from "@/types"
interface SortiesSectionProps {
  sorties: SortieData[]
  clients: Client[]
  selectedClient: string
  sortieLabels: Record<string, number>
  sortieVersements: Record<string, string>
  sortieTemplates: Record<string, string>
  availableTemplates: Array<{
    id: string
    name: string
    preview: string
    dimensions: string
    fileType: string
  }>
  onClientChange: (sortieId: string, clientId: string) => void
  onModificationClick: (sortieId: string) => void
  onPreviewClick: (sortieId: string) => void
  loading?: boolean
  error?: string | null
    // onTemplateChange: (sortieId: string, templateId: string) => void
  // onLabelCountChange: (sortieId: string, increment: boolean) => void
  // onVersementChange: (sortieId: string, increment: boolean) => void
  sortieVersementDates: Record<string, string>
  versements:Versement[]
  
}

export function SortiesSection({
  sorties,
  clients,
  selectedClient,
  sortieLabels,
  sortieVersements,
  sortieTemplates,
  availableTemplates,
  onClientChange,
  onModificationClick,
  onPreviewClick,
    // onTemplateChange,
  // onLabelCountChange,
  // onVersementChange,
  sortieVersementDates,
  loading,
  error,
  versements

}: SortiesSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScrollState = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    checkScrollState()
    if (scrollContainerRef.current) {
      scrollContainerRef.current.addEventListener("scroll", checkScrollState)
      return () => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.removeEventListener("scroll", checkScrollState)
        }
      }
    }
  }, [sorties])

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: "smooth" })
    }
  }
console.log(availableTemplates)
  return (
    <div className="mb-6">
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-2 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg font-semibold text-gray-800">
                Sorties Disponibles
              </CardTitle>
              <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-sm px-2 py-0.5">
                {sorties.length}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {(canScrollLeft || canScrollRight) && (
                <>
                  <Button
                    onClick={scrollLeft}
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0 bg-transparent"
                    disabled={!canScrollLeft}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={scrollRight}
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0 bg-transparent"
                    disabled={!canScrollRight}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div
            ref={scrollContainerRef}
            className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
          >
            {sorties.map((sortie) => (
              <SortieCard
                 key={sortie.id}
      sortie={sortie}
      clients={clients}
      selectedClient={selectedClient}
      sortieLabels={sortieLabels}
      sortieVersements={sortieVersements}
      sortieTemplates={sortieTemplates}
      availableTemplates={availableTemplates}
      onClientChange={onClientChange}
      onModificationClick={onModificationClick}
      onPreviewClick={onPreviewClick}
      // onEtiquetteChange={onEtiquetteChange}
      // onLabelCountChange={onLabelCountChange}
      // onVersementChange={onVersementChange}
      sortieVersementDates={sortieVersementDates}
      versements={versements}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}