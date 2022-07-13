<h1 align="center">🗺️ Offline Map</h1>

<!-- ABOUT THE PROJECT -->

## 📋 Sobre o projeto

Projeto desenvolvido com o intuito de possibilitar a visualização de pontos específicos em um mapa, mesmo com ausência
de internet. A aplicação será utilizada em fazendas, para que os usuários localizem locais específicos cadastrados no
sistema.

## 📦 Componentes

O projeto consiste de 2 componentes principais

1. Mapa
2. Ponto de controle

- mais componentes serão adicionados com o desenvolvimento

## 🍃 Leaflet

Para que os componentes do Leaflet funcionem corretamente, é necessário adicionar as seguintes importações:

`public/index.html`

```html

<link href='https://cdn.jsdelivr.net/npm/leaflet.locatecontrol/dist/L.Control.Locate.min.css' rel='stylesheet' />

<script charset='utf-8' src='https://cdn.jsdelivr.net/npm/leaflet.locatecontrol/dist/L.Control.Locate.min.js'></script>

<link
  crossorigin=''
  href='https://unpkg.com/leaflet@1.8.0/dist/leaflet.css'
  integrity='sha512-hoalWLoI8r4UszCkZ5kL8vayOGVae1oxXe/2A4AO6J9+580uKHDO3JdHb7NzwwzK5xr/Fs0W40kiNHxM9vyTtQ=='
  rel='stylesheet'
/>

<script
  crossorigin=''
  integrity='sha512-BB3hKbKWOc9Ez/TAwyWxNXeoV9c1v6FIeYiBieIWkpLjauysF18NzgR1MBNBXf8/KABdlkX68nAhlwcDFLGPCQ=='
  src='https://unpkg.com/leaflet@1.8.0/dist/leaflet.js'
></script>
```

<br>

`src/app/screens/OfflineMap/index.tsx`

```ts
import 'leaflet.offline'
import 'leaflet.locatecontrol'
```

## 📕 Estados da aplicação - React States

`src/app/screens/OfflineMap/index.tsx`

```ts
// estado para armazenar e atualizar o mapa do Leaflet
const [map, setMap] = useState<Leaflet.Map | null>(null)

// armazenar e atualizar posição atual do usuário
const [position, setPosition] = useState<ILatLng>()

// flag para identificar se os controles de "salvar" e "excluir" já foram adicionados ao mapa
// esses controles servem para salvar os "tiles" do leaflet no IndexedDb para visualização sem internet
const [mapControls, setMapControls] = useState<boolean>(false)

// estado utilizado para exibir barra de progresso ao salvar mapa em memória
const [progressSaveMap, setProgressSaveMap] = useState(0)

// quantidade de "tiles" que serão armazenados em memória
const [totalLayerToSave, setTotalLayersToSave] = useState(0)

// as polylines são as linhas que conectam o usuário a um ponto selecionado no mapa
const [polylines, setPolylines] = useState<ILatLng[][]>([])

// estado para armazenar a camada de polylines do Leaflet para poder adicionar ou remover linhas
const [mapPolyline, setMapPolyline] = useState<Leaflet.Polyline<any>>()

// pontos de controle marcados no mapa
const [checkpoints, setCheckpoints] = useState<ICheckpoint[]>([])
```

## 📚 Funções Principais

`src/app/screens/OfflineMap/index.tsx`

```ts
// altera a visualização do mapa para centralizar na localização recebida
function navigatoTePosition(data: ILatLng, zoomLevel?: number): void

// dado uma coordenada geográfica
// retorna um booleano indicando se existe polyline que se conecta ao usuário
function verifyPolylineExists(destiny: ILatLng): boolean

// adiciona polyline para o destino, se conectado ao usuário
// em seguida altera o zoom do mapa para exibir toda a extesão da linha
function handleAddPolyline(destiny: ILatLng): void

// remove a linha que conecta o usuário ao destino especificado
function handleRemovePolyline(destiny: ILatLng): void

// adiciona os controles para salvar e excluir o mapa da memória
// em seguida registra os eventos para exibir a barra de progresso
function addOfflineMapControls(): void

// adiciona controle para buscar localização do usuário e exibir orientação
function addUserLocationHandler(): void

// verifica se o dispositivo tem suporte a geolocalização
// muda a visualização do mapa para a localização inicial do usuário
function setMapViewOnUserLocation(): void
```

<br>

`src/app/screens/OfflineMap/functions/CalculateDistanceBetweenCoords.ts`

```ts
// calcula a distância entre duas coordenadas, em METROS
function CalculateDistanceBetweenCoords(firstPosition?: ICoords, secondPosition?: ICoords): number
```

<br>

`src/app/screens/OfflineMap/functions/TileLayerOffline.ts`

```ts
// adiciona a possibilidade de salvar a visualização do mapa em memória
function MakeTileLayerOffline(leaflet: typeof Leaflet, map: Map): Leaflet.tileLayerOffline | undefined
```

## 🚀 Iniciando

### Pre-requisitos

- yarn
  ```sh
  npm install -g yarn
  ```

### Instalação

1. Clone este repositório em seu computador
   ```sh
   git clone git@github.com:fernandes-dev/offline-map-pwa.git
   ```
2. Acesse a pasta e instale as dependências
   ```sh
   yarn
   ```
3. Para executar em modo desenvolvimento:
   ```sh
   yarn start
   ```

## 🔜 Implementações futuras

- Mapa térmico para identificação de concentração de pragas
- Agrupamento de pontos próximos em um único local

## 🎯 Status do Projeto

- Em desenvolvimento

## 🤝 Colaboradores

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/fernandes-dev">
        <img src="https://avatars.githubusercontent.com/u/44908695?v=4" width="100px;" alt="Foto de Eduardo Fernandes no GitHub"/><br>
        <sub>
          <b>Eduardo Fernandes</b>
        </sub>
      </a>
    </td>
  </tr>
</table>

