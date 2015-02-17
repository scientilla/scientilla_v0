/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

// Resolves dependencies
var async = require("async");
var bcryptNodejs = require("bcrypt-nodejs");
var bodyParser = require("body-parser");
var cors = require("cors");
var crypto = require("crypto");
var express = require("express");
var expressJwt = require("express-jwt");
var fs = require("fs");
var http = require("http");
var https = require("https");
var jsonWebToken = require("jsonwebtoken");
var moment = require("moment");
var mongodb = require("mongodb");
var multer = require("multer");
var nodeSchedule = require("node-schedule");
var path = require("path");
var request = require("request");
var tingodb = require("tingodb");
var underscore = require("underscore");

var application = express();

var configurationManager = require(path.resolve(__dirname + "/application/plugins/system/controllers/configuration.js"));
var seedsConfiguration = require("./configuration/seeds.json");
var peerMode = configurationManager.get().mode;
var requirePrefix = (peerMode === 1) ? 'seed.' : '';

var datasetsController = require("./application/plugins/dataset/controllers/default.js")();
var peerDatasetsController = require("./application/plugins/dataset/controllers/peer-datasets.js")();
var peersController = require("./application/plugins/peer/controllers/default.js")();
var referencesController = require("./application/plugins/reference/controllers/default.js")();
var collectedReferencesController = require("./application/plugins/reference/controllers/collected-references.js")();
var datasetReferencesController = require("./application/plugins/reference/controllers/dataset-references.js")();
var networkReferencesController = require("./application/plugins/reference/controllers/network-references.js")();
var peerReferencesController = require("./application/plugins/reference/controllers/peer-references.js")();
var peerDatasetReferencesController = require("./application/plugins/reference/controllers/peer-dataset-references.js")();
var repositoryReferencesController = require("./application/plugins/reference/controllers/repository-references.js")();
var seedPeerReferencesController = require("./application/plugins/reference/controllers/seed-peer-references.js")();
var worldNetworkReferencesController = require("./application/plugins/reference/controllers/world-network-references.js")();
var rankedReferencesController = require("./application/plugins/reference/controllers/ranked-references.js")();
var localRankedReferencesController = require("./application/plugins/reference/controllers/local-ranked-references.js")();
var repositoriesController = require("./application/plugins/repository/controllers/default.js")();
var settingsController = require("./application/plugins/setting/controllers/default.js")();
var systemController = require("./application/plugins/system/controllers/default.js")();
var usersController = require("./application/plugins/user/controllers/default.js")();
var peerUsersController = require("./application/plugins/user/controllers/peer-users.js")();
var worldNetworkUsersController = require("./application/plugins/user/controllers/world-network-users.js")();
var localNetworkUsersController = require("./application/plugins/user/controllers/local-network-users.js")();
var discoveryController = require("./application/plugins/discovery/controllers/discovery.js")();
var tagsController = require("./application/plugins/tag/controllers/" + requirePrefix + "default.js")();

// Detects user operative system
var isWindows = /^win/.test(process.platform);
var isMac = /^dar/.test(process.platform);
var isLinux = /^lin/.test(process.platform);

// Inizializes paths
var dataPath;

// Initializes databases
var databaseEngine;
if (configurationManager.get().database_type == "mongodb") {
    databaseEngine = mongodb.MongoClient;
} else {
    databaseEngine = tingodb({});
}
var database;

var datasetsCollection;
var peersCollection;
var repositoriesCollection;
var referencesCollection;
var guestReferencesCollection;
var collectedReferencesCollection;
var tagsCollection;
var usersCollection;
var collectedUsersCollection;
var datasetReferencesCollections = [];
var rankedReferencesCollection;
var localRankedReferencesCollection;
var localCollectedReferencesCollection;
var localCollectedUsersCollection;

