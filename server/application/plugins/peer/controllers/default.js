/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

// Resolves dependencies
var async = require("async");
var path = require("path");
var request = require("request");
var underscore = require("underscore");

var configurationManager = require(path.resolve(__dirname + "/../../system/controllers/configuration.js"));
var peerManager = require("../models/default.js")();

// Defines actions
module.exports = function () {
    return {
        getPeers: function(req, res) {
            req.peersCollection.find({}).toArray(function(err, peers) {
                if (err || req.underscore.isNull(peers)) {
                    res.status(404).end();
                    return;
                }
                
                res.setHeader("Content-Type", "application/json");
                res.json(peers);
            });
        },
        getPublicPeers: function(req, res) {
            req.peersCollection.find({ sharing_status: true }).toArray(function(err, peers) {
                if (err || req.underscore.isNull(peers)) {
                    res.status(404).end();
                    return;
                }
                
                res.setHeader("Content-Type", "application/json");
                res.json(peers);
            });            
        },
        getSeedPeers: function(req, res) {
            peerManager.getSeedPeers(req.seedsConfiguration, function(seedPeers) {
                res.setHeader("Content-Type", "application/json");
                res.json(seedPeers);            
            });
        },        
        getPeer: function(req, res) {
            req.peersCollection.findOne({ _id: req.params.id }, function(err, peer) {
                if (err || req.underscore.isNull(peer)) {
                    res.status(404).end();
                    return;
                }
                
                res.setHeader("Content-Type", "application/json");
                res.json(peer);
            });            
        },
        getPublicPeer: function(req, res) {
            req.peersCollection.findOne({ _id: req.params.id, sharing_status: true }, function(err, peer) {
                if (err || req.underscore.isNull(peer)) {
                    res.status(404).end();
                    return;
                }
                
                res.setHeader("Content-Type", "application/json");
                res.json(peer);
            });            
        },        
        createPeer: function(req, res) {
            req.peersCollection.findOne({ url: req.body.url }, function(err, existingpeer) {
                if (err || req.underscore.isNull(existingpeer)) {
                    req.peersCollection.find({}).sort({ hits: 1 }).limit(1).toArray(function(err, existingPeers) {
                        var defaultPeerHits;
                        if (err || req.underscore.isNull(existingPeers)) {
                            defaultPeerHits = 0;
                        } else {
                            defaultPeerHits = existingPeers[0].hits;
                        }
                        var newPeer = {};
                        !req.underscore.isUndefined(req.body.name) ? newPeer.name = req.body.name.trim() : newPeer.name = "";
                        !req.underscore.isUndefined(req.body.url) ? newPeer.url = req.body.url.trim() : newPeer.url = "";
                        !req.underscore.isUndefined(req.body.sharing_status) ? newPeer.sharing_status = req.body.sharing_status : newPeer.sharing_status = ""; 
                        !req.underscore.isUndefined(req.body.aggregating_status) ? newPeer.aggregating_status = req.body.aggregating_status : newPeer.aggregating_status = "";
                        newPeer.hits = defaultPeerHits;
                        newPeer.creator_id = req.user.id;
                        newPeer.creation_datetime = req.moment().format();
                        newPeer.last_modifier_id = req.user.id;
                        newPeer.last_modification_datetime = req.moment().format();            
                        req.peersCollection.insert(newPeer, { w: 1 }, function(err, storedPeer) {
                            if (err || req.underscore.isNull(storedPeer)) {
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
                req.peersCollection.findOne({ url: req.body.url }, function(err, existingpeer) {
                    if (err || req.underscore.isNull(existingpeer)) {
                        req.peersCollection.find({}).sort({ hits: 1 }).limit(1).toArray(function(err, existingPeers) {
                            var defaultPeerHits;
                            if (err || req.underscore.isNull(existingPeers)) {
                                defaultPeerHits = 0;
                            } else {
                                defaultPeerHits = existingPeers[0].hits;
                            }                    
                            var newPeer = {};
                            !req.underscore.isUndefined(req.body.name) ? newPeer.name = req.body.name.trim() : newPeer.name = "";
                            !req.underscore.isUndefined(req.body.url) ? newPeer.url = req.body.url.trim() : newPeer.url = "";
                            newPeer.sharing_status = true;
                            newPeer.aggregating_status = false;
                            newPeer.hits = defaultPeerHits;
                            newPeer.creator_id = "";
                            newPeer.creation_datetime = req.moment().format();
                            newPeer.last_modifier_id = "";
                            newPeer.last_modification_datetime = req.moment().format();            
                            req.peersCollection.insert(newPeer, { w: 1 }, function(err, storedPeer) {
                                if (err || req.underscore.isNull(storedPeer)) {
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
            }
        },        
        updatePeer: function(req, res) { 
            var peer = {};
            !req.underscore.isUndefined(req.body.name) ? peer.name = req.body.name.trim() : null;
            !req.underscore.isUndefined(req.body.url) ? peer.url = req.body.url.trim() : null; 
            !req.underscore.isUndefined(req.body.sharing_status) ? peer.sharing_status = req.body.sharing_status : null;
            !req.underscore.isUndefined(req.body.aggregating_status) ? peer.aggregating_status = req.body.aggregating_status : null;
            peer.last_modifier_id = req.user.id;
            peer.last_modification_datetime = req.moment().format();         
            req.peersCollection.update({ _id: req.params.id }, { $set: peer }, {w: 1}, function(err, peer) {
                if (err || req.underscore.isNull(peer)) {
                    res.status(404).end();
                    return;
                }
                
                res.end();
            });            
        },
        deletePeer: function(req, res) {          
            req.peersCollection.remove({ _id: req.params.id }, {w: 1}, function(err) {
                if (err) {
                    res.status(500).end();
                    return;
                }
                
                res.end();
            });            
        },        
        discoverPeers: function(seedsConfiguration, peersCollection) {
            for (var seedKey in seedsConfiguration) {
                request({
                    method: "GET",
                    url: seedsConfiguration[seedKey] + "/api/public-peers", 
                    strictSSL: false 
                }, function (err, res, body) {
                    if (!err && body != "") {
                        var peers = JSON.parse(body);
						async.eachSeries(
							peers,
							function(peer, eachSeriesCallback) {
								peersCollection.findOne({ url: peer.url }, function(err, knownPeer) {
									if (err || underscore.isNull(knownPeer)) {
										var discoveredPeer = {};
										discoveredPeer.name = peer.name;
										discoveredPeer.url = peer.url;
										discoveredPeer.sharing_status = true; 
                                        discoveredPeer.aggregating_status = false;
                                        discoveredPeer.hits = 0;
										discoveredPeer.creator_id = "";
										discoveredPeer.creation_datetime = peer.creation_datetime;
										discoveredPeer.last_modifier_id = "";
										discoveredPeer.last_modification_datetime = "";            
										peersCollection.insert(discoveredPeer, {w:1}, function(err, createdPeer) {
											eachSeriesCallback();
										}); 
									}
								});
							}
						);
                    }
                    if (seedsConfiguration[seedKey] != configurationManager.get().url) {
                        request({
                            method: "POST",
                            url: seedsConfiguration[seedKey] + "/api/public-peers", 
                            json: { 
                                name: configurationManager.get().name, 
                                url: configurationManager.get().url 
                            },
                            strictSSL: false 
                        }, function (err, res, body) {
                            //
                        });
                    }
                });                               
            }
        } 
    };
};