const fs = require('fs')
const API = require('./overpassAPI')
const configUtil = import('./VTOLConfigNodeToJSON/dist/index.js')


const cacheFile = './queryCache';
if(!fs.existsSync(cacheFile)) {
    const rawQuery = fs.readFileSync('./query.txt').toString();
    let query = API.injectBbox(rawQuery, 50.36835019940018,-4.320030212402344,50.46985198362652,-4.138927459716797)

    API.interrogate(query).then(output => {
        fs.writeFileSync(cacheFile, JSON.stringify(output, null, '\t'))
        console.log("Cached query, re-run to use")
    });
} else {
    const fileBuf = fs.readFileSync(cacheFile);
    const queryRes = JSON.parse(fileBuf.toString());
    console.log('Loaded query res cache')
    
    geoJson = queryResToGeoJSON(queryRes)
    fs.writeFileSync("./geo.json", JSON.stringify(geoJson, null, '\t'))
}

function nodeToCoords(node) {
    return [node.lon, node.lat]
}

function getElementGeoJSONType(element) {
    if(element.type == "node") {
        return "Point"
    } else {
        return (element.tags.landuse) ? "Polygon" : "LineString"
    }
}

function getElementGeoJSONCoords(element) {
    if(element.type == "node") {
        return nodeToCoords(element)
    } else {
        let allCoords = element.nodes.map(nodeToCoords)
        return (element.tags.landuse) ? [allCoords] : allCoords 
    }
}

function queryResToGeoJSON(queryRes) {
    const consolidated = consolidateElements(queryRes.elements);
    const features = consolidated.map(element => {
        return { 
            geometry: {
                type: getElementGeoJSONType(element),
                coordinates: getElementGeoJSONCoords(element)
            },
            type: "Feature",
            properties: {}
        }
    });
    return {type: "FeatureCollection", features}
}

function wayToString(way) {
    let wayText = "";
    way.nodes.forEach(node => {
        wayText += nodeToString(node) + " --> "
    })
    return wayText
}

function nodeToString(node) {
    return `${node.id}@${node.lat},${node.lon}`
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