async.series([
    function(seriesCallback) {
        if (configurationManager.get().files_routing && isWindows) {
            dataPath = path.resolve(process.env.APPDATA + "/Scientilla/");
            if (!fs.existsSync(dataPath)) {
                fs.mkdirSync(dataPath);
            }
        } else {
            dataPath = path.resolve(__dirname + "/../");
        }
        seriesCallback();
    },
    function(seriesCallback) {
        if (!fs.existsSync(path.resolve(dataPath + "/files/"))) {
            fs.mkdirSync(path.resolve(dataPath + "/files/"));
        }
        seriesCallback();
    },
    function(seriesCallback) {
        if (!fs.existsSync(path.resolve(dataPath + "/files/datasets/"))) {
            fs.mkdirSync(path.resolve(dataPath + "/files/datasets/"));
        }
        seriesCallback();
    },
    function(seriesCallback) {
        if (!fs.existsSync(path.resolve(dataPath + "/files/uploads/"))) {
            fs.mkdirSync(path.resolve(dataPath + "/files/uploads/"));
        }
        seriesCallback();
    },    
    function(seriesCallback) {
        if (configurationManager.get().database_type == "mongodb") {
            databaseEngine.connect(
                "mongodb://" + configurationManager.get().database_host + ":" + configurationManager.get().database_port + "/scientilla",
                function(err, db) {
                    database = db;
                    seriesCallback();
                }
            );
        } else {
            resource = new databaseEngine.Db(path.resolve(dataPath + "/files/") + path.sep, {});
            resource.open(function(err, db) {
                database = db;
                seriesCallback();
            });
        }
    },
    function(seriesCallback) {
        database.collection("datasets", function(err, collection) {
            datasetsCollection = collection;
            seriesCallback();
        });
    },
    function(seriesCallback) {
        database.collection("peers", function(err, collection) {
            peersCollection = collection;
            seriesCallback();
        });
    },
    function(seriesCallback) {
        database.collection("repositories", function(err, collection) {
            repositoriesCollection = collection;
            seriesCallback();
        });
    },
    function(seriesCallback) {
        database.collection("references", function(err, collection) {
            referencesCollection = collection;
            seriesCallback();
        });
    },
    function(seriesCallback) {
        database.collection("guest_references", function(err, collection) {
            guestReferencesCollection = collection;
            seriesCallback();
        });
    },
    function(seriesCallback) {
        database.collection("collected_references", function(err, collection) {
            collectedReferencesCollection = collection;
            seriesCallback();
        });
    },
    function(seriesCallback) {
        database.collection("local_collected_references", function(err, collection) {
            localCollectedReferencesCollection = collection;
            seriesCallback();
        });
    },
    function(seriesCallback) {
        database.collection("ranked_references", function(err, collection) {
            rankedReferencesCollection = collection;
            seriesCallback();
        });
    },
    function(seriesCallback) {
        database.collection("local_ranked_references", function(err, collection) {
            localRankedReferencesCollection = collection;
            seriesCallback();
        });
    },
    function(seriesCallback) {
        database.collection("users", function(err, collection) {
            usersCollection = collection;
            seriesCallback();
        });
    },
    function(seriesCallback) {
        database.collection("collected_users", function(err, collection) {
            collectedUsersCollection = collection;
            seriesCallback();
        });
    },
    function(seriesCallback) {
        database.collection("local_collected_users", function(err, collection) {
            localCollectedUsersCollection = collection;
            seriesCallback();
        });
    },
    /*
     function(seriesCallback) {
     database = new databaseEngine.Db(path.resolve(dataPath + "/files/datasets/") + path.sep, {});
     seriesCallback();
     },
     function(seriesCallback) {
     var datasetFileNames = fs.readdirSync(path.resolve(dataPath + "/files/datasets/") + path.sep);
     async.eachSeries(
     datasetFileNames,
     function(datasetFileName, eachSeriesCallback) {
     if (datasetFileName !== "." && datasetFileName !== "..") {
     database.collection(datasetFileName, function(err, collection) {
     datasetReferencesCollections[datasetFileName.replace(".db", "")] = collection;
     eachSeriesCallback();
     });
     }
     },
     seriesCallback
     );
     },
     */
    function(seriesCallback) {
        var versionCheckJob = function versionCheckJob() {
            console.log("Checking version...");
            systemController.checkVersion();

            return versionCheckJob;
        }();
        var versionCheckRecurrenceRule = new nodeSchedule.RecurrenceRule();
        versionCheckRecurrenceRule.minute = [1, new nodeSchedule.Range(0, 59)];
        nodeSchedule.scheduleJob(versionCheckRecurrenceRule, versionCheckJob);
        seriesCallback();
    },    
    function(seriesCallback) {
        var peersAndRepositoriesCollectionJob = function peersAndRepositoriesCollectionJob() {
            console.log("Collecting peers and repositories...");
            peersController.discoverPeers(seedsConfiguration, peersCollection, usersCollection);
            repositoriesController.discoverRepositories(seedsConfiguration, peersCollection);

            return peersAndRepositoriesCollectionJob;
        }();
        var peersAndRepositoriesCollectionRecurrenceRule = new nodeSchedule.RecurrenceRule();
        peersAndRepositoriesCollectionRecurrenceRule.minute = [3, new nodeSchedule.Range(0, 59)];
        nodeSchedule.scheduleJob(peersAndRepositoriesCollectionRecurrenceRule, peersAndRepositoriesCollectionJob);
        seriesCallback();
    },
    function(seriesCallback) {
        if (peerMode === 1) {
            var referencesAndUsersCollectionJob = function referencesAndUsersCollectionJob() {
                console.log("Collecting references and users...");
                peerReferencesController.discoverGlobalReferences(peersCollection, referencesCollection, collectedReferencesCollection);
                peerUsersController.discoverGlobalUsers(peersCollection, usersCollection, collectedUsersCollection);

                return referencesAndUsersCollectionJob;
            }();
            var referencesAndUsersCollectionRecurrenceRule = new nodeSchedule.RecurrenceRule();
            referencesAndUsersCollectionRecurrenceRule.minute = [2, new nodeSchedule.Range(0, 59)];
            nodeSchedule.scheduleJob(referencesAndUsersCollectionRecurrenceRule, referencesAndUsersCollectionJob);
        }
        seriesCallback();
    },
    function(seriesCallback) {
        if (peerMode === 2) {
            var localReferencesAndUsersCollectionJob = function localReferencesAndUsersCollectionJob() {
                console.log("Collecting local references and users...");
                peerReferencesController.discoverLocalReferences(peersCollection, referencesCollection, localCollectedReferencesCollection);
                peerUsersController.discoverLocalUsers(peersCollection, usersCollection, localCollectedUsersCollection);

                return localReferencesAndUsersCollectionJob;
            }();
            var localReferencesAndUsersCollectionRecurrenceRule = new nodeSchedule.RecurrenceRule();
            localReferencesAndUsersCollectionRecurrenceRule.minute = [2, new nodeSchedule.Range(0, 59)];
            nodeSchedule.scheduleJob(localReferencesAndUsersCollectionRecurrenceRule, localReferencesAndUsersCollectionJob);
        }
        seriesCallback();
    },
    function(seriesCallback) {
        if (peerMode === 1) {
            var rankReferencesJob = function rankReferencesJob() {
                console.log("Ranking references...");
                collectedReferencesController.rankGlobalReferences(collectedReferencesCollection, function() {
                    database.collection("ranked_references", function(err, collection) {
                        rankedReferencesCollection = collection;
                    });
                });
                
                return rankReferencesJob;
            }();
            nodeSchedule.scheduleJob({hour: 1, minute: 0}, rankReferencesJob);
        }
        seriesCallback();
    },
    function(seriesCallback) {
        if (peerMode === 2) {
            var rankReferencesJob = function rankReferencesJob() {
                console.log("Ranking Local References...");
                    collectedReferencesController.rankLocalReferences(localCollectedReferencesCollection, function() {
                    database.collection("local_ranked_references", function(err, collection) {
                        localRankedReferencesCollection = collection;
                    });
                });
                    
                return rankReferencesJob;
            }();
            nodeSchedule.scheduleJob({hour: 1, minute: 0}, rankReferencesJob);
        }
        seriesCallback();
    },
    function(seriesCallback) {
        if (peerMode === 1) {
            var extractTagsJob = (function extractTagsJob() {
                console.log("Extracting tags...");
                tagsController.extractTags(collectedReferencesCollection, function() {
                    database.collection("tags", function(err, collection) {
                        tagsCollection = collection;
                    });
                });
            }());
            nodeSchedule.scheduleJob({hour: 2, minute: 0}, extractTagsJob);
        }
        seriesCallback();
    }
]);

