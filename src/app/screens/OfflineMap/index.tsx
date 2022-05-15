/* eslint-disable no-alert */
import { MapContainer, TileLayer } from 'react-leaflet'
import React, { useEffect, useState } from 'react'
import Leaflet, { LatLng } from 'leaflet'
import { PositionMarker } from '../../components/PositionMarker'

import 'leaflet.offline'

function Map() {
  const [position, setPosition] = useState<LatLng>()
  const [map, setMap] = useState(null)

  function showPosition(foundPosition: any) {
    setPosition({
      lng: foundPosition.coords.longitude,
      lat: foundPosition.coords.latitude,
    } as LatLng)
  }

  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(showPosition)
    } else {
      window.alert('Geolocation is not supported by this browser.')
    }
  }

  useEffect(() => {
    if (map) {
      // @ts-ignore
      if (!Leaflet.tileLayer?.offline) return
      // @ts-ignore
      const tileLayerOffline = Leaflet.tileLayer?.offline('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: 13,
      })

      tileLayerOffline.addTo(map)

      // @ts-ignore
      const controlSaveTiles = Leaflet.control.savetiles(tileLayerOffline, {
        zoomlevels: [13, 14, 15, 16],
        confirm(layer: any, succescallback: any) {
          // eslint-disable-next-line no-alert
          if (window.confirm(`Save ${layer._tilesforSave.length}`)) {
            succescallback()
          }
        },
        confirmRemoval(layer: any, successCallback: any) {
          // eslint-disable-next-line no-alert
          if (window.confirm('Remove all the tiles?')) {
            successCallback()
          }
        },
        saveText: 'salvar',
        rmText: 'excluir',
      })

      controlSaveTiles.addTo(map!)
    }
  }, [map])

  useEffect(() => {
    getLocation()
  }, [])

  return (
    <>
      {position && (
        // @ts-ignore
        <MapContainer id="map" center={position} zoom={13} ref={setMap}>
          <TileLayer
            id="mapbox/streets-v11"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <PositionMarker position={position} />
        </MapContainer>
      )}
    </>
  )
}

export { Map }
