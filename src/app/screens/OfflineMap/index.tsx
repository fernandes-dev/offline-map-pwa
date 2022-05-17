/* eslint-disable no-alert */
import { MapContainer, TileLayer } from 'react-leaflet'
import React, { FormEvent, useEffect, useState } from 'react'
import Leaflet, { LatLng } from 'leaflet'
import { PositionMarker } from '../../components/PositionMarker'

import 'leaflet.offline'

function Map() {
  const [position, setPosition] = useState<LatLng>()
  const [map, setMap] = useState(null)
  const [progressSaveMap, setProgressSaveMap] = useState(0)
  const [totalLayerToSave, setTotalLayersToSave] = useState(0)

  function showPosition(foundPosition: any) {
    setPosition({
      lng: foundPosition.coords.longitude,
      lat: foundPosition.coords.latitude,
    } as LatLng)
  }

  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        showPosition,
        err => {
          window.alert(`Erro ao atualizar localização - ${err.message}`)
        },
        {
          timeout: 2000,
        }
      )
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

      tileLayerOffline.on('savestart', (e: any) => {
        setTotalLayersToSave(e._tilesforSave.length)
      })

      tileLayerOffline.on('savetileend', () => {
        setProgressSaveMap(currentProgress => currentProgress + 1)
      })
    }
  }, [map])

  useEffect(() => {
    getLocation()
  }, [])

  function handleSubmitCoords(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const lat = (document.getElementById('lat') as any)?.value
    const lng = (document.getElementById('long') as any)?.value

    setPosition({
      lat,
      lng,
    } as LatLng)
  }

  return (
    <>
      <div>Posição atual: {JSON.stringify(position)}</div>
      <form onSubmit={handleSubmitCoords}>
        <label htmlFor="lat">
          Latitude
          <input id="lat" type="text" />
        </label>
        <label htmlFor="long">
          Longitude
          <input id="long" type="text" />
        </label>
        <button type="submit">Navegar</button>
      </form>
      {progressSaveMap > 0 && (
        <progress id="file" value={Number((progressSaveMap / totalLayerToSave) * 100).toFixed(2)} max="100">
          {Number((progressSaveMap / totalLayerToSave) * 100).toFixed(2)}%
        </progress>
      )}
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