// Executes middlewares
application.use("*", function(req, res, next) {
    req.async = async;
    req.bcryptNodejs = bcryptNodejs;
    req.crypto = crypto;
    req.expressJwt = expressJwt;
    req.fs = fs;
    req.jsonWebToken = jsonWebToken;
    req.moment = moment;
    req.request = request;
    req.underscore = underscore;
    req.configurationManager = configurationManager;
    req.seedsConfiguration = seedsConfiguration;
    // req.datasetsCollection = datasetsCollection;
    req.peersCollection = peersCollection;
    req.repositoriesCollection = repositoriesCollection;
    req.referencesCollection = referencesCollection;
    req.guestReferencesCollection = guestReferencesCollection;
    req.collectedReferencesCollection = collectedReferencesCollection;
    req.localCollectedReferencesCollection = localCollectedReferencesCollection;
    req.usersCollection = usersCollection;
    req.collectedUsersCollection = collectedUsersCollection;
    req.localCollectedUsersCollection = localCollectedUsersCollection;
    req.datasetReferencesCollections = datasetReferencesCollections;
    req.rankedReferencesCollection = rankedReferencesCollection;
    req.localRankedReferencesCollection = localRankedReferencesCollection;
    req.tagsCollection = tagsCollection;
    next();
});

application.use("*", bodyParser.json());

