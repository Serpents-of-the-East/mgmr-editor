import { createSignal, For, Index, onMount, Show } from "solid-js";
import config, { reverseLookup } from './config.js'
import { v4 as uuidV4 } from "uuid";

const emptySection = { code: -1, name: 'Empty', color: '' };

const hexToRGBA = (hex, opacity) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

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
  const [saveInfo, setSaveInfo] = createSignal({
    title: '',
    hint: '',
    defaultXCenter: 0,
    defaultYCenter: 0,
    defaultZoom: 8,
    goals: (new Array(Object.keys(config.objects).length).fill(0)),
  });
  const [mouseDown, setMouseDown] = createSignal(false);


  const [names, setNames] = createSignal((Object.keys(config.objects)));
  const [codes, setCodes] = createSignal(Object.values(config.objects));

  const [loadedFile, setLoadedFile] = createSignal(null);

  const [layerTransparency, setLayerTransparency] = createSignal(0.5);

  const getBackgroundColor = (rowIndex, colIndex) => {
    let color = worldmap()[rowIndex][colIndex].color;
    // If this one is filled already, we should do this one
    if (color) {
      return color;
    }

    for (let i = 2; i >= 0; i--){
      // Top down approach, top-most layer should appear if the current doesn't have one
      let currentRow = layersWorldMap()[i][rowIndex];

      if (!currentRow) {
        continue;
      }

      color = currentRow[colIndex]?.color;
      if (color) {
        return hexToRGBA(color, layerTransparency());
      }
    }

    return '';
  }

  onMount(() => {
    let colorTheme = localStorage.getItem('editor-color') ?? 'night';
    const html = document.querySelector('html');
    html.setAttribute('data-theme', colorTheme);
    document.body.onmousedown = () => {console.log("Down"); setMouseDown(true)}
    document.body.onmouseup = () => {console.log("Up"); setMouseDown(false)}
  })

  const setColorTheme = (e) => {
    const html = document.querySelector('html');
    html.setAttribute('data-theme', e.target.value);
    localStorage.setItem('editor-color', e.target.value);
  }

  const saveFile = () => {
    let fileContent = "";

    // Create the filename
    let fileName = saveInfo().title + '.puzzles';

    // Create the UUID to append
    let uuid = uuidV4();

    // Add the goals
    let goals = "";
    for (let i = 0; i < saveInfo().goals.length; i++) {
      if (saveInfo().goals[i] !== 0) {
        goals += `[${saveInfo().goals[i]}:${codes()[i].code}]`;
      }
    }

    // Get the information for the Center X, Center Y, and Zoom
    let centerAndZoom = `${saveInfo().defaultXCenter}, ${saveInfo().defaultYCenter}, ${saveInfo().defaultZoom}`;

    // Get Size of the Map
    let sizeOfMap = `${layerCount()} x ${gridSizeX()} x ${gridSizeY()}`;

    // Get all layer information

    let map = ""
    // If empty, must be '  ', else will always be 2 characters long. If < 10 ' #', else #
    for (let layer of layersWorldMap()) {
      let layerText = ""
      for (let row of layer) {
        let rowText = ""
        for (let element of row) {
          let elementText = ""
          if (!element) { // TODO: FIX THIS! THIS IS ONLY A SLIGHT FIX WHICH MAKES LAYER 3 UNUSABLE! THE LOAD BRINGS IT IN AS AN UNDEFINED!
            elementText = "  "
          } else if (element.code == -1) {
            elementText = "  "
          } else if (element.code < 10) {
            elementText = ` ${element.code}`;
          } else {
            elementText = `${element.code}`;
          }
          rowText += `${elementText}`;
        }
        layerText += rowText + '\n';
      }
      map += layerText;

    }

    // Concatenate all the information together
    fileContent += (saveInfo().title + '\n' + saveInfo().hint + '\n' + `${uuid} \n` + `${goals}\n` + `${centerAndZoom}\n` +
      `${sizeOfMap}\n` + `${map}`);


    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fileContent));
    element.setAttribute('download', fileName);

    element.style.display = 'none';
    element.click();



  }

  const loadFile = () => {

    if (!loadedFile()) {
      return console.error("Missing an uploaded file");
    }

    const reader = new FileReader()
    reader.onload = event => {
      const textContentLines = event.target.result.split("\n");
      const title = textContentLines[0];
      const hint = textContentLines[1];
      const [layerCount, sizeX, sizeY] = textContentLines[5].replaceAll(' ', '').split('x');
      const [xCenter, yCenter, zoom] = textContentLines[4].replaceAll(' ', '').split(',');

      const xParsed = Number.parseInt(sizeX);
      const yParsed = Number.parseInt(sizeY);

      setGridSizeX(xParsed);
      setGridSizeY(yParsed);

      const goalStrings = textContentLines[3].replaceAll('[', ']').split(']').filter(value => value);

      const parsedGoals = (new Array(Object.keys(config.objects).length).fill(0));

      goalStrings.forEach(goal => {
        const [count, id] = goal.split(':').map(num => Number.parseInt(num, 10));
        parsedGoals[id - 1] = count;
      });

      setSaveInfo(lastValue => ({ ...lastValue, goals: parsedGoals }));

      // { code: -1, name: 'Empty', color: '' }
      // Load layer 0
      const layer0Map = []
      for (let y = 6; y < 6 + gridSizeY(); y++) {
        const currentLine = [];
        for (let x = 0; x < textContentLines[y].length / 2; x++) {
          const currentString = textContentLines[y].substr(x * 2, 2);
          if (!currentString.replaceAll(' ', '')) {
            currentLine.push({ code: -1, name: 'Empty', color: '' })
          }
          else {
            const currentNumber = Number.parseInt(currentString);
            currentLine.push(reverseLookup[currentNumber]);
          }
        }
        layer0Map.push(currentLine);
      }

      // Load layer 1
      const layer1Map = []
      for (let y = 6 + gridSizeY(); y < 6 + (gridSizeY() * 2); y++) {
        const currentLine = [];
        for (let x = 0; x < textContentLines[y].length / 2; x++) {
          const currentString = textContentLines[y].substr(x * 2, 2);
          if (!currentString.replaceAll(' ', '')) {
            currentLine.push({ code: -1, name: 'Empty', color: '' })
          }
          else {
            const currentNumber = Number.parseInt(currentString);
            currentLine.push(reverseLookup[currentNumber]);
          }
        }
        layer1Map.push(currentLine);
      }

      // Load layer 2
      const layer2Map = []
      for (let y = 6 + (gridSizeY() * 2); y < 6 + (gridSizeY() * 3); y++) {
        const currentLine = [];
        for (let x = 0; x < textContentLines[y].length / 2; x++) {
          const currentString = textContentLines[y].substr(x * 2, 2);
          if (!currentString.replaceAll(' ', '')) {
            currentLine.push({ code: -1, name: 'Empty', color: '' })
          }
          else {
            const currentNumber = Number.parseInt(currentString);
            currentLine.push(reverseLookup[currentNumber]);
          }
        }
        layer2Map.push(currentLine);
      }

      setSaveInfo(old => ({
        ...old,
        title,
        hint,
        defaultXCenter: xCenter,
        defaultYCenter: yCenter,
        defaultZoom: zoom,
      }));

      setLayer(0);
      let newMap = []
      for (let i = 0; i < layer0Map.length; i++) {
        newMap.push([]);
        for (let j = 0; j < layer0Map[0].length; j++) {
          newMap[i].push(layer0Map[i][j])
          if (!layer0Map[i][j]) {
          }
        }
      }
      setWorldMap(newMap);

      setLayersWorldMap([layer0Map, layer1Map, layer2Map]);


    }
    reader.readAsText(loadedFile()); // you could also read images and other binaries
  }

  const getName = (col, rowIndex, colIndex) => {
    if (!col()){
      return "BROKEN"
    }
    else return col().code === 2 ? '' : col().name;
  }

  const changeMap = (rowIndex, colIndex) => {
    console.log()
    let oldMap = []
    for (let i = 0; i < worldmap().length; i++) {
      oldMap.push([])
      for (let j = 0; j < worldmap()[i].length; j++) {
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
  }

  return (
    <div class="h-full w-full flex">
      <div class="h-full w-9/12 my-1">
        <Index each={worldmap()}>
          {(row, rowIndex) => (
            <div class="flex flex-row my-1 text-center select-none" classList={{ 'translate-x-10': rowIndex % 2 === 1 }}>
              <Index each={row()}>
                {(col, colIndex) => (
                  <div 
                  class="mx-1 cursor-pointer h-20 w-20 overflow-hidden resize-none pt-6 border-2"
                  style={`background-color: ${getBackgroundColor(rowIndex, colIndex)}`} 
                  onClick={() => changeMap(rowIndex, colIndex)}
                  onMouseEnter={() => {
                    if (mouseDown()) {
                      changeMap(rowIndex, colIndex)
                    }
                  }}
                  onMouseLeave={() => {
                    if (mouseDown()) {
                      changeMap(rowIndex, colIndex)
                    }
                  }}
                  >
                    <div classList={{ "text-black": col()?.code === 13 }} class="font-bold">
                    {getName(col, rowIndex, colIndex)}
                    </div>
                  </div>
                )}
              </Index>
            </div>
          )}
        </Index>
      </div>




      <Show when={!isEditing()}>
        <div class="card fixed w-3/12 h-[98%] max-h-full right-2 bg-base-100 shadow-2xl overflow-y-scroll">
          <div class="card-body">
            <div class="flex flex-row gap-2">
              <button type="button" class="btn btn-primary flex-auto" onClick={() => setIsEditing(true)}>Map Editor</button>
              <button type="button" class="btn btn-primary flex-auto" onClick={() => setIsEditing(false)}>Save Menu</button>
            </div>
            <label for="my-modal" class="btn modal-button">Load from File</label>

            <div class="form-control w-full max-w-xs">
              <label class="label">
                <span class="label-text">Select editor color theme</span>
              </label>
              <select class="select select-bordered" onChange={setColorTheme}>
                <option selected>night</option>
                <option>light</option>
                <option>synthwave</option>
                <option>retro</option>
                <option>forest</option>
                <option>aqua</option>
                <option>black</option>
                <option>dracula</option>
                <option>business</option>
                <option>coffee</option>
              </select>
            </div>
            
            <h2 class="card-title">Layer {layer} Selected</h2>
            <input type="range" min="0" max="2" value={layer()} onChange={(e) => {
              setLayer(e.target.value);
              let newMap = [];
              for (let i = 0; i < layersWorldMap()[e.target.value].length; i++) {
                newMap.push([]);
                for (let j = 0; j < layersWorldMap()[e.target.value][0].length; j++) {
                  newMap[i].push(layersWorldMap()[layer()][i][j])
                }
              }

              setWorldMap(newMap);
            }} class="range"> </input>
            <div class="w-full flex justify-between text-xs px-2">
              <span>|</span>
              <span>|</span>
              <span>|</span>
            </div>
            <h2 class="card-title mt-8 mb-2">Title</h2>
            <input type="text" placeholder="Enter Your Beautiful, Well Thought Out Title" id="title" name="title" class="input input-bordered" value={saveInfo().title} onChange={(e) => setSaveInfo(oldValues => ({ ...oldValues, title: e.target.value }))}></input>


            <h2 class="card-title mt-8 mb-2">Hint</h2>
            <input type="text" placeholder="Enter Your Hint" id="hint" name="hint" class="input input-bordered" value={saveInfo().hint} onChange={(e) => setSaveInfo(oldValues => ({ ...oldValues, hint: e.target.value }))}></input>



            <div class="flex flex-row">
              <div>
                <h2 class="card-title mt-8 mb-2 ">Default X Center</h2>
                <input type="text" placeholder="Enter X centering" id="X" name="X" class="input input-bordered w-[95%]" value={saveInfo().defaultXCenter} onChange={(e) => setSaveInfo(oldValues => ({ ...oldValues, defaultXCenter: e.target.value }))}></input>
              </div>
              <div>

                <h2 class="card-title mt-8 mb-2 ">Default Y Center</h2>
                <input type="text" placeholder="Enter Y Centering" id="Y" name="Y" class="input input-bordered w-[95%]" value={saveInfo().defaultYCenter} onChange={(e) => setSaveInfo(oldValues => ({ ...oldValues, defaultYCenter: e.target.value }))}></input>
              </div>
            </div>

            <h2 class="card-title mt-8 mb-2">Default Zoom</h2>
            <input type="text" placeholder="Default Zoom (# Cells Seen in Biggest Dimension)" id="zoom" name="zoom" class="input input-bordered" value={saveInfo().defaultZoom} onChange={(e) => setSaveInfo(oldValues => ({ ...oldValues, defaultZoom: e.target.value }))}></input>

            <h2 class="card-title mt-8 mb-2">Goals</h2>
            <For each={Object.keys(config.objects)}>
              {(selection, index) =>
                <div class="flex flex-row">
                  <div>
                    <input type="number" placeholder="Enter number to reach this type (i.e. 2 to blue)" value={saveInfo().goals[index()]} class="input input-bordered w-[95%]" onChange={(e) => {
                      let goals = saveInfo().goals;
                      goals[index()] = parseInt(e.target.value);
                      setSaveInfo(oldValues => ({ ...oldValues, goals }))
                    }
                    }></input>
                  </div>
                  <div class="w-[95%]">
                    <div id={`object-${selection}`} class="btn w-[95%]">{selection}</div>
                  </div>
                </div>}
            </For>


            <div class="card-actions mt-4 w-[100%]">
              <button class="btn btn-primary w-[100%]" onClick={saveFile}>Save</button>
            </div>
          </div>
        </div>
      </Show>

      <Show when={isEditing()}>
        <div class="card fixed w-3/12 h-[98%] max-h-full right-2 bg-base-100 shadow-2xl overflow-y-scroll">
          <div class="card-body">
            <div class="flex flex-row gap-2">
              <button type="button" class="btn btn-primary flex-auto" onClick={() => setIsEditing(true)}>Map Editor</button>
              <button type="button" class="btn btn-primary flex-auto" onClick={() => setIsEditing(false)}>Save Menu</button>
            </div>
            <label for="my-modal" class="btn modal-button">Load from File</label>
            
            <div class="form-control w-full max-w-xs">
              <label class="label">
                <span class="label-text">Select editor color theme</span>
              </label>
              <select class="select select-bordered" onChange={setColorTheme}>
                <option selected>night</option>
                <option>light</option>
                <option>synthwave</option>
                <option>retro</option>
                <option>forest</option>
                <option>aqua</option>
                <option>black</option>
                <option>dracula</option>
                <option>business</option>
                <option>coffee</option>
              </select>
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
            <div class="w-full flex justify-between text-xs px-2">
              <span>|</span>
              <span>|</span>
              <span>|</span>
            </div>
            
            <h2 class="card-title">Alternate Layer Opacity</h2>
            <h3>The current selected layer takes priority, showing the others only if it is empty. It will show the first layer with an item in the position, top to bottom</h3>
            <input type="range" min="0" max="100" value={layerTransparency() * 100} class="range" onChange={(e) => {
              setLayerTransparency(e.target.value / 100)
            }} />

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
            <h2 class="card-title mt-8">Background Colors</h2>
            <For each={Object.keys(config.b_colors)}>
              {selection => <button id={`verb-${selection}`} class="btn" classList={{ 'btn-accent': currentSelected().code === config.b_colors[selection].code }} onClick={() => setCurrentSelected(config.b_colors[selection])}>{selection}</button>}
            </For>
            <p></p>
          </div>
        </div>
      </Show>

      <input type="checkbox" id="my-modal" class="modal-toggle" />
      <div class="modal">
        <div class="modal-box">
          <h3 class="font-bold text-lg">Load a file to continue working</h3>
          <p class="py-4">WARNING: All current progress will be lost, make sure to save beforehand if you need.</p>
          <input type="file" onChange={(e => setLoadedFile(e.target.files[0]))}></input>
          <div class="modal-action">
            <label for="my-modal" class="btn">Cancel</label>
            <label for="my-modal" class="btn btn-primary" onClick={loadFile}>Load</label>
          </div>
        </div>
      </div>
    </div>


  )
};

export default Editor;