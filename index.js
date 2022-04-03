import fs from "fs"
import vtolMapGen from "./vtolMapGen.js";
import API from './overpassAPI.js'
import {save} from './VTOLConfigNodeToJSON/dist/index.js'

const cacheFile = './queryCache';
//const bbox = [50.36835019940018,-4.320030212402344,50.46985198362652,-4.138927459716797] //plymouth
const bbox = [50.36035645494996,-4.336509704589844,50.43432923127259,-4.036445617675781]
if(!fs.existsSync(cacheFile)) {
    console.log('Querying API...')
    const rawQuery = fs.readFileSync('./query.txt').toString();
    let query = API.injectBbox(rawQuery, ...bbox)

    API.interrogate(query).then(output => {
        fs.writeFileSync(cacheFile, JSON.stringify(output, null, '\t'))
        console.log("Cached query, re-run to use result")
    });
} else {
    const fileBuf = fs.readFileSync(cacheFile);
    const queryRes = JSON.parse(fileBuf.toString());
    console.log(`Loaded query res cache - ${cacheFile}`)
    
    const config = `{
        "name": "CustomScenario",
        "nodes": [
            {
                "name": "UNITS",
                "nodes": [
                    {
                        "name": "UnitSpawner",
                        "nodes": [
                            {
                                "name": "UnitFields",
                                "nodes": [],
                                "values": {
                                    "unitGroup": null,
                                    "moveSpeed": "Slow_10",
                                    "behavior": "Parked",
                                    "defaultPath": null,
                                    "waypoint": null,
                                    "engageEnemies": true,
                                    "detectionMode": "Default",
                                    "spawnOnStart": true,
                                    "invincible": false
                                }
                            }
                        ],
                        "values": {
                            "unitName": "MAD-4 Radar",
                            "globalPosition": {
                                "x": 98288.20336914062,
                                "y": 212.156005859375,
                                "z": 98455.60217285156
                            },
                            "unitInstanceID": 1,
                            "unitID": "MAD-4Radar",
                            "rotation": {
                                "x": 2.222378,
                                "y": 0,
                                "z": 0
                            },
                            "spawnChance": 100,
                            "lastValidPlacement": {
                                "x": 98288.20336914062,
                                "y": 212.156005859375,
                                "z": 98455.60217285156
                            },
                            "editorPlacementMode": "Unknown",
                            "spawnFlags": ""
                        }
                    },
                    {
                        "name": "UnitSpawner",
                        "nodes": [
                            {
                                "name": "UnitFields",
                                "nodes": [],
                                "values": {
                                    "radarUnits": 1,
                                    "allowReload": false,
                                    "reloadTime": 120,
                                    "unitGroup": null,
                                    "moveSpeed": "Slow_10",
                                    "behavior": "Parked",
                                    "defaultPath": null,
                                    "waypoint": null,
                                    "engageEnemies": true,
                                    "detectionMode": "Default",
                                    "spawnOnStart": false,
                                    "invincible": false,
                                    "equips": [
                                        "MAD-4 Missile",
                                        ""
                                    ]
                                }
                            }
                        ],
                        "values": {
                            "unitName": "MAD-4 Launcher",
                            "globalPosition": {
                                "x": 98281.57495117188,
                                "y": 210.56935119628906,
                                "z": 98477.04409790039
                            },
                            "unitInstanceID": 3,
                            "unitID": "MAD-4Launcher",
                            "rotation": {
                                "x": 4.43808,
                                "y": 0,
                                "z": 0
                            },
                            "spawnChance": 100,
                            "lastValidPlacement": {
                                "x": 98281.57495117188,
                                "y": 210.56935119628906,
                                "z": 98477.04409790039
                            },
                            "editorPlacementMode": "Unknown",
                            "spawnFlags": ""
                        }
                    },
                    {
                        "name": "UnitSpawner",
                        "nodes": [
                            {
                                "name": "UnitFields",
                                "nodes": [],
                                "values": {
                                    "startMode": "FlightReady",
                                    "initialSpeed": 77.074,
                                    "unitGroup": null
                                }
                            }
                        ],
                        "values": {
                            "unitName": "Player",
                            "globalPosition": {
                                "x": 97599.03515625,
                                "y": 351.9296875,
                                "z": 133318.046875
                            },
                            "unitInstanceID": 4,
                            "unitID": "PlayerSpawn",
                            "rotation": {
                                "x": 0,
                                "y": 180,
                                "z": 0
                            },
                            "spawnChance": 100,
                            "lastValidPlacement": {
                                "x": 97599.03515625,
                                "y": 351.9296875,
                                "z": 133318.046875
                            },
                            "editorPlacementMode": "Air",
                            "spawnFlags": ""
                        }
                    },
                    {
                        "name": "UnitSpawner",
                        "nodes": [
                            {
                                "name": "UnitFields",
                                "nodes": [],
                                "values": {
                                    "unitGroup": null,
                                    "defaultBehavior": "Parked",
                                    "defaultWaypoint": null,
                                    "defaultPath": null,
                                    "engageEnemies": true,
                                    "detectionMode": "Default",
                                    "spawnOnStart": true,
                                    "invincible": false
                                }
                            }
                        ],
                        "values": {
                            "unitName": "NMSS Cruiser",
                            "globalPosition": {
                                "x": 97625.39990234375,
                                "y": -5,
                                "z": 107613.6591796875
                            },
                            "unitInstanceID": 5,
                            "unitID": "ESuperMissileCruiser",
                            "rotation": {
                                "x": 0,
                                "y": 0,
                                "z": 0
                            },
                            "spawnChance": 100,
                            "lastValidPlacement": {
                                "x": 97625.39990234375,
                                "y": -5,
                                "z": 107613.6591796875
                            },
                            "editorPlacementMode": "Sea",
                            "spawnFlags": ""
                        }
                    }
                ],
                "values": {}
            },
            {
                "name": "PATHS",
                "nodes": [],
                "values": {}
            },
            {
                "name": "WAYPOINTS",
                "nodes": [],
                "values": {}
            },
            {
                "name": "UNITGROUPS",
                "nodes": [],
                "values": {}
            },
            {
                "name": "TimedEventGroups",
                "nodes": [],
                "values": {}
            },
            {
                "name": "TRIGGER_EVENTS",
                "nodes": [],
                "values": {}
            },
            {
                "name": "OBJECTIVES",
                "nodes": [],
                "values": {}
            },
            {
                "name": "OBJECTIVES_OPFOR",
                "nodes": [],
                "values": {}
            },
            {
                "name": "StaticObjects",
                "nodes": [],
                "values": {}
            },
            {
                "name": "Conditionals",
                "nodes": [],
                "values": {}
            },
            {
                "name": "ConditionalActions",
                "nodes": [],
                "values": {}
            },
            {
                "name": "EventSequences",
                "nodes": [],
                "values": {}
            },
            {
                "name": "BASES",
                "nodes": [],
                "values": {}
            },
            {
                "name": "GlobalValues",
                "nodes": [],
                "values": {}
            },
            {
                "name": "Briefing",
                "nodes": [],
                "values": {}
            }
        ],
        "values": {
            "gameVersion": 1.3,
            "campaignID": "",
            "campaignOrderIdx": -1,
            "scenarioName": "untitled",
            "scenarioID": "MAD-4 Missle avoid test",
            "scenarioDescription": "",
            "mapID": "emptymap",
            "vehicle": "AH-94",
            "multiplayer": false,
            "allowedEquips": [
                "ah94_gun",
                "ah94_gun_30",
                "h70-x7",
                "h70-4x4",
                "h70-x19",
                "h70-x57",
                "hellfirex4",
                "agm145x4",
                "ah94_agRadar",
                "ah94_stingerL",
                "ah94_stingerR",
                "apkws-x7",
                "apkws-x19",
                "gbu39er-x4",
                "ah94_droptank",
                ""
            ],
            "forcedEquips": [
                "ah94_gun",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                ""
            ],
            "forceEquips": true,
            "normForcedFuel": 0.5180826,
            "equipsConfigurable": false,
            "baseBudget": 100000,
            "isTraining": false,
            "rtbWptID": "",
            "refuelWptID": "",
            "envName": "day",
            "selectableEnv": false,
            "qsMode": "Anywhere",
            "qsLimit": -1
        }
    }`;
    const mapSizeChunk = 16
    const mapSize = mapSizeChunk * vtolMapGen.CHUNK_MULTIPLIER_M
    const gameBbox = [0, 0, mapSize, mapSize]
    const mapID = "complex"
    const custom = vtolMapGen.toVtolCustomMap(queryRes, bbox, mapID, "Coast", "South", "Boreal", mapSizeChunk, gameBbox)
    fs.writeFileSync(`./${mapID}.vtm`, save(custom));
    console.log(`saved ${mapID}`)
}