application.use("/client", express.static(require('path').resolve(__dirname + "/../client")));

application.use(multer({ 
    dest: path.resolve(dataPath + "/files/uploads/")
}));

application.get("/", function(req, res, next) {
    res.redirect("/client");
});

// Routes requests
// DATASETS
application.get("/api/datasets", expressJwt({secret: configurationManager.get().secret}), cors(), function(req, res) {
    console.log("Request to Read all Datasets");
    systemController.checkUserCoherence(req, res);
    datasetsController.getDatasets(req, res);
});

application.get("/api/public-datasets", cors(), function(req, res) {
    console.log("Request to Read all Public Datasets");
    datasetsController.getPublicDatasets(req, res);
});

application.get("/api/datasets/:id", expressJwt({secret: configurationManager.get().secret}), function(req, res) {
    console.log("Request to Read a Dataset");
    systemController.checkUserCoherence(req, res);
    datasetsController.getDataset(req, res);
});

application.get("/api/public-datasets/:id", cors(), function(req, res) {
    console.log("Request to Read a Public Dataset");
    datasetsController.getPublicDataset(req, res);
});

application.post("/api/datasets", expressJwt({secret: configurationManager.get().secret}), function(req, res) {
    console.log("Request to Add a Dataset");
    systemController.checkUserCoherence(req, res);
    datasetsController.createDataset(req, res);
});

application.put("/api/datasets/:id", expressJwt({secret: configurationManager.get().secret}), function(req, res) {
    console.log("Request to Update a Dataset");
    systemController.checkUserCoherence(req, res);
    datasetsController.updateDataset(req, res);
});

// DATASET REFERENCES
application.get("/api/datasets/:datasetId/references", expressJwt({secret: configurationManager.get().secret}), function(req, res) {
    console.log("Request to Read all Dataset References");
    systemController.checkUserCoherence(req, res);
    datasetReferencesController.getDatasetReferences(req, res);
});

application.get("/api/public-datasets/:datasetId/references", cors(), function(req, res) {
    console.log("Request to Read all Public Dataset References");
    datasetReferencesController.getPublicDatasetReferences(req, res);
});

application.get("/api/datasets/:datasetId/references/:referenceId", expressJwt({secret: configurationManager.get().secret}), function(req, res) {
    console.log("Request to Read a Dataset Reference");
    systemController.checkUserCoherence(req, res);
    datasetReferencesController.getDatasetReference(req, res);
});

