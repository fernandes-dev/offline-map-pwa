import React from 'react'

import { Marker, Popup } from 'react-leaflet'
import { LatLngExpression } from 'leaflet'

function PositionMarker({ position, text }: { position: LatLngExpression; text?: string }) {
  return (
    <>
      {position && (
        <Marker position={position!}>
          <Popup minWidth={90}>
            <span>{text}</span>
          </Popup>
        </Marker>
      )}
    </>
  )
}

PositionMarker.defaultProps = { text: '' }

export { PositionMarker }
