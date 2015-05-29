/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

// Resolves dependencies
var async = require("async");
var moment = require("moment");
var mongodb = require("mongodb");
var path = require("path");
var request = require("request");
var underscore = require("underscore");
var _ = require("lodash");

var configurationManager = require(path.resolve(__dirname + "/../../system/controllers/configuration.js"));
var identificationManager = require(path.resolve(__dirname + "/../../system/controllers/identification.js"));
var peerManager = require("../models/default.js")();
var userManager = require("../../user/models/default.js")();

// Defines actions
module.exports = function () {
    var LOCAL = 0;
    var REMOTE = 1;
    return {
        getPeers: function(req, res) {
            var config = _.pick(req.query, ['keywords', 'page', 'rows']);
            var page = config.page || 1;
            var rows = parseInt(config.rows || 20, 10);
            var skip = (page - 1) * rows;
            var keywords = config.keywords || "";
            var result = {};
            var regexQuery = "^(?=.*(" + keywords.replace(" ", "))(?=.*(") + "))";
            var peersCollection = req.peersCollection
            .find({
                $or: [
                    {
                        name : { 
                            $regex: regexQuery,
                            $options: 'i'
                        }
                    },
                    {
                        description : { 
                            $regex: regexQuery,
                            $options: 'i'
                        }
                    },
                    {
                        url : { 
                            $regex: regexQuery,
                            $options: 'i'
                        }
                    }
                ]
            })
            .skip(
                skip
            ).limit(
                rows
            );
    
            peersCollection.count(function(err, count) {
                if (err) {
                    console.log(err);
                    res.status(404).end();
                    return;
                }
                result.total_number_of_items = count;
                peersCollection.toArray(function(err, peers) {
                    if (err || req.underscore.isNull(peers)) {
                        console.log(err);
                        res.status(404).end();
                        return;
                    }
                    result.items = peers;
                    // res.setHeader("Content-Type", "application/json");
                    res.json(result);
                });
            });
        },
        getPublicPeers: function(req, res) {
            req.peersCollection.find({ sharing_status: true }, { tags: 0}).toArray(function(err, peers) {
                if (err || req.underscore.isNull(peers)) {
                    res.status(404).end();
                    return;
                }
                
                // res.setHeader("Content-Type", "application/json");
                res.json(peers);
            });            
        },
        getSeedPeers: function(req, res) {
            peerManager.getSeedPeers(req.seedsConfiguration, function(seedPeers) {
                // res.setHeader("Content-Type", "application/json");
                res.json(seedPeers);            
            });
        },
        getAggregatedPeers: function(req, res) {
            req.peersCollection.find({ aggregating_status: true }).toArray(function(err, peers) {
                if (err || req.underscore.isNull(peers)) {
                    res.status(404).end();
                    return;
                }
                
                // res.setHeader("Content-Type", "application/json");
                res.json(peers);
            });
        },
        getCustomPeers: function(req, res) {
            req.peersCollection.find({ type: 0 }).toArray(function(err, peers) {
                if (err || req.underscore.isNull(peers)) {
                    res.status(404).end();
                    return;
                }
                
                // res.setHeader("Content-Type", "application/json");
                res.json(peers);
            });
        },
        getAggregatedAndCustomPeers: function(req, res) {
            
            var config = _.pick(req.query, ['keywords', 'page', 'rows']);
            var page = config.page || 1;
            var rows = parseInt(config.rows || 20, 10);
            var skip = (page - 1) * rows;
            var keywords = config.keywords || "";
            var result = {};
            var regexQuery = "^(?=.*(" + keywords.replace(" ", "))(?=.*(") + "))";
            var peersCollection = req.peersCollection
            .find({
                $and: [
                    {$or: [
                        {
                            name : { 
                                $regex: regexQuery,
                                $options: 'i'
                            }
                        },
                        {
                            description : { 
                                $regex: regexQuery,
                                $options: 'i'
                            }
                        },
                        {
                            url : { 
                                $regex: regexQuery,
                                $options: 'i'
                            }
                        }
                    ]},
                    {$or: [
                        { aggregating_status: true }, 
                        { type: 0 }
                    ]}
                ]
            })
            .skip(
                skip
            ).limit(
                rows
            );
    
            peersCollection.count(function(err, count) {
                if (err) {
                    console.log(err);
                    res.status(404).end();
                    return;
                }
                result.total_number_of_items = count;
                peersCollection.toArray(function(err, peers) {
                    if (err || req.underscore.isNull(peers)) {
                        console.log(err);
                        res.status(404).end();
                        return;
                    }
                    result.items = peers;
                    // res.setHeader("Content-Type", "application/json");
                    res.json(result);
                });
            });
        },        
        getPeer: function(req, res) {
            req.peersCollection.findOne({_id: identificationManager.getDatabaseSpecificId(req.params.id)}, function(err, peer) {
                if (err || req.underscore.isNull(peer)) {
                    res.status(404).end();
                    return;
                }
                
                // res.setHeader("Content-Type", "application/json");
                res.json(peer);
            });            
        },
        getPublicPeer: function(req, res) {
            req.peersCollection.findOne({_id: identificationManager.getDatabaseSpecificId(req.params.id), sharing_status: true}, function(err, peer) {
                if (err || req.underscore.isNull(peer)) {
                    res.status(404).end();
                    return;
                }
                
                // res.setHeader("Content-Type", "application/json");
                res.json(peer);
            });            
        },        
        createPeer: function(req, res) {
            req.peersCollection.findOne({ url: req.body.url }, function(err, existingpeer) {
                if (err || req.underscore.isNull(existingpeer)) {
                    req.peersCollection.find({}).sort({ 
                        references_discovering_hits: 1,
                        users_discovering_hits: 1
                    }).limit(1).toArray(function(err, existingPeers) {
                        var defaultPeerReferencesDiscoveringHits;
                        var defaultPeerUsersDiscoveringHits;
                        if (err || req.underscore.isNull(existingPeers)) {
                            defaultPeerReferencesDiscoveringHits = 0;
                            defaultPeerUsersDiscoveringHits = 0;
                        } else {
                            defaultPeerReferencesDiscoveringHits = existingPeers[0].references_discovering_hits;
                            defaultPeerUsersDiscoveringHits = existingPeers[0].users_discovering_hits;
                        }
                        var newPeer = {};
                        !req.underscore.isUndefined(req.body.name) ? newPeer.name = req.body.name.trim() : newPeer.name = "";
                        !req.underscore.isUndefined(req.body.url) ? newPeer.url = req.body.url.trim() : newPeer.url = "";
                        !req.underscore.isUndefined(req.body.description) ? newPeer.description = req.body.description.trim() : newPeer.description = "";
                        !req.underscore.isUndefined(req.body.tags) ? newPeer.tags = req.body.tags : newPeer.tags = [];
                        newPeer.references_discovering_hits = defaultPeerReferencesDiscoveringHits;
                        newPeer.users_discovering_hits = defaultPeerUsersDiscoveringHits;
                        newPeer.creator_id = req.user.id;
                        newPeer.creation_datetime = req.moment().format();
                        newPeer.last_modifier_id = req.user.id;
                        newPeer.last_modification_datetime = req.moment().format(); 
                        newPeer.type = LOCAL;
                        newPeer.sharing_status = false;
                        newPeer.aggregating_status = true;
                        if (_.isEmpty(newPeer.name) || _.isEmpty(newPeer.url)) {
                            res.status(404).end();
                            return;
                        }
                        req.peersCollection.insert(newPeer, { w: 1 }, function(err, storedPeer) {
                            if (err || req.underscore.isNull(storedPeer)) {
                                console.log(err);
                                res.status(409).end();
                                return;
                            }
                            res.end();
                        });
                    });
                } else {
                    res.status(409).end();
                    return;
                }
            });
        },
        createPublicPeer: function(req, res) {
            if (req.body.url != configurationManager.get().url && !req.body.url.match("/.*127\.0\.0\.1.*/i") && !req.body.url.match("/.*localhost.*/i")) {
                req.peersCollection.findOne({ url: req.body.url }, function(err, existingPeer) {
                    if (err || req.underscore.isNull(existingPeer)) {
                        req.peersCollection.find({}).sort({ 
                            references_discovering_hits: 1,
                            users_discovering_hits: 1 
                        }).limit(1).toArray(function(err, existingPeers) {
                            var defaultPeerReferencesDiscoveringHits;
                            var defaultPeerUsersDiscoveringHits;
                            if (err || req.underscore.isNull(existingPeers)) {
                                defaultPeerReferencesDiscoveringHits = 0;
                                defaultPeerUsersDiscoveringHits = 0;
                            } else {
                                defaultPeerReferencesDiscoveringHits = existingPeers[0].references_discovering_hits;
                                defaultPeerUsersDiscoveringHits = existingPeers[0].users_discovering_hits;
                            }                    
                            var newPeer = {};
                            !req.underscore.isUndefined(req.body.name) ? newPeer.name = req.body.name.trim() : newPeer.name = "";
                            !req.underscore.isUndefined(req.body.url) ? newPeer.url = req.body.url.trim() : newPeer.url = "";
                            !req.underscore.isUndefined(req.body.description) ? newPeer.description = req.body.description.trim() : newPeer.description = "";
                            newPeer.sharing_status = true;
                            newPeer.aggregating_status = false;
                            newPeer.references_discovering_hits = defaultPeerReferencesDiscoveringHits;
                            newPeer.users_discovering_hits = defaultPeerUsersDiscoveringHits;
                            newPeer.creator_id = "";
                            newPeer.creation_datetime = req.moment().format();
                            newPeer.last_modifier_id = "";
                            newPeer.last_modification_datetime = req.moment().format();      
                            newPeer.type = REMOTE;
                            if (_.isEmpty(newPeer.name) || _.isEmpty(newPeer.url)) {
                                res.status(404).end();
                                return;
                            }
                            req.peersCollection.insert(newPeer, { w: 1 }, function(err, storedPeer) {
                                if (err || req.underscore.isNull(storedPeer)) {
                                    res.status(409).end();
                                    return;
                                }
                                res.end();
                            });
                        });
                    } else {
                        var renewedPeer = {};
                        !req.underscore.isUndefined(req.body.name) ? renewedPeer.name = req.body.name.trim() : renewedPeer.name = existingPeer.name;
                        !req.underscore.isUndefined(req.body.description) ? renewedPeer.description = req.body.description.trim() : renewedPeer.description = existingPeer.description;
                        renewedPeer.last_modification_datetime = req.moment().format();      
                        renewedPeer.type = REMOTE;
                        if (_.isEmpty(renewedPeer.name) || _.isEmpty(renewedPeer.url)) {
                            res.status(404).end();
                            return;
                        }
                        req.peersCollection.update({ url: existingPeer.url }, { $set: renewedPeer }, { w: 1 }, function(err, storedPeer) {
                            if (err || req.underscore.isNull(storedPeer)) {
                                res.status(409).end();
                                return;
                            }
                            res.end();
                        });
                    }
                });
            }
        },        
        updatePeer: function(req, res) { 
            var peer = {};
            !req.underscore.isUndefined(req.body.name) ? peer.name = req.body.name.trim() : null;
            !req.underscore.isUndefined(req.body.url) ? peer.url = req.body.url.trim() : null; 
            !req.underscore.isUndefined(req.body.description) ? peer.description = req.body.description.trim() : null; 
            !req.underscore.isUndefined(req.body.aggregating_status) ? peer.aggregating_status = req.body.aggregating_status : null;
            !req.underscore.isUndefined(req.body.tags) ? peer.tags = req.body.tags : [];
            peer.last_modifier_id = req.user.id;
            peer.last_modification_datetime = req.moment().format();         
            req.peersCollection.update({_id: identificationManager.getDatabaseSpecificId(req.params.id)}, { $set: peer }, {w: 1}, function(err, count) {
                if (err || count === 0) {
                    console.log(err);
                    res.status(404).end();
                    return;
                }
                
                res.end();
            });            
        },
        deletePeer: function(req, res) {          
            var id = req.params.id;
            req.peersCollection.remove({_id: identificationManager.getDatabaseSpecificId(id), type: 0}, {w: 1}, function(err, num) {
                if (err) {
                    console.log(err);
                    res.status(500).end();
                    return;
                }
                if (num < 1) {
                    req.peersCollection.count({_id: identificationManager.getDatabaseSpecificId(id)}, function(err, count) {
                        if (err) {
                            console.log(err);
                            res.status(500).end();
                            return;
                        }
                        if (count < 1) {
                            console.log('A peer with id ' + id + ' does not exist');
                            res.status(400).json('not exists').end();
                            return;
                        } else  {
                            console.log('The peer cannot be deleted');
                            res.status(430).json('not deletable').end();
                            return;
                        }
                    });
                } else {
                    res.end();
                }
            });            
        },        
        discoverPeers: function(seedsConfiguration, peersCollection, usersCollection) {
            for (var seedKey in seedsConfiguration) {
                request({
                    method: "GET",
                    url: seedsConfiguration[seedKey] + "/api/public-peers", 
                    strictSSL: false,
                    json:true
                }, function (err, res, body) {
                    if (!err && body != "") {
                        var peers = body;
                        async.eachSeries(
                                peers,
                                function(peer, eachSeriesCallback) {
                                if (peer.url != configurationManager.get().url) {
                                    peersCollection.findOne({ url: peer.url }, function(err, knownPeer) {
                                        if (err || underscore.isNull(knownPeer)) {
                                            peersCollection.find({}).sort({ 
                                                references_discovering_hits: 1,
                                                users_discovering_hits: 1 
                                            }).limit(1).toArray(function(err, existingPeers) {
                                                var defaultPeerReferencesDiscoveringHits;
                                                var defaultPeerUsersDiscoveringHits;
                                                if (err || underscore.isNull(existingPeers) || underscore.isEmpty(existingPeers)) {
                                                    defaultPeerReferencesDiscoveringHits = 0;
                                                    defaultPeerUsersDiscoveringHits = 0;
                                                } else {
                                                    defaultPeerReferencesDiscoveringHits = existingPeers[0].references_discovering_hits;
                                                    defaultPeerUsersDiscoveringHits = existingPeers[0].users_discovering_hits;
                                                }
                                                request({
                                                    method: "GET",
                                                    url: peer.url + "/api/public-counts", 
                                                    strictSSL: false,
                                                    json: true
                                                }, function (err, res, body) {
                                                    var discoveredPeer = {};
                                                    if (!err && body != "") {
                                                        var publicCounts = body;
                                                        discoveredPeer.size = publicCounts.public_references;
                                                    } else {
                                                        discoveredPeer.size = 0;
                                                    }
                                                    discoveredPeer.name = peer.name;
                                                    discoveredPeer.url = peer.url;
                                                    discoveredPeer.description = peer.description;
                                                    discoveredPeer.sharing_status = true; 
                                                    discoveredPeer.aggregating_status = false;
                                                    discoveredPeer.references_discovering_hits = defaultPeerReferencesDiscoveringHits;
                                                    discoveredPeer.users_discovering_hits = defaultPeerUsersDiscoveringHits;
                                                    discoveredPeer.creator_id = "";
                                                    discoveredPeer.creation_datetime = peer.creation_datetime;
                                                    discoveredPeer.last_modifier_id = "";
                                                    discoveredPeer.last_modification_datetime = moment().format();  
                                                    discoveredPeer.type = REMOTE;
                                                    if (_.isEmpty(discoveredPeer.name) || _.isEmpty(discoveredPeer.url)) {
                                                        eachSeriesCallback();
                                                    } else {
                                                        peersCollection.insert(discoveredPeer, {w: 1}, function(err, createdPeer) {
                                                            eachSeriesCallback();
                                                        });   
                                                    }
                                                });
                                            });
                                        } else {
                                            request({
                                                method: "GET",
                                                url: peer.url + "/api/public-counts", 
                                                strictSSL: false,
                                                json: true
                                            }, function (err, res, body) {
                                                var rediscoveredPeer = {};
                                                if (!err && body != "") {
                                                    var publicCounts = body;
                                                    rediscoveredPeer.size = publicCounts.public_references;
                                                } else {
                                                    rediscoveredPeer.size = 0;
                                                }
                                                rediscoveredPeer.name = peer.name;
                                                rediscoveredPeer.description = peer.description;
                                                rediscoveredPeer.last_modification_datetime = moment().format();  
                                                rediscoveredPeer.type = REMOTE;
                                                if (_.isEmpty(rediscoveredPeer.name) || _.isEmpty(rediscoveredPeer.url)) {
                                                    eachSeriesCallback();
                                                } else {
                                                    peersCollection.update({ url: peer.url }, { $set: rediscoveredPeer }, {w: 1}, function(err, createdPeer) {
                                                        eachSeriesCallback();
                                                    }); 
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    eachSeriesCallback();
                                }
							}
						);
                    }
                    if (seedsConfiguration[seedKey] != configurationManager.get().url) {
                        userManager.getUser(usersCollection, configurationManager.get().owner_user_id, function(err, user) {
                            var ownerUserScientillaNominative = "";
                            var userDescription = "";
                            if (!err) {
                                ownerUserScientillaNominative = user.scientilla_nominative;
                                userDescription = user.description;
                            } else {
                                ownerUserScientillaNominative = "SCIENTILLA";
                                userDescription = "";
                            }
                            request({
                                method: "POST",
                                url: seedsConfiguration[seedKey] + "/api/public-peers", 
                                json: { 
                                    name: ownerUserScientillaNominative, 
                                    url: configurationManager.get().url,
                                    description: userDescription
                                },
                                strictSSL: false 
                            }, function (err, res, body) {
                                //
                            });
                        });
                    }
                });                               
            }
        },
        getPublicPeersCount: function(req, res, callback) {
            callback(null, 0);
        } 
    };
};