
const CHUNK_MULTIPLIER = 3.0625


/**
 * Take an array of 2 lat/lon pairs and calculate
 * the width and height of the rect they describe
 * @param {Array} bbox 
 * @returns 
 */
function bboxToSpan(bbox) {
    const latSpan = Math.abs(bbox[2] - bbox[0])
    const lonSpan = Math.abs(bbox[3] - bbox[1])
    return {latSpan, lonSpan}
}

/**
 * 
 * @param {Array} bboxWorld min/max coords in lat/lon
 * @param {Array} bboxGame min/max coords in the game
 * @param {*} lat The world-space lat to convert
 * @param {*} lon The world-space lon to convert
 * @returns Coords in game-space
 */
function convertPosToOffset(bboxWorld, bboxGame, lat, lon) {
    const worldSpan = bboxToSpan(bboxWorld);
    const latPercent = Math.abs(lat - bboxWorld[0]) / worldSpan.latSpan
    const lonPercent = Math.abs(lon - bboxWorld[1]) / worldSpan.lonSpan
    
    const gameSpan = bboxToSpan(bboxGame)
    const gameLat = bboxGame[0] + (gameSpan.latSpan * latPercent)
    const gameLon = bboxGame[1] + (gameSpan.lonSpan * lonPercent)

    return {lat: gameLat, lon: gameLon}
}

/**
 * Convert all lat/lon positions on nodes to game-space coords
 * @param {Array} elements Array of elements from OSM
 * @param {Array} bboxWorld min/max world lat/lon
 * @param {*} bboxGame min/max game coords
 * @returns Elements with all nodes positions converted to game-space
 */
function convertNodePositionsToOffset(elements, bboxWorld, bboxGame) {
    elements.forEach((element) => {
        if(element.type == 'node') {
            const gamePos = convertPosToOffset(bboxWorld, bboxGame, element.lat, element.lon)
            element.lat = gamePos.lat
            element.lon = gamePos.lon
        }
    })
    return elements
}

/**
 * For each 'way' element lookup the referenced node and replace the id with the object
 * @param {Array} elements 
 * @returns Consolidated elements array
 */
function consolidateElements(elements) {
    let newElements = [];
    elements.forEach(element => {
        if(element.nodes) {
            let consolidatedNodes = []
            element.nodes.forEach(nodeId => {
                const matchedNode = elements.find((filterElement) => {
                    return filterElement.id == nodeId;
                });
                consolidatedNodes.push(matchedNode);
            });
            const newElement = JSON.parse(JSON.stringify(element));
            newElement.nodes = consolidatedNodes;
            newElements.push(newElement);
        }
    });
    return newElements
}

function positionToChunk(lat, lon) {
    return {lat: Math.floor(lat / CHUNK_MULTIPLIER), lon: Math.floor(lon / CHUNK_MULTIPLIER)}
}

function getConfigItemValue(path, config, valueName) {
    return getConfigItem(path, config).values[valueName];
}

function getConfigItemNodes(path, config) {
    return getConfigItem(path, config).nodes;
}

let segmentID = 1;
function generateDefaultSegmentValues() {
    return {
        id: ++segmentID,
        type: 0, // TODO: seems to be 0 or 1?
        bridge: "False",
        length: 0,
        s: "", // (57962.1884765625, 249.36279296875, 103074.36437988281),
        m: "", // (58078.710205078125, 250.6358642578125, 103105.03308105469),
        e: "", // (58203.53515625, 251.75927734375, 103140.572265625),
        ps: 1, // 20,
        ns: 1, // 5
    }
}

function calcSegmentLength(segment) {
    let startPos = segment.values.s.split(', ').map(x => Number(x));
    let endPos = segment.values.e.split(', ').map(x => Number(x));

    const a = startPos[0] - endPos[0];
    const b = startPos[1] - endPos[1];
    const c = startPos[2] - endPos[2];
    const distance = Math.sqrt(a * a + b * b + c * c);

    return distance
}