application.get("/api/public-datasets/:datasetId/references/:referenceId", cors(), function(req, res) {
    console.log("Request to Read a Public Dataset Reference");
    datasetReferencesController.getPublicDatasetReference(req, res);
});

application.post("/api/datasets/:datasetId/references", expressJwt({secret: configurationManager.get().secret}), function(req, res) {
    console.log("Request to Create a Dataset Reference");
    systemController.checkUserCoherence(req, res);
    datasetReferencesController.storeDatasetReference(req, res);
});

// PEERS
application.get("/api/peers", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Read all Peers");
    peersController.getPeers(req, res);
});

application.get("/api/public-peers", cors(), function(req, res) {
    console.log("Request to Read all Public Peers");
    peersController.getPublicPeers(req, res);
});

application.get("/api/peers/:id", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Read a Peer");
    peersController.getPeer(req, res);
});

application.get("/api/public-peers/:id", cors(), function(req, res) {
    console.log("Request to Read a Public Peer");
    peersController.getPublicPeer(req, res);
});

application.post("/api/peers", expressJwt({secret: configurationManager.get().secret}), function(req, res) {
    console.log("Request to Create a Peer");
    systemController.checkUserCoherence(req, res);
    peersController.createPeer(req, res);
});

application.post("/api/public-peers", cors(), function(req, res) {
    console.log("Request to Create a Public Peer");
    peersController.createPublicPeer(req, res);
});

application.put("/api/peers/:id", expressJwt({secret: configurationManager.get().secret}), function(req, res) {
    console.log("Request to Update a Peer");
    systemController.checkUserCoherence(req, res);
    peersController.updatePeer(req, res);
});

application.delete("/api/peers/:id", expressJwt({secret: configurationManager.get().secret}), function(req, res) {
    console.log("Request to Delete a Peer");
    systemController.checkUserCoherence(req, res);
    peersController.deletePeer(req, res);
});

application.get("/api/seed-peers", expressJwt({secret: configurationManager.get().secret}), function(req, res) {
    console.log("Request to Read all Seed Peers");
    systemController.checkUserCoherence(req, res);
    peersController.getSeedPeers(req, res);
});

application.get("/api/aggregated-peers", expressJwt({secret: configurationManager.get().secret}), function(req, res) {
    console.log("Request to Read all Aggregated Peers");
    systemController.checkUserCoherence(req, res);
    peersController.getAggregatedPeers(req, res);
});

application.get("/api/custom-peers", expressJwt({secret: configurationManager.get().secret}), function(req, res) {
    console.log("Request to Read all Custom Peers");
    systemController.checkUserCoherence(req, res);
    peersController.getCustomPeers(req, res);
});

application.get("/api/aggregated-and-custom-peers", expressJwt({secret: configurationManager.get().secret}), function(req, res) {
    console.log("Request to Read all Aggregated and Custom Peers");
    systemController.checkUserCoherence(req, res);
    peersController.getAggregatedAndCustomPeers(req, res);
});

// PEER DATASETS
application.get("/api/peers/:id/public-datasets", expressJwt({secret: configurationManager.get().secret}), function(req, res) {
    console.log("Request to Read all Peer Public Datasets");
    systemController.checkUserCoherence(req, res);
    peerDatasetsController.getPeerPublicDatasets(req, res);
});

application.get("/api/peers/:peerId/public-datasets/:datasetId", expressJwt({secret: configurationManager.get().secret}), function(req, res) {
    console.log("Request to Read a Peer Public Dataset");
    systemController.checkUserCoherence(req, res);
    peerDatasetsController.getPeerPublicDataset(req, res);
});

// PEER DATASET REFERENCES
application.get("/api/peers/:peerId/public-datasets/:datasetId/references", expressJwt({secret: configurationManager.get().secret}), function(req, res) {
    console.log("Request to Read all Peer Public Dataset References");
    systemController.checkUserCoherence(req, res);
    peerDatasetReferencesController.getPeerPublicDatasetReferences(req, res);
});

