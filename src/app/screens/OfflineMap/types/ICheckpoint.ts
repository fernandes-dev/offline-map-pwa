import { LatLng } from 'leaflet'

export interface ICheckpoint {
  id: number
  position: Pick<LatLng, 'lat' | 'lng'>
  text?: string
}
