import { Marker, Popup } from 'react-leaflet'
import React, { ReactNode } from 'react'
import { Icon } from 'leaflet'
import { ICheckpoint } from '../../types/ICheckpoint'
import { ICoords } from '../../types/ICoords'
import { CalculateDistanceBetweenCoords } from '../../functions/CalculateDistanceBetweenCoords'

interface IProps {
  marker: ICheckpoint
  checkPointDetails?: ReactNode
  positionToCompare?: ICoords
}

function CheckpointMarker({ marker, checkPointDetails, positionToCompare }: IProps) {
  const distanceInMeters = CalculateDistanceBetweenCoords(marker.position, positionToCompare)
  const distanceInKm = distanceInMeters > 0 ? (distanceInMeters / 1000).toFixed(2) : 0

  return (
    <Marker
      position={marker.position}
      icon={
        new Icon({
          iconUrl: '/icons/circle-icon.png',
          iconSize: [25, 25],
        })
      }
      title={marker.text}
    >
      <Popup>
        {checkPointDetails}

        <>
          <div>Distância atual: {distanceInKm} km</div>
        </>
      </Popup>
    </Marker>
  )
}

export { CheckpointMarker }
