import { LatLng } from 'leaflet'

export interface ICheckpoint {
  position: Pick<LatLng, 'lat' | 'lng'>
  text?: string
}
