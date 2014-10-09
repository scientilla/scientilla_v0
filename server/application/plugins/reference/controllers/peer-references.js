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
                        req.user.hash,
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
            console.log("discover references");
            peersCollection.find({}).sort({ hits: -1 }).limit(1).toArray(function(err, peers) {
                if (err) {
                    // 
                }
                console.log("peer: " + peers[0].hits + " - " + peers[0].url);
                peersCollection.update({ _id: peers[0]._id }, { $set: { hits: (peers[0].hits + 1) } }, { w: 1}, function(err, peer) {
                    if (err) {
                        // 
                    }
                });
            });
        }
    };
};