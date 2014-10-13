/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var referenceManager = require("../../reference/models/default.js")();
var model = require("../models/peer-references.js")();
var _ = require("underscore");

module.exports = function () {
    return {        
        getPeerPublicReferences: function(req, res) {
            req.peersCollection.findOne({ _id: req.params.id }, function(err, peer) {
                if (err || req.underscore.isNull(peer)) {
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
                if (err || req.underscore.isNull(peer)) {
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
        
        discoverReferences: function(peersCollection, collectedReferencesCollection) {
            peersCollection.find({}).sort({ hits: 1 }).limit(1).toArray(function(err, peers) {
                if (err) {
                    return; 
                }
                // Find the datetime of the last modified reference (from local collected references)
                // Ask to the peer the public references passing the datetime as filter (to get only those that have a higher modification datetime)
                // Checking references by reference if they are present locally and, if yes and with an outdated modification datetime, substitute the local data, or, if not present, create new local data (matching by original_hash and user_hash)
                // When a peer is created it should be set with hits equal to the smaller value of the list.
                peersCollection.update({ _id: peers[0]._id }, { $set: { hits: (peers[0].hits + 1) } }, { w: 1}, function(err, peer) {
                    if (err) {
                        return;
                    }
                });
            });
        }
    };
};
