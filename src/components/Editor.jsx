import { createSignal, For, Index, Show } from "solid-js";
import config, { reverseLookup } from './config.js'
import { v4 as uuidV4 } from "uuid";

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
  const [saveInfo, setSaveInfo] = createSignal({
    title: '',
    hint: '',
    defaultXCenter: 0,
    defaultYCenter: 0,
    defaultZoom: 8,
    goals: (new Array(Object.keys(config.objects).length).fill(0)),
  });
  const [names, setNames] = createSignal((Object.keys(config.objects)));
  const [codes, setCodes] = createSignal(Object.values(config.objects));

  const [loadedFile, setLoadedFile] = createSignal(null);


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
          console.log(element)
          if (element.code == -1) {
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
      for (let y = 6; y < 6 + yParsed - 1; y++) {
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
      for (let y = 6 + yParsed; y < 6 + (yParsed * 2) - 1; y++) {
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
      for (let y = 6 + (yParsed * 2); y < 6 + (yParsed * 3); y++) {
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

      console.log(layer0Map);

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
        }
      }
      setWorldMap(newMap);
      setLayersWorldMap([layer0Map, layer1Map, layer2Map]);


    }
    reader.readAsText(loadedFile()); // you could also read images and other binaries
  }

  return (
    <div class="h-full w-full flex">
      <div class="h-full w-9/12 my-1">
        <Index each={worldmap()}>
          {(row, rowIndex) => (
            <div class="flex flex-row my-1 text-center" classList={{ 'translate-x-10': rowIndex % 2 === 1 }}>
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




      <Show when={!isEditing()}>
        <div class="card fixed w-3/12 h-[98%] max-h-full right-2 bg-base-100 shadow-2xl overflow-y-scroll">
          <div class="card-body">
            <div class="flex flex-row gap-2">
              <button type="button" class="btn btn-primary flex-auto" onClick={() => setIsEditing(true)}>Map Editor</button>
              <button type="button" class="btn btn-primary flex-auto" onClick={() => setIsEditing(false)}>Save Menu</button>
            </div>
            <label for="my-modal" class="btn modal-button">Load from File</label>
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