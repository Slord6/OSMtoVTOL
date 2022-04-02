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

function bboxToSpan(bbox) {
    const latSpan = Math.abs(bbox[2] - bbox[0])
    const lonSpan = Math.abs(bbox[3] - bbox[1])
    return {latSpan, lonSpan}
}

function convertPosToOffset(bboxWorld, bboxGame, lat, lon) {
    const worldSpan = bboxToSpan(bboxWorld);
    const latPercent = (lat - bboxWorld[0]) / worldSpan.latSpan
    const lonPercent = (lon - bboxWorld[2]) / worldSpan.lonSpan
    
    const gameSpan = bboxToSpan(bboxGame)
    const gameLat = bboxGame[0] + gameSpan.latSpan * latPercent
    const gameLon = bboxGame[2] + gameSpan.lonSpan * lonPercent

    return {lat: gameLat, lon: gameLon}
}

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

function getConfigItemValue(path, config, valueName) {
    return getConfigItem(path, config).values[valueName];
}

function getConfigItemNodes(path, config) {
    return getConfigItem(path, config).nodes;
}

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

function toVtolCustomMap (queryRes, worldBbox, mapID, edgeMode, coastSide, biome, mapSize, gameBbox) {
    const consolidatedElements = consolidateElements(queryRes.elements)
    convertNodePositionsToOffset(consolidateElements, worldBbox, gameBbox)
    const elementStack = [];
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
    insertConfigItem('BezierRoads', config, 'Chunk') // TODO: how many? where and why is split?
    //BezierRoads: queryResToBezierRoads(queryRes, worldBbox)
    return config;
}

export default {toVtolCustomMap}