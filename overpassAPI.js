const queryParams = "?data=";

url: "https://overpass-api.de/api/interpreter";
    
async function interrogate (query) {
    const encodedData = encodeURIComponent(query)
    const requestUrl = `${API.url}${queryParams}${encodedData}`
    const response = await fetch(requestUrl)
    return response.json()
}

function injectBbox (query, blLat, blLon, trLat, trLon) {
    area = `${blLat},${blLon},${trLat},${trLon}`
    return query.replaceAll("{{bbox}}", area)
}

export default {interrogate, injectBbox}