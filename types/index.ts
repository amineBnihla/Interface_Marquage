import type { LigneMarquage } from "@/api/api"

export interface SortieData extends Omit<LigneMarquage, 'idligne_marquage'> {
  id: string
  details: {
    quantity: number
    weight: string
    destination: string
    createdAt: string
  }
}

export interface Template {
  id: string
  name: string
  preview: string
  dimensions: string
  fileType: string
}