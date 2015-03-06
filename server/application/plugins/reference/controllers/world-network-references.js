/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var async = require("async");
var request = require("request");
var _ = require("lodash");

var referenceManager = require("../../reference/models/default.js")();
var rankedReferencesManager = require("../../reference/models/ranked-references.js")();
var networkModel = require("../../network/models/default.js")();
var collectedReferencesManager = require("../../reference/models/collected-references.js")();
var configurationManager = require("../../system/controllers/configuration.js");
var referencesManager = require("../../reference/models/default.js")();

module.exports = function () {
    var makeRequest = function(url, qs, cb) {
        console.log("test1");
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
                if (!body) {
                    cb(new Error('no references'), null);
                    return;
                }
                console.log("test2");
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
        async.map(
            referencesObj.items,
            function(reference, iterationCallback) {
                peersCollection.findOne({ url: reference.peer_url }, function(error, peer) {
                    if (error || _.isNull(peer) || _.isUndefined(peer)) {
                        iterationCallback(error, reference);
                        return;
                    }
                    reference.peer_id = peer._id;
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
                    var configuration = configurationManager.get();
                        if (configuration.mode === 1) {
                            var keywords = _.isUndefined(req.query.keywords) ? '' : req.query.keywords;
                            var currentPageNumber = _.isUndefined(req.query.current_page_number) ? 1 : parseInt(req.query.current_page_number);
                            var numberOfItemsPerPage = _.isUndefined(req.query.number_of_items_per_page) ? 20 : parseInt(req.query.number_of_items_per_page);
                            var peerUrls = _.isUndefined(req.query.peer_urls) ? [] : req.query.peer_urls;
                            var originalHashes = _.isUndefined(req.query.original_hashes) ? [] : req.query.original_hashes;

                            rankedReferencesManager.getReferences(
                                configuration, 
                                req.rankedReferencesCollection, 
                                keywords, currentPageNumber, 
                                numberOfItemsPerPage, 
                                peerUrls, 
                                originalHashes,
                                cb
                            );
                        } else {
                            networkModel.getSeedUrl(req, function(err, seed_url) {
                                var reqUrl = seed_url + "/api/ranked-references/";
                                makeRequest(reqUrl, {}, cb);
                            });
                    }
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
                    networkModel.getSeedUrl(req, cb);
                },
                function(peer_url, cb) {
                    var reqUrl = peer_url + "/api/ranked-references/" + id;
                    // makeRequest(reqUrl, {}, cb);
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
