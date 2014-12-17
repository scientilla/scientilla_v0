/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

// Resolves dependencies
var _ = require("underscore");
var async = require("async");
var path = require("path");
var request = require("request");

var configurationManager = require(path.resolve(__dirname + "/../../system/controllers/configuration.js"));

var referenceManager = require("../../reference/models/default.js")();
var model = require("../models/peer-references.js")();

module.exports = function () {
    var updateReferencesDiscoveringHits = function(peersCollection, currentPeer, callback) {
        peersCollection.update({ _id: currentPeer._id }, { $set: { references_discovering_hits: (currentPeer.references_discovering_hits + 1) } }, { w: 1}, function(err, peer) {
            callback();
        });
    };
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
                }, function (error, response, peerReferencesObj) {
                    var peerReferences = peerReferencesObj.items;
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
                            var verifiedReferencesObj = {items: verifiedReferences, number_of_items: verifiedReferences.length};
                            res.setHeader("Content-Type", "application/json");
                            res.status(200).send(verifiedReferencesObj).end();
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
                function(firstSeriesCallback) {
                    collectedReferencesCollection.find({ peer_url: configurationManager.get().url }).sort({ last_modification_datetime: -1 }).limit(1).toArray(function(err, collectedReferences) {
                        if (err || _.isNull(collectedReferences)) {
                            firstSeriesCallback();
                            return; 
                        }
                        var datetime = (_.isNull(collectedReferences.length) || _.isUndefined(collectedReferences.length) || collectedReferences.length == 0) ? "" : collectedReferences[0].last_modification_datetime;
                        referencesCollection.find({ 
                            sharing_status: true,
                            last_modification_datetime: {
                                $gt: datetime
                            }                
                        }).sort({ creation_datetime: -1 }).toArray(function(err, publicReferences) {
                            if (err || _.isNull(publicReferences)) {
                                firstSeriesCallback();
                                return;
                            } else {
                                async.series([
                                    function(secondSeriesCallback) {
                                        async.eachSeries(
                                            publicReferences,
                                            function(publicReference, eachSeriesCallback) {
                                                var cleanedPublicReference = referenceManager.createNewReference(publicReference);
                                                cleanedPublicReference.peer_url = configurationManager.get().url;
                                                cleanedPublicReference.original_id = publicReference._id;
                                                cleanedPublicReference.author_signatures = publicReference.author_signatures;
                                                cleanedPublicReference.organization_signatures = publicReference.organization_signatures;
                                                collectedReferencesCollection.update({ peer_url: configurationManager.get().url, original_hash: cleanedPublicReference.original_hash, user_hash: cleanedPublicReference.user_hash }, { $set: cleanedPublicReference }, { upsert: true, w: 1 }, function(err, storedCollectedReference) {
                                                    if (err || _.isNull(storedCollectedReference)) {
                                                        // return; 
                                                    }
                                                    eachSeriesCallback();
                                                });
                                            }
                                        );
                                        secondSeriesCallback();
                                    },
                                    function(secondSeriesCallback) {
                                        firstSeriesCallback();
                                    }
                                ]);
                            }
                        });
                    });
                },
                function(firstSeriesCallback) {
                    peersCollection.find({}).sort({ references_discovering_hits: 1 }).limit(1).toArray(function(err, peers) {
                        if (err || _.isNull(peers)) {
                            firstSeriesCallback();
                            return;
                        }
                        if (peers.length > 0) {
                            collectedReferencesCollection.find({ peer_url: peers[0].url }).sort({ last_modification_datetime: -1 }).limit(1).toArray(function(err, collectedReferences) {
                                if (err || _.isNull(collectedReferences)) {
                                    firstSeriesCallback();
                                    return;
                                }
                                var datetime = (_.isNull(collectedReferences.length) || _.isUndefined(collectedReferences.length) || collectedReferences.length == 0) ? "" : collectedReferences[0].last_modification_datetime;
                                console.log(peers[0].url);
                                request({ 
                                    url: peers[0].url + "/api/public-references?datetime=" + encodeURIComponent(datetime), 
                                    strictSSL: false,
                                    json: true 
                                }, function (err, res, peerReferencesObj) {
                                    if (err || _.isNull(peerReferences)) {
                                        updateReferencesDiscoveringHits(peersCollection, peers[0], firstSeriesCallback);
                                    } else {
                                        var peerReferences = peerReferencesObj.items;
                                        async.series([
                                            function(secondSeriesCallback) {                                    
                                                async.eachSeries(
                                                    peerReferences,
                                                    function(peerReference, eachSeriesCallback) {
                                                        var cleanedPeerReference = referenceManager.createNewReference(peerReference);
                                                        cleanedPeerReference.peer_url = peers[0].url;
                                                        cleanedPeerReference.original_id = peerReference._id;
                                                        cleanedPeerReference.author_signatures = peerReference.author_signatures;
                                                        cleanedPeerReference.organization_signatures = peerReference.organization_signatures;
                                                        collectedReferencesCollection.update({ peer_url: peers[0].url, original_hash: cleanedPeerReference.original_hash, user_hash: cleanedPeerReference.user_hash }, { $set: cleanedPeerReference }, { upsert: true, w: 1 }, function(err, storedCollectedReference) {
                                                            if (err || _.isNull(storedCollectedReference)) {
                                                                // 
                                                            }
                                                            eachSeriesCallback();
                                                        });
                                                    }
                                                );
                                                secondSeriesCallback();
                                            },
                                            function(secondSeriesCallback) {
                                                updateReferencesDiscoveringHits(peersCollection, peers[0], firstSeriesCallback);
                                            }
                                        ]);                                    
                                    }
                                });
                            });
                        }
                    });                                    
                }
            ]); 
        }
    };
};
