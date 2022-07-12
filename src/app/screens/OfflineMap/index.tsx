/* eslint-disable no-alert */
import { MapContainer, TileLayer } from 'react-leaflet'
import React, { FormEvent, useEffect, useState } from 'react'
import Leaflet, { LatLng } from 'leaflet'

import 'leaflet.offline'
import 'leaflet.locatecontrol'
import { MakeTileLayerOffline } from './functions/TileLayerOffline'
import { ICheckpoint } from './types/ICheckpoint'
import { CheckpointMarker } from './components/CheckpointMarker'

type ILatLng = Pick<LatLng, 'lat' | 'lng'>

function Map() {
  const [position, setPosition] = useState<ILatLng>()
  const [map, setMap] = useState<Leaflet.Map | null>(null)
  const [mapControls, setMapControls] = useState<boolean>(false)
  const [progressSaveMap, setProgressSaveMap] = useState(0)
  const [totalLayerToSave, setTotalLayersToSave] = useState(0)
  const [polylines, setPolylines] = useState<ILatLng[][]>([])
  const [mapPolyline, setMapPolyline] = useState<Leaflet.Polyline<any>>()

  const [checkpoints, setCheckpoints] = useState<ICheckpoint[]>([])

  function updatePosition(newPosition: any): void {
    setPosition({
      lng: newPosition.coords.longitude,
      lat: newPosition.coords.latitude,
    })
  }

  function getLocation(): number {
    if (navigator.geolocation) {
      return navigator.geolocation.watchPosition(
        updatePosition,
        err => {
          window.alert(`Erro ao atualizar localização - ${err.message}`)
        },
        {
          timeout: 3000,
          enableHighAccuracy: true,
        }
      )
    }
    window.alert('Seu dispositivo não tem suporte à geolocalização')

    return 0
  }

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

  function deleteCheckpoint(index: number) {
    const newCheckpoints = checkpoints.filter((c, currentIndex) => currentIndex !== index)

    setCheckpoints(newCheckpoints)
    localStorage.setItem('map-checkpoints', JSON.stringify(newCheckpoints))
  }

  function verifyPolylineExists(destiny: ILatLng): boolean {
    if (!position) return false

    const existsPolyline = polylines.find(p =>
      p.find(p2 => String(p2.lng) === String(destiny.lng) && String(p2.lat) === String(destiny.lat))
    )

    return !!existsPolyline
  }

  function handleAddPolyline(destiny: ILatLng) {
    if (!map) return

    const existsPolyline = verifyPolylineExists(destiny)

    if (existsPolyline || !position) return

    if (mapPolyline) {
      mapPolyline.setLatLngs([...polylines, [destiny, position]])
    } else {
      const polyline = Leaflet.polyline([...polylines, [destiny, position]], { color: 'red' })

      polyline.addTo(map)

      setMapPolyline(polyline)
    }

    setPolylines([...polylines, [destiny, position]])
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

  const renderMap = () => {
    if (position)
      return (
        <MapContainer id="map" center={position} zoom={13} ref={setMap} scrollWheelZoom={false}>
          <TileLayer
            id="mapbox/streets-v11"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* <PositionMarker position={position} text="Você está aqui" /> */}

          {checkpoints.length > 0 &&
            checkpoints.map(marker => (
              <CheckpointMarker
                key={marker.id}
                marker={marker}
                positionToCompare={position}
                checkPointDetails={
                  <>
                    <h3>{marker.text}</h3>
                    <div>
                      <b>Coordenadas</b>
                    </div>
                    <div>latitude: {marker.position.lat}</div>
                    <div>longitude: {marker.position.lng}</div>
                    {!verifyPolylineExists(marker.position) ? (
                      <button type="button" onClick={() => handleAddPolyline(marker.position)}>
                        Marcar rota
                      </button>
                    ) : (
                      <button type="button" onClick={() => handleRemovePolyline(marker.position)}>
                        Excluir rota
                      </button>
                    )}
                  </>
                }
              />
            ))}
        </MapContainer>
      )
    return <></>
  }

  useEffect(() => {
    if (position) navigatoTePosition(position)

    const localStorageCheckpoints = localStorage.getItem('map-checkpoints')

    if (localStorageCheckpoints) setCheckpoints(JSON.parse(localStorageCheckpoints))

    const watchPositionID = getLocation()

    return () => {
      navigator.geolocation.clearWatch(watchPositionID)
    }
  }, [])

  useEffect(() => {
    if (map) {
      if (map && !mapControls) {
        const tileLayerOffline = MakeTileLayerOffline(Leaflet, map)

        tileLayerOffline?.on('savestart', e => {
          setTotalLayersToSave(e.lengthToBeSaved)
        })

        tileLayerOffline?.on('savetileend', () => {
          setProgressSaveMap(currentProgress => currentProgress + 1)
        })

        setMapControls(true)
      }

      Leaflet.control
        .locate({
          strings: {
            popup: ({ distance }: { distance: number; unit: number }) => `você está a ${distance} metros deste ponto.`,
          },
        })
        .addTo(map)
    }

    return () => {
      setMapControls(false)
    }
  }, [map])

  // useEffect(() => {
  //   if (polylines.length > 0 && map) {
  //
  //   }
  // }, [polylines])

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
