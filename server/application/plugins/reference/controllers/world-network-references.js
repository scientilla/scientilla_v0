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
    var getSeedUrl = function(cb) {
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
                }
                cb(null, body);
            });
    };
    var verifyResults = function(req, res, err, referencesObj) {
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }
        var result = _.pick(referencesObj, ['total_number_of_items']);
        referencesManager.getVerifiedReferences(
            req.referencesCollection,
            req.user.hashes,
            referencesObj.items, 
            null,
            function(err, references) {
                if (err) {
                    console.log(err);
                    res.status(500).end();
                    return;
                }
                result.items = references;
                res.setHeader("Content-Type", "application/json");
                res.json(result);
                return;
            });
    };
    
    var resolveReferencePeers = function(references, peersCollection, finalizationCallback) {
        async.mapSeries(
            references,
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
            function(error, resolvedReferences) {
                finalizationCallback(resolvedReferences);
            }
        );
    };
    
    return {        
        getReferences: function(req, res) {
            async.waterfall([
                getSeedUrl,
                function(peer_url, cb) {
                    var reqUrl = peer_url + "/api/ranked-references";
                    makeRequest(reqUrl, req.query, cb);
                }
            ],
            function(err, referencesObj) {
                verifyResults(req, res, err, referencesObj);
            });
        },
        getRankedReference: function(req, res) {
            var id = req.params.id;
            async.waterfall([
                getSeedUrl,
                function(peer_url, cb) {
                    var reqUrl = peer_url + "/api/ranked-references/" + id;
                    makeRequest(reqUrl, {}, cb);
                }
            ],
            function(err, referencesObj) {
                verifyResults(req, res, err, referencesObj);
            });
        }
    };
};
