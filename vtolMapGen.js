
const CHUNK_MULTIPLIER = 3.0625


function queryResToBezierRoads(queryRes, worldBbox) {
    /*
    BezierRoads
	{
		Chunk
		{
			grid = (18,33)
			Segment
			{
				id = 4
				type = 0
				bridge = False
				length = 250.3658
				s = (57962.1884765625, 249.36279296875, 103074.36437988281)
				m = (58078.710205078125, 250.6358642578125, 103105.03308105469)
				e = (58203.53515625, 251.75927734375, 103140.572265625)
				ps = 20
				ns = 5
			}
			Segment
			{
				id = 5
				type = 0
				bridge = False
				length = 269.0178
				s = (58203.53515625, 251.75927734375, 103140.572265625)
				m = (58328.341796875, 253.43212890625, 103176.10363769531)
				e = (58461.51171875, 254.09228515625, 103216.51574707031)
				ps = 4
				ns = 6
			}
    */

    // loop through elements
    // build out nodes for roads
    // Move into game-space coords
    // convertToOffset(worldBbox, ??)
    // convert to beziers
    return {}
}

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
    return {lat: lat / CHUNK_MULTIPLIER, lon: lon / CHUNK_MULTIPLIER}
}

function getConfigItemValue(path, config, valueName) {
    return getConfigItem(path, config).values[valueName];
}

function getConfigItemNodes(path, config) {
    return getConfigItem(path, config).nodes;
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
    insertConfigItem('', config, 'BezierRoads', [], {}) // TODO: from OSM
    insertConfigItem('', config, 'BASES', [], {})       // TODO: from OSM
    
    //BezierRoads: queryResToBezierRoads(queryRes, worldBbox)
    insertConfigItem('BezierRoads', config, 'Chunk', [], {}) // TODO: build object to add
    insertConfigItem('BezierRoads/Chunk', config, ) // Note positionToChunk already written
    return config;
}

export default {toVtolCustomMap, CHUNK_MULTIPLIER}