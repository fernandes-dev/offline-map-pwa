/* eslint-disable no-alert */
import { MapContainer, TileLayer } from 'react-leaflet'
import React, { FormEvent, useEffect, useMemo, useState } from 'react'
import Leaflet, { LatLng } from 'leaflet'
import { PositionMarker } from '../../components/PositionMarker'

import 'leaflet.offline'
import { MakeTileLayerOffline } from './functions/TileLayerOffline'
import { ICheckpoint } from './types/ICheckpoint'
import { CheckpointMarker } from './components/CheckpointMarker'

function Map() {
  const [position, setPosition] = useState<Pick<LatLng, 'lat' | 'lng'>>()
  const [map, setMap] = useState<any>(null)
  const [progressSaveMap, setProgressSaveMap] = useState(0)
  const [totalLayerToSave, setTotalLayersToSave] = useState(0)

  const [checkpoints, setCheckpoints] = useState<ICheckpoint[]>([])

  function updatePosition(newPosition: any): void {
    if (newPosition.coords.longitude !== position?.lng || newPosition.coords.latitude !== position?.lat) {
      setPosition({
        lng: newPosition.coords.longitude,
        lat: newPosition.coords.latitude,
      })
    }
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

  function navigatoTePosition(data: Pick<LatLng, 'lat' | 'lng'>, zoomLevel?: number): void {
    if (data) map?.setView(data, zoomLevel || map.getZoom())
  }

  function handleSubmitCheckpoint(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const lat = (document.getElementById('latC') as any)?.value
    const lng = (document.getElementById('longC') as any)?.value

    const newCheckpoint: ICheckpoint = {
      position: { lat, lng },
      text: `Ponto de controle - ${checkpoints.length}`,
    }

    const newCheckpoints = [...checkpoints, newCheckpoint]
    setCheckpoints(newCheckpoints)
    localStorage.setItem('map-checkpoints', JSON.stringify(newCheckpoints))
    map?.setView(map?.getCenter())
  }

  function deleteCheckpoint(index: number) {
    const newCheckpoints = checkpoints.filter((c, currentIndex) => currentIndex !== index)

    setCheckpoints(newCheckpoints)
    localStorage.setItem('map-checkpoints', JSON.stringify(newCheckpoints))
  }

  const renderMap = useMemo(() => {
    if (position)
      return (
        <MapContainer id="map" center={position} zoom={13} ref={setMap} scrollWheelZoom={false}>
          <TileLayer
            id="mapbox/streets-v11"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <PositionMarker position={position} text="Você está aqui" />

          {checkpoints.length > 0 &&
            checkpoints.map(marker => (
              <CheckpointMarker
                key={Math.random()}
                marker={marker}
                positionToCompare={position}
                checkPointDetails={
                  <>
                    <div>{marker.text}</div>
                    <div>
                      <b>Coordenadas</b>
                    </div>
                    <div>latitude: {marker.position.lat}</div>
                    <div>longitude: {marker.position.lng}</div>
                  </>
                }
              />
            ))}
        </MapContainer>
      )

    return <></>
  }, [position, checkpoints])

  useEffect(() => {
    if (position) navigatoTePosition(position)

    const localStorageCheckpoints = localStorage.getItem('map-checkpoints')

    if (localStorageCheckpoints) setCheckpoints(JSON.parse(localStorageCheckpoints))
  }, [])

  useEffect(() => {
    const watchPositionID = getLocation()

    return () => {
      navigator.geolocation.clearWatch(watchPositionID)
    }
  }, [])

  useEffect(() => {
    if (map) {
      const tileLayerOffline = MakeTileLayerOffline(Leaflet, map)

      tileLayerOffline?.on('savestart', e => {
        setTotalLayersToSave(e.lengthToBeSaved)
      })

      tileLayerOffline?.on('savetileend', () => {
        setProgressSaveMap(currentProgress => currentProgress + 1)
      })
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
            <button type="button" onClick={() => map?.setView(position)}>
              Ver minha posição
            </button>
          </div>
          <div>{renderMap}</div>
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
