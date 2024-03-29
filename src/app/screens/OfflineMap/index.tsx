/* eslint-disable no-alert,no-console */
import { MapContainer, TileLayer } from 'react-leaflet'
import React, { FormEvent, useEffect, useState } from 'react'
import Leaflet, { LatLng } from 'leaflet'

import 'leaflet.offline'
import 'leaflet.locatecontrol'
// import 'leaflet.webgl-temperature-map'
import '../../../libs/leaflet-heat'
import { MakeTileLayerOffline } from './functions/TileLayerOffline'
import { ICheckpoint } from './types/ICheckpoint'

type ILatLng = Pick<LatLng, 'lat' | 'lng'>

function Map() {
  const [map, setMap] = useState<Leaflet.Map | null>(null)
  const [position, setPosition] = useState<ILatLng>()
  const [mapControls, setMapControls] = useState<boolean>(false)
  const [progressSaveMap, setProgressSaveMap] = useState(0)
  const [totalLayerToSave, setTotalLayersToSave] = useState(0)
  const [polylines, setPolylines] = useState<ILatLng[][]>([])
  const [mapPolyline, setMapPolyline] = useState<Leaflet.Polyline<any>>()
  const [checkpoints, setCheckpoints] = useState<ICheckpoint[]>([])

  let heatLayer: any
  const [heatPoints, setHeatPoints] = useState<any>()

  function navigatoTePosition(data: ILatLng, zoomLevel?: number): void {
    if (data) map?.setView(data, zoomLevel || map.getZoom())
  }

  function handleSubmitCheckpoint(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const lat = (document.getElementById('latC') as any)?.value
    const lng = (document.getElementById('longC') as any)?.value

    const newCheckpoint: ICheckpoint = {
      id: Math.random(),
      position: { lat, lng },
      text: `Ponto de controle - ${checkpoints.length}`,
    }

    const newCheckpoints = [...checkpoints, newCheckpoint]
    setCheckpoints(newCheckpoints)
    localStorage.setItem('map-checkpoints', JSON.stringify(newCheckpoints))
  }

  function resetHeatLayerRender() {
    const elements = document.getElementsByClassName('leaflet-pane leaflet-overlay-pane')

    ;(elements[0] as any)?.click()
  }

  function handleRemovePolyline(destiny: ILatLng) {
    if (!map) return

    const polygonIndex = polylines.findIndex(p =>
      p.find(p2 => String(p2.lng) === String(destiny.lng) && String(p2.lat) === String(destiny.lat))
    )

    const newPolylines = [...polylines]
    newPolylines.splice(polygonIndex, 1)

    mapPolyline?.setLatLngs(newPolylines)

    setPolylines(newPolylines)
  }

  function addHeatPoints(points: any[]) {
    heatLayer?.setLatLngs(points)

    setHeatPoints(points)
    resetHeatLayerRender()
  }

  function deleteCheckpoint(index: number) {
    handleRemovePolyline(checkpoints[index].position)

    const newCheckpoints = checkpoints.filter((c, currentIndex) => currentIndex !== index)

    setCheckpoints(newCheckpoints)
    localStorage.setItem('map-checkpoints', JSON.stringify(newCheckpoints))

    addHeatPoints(newCheckpoints.map(c => [Number(c?.position.lat), Number(c?.position.lng), 1]))
  }

  const renderCheckpoints = () => {
    return checkpoints.length > 0 && checkpoints.map(marker => <div key={marker.id} />)
  }

  const renderMap = () => {
    return (
      position && (
        <MapContainer id="map" center={position} zoom={13} ref={setMap}>
          <TileLayer
            id="mapbox/streets-v11"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {renderCheckpoints()}
        </MapContainer>
      )
    )
  }

  function setMapViewOnUserLocation(): void {
    if (window.navigator.geolocation)
      navigator.geolocation.getCurrentPosition(e => {
        const currentPosition = { lng: e.coords.longitude, lat: e.coords.latitude }

        setPosition(currentPosition)
      })
    else window.alert('Seu dispositivo não tem suporte a geolocalização')
  }

  useEffect(() => {
    if (position) navigatoTePosition(position)

    setMapViewOnUserLocation()

    const localStorageCheckpoints = localStorage.getItem('map-checkpoints')

    if (localStorageCheckpoints) setCheckpoints(JSON.parse(localStorageCheckpoints))
  }, [])

  function addHeatLayer() {
    if (map) {
      // @ts-ignore
      heatLayer = Leaflet.heatLayer([], { radius: 50, blur: 25 }).addTo(map)

      resetHeatLayerRender()
    }
  }

  // useEffect(() => {
  //   console.log(heatPoints)
  // }, [heatPoints])

  function addOfflineMapControls(): void {
    if (map && !mapControls) {
      const tileLayerOffline = MakeTileLayerOffline(Leaflet, map)

      tileLayerOffline?.on('savestart', e => {
        setTotalLayersToSave(e.lengthToBeSaved)
      })

      tileLayerOffline?.on('savetileend', () => {
        setProgressSaveMap(currentProgress => currentProgress + 1)
      })

      setMapControls(true)
      addHeatPoints(checkpoints.map((c, index) => [Number(c?.position.lat), Number(c?.position.lng), index / 50]))
    }
  }

  function addUserLocationHandler(): void {
    if (!map) return

    Leaflet.control
      .locate({
        strings: {
          popup: ({ distance }: { distance: number; unit: number }) => `você está a ${distance} metros deste ponto.`,
        },
      })
      .addTo(map)

    map.on('locationfound', e => {
      setPosition(e.latlng)
    })

    map.on('click', (e: any) => {
      if (e.originalEvent.pointerType !== 'mouse') return

      const currentCheckpoints = localStorage.getItem('map-checkpoints') || '[]'

      const newCheckpoint = { id: Math.random(), position: (e as any).latlng, text: `teste${Math.random()}` }
      const newCheckpoints = [...JSON.parse(currentCheckpoints), newCheckpoint]
      setCheckpoints(newCheckpoints)
      addHeatPoints(newCheckpoints.map(c => [Number(c?.position.lat), Number(c?.position.lng), 1]))

      localStorage.setItem('map-checkpoints', JSON.stringify(newCheckpoints))
      console.log('adicionou ponto')

      resetHeatLayerRender()
    })

    map.on('click', (e: any) => {
      if (e.originalEvent.pointerType === 'mouse') return

      const currentCheckpoints = localStorage.getItem('map-checkpoints') || '[]'

      const newCheckpoints = [...JSON.parse(currentCheckpoints)]

      addHeatPoints(newCheckpoints.map(c => [Number(c?.position.lat), Number(c?.position.lng), 1]))
    })
  }

  useEffect(() => {
    addOfflineMapControls()
    addUserLocationHandler()
    addHeatLayer()

    return () => {
      setMapControls(false)
    }
  }, [map])

  return (
    <>
      <div>Posição atual: {JSON.stringify(position)}</div>

      <div className="forms-box">
        <form className="add-checkpoint-form" onSubmit={handleSubmitCheckpoint}>
          <div className="forms-title">Adicionar ponto de Controle:</div>
          <label htmlFor="latC">
            Latitude
            <input id="latC" type="text" />
          </label>
          <label htmlFor="longC">
            Longitude
            <input id="longC" type="text" />
          </label>
          <button type="submit">Adicionar</button>
        </form>
      </div>
      {progressSaveMap > 0 && (
        <progress id="file" value={Number((progressSaveMap / totalLayerToSave) * 100).toFixed(2)} max="100">
          {Number((progressSaveMap / totalLayerToSave) * 100).toFixed(2)}%
        </progress>
      )}

      <div className="map-box">
        <div>
          <div>
            <button
              type="button"
              onClick={() => {
                const a = document.getElementsByClassName('savetiles')

                ;(a[1] as any)?.click()
              }}
            >
              Salvar mapa atual
            </button>
            <button
              type="button"
              onClick={() => {
                const b = document.getElementsByClassName('rmtiles')

                ;(b[0] as any)?.click()
              }}
            >
              Exluir dados da memória
            </button>
            <button type="button" onClick={() => map?.setView(position!)}>
              Ver minha posição
            </button>
          </div>
          <div>{renderMap()}</div>
        </div>
        <div style={{ margin: '0 10px' }} />
        <div>
          {checkpoints.length > 0 && (
            <>
              <h3 style={{ textAlign: 'center' }}>Lista de pontos de controle</h3>

              {checkpoints.map((checkPoint, index) => (
                <div className="checkpoint" key={Math.random()}>
                  <div className="checkpoint-body">
                    {checkPoint.text}
                    <small>{JSON.stringify(checkPoint.position)}</small>
                  </div>
                  <div className="checkpoint-actions">
                    <button type="button" onClick={() => navigatoTePosition(checkPoint.position)} key={Math.random()}>
                      Visualizar
                    </button>
                    <div style={{ margin: '0 10px' }} />
                    <button type="button" onClick={() => deleteCheckpoint(index)} key={Math.random()}>
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  )
}

export { Map }
