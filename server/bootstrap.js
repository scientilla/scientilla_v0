/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
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
var path = require("path");
var request = require("request");
var tingodb = require("tingodb");
var underscore = require("underscore");
var application = express();

var configuration = require("./configuration/default.js")();
var seeds = require("./seeds.js")();

var datasetsController = require("./application/plugins/dataset/controllers/default.js")();
var peerDatasetsController = require("./application/plugins/dataset/controllers/peer-datasets.js")();
var activatedDatasetsController = require("./application/plugins/dataset/controllers/activated-datasets.js")();
var peersController = require("./application/plugins/peer/controllers/default.js")();
var activatedPeersController = require("./application/plugins/peer/controllers/activated-peers.js")();
var referencesController = require("./application/plugins/reference/controllers/default.js")();
var datasetReferencesController = require("./application/plugins/reference/controllers/dataset-references.js")();
var peerReferencesController = require("./application/plugins/reference/controllers/peer-references.js")();
var peerDatasetReferencesController = require("./application/plugins/reference/controllers/peer-dataset-references.js")();
var repositoryReferencesController = require("./application/plugins/reference/controllers/repository-references.js")();
var repositoriesController = require("./application/plugins/repository/controllers/default.js")();
var activatedRepositoriesController = require("./application/plugins/repository/controllers/activated-repositories.js")();
var settingsController = require("./application/plugins/setting/controllers/default.js")();
var systemController = require("./application/plugins/system/controllers/default.js")();
var usersController = require("./application/plugins/user/controllers/default.js")();

// Executes middlewares
application.use("/client", express.static(require('path').resolve(__dirname + "/../client")));

application.use("*", bodyParser.json());

application.use("*", function(req, res, next) {
	req.async = async;
    req.bcryptNodejs = bcryptNodejs;
    req.crypto = crypto;
    req.expressJwt = expressJwt;
    req.jsonWebToken = jsonWebToken;    
    req.moment = moment;
    req.request = request;
    req.seeds = seeds;
    req.underscore = underscore;    
    next();    
});

application.get("/", function(req, res, next) {
    res.redirect("/client");
});

application.all("*", function(req, res, next) {
    var databaseEngine = tingodb({});
    var database = new databaseEngine.Db(path.resolve(__dirname + "/../files/") + path.sep, {});
    database.open(function(err, database) {
        database.collection("users.db", function(err, collection) {
            req.usersCollection = collection;
            next();
        });
    });    
});

application.all("/*", function(req, res, next) {
    var adDatabaseEngine = tingodb({});
    var adDatabase = new adDatabaseEngine.Db(path.resolve(__dirname + "/../files/") + path.sep, {});
    adDatabase.open(function(err, adDatabase) {
        adDatabase.collection("activated-datasets.db", function(err, adCollection) {
            req.adCollection = adCollection;
            next();
        });
    });   
});

application.all("/*", function(req, res, next) {
    var apDatabaseEngine = tingodb({});
    var apDatabase = new apDatabaseEngine.Db(path.resolve(__dirname + "/../files/") + path.sep, {});
    apDatabase.open(function(err, apDatabase) {
        apDatabase.collection("activated-peers.db", function(err, apCollection) {
            req.apCollection = apCollection;
            next();
        });
    });   
});

application.all("/*", function(req, res, next) {
    var arDatabaseEngine = tingodb({});
    var arDatabase = new arDatabaseEngine.Db(path.resolve(__dirname + "/../files/") + path.sep, {});
    arDatabase.open(function(err, arDatabase) {
        arDatabase.collection("activated-repositories.db", function(err, arCollection) {
            req.arCollection = arCollection;
            next();
        });
    });    
});

application.all("/api/datasets*", function(req, res, next) {
    var databaseEngine = tingodb({});
    var database = new databaseEngine.Db(path.resolve(__dirname + "/../files/") + path.sep, {});
    database.open(function(err, database) {
        database.collection("datasets.db", function(err, collection) {
            req.collection = collection;
            next();
        });
    });   
});

