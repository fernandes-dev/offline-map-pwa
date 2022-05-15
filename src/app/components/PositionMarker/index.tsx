import React from 'react'

import { Marker, Popup } from 'react-leaflet'
import { LatLngExpression } from 'leaflet'

function PositionMarker({ position }: { position: LatLngExpression }) {
  return (
    <>
      {position && (
        <Marker position={position!}>
          <Popup minWidth={90}>
            <span>Você está aqui!</span>
          </Popup>
        </Marker>
      )}
    </>
  )
}

export { PositionMarker }