function calcSegmentMiddleString(segment) {
    const startPos = segment.values.s.split(', ').map(x => Number(x));
    const endPos = segment.values.e.split(', ').map(x => Number(x));

    const middleX = ((endPos[0] - startPos[0])/2) + startPos[0];
    const middleY = ((endPos[1] - startPos[1])/2) + startPos[1];
    const middleZ = ((endPos[2] - startPos[2])/2) + startPos[2];

    return `${middleX}, ${middleY}, ${middleZ}`
}

function addSegmentToChunk(node, chunk) {
    const segment = {name: "Segment", nodes: [], values: generateDefaultSegmentValues()}
    segment.values.s = `${node.lat}, 250, ${node.lon}`;
    if(chunk.nodes.length > 0) {
        const prevSegment = chunk.nodes[chunk.nodes.length - 1];
        // TODO: Y component
        prevSegment.values.e = segment.values.s;
        prevSegment.values.m = calcSegmentMiddleString(prevSegment);
        prevSegment.values.length = calcSegmentLength(prevSegment)
    }
    chunk.nodes.push(segment)
}

function generateChunkedRoads(elements) {
    const chunks = {};
    const allChunks = [];
    elements.forEach((way) => {
        way.nodes.forEach((node) => {
            const grid = positionToChunk(node.lat, node.lon);
            if(!chunks[grid.lat]) chunks[grid.lat] = {}
            if(!chunks[grid.lat][grid.lon]) chunks[grid.lat][grid.lon] = {name: "Chunk", nodes: [], values: {}}
            addSegmentToChunk(node, chunks[grid.lat][grid.lon])
            chunks[grid.lat][grid.lon].values.grid = `(${grid.lat},${grid.lon})`
            
            allChunks.push(chunks[grid.lat][grid.lon])
        });
    });
    return allChunks
}

/**
 * 
 * @param {string} path Path to the item to get, eg. 'BezierRoads/Chunk'
 * @param {*} config 
 * @returns 
 */
function getConfigItem(path, config) {
    if(path === '') return config
    const names = path.split('/').reverse();
    let item = config;
    while(names.length > 0) {
        const name = names.pop();
        if(item === undefined) {
            console.error('No item in path', path, 'next would be ', name)
            return null
        }
        item = item.nodes.find((item) => item.name == name)
    }
    return item
}

/**
 * Given a name, nodes and values, insert a new config item
 * @param {string} path Path of names to insert as child
 * @param {*} config Existing config to add to
 * @param {string} name Name of this item
 * @param {Array} nodes Child nodes of the new node
 * @param {Object} values
 */
function insertConfigItem(path, config, name, nodes = [], values = {}) {
    let item = getConfigItem(path, config);
    if(item) {
        item.nodes.push({
            name,
            nodes,
            values
        })
    }
}

/**
 * 
 * @param {*} queryRes OSM output
 * @param {Array} worldBbox lat/lon min max in world coords
 * @param {string} mapID Name for map
 * @param {string} edgeMode 
 * @param {string} coastSide 
 * @param {string} biome 
 * @param {string} mapSize 
 * @param {Array} gameBbox min/max coords in game-space
 * @returns 
 */
function toVtolCustomMap (queryRes, worldBbox, mapID, edgeMode, coastSide, biome, mapSize, gameBbox) {
    convertNodePositionsToOffset(queryRes.elements, worldBbox, gameBbox)
    queryRes.elements = consolidateElements(queryRes.elements)
    const topLevelValues = {
        mapID,
        mapType: "HeightMap",
        edgeMode,
        coastSide,
        biome,
        seed: "seed",
        mapSize
    }
    const config = {name: "CustomScenario", nodes: [], values: topLevelValues};
    insertConfigItem('', config, 'TerrainSettings')
    insertConfigItem('', config, 'StaticObjects')
    insertConfigItem('', config, 'Conditionals')
    insertConfigItem('', config, 'BASES', [], {})       // TODO: from OSM ?

    const chunkedRoads = generateChunkedRoads(queryRes.elements);

    //BezierRoads: queryResToBezierRoads(queryRes, worldBbox)
    const roads = {name: 'BezierRoads', nodes: chunkedRoads, values: {}}

    // Add roads items to base config
    insertConfigItem('', config, 'BezierRoads', roads.nodes, roads.values)
    return config;
}

export default {toVtolCustomMap, CHUNK_MULTIPLIER}