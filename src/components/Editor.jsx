import { createSignal, For, Index } from "solid-js";
import config from './config.js'

const emptySection = { code: -1, name: 'Empty', color: '' };

const Editor = () => {

  const [mapScale, setMapScale] = createSignal(8);

  const [currentSelected, setCurrentSelected] = createSignal(emptySection);
  const [layer, setLayer] = createSignal(0)
  const [layerCount, setLayerCount] = createSignal(3)
  const [gridSizeX, setGridSizeX] = createSignal(3);
  const [gridSizeY, setGridSizeY] = createSignal(4);
  const [layersWorldMap, setLayersWorldMap] = createSignal([[[emptySection]], [[emptySection]], [[emptySection]]])
  const [worldmap, setWorldMap] = createSignal([[emptySection]])
  const [isEditing, setIsEditing] = createSignal(true);

  return (
    <div class="h-full w-full flex">

      <div class="h-full w-9/12 my-1">
        <Index each={worldmap()}>
          {(row, rowIndex) => (
            <div class="flex flex-row my-1 text-center" classList={{ 'translate-x-10': rowIndex % 2 === 1}}>
              <Index each={row()}>
                {(col, colIndex) => (
                  // TODO: Change the div color based on the selection. Probably grab all the assets from Dean's game to place in
                      <div class="mx-1 cursor-pointer h-20 w-20 overflow-hidden resize-none pt-6 border-2" style={`background-color: ${col().color}`} onClick={() => {
                        let oldMap = []
                        for (let i = 0; i < worldmap().length; i++) {
                          oldMap.push([])
                          for (let j = 0; j < worldmap()[0].length; j++) {
                            oldMap[i].push(worldmap()[i][j])
                          }
                        }

                        oldMap[rowIndex][colIndex] = currentSelected();
                        setWorldMap(oldMap);

                        let transferMap = [];

                        for (let k = 0; k < layerCount(); k++) {
                          transferMap.push([]);
                          for (let i = 0; i < gridSizeY(); i++) {
                            transferMap.at(k).push([])
                            for (let j = 0; j < gridSizeX(); j++) {
                              transferMap[k][i].push(layersWorldMap()[k][i][j]);
                            }
                          }
                        }

                        transferMap[layer()] = oldMap;

                        setLayersWorldMap(transferMap);

                      }}>
                        {col().name === 'Floor' ? '' : col().name}
                      </div>
                )}
              </Index>
            </div>
          )}
        </Index>
      </div>

      


          {!isEditing() && 
          <div class="card fixed w-3/12 h-[98%] max-h-full right-2 bg-base-100 shadow-2xl overflow-y-scroll">
          <div class="card-body">
            <div class="flex flex-row">
              <div class="w-1/2">
                <button type="button" class="btn btn-primary w-[95%]" onClick={() => setIsEditing(true)}>Map Editor</button>
              </div>
              <div class="w-1/2">
                <button type="button" class="btn btn-primary w-[95%]" onClick={() => setIsEditing(false)}>Save Menu</button>
              </div>
            </div>
            <h2 class="card-title">Layer {layer} Selected</h2>
            <input type="range" min="0" max="2" value={layer()} onChange={(e) => {
              setLayer(e.target.value);
  
              let newMap = []
  
              for (let i = 0; i < layersWorldMap()[e.target.value].length; i++) {
                newMap.push([]);
                for (let j = 0; j < layersWorldMap()[e.target.value][0].length; j++) {
                  newMap[i].push(layersWorldMap()[layer()][i][j])
                }
              }
  
              setWorldMap(newMap);
              }} class="range"> </input>
            <h2 class="card-title mt-8 mb-2">Title</h2>
            <input type="text" placeholder="Enter Your Beautiful, Well Thought Out Title" id="title" name="title" class="input input-bordered"></input>
  
  
            <h2 class="card-title mt-8 mb-2">Hint</h2>
            <input type="text" placeholder="Enter Your Hint" id="hint" name="hint" class="input input-bordered"></input>
  
            
  
            <div class="flex flex-row">
              <div>
              <h2 class="card-title mt-8 mb-2 ">Default X Center</h2>
              <input type="text" placeholder="Enter X centering" id="X" name="X" class="input input-bordered w-[95%]"></input>
              </div>
              <div>
  
              <h2 class="card-title mt-8 mb-2 ">Default Y Center</h2>
              <input type="text" placeholder="Enter Y Centering" id="Y" name="Y" class="input input-bordered w-[95%]"></input>
              </div>
            </div>
            
            <h2 class="card-title mt-8 mb-2">Default Zoom</h2>
            <input type="text" placeholder="Default Zoom (# Cells Seen in Biggest Dimension)" id="zoom" name="zoom" class="input input-bordered"></input>

            <h2 class="card-title mt-8 mb-2">Goals</h2>
            <For each={Object.keys(config.objects)}>
              {selection =>
              <div class="flex flex-row"> 
                <div>
                  <input type="number" placeholder="Enter number to reach this type (i.e. 2 to blue)" value="0" class="input input-bordered w-[95%]"></input> 
                </div>
                <div class="w-[95%]">
                  <button id={`object-${selection}`} class="btn w-[95%]" classList={{ 'btn-primary': currentSelected().code === config.objects[selection].code }}>{selection}</button> 
                </div>
              </div>}
            </For>


            <div class="card-actions mt-4 w-[100%]">
              <button class="btn btn-primary w-[100%]">Save</button>
            </div>
          </div>
          </div>
          }
          

          {isEditing() && 
          <div class="card fixed w-3/12 h-[98%] max-h-full right-2 bg-base-100 shadow-2xl overflow-y-scroll">
          <div class="card-body">
            <div class="flex flex-row">
              <div class="w-1/2">
                <button type="button" class="btn btn-primary w-[95%]" onClick={() => setIsEditing(true)}>Map Editor</button>
              </div>
              <div class="w-1/2">
                <button type="button" class="btn btn-primary w-[95%]" onClick={() => setIsEditing(false)}>Save Menu</button>
              </div>
  
            </div>
  
            <h2 class="card-title">Layer {layer} Selected</h2>
            <input type="range" min="0" max="2" value={layer()} onChange={(e) => {
              setLayer(e.target.value);
  
              let newMap = []
  
              for (let i = 0; i < layersWorldMap()[e.target.value].length; i++) {
                newMap.push([]);
                for (let j = 0; j < layersWorldMap()[e.target.value][0].length; j++) {
                  newMap[i].push(layersWorldMap()[layer()][i][j])
                }
              }
  
              setWorldMap(newMap);
              }} class="range"> </input>
              
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

              for (let k = 0; k < layerCount(); k++) {
                newMap.push([]);
                for (let i = 0; i < gridSizeY(); i++) {
                  newMap.at(k).push([])
                  for (let j = 0; j < gridSizeX(); j++) {
                    newMap[k][i].push(emptySection);
                  }
                }
              }
              setWorldMap(newMap[layer()])
              setLayersWorldMap(newMap);
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

            </div>
          </div>
          
          }


    </div>      


  )
};

export default Editor;