application.get("/api/peers/:peerId/public-datasets/:datasetId/references/:referenceId", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Read a Peer Public Dataset Reference");
    peerDatasetReferencesController.getPeerPublicDatasetReference(req, res);
});

// PEER REFERENCES
application.get("/api/peers/:id/public-references", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Read all Peer Public References");
    peerReferencesController.getPeerPublicReferences(req, res);
});

application.get("/api/peers/:peerId/public-references/:referenceId", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Read a Peer Public Reference");
    peerReferencesController.getPeerPublicReference(req, res);
});

application.get("/api/seed-peers/:seedPeerIndex/public-references", expressJwt({secret: configurationManager.get().secret}), function(req, res) {
    console.log("Request to Read all Seed Peer Public References");
    seedPeerReferencesController.getSeedPeerPublicReferences(req, res);
});

application.get("/api/seed-peers/:seedPeerIndex/public-references/:referenceId", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Read a Seed Peer Public Reference");
    seedPeerReferencesController.getPeerPublicReference(req, res);
});

// REFERENCES
application.get("/api/references", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Read all References");
    referencesController.getReferences(req, res);
});

application.get("/api/public-references", cors(), function(req, res) {
    console.log("Request to Read all Public References");
    referencesController.getPublicReferences(req, res);
});

application.get("/api/references/:id", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Read a Reference");
    referencesController.getReference(req, res);
});

application.get("/api/public-references/:id", cors(), function(req, res) {
    console.log("Request to Read a Public Reference");
    referencesController.getPublicReference(req, res);
});

application.post("/api/references", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Create a Reference");
    referencesController.createReference(req, res);
});

application.put("/api/references/:id", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Update a Reference");
    referencesController.updateReference(req, res);
});

application.patch("/api/references/:id", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Partially Update a Reference");
    referencesController.patchReference(req, res);
});

application.delete("/api/references/:id", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Delete a Reference");
    referencesController.deleteReference(req, res);
});

application.get("/api/received-references", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Read all Received References");
    referencesController.getReceivedReferences(req, res);
});

//RANKED REFERENCES
application.get("/api/ranked-references", function(req, res) {
    console.log("Request to Read all Ranked References");
    rankedReferencesController.getReferences(req, res);
});
application.get("/api/ranked-references/:id", function(req, res) {
    console.log("Request to Read details for a Ranked Reference");
    rankedReferencesController.getRankedReference(req, res);
});

// WORLD NETWORK REFERENCES
application.get("/api/world-network-references", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Read all World Network References");
    worldNetworkReferencesController.getReferences(req, res);
});
application.get("/api/world-network-references/:id", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Read details for a World Network Reference");
    worldNetworkReferencesController.getRankedReference(req, res);
});

// NETWORK REFERENCES
application.get("/api/network-references", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Read all Network References");
    networkReferencesController.getReferences(req, res);
});
application.get("/api/ranked-network-references", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Read all Local Ranked References");
    localRankedReferencesController.getReferences(req, res);
});

// LOCAL NETWORK USERS
application.get("/api/public-network-users", function(req, res) {
    console.log("Request to Read all Public Local Network Users");
    localNetworkUsersController.getUsers(req, res);
});
application.get("/api/network-users", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Read all Local Network Users");
    localNetworkUsersController.getUsers(req, res);
});

// WORLD NETWORK USERS
application.get("/api/public-world-network-users", function(req, res) {
    console.log("Request to Read all Public World Network Users");
    worldNetworkUsersController.getUsers(req, res);
});
application.get("/api/world-network-users", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Read all World Network Users");
    worldNetworkUsersController.getUsers(req, res);
});
application.get("/api/world-network-users/:id", function(req, res) {
    console.log("Request to Read details for a World Network User");
    worldNetworkUsersController.getRankedUser(req, res);
});

// NETWORK USERS
application.get("/api/network-users", function(req, res) {
    console.log("Request to Read all Network Users");
    networkUsersController.getUsers(req, res);
});

// COLLECTED REFERENCES
application.get("/api/collected-references", function(req, res) {
    console.log("Request to Read all Collected References");
    collectedReferencesController.getReferences(req, res);
});

