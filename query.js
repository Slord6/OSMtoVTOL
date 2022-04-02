const queryParams = "?data=";

const API = {

    url: "https://overpass-api.de/api/interpreter",
    
    interrogate: async (query, cb) => {
        const encodedData = encodeURIComponent(query)
        const requestUrl = `${API.url}${queryParams}${encodedData}`
        const response = await fetch(requestUrl)
        return response.json()
    },

    injectBbox: (query, blLat, blLon, trLat, trLon) =>  {
        area = `${blLat},${blLon},${trLat},${trLon}`
        return query.replaceAll("{{bbox}}", area)
    }
}

module.exports = API