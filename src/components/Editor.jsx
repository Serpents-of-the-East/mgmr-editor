import { createSignal, For, Index } from "solid-js";
import config from './config.js'

const emptySection = { code: -1, name: 'Empty', color: 'bg-secondary' };

const Editor = () => {

  const [mapScale, setMapScale] = createSignal(8);

  const [currentSelected, setCurrentSelected] = createSignal(emptySection);

  const [gridSizeX, setGridSizeX] = createSignal(3);
  const [gridSizeY, setGridSizeY] = createSignal(4);

  const [worldmap, setWorldMap] = createSignal([[emptySection]])

  return (
    <div class="h-full w-full flex">

      <div class="h-full w-9/12 my-1">
        <Index each={worldmap()}>
          {(row, rowIndex) => (
            <div class="flex flex-row my-1 text-center" classList={{ 'translate-x-10': rowIndex % 2 === 1}}>
              <Index each={row()}>
                {(col, colIndex) => (
                  // TODO: Change the div color based on the selection. Probably grab all the assets from Dean's game to place in
                      <div class="bg-secondary mx-1 cursor-pointer h-20 w-20 overflow-hidden resize-none pt-6" onClick={() => {
                        let oldMap = []
                        for (let i = 0; i < worldmap().length; i++) {
                          oldMap.push([])
                          for (let j = 0; j < worldmap()[0].length; j++) {
                            oldMap[i].push(worldmap()[i][j])
                          }
                        }
                        oldMap[rowIndex][colIndex] = currentSelected()
                        setWorldMap(oldMap);

                      }}>
                        {col().name}
                      </div>
                )}
              </Index>
            </div>
          )}
        </Index>
      </div>

      <div class="card fixed w-3/12 h-[98%] max-h-full right-2 bg-base-100 shadow-2xl overflow-y-scroll">
        <div class="card-body">
          <h2 class="card-title">View Width</h2>
          <input type="range" min="1" max="20" value={mapScale()} onChange={(e) => setMapScale(e.target.value)} class="range" />

          <h2 class="card-title mt-8 mb-2">Map Size</h2>
          <div class="form-control">
            <label class="input-group">
              <span>X</span>
              <input type="number" placeholder="1" value={gridSizeX()} onChange={(e) => setGridSizeX(e.target.value)} class="input input-bordered" />
            </label>
          </div>
          <div class="form-control">
            <label class="input-group">
              <span>Y</span>
              <input type="number" placeholder="1" value={gridSizeY()} onChange={(e) => setGridSizeY(e.target.value)} class="input input-bordered" />
            </label>
          </div>
          <button type="button" class="btn btn-primary" onClick={() => {
            const newMap = []
            for (let i = 0; i < gridSizeY(); i++){
              let current = []
              for (let j = 0; j < gridSizeX(); j++){
                current.push(emptySection)
              }
              newMap.push(current)
            }
            setWorldMap(newMap)
          }}>Set</button>

          <h2 class="card-title mt-8">Current Selection</h2>
          <span>{currentSelected().name}</span>
          <h2 class="card-title mt-8">Empty</h2>
          <button class="btn" classList={{ 'btn-primary': currentSelected().code === -1 }} onClick={() => setCurrentSelected({ code: -1, name: 'Empty' })}>Empty</button>
          <h2 class="card-title mt-8">Objects</h2>
          <For each={Object.keys(config.objects)}>
            {selection => <button id={`object-${selection}`} class="btn" classList={{ 'btn-primary': currentSelected().code === config.objects[selection].code }} onClick={() => setCurrentSelected(config.objects[selection])}>{selection}</button>}
          </For>
          <h2 class="card-title mt-8">Object Text</h2>
          <For each={Object.keys(config.objectsText)}>
            {selection => <button id={`text-${selection}`} class="btn" classList={{ 'btn-secondary': currentSelected().code === config.objectsText[selection].code }} onClick={() => setCurrentSelected(config.objectsText[selection])}>{selection}</button>}
          </For>
          <h2 class="card-title mt-8">Verbs</h2>
          <For each={Object.keys(config.verbs)}>
            {selection => <button id={`verb-${selection}`} class="btn" classList={{ 'btn-accent': currentSelected().code === config.verbs[selection].code }} onClick={() => setCurrentSelected(config.verbs[selection])}>{selection}</button>}
          </For>
          <h2 class="card-title mt-8">Properties</h2>
          <For each={Object.keys(config.properties)}>
            {selection => <button id={`prop-${selection}`} class="btn" classList={{ 'btn-primary': currentSelected().code === config.properties[selection].code }} onClick={() => setCurrentSelected(config.properties[selection])}>{selection}</button>}
          </For>
          <p></p>
          <div class="card-actions justify-end">
            <button class="btn btn-primary">Save</button>
          </div>
        </div>
      </div>
    </div>
  )
};

export default Editor;