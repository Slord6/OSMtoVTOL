const fs = require('fs')
const API = require('./query')

const rawQuery = fs.readFileSync('./query.txt').toString();
let query = API.injectBbox(rawQuery, 50.36835019940018,-4.320030212402344,50.46985198362652,-4.138927459716797)

API.interrogate(query).then(console.log)