application.get("/api/collected-references/:id", function(req, res) {
    console.log("Request to Read a Collected Reference");
    collectedReferencesController.getReference(req, res);
});

// CLONED REFERENCES
application.post("/api/cloned-references", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Clone a Reference");
    referencesController.cloneReference(req, res);
});

// REPOSITORIES
application.get("/api/repositories", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Read all Repositories");
    repositoriesController.getRepositories(req, res);
});

application.get("/api/public-repositories", cors(), function(req, res) {
    console.log("Request to Read all Public Repositories");
    repositoriesController.getPublicRepositories(req, res);
});

/*
application.get("/api/repositories/:id", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Read a Repository");
    repositoriesController.getRepository(req, res);
});
*/

application.get("/api/repositories/:id", cors(), function(req, res) {
    console.log("Request to Read a Repository");
    repositoriesController.getRepository(req, res);
});

application.post("/api/repositories", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Create a Repository");
    repositoriesController.createRepository(req, res);
});

application.put("/api/repositories/:id", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Update a Repository");
    repositoriesController.updateRepository(req, res);
});

application.delete("/api/repositories/:id", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Delete a Repository");
    repositoriesController.deleteRepository(req, res);
});

// REPOSITORY REFERENCES
application.get("/api/repositories/:id/references", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Read all Repository References");
    repositoryReferencesController.getRepositoryReferences(req, res);
});

// SETTINGS
application.get("/api/settings", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Read all Settings");
    settingsController.getSettings(req, res);
});

application.put("/api/settings", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Update all Settings");
    settingsController.updateSettings(req, res);
});

// TAGS
application.get("/api/tags", function(req, res) {
    console.log("Request to Read the Tags");
    tagsController.getTags(req, res);
});

// SYSTEM
application.get("/api/status", function(req, res) {
    console.log("Request to Read the System Status");
    systemController.getStatus(req, res);
});

application.get("/api/public-counts", cors(), function(req, res) {
    console.log("Request to read Public Counts");
    systemController.getPublicCounts(req, res);
});

// USERS
application.get("/api/users", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Read all Users");
    usersController.getUsers(req, res);
});

application.get("/api/public-users", cors(), function(req, res) {
    console.log("Request to Read all Public Users");
    usersController.getPublicUsers(req, res);
});

application.get("/api/users/:id", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Read a User");
    usersController.getUser(req, res);
});

application.post("/api/users", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Create a User");
    usersController.createUser(req, res);
});

application.put("/api/users/:id", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Update a User");
    usersController.updateUser(req, res);
});

application.delete("/api/users/:id", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to Delete a User");
    usersController.deleteUser(req, res);
});

// LOGGED USERS
application.get("/api/logged-users", expressJwt({secret: configurationManager.get().secret}), function(req, res) {
    console.log("Request to Read the Logged User");
    usersController.getLoggedUser(req, res);
});

application.post("/api/logged-users", cors(), function(req, res) {
    console.log("Request to Login an User");
    usersController.loginUser(req, res);
});

application.put("/api/logged-users", expressJwt({secret: configurationManager.get().secret}), function(req, res) {
    console.log("Request to Update the Logged User");
    usersController.updateLoggedUser(req, res);
});

// DISCOVERY
application.get("/api/discovery/references", cors(), function(req, res) {
    console.log("Request to read All Discovery References");
    discoveryController.getReferences(req, res);
});

application.get("/api/discovery/filtered-references", expressJwt({secret: configurationManager.get().secret}), systemController.checkUserCoherence, function(req, res) {
    console.log("Request to read Discovery References");
    discoveryController.getFilteredReferences(req, res);
});

// Bootstraps application
var ssl_key = fs.readFileSync(path.resolve(__dirname + configurationManager.get().ssl_key_path));
var ssl_cert = fs.readFileSync(path.resolve(__dirname + configurationManager.get().ssl_cert_path));
var options = {
    key: ssl_key,
    cert: ssl_cert
};
https.createServer(options, application).listen(configurationManager.get().port, function() {
    console.log("Listening on port %d", configurationManager.get().port);
});
