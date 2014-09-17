/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

// Resolves dependencies
var async = require("async");
var request = require("request");
var underscore = require("underscore");

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
            var peer = {};
            !req.underscore.isUndefined(req.body.name) ? peer.name = req.body.name.trim() : peer.name = "";
            !req.underscore.isUndefined(req.body.url) ? peer.url = req.body.url.trim() : peer.url = "";
            !req.underscore.isUndefined(req.body.sharing_status) ? peer.sharing_status = req.body.sharing_status : peer.sharing_status = ""; 
            peer.creator_id = req.user.id;
            peer.creation_datetime = req.moment().format();
            peer.last_modifier_id = "";
            peer.last_modification_datetime = "";            
            req.peersCollection.insert(peer, {w:1}, function(err, peer) {
                if (err || req.underscore.isNull(peer)) {
                    res.status(404).end();
                    return;
                }
                
                res.end();
            });            
        },
        createPublicPeer: function(req, res) {
            req.peersCollection.findOne({ url: req.body.url }, function(err, peer) {
                if (err || req.underscore.isNull(peer)) {
                    var peer = {};
                    !req.underscore.isUndefined(req.body.name) ? peer.name = req.body.name.trim() : peer.name = "";
                    !req.underscore.isUndefined(req.body.url) ? peer.url = req.body.url.trim() : peer.url = "";
                    peer.sharing_status = true; 
                    peer.creator_id = "";
                    peer.creation_datetime = req.moment().format();
                    peer.last_modifier_id = "";
                    peer.last_modification_datetime = "";            
                    req.peersCollection.insert(peer, {w:1}, function(err, peer) {
                        if (err || req.underscore.isNull(peer)) {
                            res.status(500).end();
                            return;
                        }

                        res.end();
                    });                    
                } else {
                    res.status(500).end();
                    return;
                }
            });
        },        
        updatePeer: function(req, res) { 
            var peer = {};
            !req.underscore.isUndefined(req.body.name) ? peer.name = req.body.name.trim() : null;
            !req.underscore.isUndefined(req.body.url) ? peer.url = req.body.url.trim() : null; 
            !req.underscore.isUndefined(req.body.sharing_status) ? peer.sharing_status = req.body.sharing_status : null;
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
        discoverPeers: function(installationConfiguration, seedsConfiguration, peersCollection) {
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
                    if (seedsConfiguration[seedKey] != installationConfiguration.url) {
                        request({
                            method: "POST",
                            url: seedsConfiguration[seedKey] + "/api/public-peers", 
                            json: { 
                                name: installationConfiguration.installation_name, 
                                url: installationConfiguration.installation_url 
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