application.all("/api/public-datasets*", function(req, res, next) {
    var databaseEngine = tingodb({});
    var database = new databaseEngine.Db(path.resolve(__dirname + "/../files/") + path.sep, {});
    database.open(function(err, database) {
        database.collection("datasets.db", function(err, collection) {
            req.collection = collection;
            next();
        });
    });   
});

application.all("/api/peers*", function(req, res, next) {
    var databaseEngine = tingodb({});
    var database = new databaseEngine.Db(path.resolve(__dirname + "/../files/") + path.sep, {});
    database.open(function(err, database) {
        database.collection("peers.db", function(err, collection) {
            req.collection = collection;
            next();
        });
    });    
});

application.all("/api/public-peers*", function(req, res, next) {
    var databaseEngine = tingodb({});
    var database = new databaseEngine.Db(path.resolve(__dirname + "/../files/") + path.sep, {});
    database.open(function(err, database) {
        database.collection("peers.db", function(err, collection) {
            req.collection = collection;
            next();
        });
    });    
});

application.all("/api/repositories*", function(req, res, next) {
    var databaseEngine = tingodb({});
    var database = new databaseEngine.Db(path.resolve(__dirname + "/../files/") + path.sep, {});
    database.open(function(err, database) {
        database.collection("repositories.db", function(err, collection) {
            req.collection = collection;
            next();
        });
    });    
});

application.all("/api/public-repositories*", function(req, res, next) {
    var databaseEngine = tingodb({});
    var database = new databaseEngine.Db(path.resolve(__dirname + "/../files/") + path.sep, {});
    database.open(function(err, database) {
        database.collection("repositories.db", function(err, collection) {
            req.collection = collection;
            next();
        });
    });    
});

application.all("/api/references*", function(req, res, next) {
    var databaseEngine = tingodb({});
    var database = new databaseEngine.Db(path.resolve(__dirname + "/../files/") + path.sep, {});
    database.open(function(err, database) {
        database.collection("references.db", function(err, collection) {
            req.collection = collection;
            next();
        });
    });    
});

application.all("/api/public-references*", function(req, res, next) {
    var databaseEngine = tingodb({});
    var database = new databaseEngine.Db(path.resolve(__dirname + "/../files/") + path.sep, {});
    database.open(function(err, database) {
        database.collection("references.db", function(err, collection) {
            req.collection = collection;
            next();
        });
    });    
});

application.all("/api/datasets/:datasetId/references*", function(req, res, next) {
    var databaseEngine = tingodb({});
    var database = new databaseEngine.Db(path.resolve(__dirname + "/../files/datasets") + path.sep, {});
    database.open(function(err, database) {
        database.collection(req.params.datasetId + ".db", function(err, collection) {
            req.collection = collection;
            next();
        });
    });     
});

application.all("/api/public-datasets/:datasetId/references*", function(req, res, next) {
    var databaseEngine = tingodb({});
    var database = new databaseEngine.Db(path.resolve(__dirname + "/../files/datasets") + path.sep, {});
    database.open(function(err, database) {
        database.collection(req.params.datasetId + ".db", function(err, collection) {
            req.collection = collection;
            next();
        });
    });     
});

// Routes requests
// DATASETS
application.get("/api/datasets", expressJwt({secret: 'scientilla'}), cors(), function(req, res) {
    console.log("Request to Read all Datasets");
    systemController.checkUserCoherence(req, res);
    datasetsController.getDatasets(req, res);
});

application.get("/api/public-datasets", cors(), function(req, res) {
    console.log("Request to Read all Public Datasets");   
    datasetsController.getPublicDatasets(req, res);
});

application.get("/api/datasets/:id", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Read a Dataset");
    systemController.checkUserCoherence(req, res);
    datasetsController.getDataset(req, res);
});

application.get("/api/public-datasets/:id", cors(), function(req, res) {
    console.log("Request to Read a Public Dataset");   
    datasetsController.getPublicDataset(req, res);
});

application.post("/api/datasets", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Add a Dataset");
    systemController.checkUserCoherence(req, res);
    datasetsController.createDataset(req, res);
});

application.put("/api/datasets/:id", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Update a Dataset");
    systemController.checkUserCoherence(req, res);
    datasetsController.updateDataset(req, res);
});

