/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var async = require("async");
var path = require("path");
var request = require("request");
var _ = require("underscore");

var configurationManager = require(path.resolve(__dirname + "/../../system/controllers/configuration.js"));

var referenceManager = require("../../reference/models/default.js")();
var model = require("../models/peer-references.js")();

module.exports = function () {
    return {        
        getPeerPublicReferences: function(req, res) {
            req.peersCollection.findOne({ _id: req.params.id }, function(err, peer) {
                if (err || _.isNull(peer)) {
                    res.status(404).end();
                    return;
                }
                req.request({ 
                    url: peer.url + "/api/public-references?keywords=" + req.query.keywords, 
                    strictSSL: false,
                    json: true 
                }, function (error, response, peerReferences) {
                    if (error) {
                        res.status(404).end();
                        return;
                    }
                    referenceManager.getVerifiedReferences(
                        req.referencesCollection,
                        req.user.hashes,
                        peerReferences, 
                        null,
                        function (err, verifiedReferences) {
                            if (err) {
                                res.status(404).end();
                                return;
                            }
                            res.setHeader("Content-Type", "application/json");
                            res.status(200).send(verifiedReferences).end();
                        }
                    );
                });
            });            
        },
        
        getPeerPublicReference: function(req, res) {
            req.peersCollection.findOne({ _id: req.params.peerId }, function(err, peer) {
                if (err || _.isNull(peer)) {
                    res.status(404).end();
                    return;
                }
                req.request({ 
                    url: peer.url + "/api/public-references/" + req.params.referenceId, 
                    strictSSL: false 
                }, function (error, response, body) {
                    if (error) {
                        res.status(404).end();
                        return;
                    }
                    res.setHeader("Content-Type", "application/json");
                    res.status(200).send(body).end();
                });
            });            
        },
        
        discoverReferences: function(peersCollection, referencesCollection, collectedReferencesCollection) {
            async.series([
                function(callback) {
                    collectedReferencesCollection.find({ peer_url: configurationManager.get().url }).sort({ last_modification_datetime: -1 }).limit(1).toArray(function(err, collectedReferences) {
                        if (err || _.isNull(collectedReferences)) {
                            return; 
                        }
                        var datetime = collectedReferences.length === 0 ? "" : collectedReferences[0].last_modification_datetime;
                        referencesCollection.find({ 
                            sharing_status: true,
                            last_modification_datetime: {
                                $gt: datetime
                            }                
                        }).sort({ creation_datetime: -1 }).toArray(function(err, publicReferences) {
                            if (err || _.isNull(publicReferences)) {
                                // return;
                            } else {
                                for (key in publicReferences) {
                                    publicReferences[key].peer_url = configurationManager.get().url;
                                    collectedReferencesCollection.update({ peer_url: configurationManager.get().url, original_hash: publicReferences[key].original_hash, user_hash: publicReferences[key].user_hash }, { $set: publicReferences[key] }, { upsert: true, w: 1 }, function(err, storedCollectedReference) {
                                        if (err || _.isNull(storedCollectedReference)) {
                                            // return; 
                                        }
                                    });
                                }
                            }
                            callback();
                        });                        
                    });
                },
                function(callback) {
                    peersCollection.find({}).sort({ hits: 1 }).limit(1).toArray(function(err, peers) {
                        if (err || _.isNull(peers)) {
                            return; 
                        }
                        collectedReferencesCollection.find({ peer_url: peers[0].url }).sort({ last_modification_datetime: -1 }).limit(1).toArray(function(err, collectedReferences) {
                            if (err || _.isNull(collectedReferences)) {
                                return; 
                            }
                            var datetime = collectedReferences.length === 0 ? "" : collectedReferences[0].last_modification_datetime;                            
                            request({ 
                                url: peers[0].url + "/api/public-references?datetime=" + encodeURIComponent(datetime), 
                                strictSSL: false,
                                json: true 
                            }, function (err, res, peerReferences) {
                                if (err || _.isNull(peerReferences)) {
                                    // return;
                                } else {
                                    for (key in peerReferences) {
                                        peerReferences[key].peer_url = peers[0].url;
                                        collectedReferencesCollection.update({ peer_url: peers[0].url, original_hash: peerReferences[key].original_hash, user_hash: peerReferences[key].user_hash }, { $set: peerReferences[key] }, { upsert: true, w: 1 }, function(err, storedCollectedReference) {
                                            if (err || _.isNull(storedCollectedReference)) {
                                                // return; 
                                            }
                                        });
                                    }
                                }
                                peersCollection.update({ _id: peers[0]._id }, { $set: { hits: (peers[0].hits + 1) } }, { w: 1}, function(err, peer) {
                                    if (err) {
                                        return;
                                    }
                                });
                                callback();
                            });
                        });
                    });                                    
                }
            ]); 
        }
    };
};
