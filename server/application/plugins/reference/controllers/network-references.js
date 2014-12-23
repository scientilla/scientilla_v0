/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

// Resolves dependencies
var _ = require("lodash");
var path = require("path");
var request = require("request");
var async = require("async");

var configurationManager = require(path.resolve(__dirname + "/../../system/controllers/configuration.js"));
var referencesManager = require("../../reference/models/default.js")();
var networkModel = require("../../network/models/default.js")();

module.exports = function () {
    return {        
        getReferences: function(req, res) {
            var configuration = configurationManager.get();
            var thisUrl = configuration.url;
            var peer;
            async.waterfall([
                function(cb) {
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
                },
                function(peer_url, cb) {
                    req.peersCollection.find({
                        aggregating_status: true
                    }).toArray(function(err, networkPeers) {
                        var networkPeerUrls = _.pluck(networkPeers, "url");
                        networkPeerUrls.push(thisUrl);
                        cb(err, peer_url, networkPeerUrls);
                    });
                },
                function(peer_url, networkPeers, cb) {
                    var url = peer_url + "/api/collected-references";
                    var qs = _.merge(req.query, {network_peers: networkPeers});
                    req.request({ 
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
                    },
                    function(referencesObj, cb) {
                        var result = _.pick(referencesObj, ['total_number_of_items']);
                        async.mapSeries(
                            referencesObj.items,
                            function(reference, iterationCallback) {
                                req.peersCollection.find({ url: reference.peer_url }).toArray(function(error, peers) {
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
                    }
            ],
            function(err, referencesObj) {
                if (err) {
                    console.log(err);
                    res.status(404).end();
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
            });
        }
    };
};