// DATASET REFERENCES
application.get("/api/datasets/:datasetId/references", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Read all Dataset References");
    systemController.checkUserCoherence(req, res);
    datasetReferencesController.getDatasetReferences(req, res);
});

application.get("/api/public-datasets/:datasetId/references", cors(), function(req, res) {
    console.log("Request to Read all Public Dataset References");
    datasetReferencesController.getPublicDatasetReferences(req, res);
});

application.get("/api/datasets/:datasetId/references/:referenceId", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Read a Dataset Reference");
    systemController.checkUserCoherence(req, res);
    datasetReferencesController.getDatasetReference(req, res);
});

application.get("/api/public-datasets/:datasetId/references/:referenceId", cors(), function(req, res) {
    console.log("Request to Read a Public Dataset Reference");
    datasetReferencesController.getPublicDatasetReference(req, res);
});

application.post("/api/datasets/:datasetId/references", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Create a Dataset Reference");
    systemController.checkUserCoherence(req, res);
    datasetReferencesController.storeDatasetReference(req, res);
});

// ACTIVATED DATASETS
application.get("/api/activated-datasets", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Read an Activated Dataset");
    systemController.checkUserCoherence(req, res);
    activatedDatasetsController.getActivatedDataset(req, res);
});

application.put("/api/activated-datasets/:id", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Create/Update an Activated Dataset");
    systemController.checkUserCoherence(req, res);
    activatedDatasetsController.setDatasetAsActivated(req, res);
});

// PEERS
application.get("/api/peers", expressJwt({secret: 'scientilla'}), cors(), function(req, res) {
    console.log("Request to Read all Peers");
    systemController.checkUserCoherence(req, res);
    peersController.getPeers(req, res);
});

application.get("/api/public-peers", cors(), function(req, res) {
    console.log("Request to Read all Public Peers");   
    peersController.getPublicPeers(req, res);
});

application.get("/api/peers/:id", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Read a Peer");
    systemController.checkUserCoherence(req, res);
    peersController.getPeer(req, res);
});

application.get("/api/public-peers/:id", cors(), function(req, res) {
    console.log("Request to Read a Public Peer");   
    peersController.getPublicPeer(req, res);
});

application.post("/api/peers", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Create a Peer");
    systemController.checkUserCoherence(req, res);
    peersController.createPeer(req, res);
});

application.put("/api/peers/:id", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Update a Peer");
    systemController.checkUserCoherence(req, res);
    peersController.updatePeer(req, res);
});

// PEER DATASETS
application.get("/api/peers/:id/public-datasets", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Read all Peer Public Datasets");
    systemController.checkUserCoherence(req, res);
    peerDatasetsController.getPeerPublicDatasets(req, res);
});

application.get("/api/peers/:peerId/public-datasets/:datasetId", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Read a Peer Public Dataset");
    systemController.checkUserCoherence(req, res);
    peerDatasetsController.getPeerPublicDataset(req, res);
});

// PEER DATASET REFERENCES
application.get("/api/peers/:peerId/public-datasets/:datasetId/references", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Read all Peer Public Dataset References");
    systemController.checkUserCoherence(req, res);
    peerDatasetReferencesController.getPeerPublicDatasetReferences(req, res);
});

application.get("/api/peers/:peerId/public-datasets/:datasetId/references/:referenceId", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Read a Peer Public Dataset Reference");
    systemController.checkUserCoherence(req, res);
    peerDatasetReferencesController.getPeerPublicDatasetReference(req, res);
});

// PEER REFERENCES
application.get("/api/peers/:id/public-references", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Read all Peer Public References");
    systemController.checkUserCoherence(req, res);
    peerReferencesController.getPeerPublicReferences(req, res);
});

application.get("/api/peers/:peerId/public-references/:referenceId", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Read a Peer Public Reference");
    systemController.checkUserCoherence(req, res);
    peerReferencesController.getPeerPublicReference(req, res);
});

// ACTIVATED PEERS
application.get("/api/activated-peers", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Read an Activated Peer");
    systemController.checkUserCoherence(req, res);
    activatedPeersController.getActivatedPeer(req, res);
});

