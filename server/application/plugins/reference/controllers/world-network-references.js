/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var async = require("async");
var request = require("request");
var _ = require("lodash");

var referenceManager = require("../../reference/models/default.js")();
var networkModel = require("../../network/models/default.js")();
var collectedReferencesManager = require("../../reference/models/collected-references.js")();
var configurationManager = require("../../system/controllers/configuration.js");
var referencesManager = require("../../reference/models/default.js")();

module.exports = function () {
    var getSeedUrl = function(req, cb) {
        var configuration = configurationManager.get();
        var peer;
        if (configuration.seed) {
            peer = configuration.url;
            cb(null, peer);
        } else {
            networkModel.getRandomSeed(
                req.seedsConfiguration, 
                function(err, seed) {
                    if (err) {
                        cb(err, null);
                    } else {
                        cb(null, seed.url);
                    }
                });
        }
    };
    var makeRequest = function(url, qs, cb) {
        request({ 
            url: url, 
            qs: qs,
            strictSSL: false,
            json: true
        }, function(err, response, body) {
                if (err) {
                    cb(err, null);
                    return;
                }
                cb(null, body);
            });
    };
    var verifyResults = function(referencesObj, referencesCollection, hashes, cb) {
        var result = _.pick(referencesObj, ['total_number_of_items']);
        referencesManager.getVerifiedReferences(
            referencesCollection,
            hashes,
            referencesObj.items, 
            null,
            function(err, references) {
                result.items = references;
                cb(err, result);
            });
    };
    
    var resolveReferencePeers = function(referencesObj, peersCollection, cb) {
        var result = _.pick(referencesObj, ['total_number_of_items']);
        async.mapSeries(
            referencesObj.items,
            function(reference, iterationCallback) {
                peersCollection.find({ url: reference.peer_url }).toArray(function(error, peers) {
                    if (error || _.isNull(peers) || _.isUndefined(peers) || peers.length === 0) {
                        iterationCallback(error, reference);
                        return;
                    }
                    reference.peer_id = peers[0]._id;
                    iterationCallback(null, reference);
                });
            },
            function(err, resolvedReferences) {
                result.items = resolvedReferences;
                cb(err, result);
            }
        );
    };
    
    return {        
        getReferences: function(req, res) {
            async.waterfall([
                function(cb) {
                    getSeedUrl(req, cb);
                },
                function(peer_url, cb) {
                    var reqUrl = peer_url + "/api/ranked-references";
                    makeRequest(reqUrl, req.query, cb);
                },
                function(referencesObj, cb) {
                    resolveReferencePeers(referencesObj, req.peersCollection, cb);
                },
                function(referencesObj, cb) {
                    verifyResults(referencesObj, req.referencesCollection, req.user.hashes, cb);
                }
            ],
            function(err, referencesObj) {
                if (err) {
                    console.log(err);
                    res.status(404).end();
                    return;
                }
                
                // res.setHeader("Content-Type", "application/json");
                res.json(referencesObj);
                return;
            });
        },
        getRankedReference: function(req, res) {
            var id = req.params.id;
            async.waterfall([
                function(cb) {
                    getSeedUrl(req, cb);
                },
                function(peer_url, cb) {
                    var reqUrl = peer_url + "/api/ranked-references/" + id;
                    makeRequest(reqUrl, {}, cb);
                },
                function(referencesObj, cb) {
                    resolveReferencePeers(referencesObj, req.peersCollection, cb);
                },
                function(referencesObj, cb) {
                    verifyResults(referencesObj, req.referencesCollection, req.user.hashes, cb);
                }
            ],
            function(err, referencesObj) {
                if (err) {
                    console.log(err);
                    res.status(500).end();
                    return;
                }
                
                // res.setHeader("Content-Type", "application/json");
                res.json(referencesObj);
                return;
            });
        }
    };
};
