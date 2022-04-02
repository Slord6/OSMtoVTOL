# OSMtoVTOL
 Export OSM data for use in VTOLVR

## State

Work in progress!

Currently gets data from OSM and outputs an empty map config

NOTE: you may need to comment some lines out in the top of VTOLConfigNodeToJSON/dist/index.js:

```JS
import fs from "fs";
// const vtsData = fs.readFileSync("../input.vts", "ascii"); // this one
//const nodeData = JSON.parse(fs.readFileSync("../input.json", "ascii")); // and this one
function reader(data) {
    let head = 0;
```

otherwise it will try to open a non-existant file when it's loaded
## Node Version

This targets Node 17.5+ (because of use of the `fetch` API)

To run:

`node --experimental-fetch .\index.js`