application.put("/api/activated-peers/:id", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Create/Update an Activated Peer");
    systemController.checkUserCoherence(req, res);
    activatedPeersController.setPeerAsActivated(req, res);
});

// REFERENCES
application.get("/api/references", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Read all References"); 
    systemController.checkUserCoherence(req, res);
    referencesController.getReferences(req, res);
});

application.get("/api/public-references", cors(), function(req, res) {
    console.log("Request to Read all Public References");   
    referencesController.getPublicReferences(req, res);
});

application.get("/api/references/:id", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Read a Reference");
    systemController.checkUserCoherence(req, res);
    referencesController.getReference(req, res);
});

application.get("/api/public-references/:id", cors(), function(req, res) {
    console.log("Request to Read a Public Reference");
    referencesController.getPublicReference(req, res);
});

application.post("/api/references", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Create a Reference");
    systemController.checkUserCoherence(req, res);
    referencesController.createReference(req, res);
});

application.put("/api/references/:id", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Update a Reference");
    systemController.checkUserCoherence(req, res);
    referencesController.updateReference(req, res);
});

application.get("/api/received-references", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Read all Received References");
    systemController.checkUserCoherence(req, res);
    referencesController.getReceivedReferences(req, res);
});

// REPOSITORIES
application.get("/api/repositories", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Read all Repositories");
    systemController.checkUserCoherence(req, res);
    repositoriesController.getRepositories(req, res);
});

application.get("/api/public-repositories", cors(), function(req, res) {
    console.log("Request to Read all Public Repositories");   
    repositoriesController.getPublicRepositories(req, res);
});

application.get("/api/repositories/:id", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Read a Repository");
    systemController.checkUserCoherence(req, res);
    repositoriesController.getRepository(req, res);
});

application.post("/api/repositories", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Create a Repository");
    systemController.checkUserCoherence(req, res);
    repositoriesController.createRepository(req, res);
});

application.put("/api/repositories/:id", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Update a Repository");
    systemController.checkUserCoherence(req, res);
    repositoriesController.updateRepository(req, res);
});

// REPOSITORY REFERENCES
application.get("/api/repositories/:id/references", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Read all Repository References");
    systemController.checkUserCoherence(req, res);
    repositoryReferencesController.getRepositoryReferences(req, res);
});

// ACTIVATED REPOSITORIES
application.get("/api/activated-repositories", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Read an Activated Repository");
    systemController.checkUserCoherence(req, res);
    activatedRepositoriesController.getActivatedRepository(req, res);
});

application.put("/api/activated-repositories/:id", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Create/Update an Activated Repository");
    systemController.checkUserCoherence(req, res);
    activatedRepositoriesController.setRepositoryAsActivated(req, res);
});

// USERS
application.get("/api/users", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Read all Users");
    systemController.checkUserCoherence(req, res);
    usersController.getUsers(req, res);
});

application.get("/api/users/:id", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Read a User");
    systemController.checkUserCoherence(req, res);
    usersController.getUser(req, res);
});

application.post("/api/users", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Create a User");
    systemController.checkUserCoherence(req, res);
    usersController.createUser(req, res);
});

application.put("/api/users/:id", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Update a User");
    systemController.checkUserCoherence(req, res);
    usersController.updateUser(req, res);
});

// LOGGED USERS
application.get("/api/logged-users", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Read the Logged User");  
    usersController.getLoggedUser(req, res);
});

application.post("/api/logged-users", function(req, res) {
    console.log("Request to Login an User");
    usersController.loginUser(req, res);
});

application.put("/api/logged-users", expressJwt({secret: 'scientilla'}), function(req, res) {
    console.log("Request to Update the Logged User");
    usersController.updateLoggedUser(req, res);
});

// Bootstraps application
var ssl_key = fs.readFileSync(path.resolve(__dirname + configuration.ssl_key_path));
var ssl_cert = fs.readFileSync(path.resolve(__dirname + configuration.ssl_cert_path));
var options = {
    key: ssl_key,
    cert: ssl_cert
};
https.createServer(options, application).listen(configuration.ssl_port, function() {
    console.log("Listening on SSL port %d", configuration.ssl_port);
});