/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */


// Resolves dependencies
var _ = require("lodash");
var async = require("async");
var path = require("path");

var configurationManager = require(path.resolve(__dirname + "/../../system/controllers/configuration.js"));

var networkModel = require("../../network/models/default.js")();
var peerManager = require("../../peer/models/default.js")();
var collectedReferencesManager = require("../../reference/models/collected-references.js")();
var referencesManager = require("../../reference/models/default.js")();

module.exports = function () {
        var getReferencesFromAliases = function(rankedReferencesCollection, aliases, userType, config) {
            var aliasesQuery = aliases.join("|");
            var keywords = config.keywords || "";
            var page = config.page || 1;
            var rows = parseInt(config.rows || 20, 10);
            var skip = (page - 1) * rows;
            var keywordsQuery = "^(?=.*(" + keywords.replace(" ", "))(?=.*(") + "))";
            
            var searchQuery;
            
            if (userType == 2) {
                searchQuery = {
                    $and: [
                        {"value.affiliations": { 
                            $in: aliases
                        }},
                        {"value.top.title": {
                            $regex: keywordsQuery,
                            $options: 'i'
                        }}
                    ]
                };
            } else {
                searchQuery = {
                    $and: [
                        {"value.top.authors": { 
                            $regex: aliasesQuery,
                            $options: 'i'
                        }},
                        {"value.top.title": {
                            $regex: keywordsQuery,
                            $options: 'i'
                        }}
                    ]
                };
            }
            
            return rankedReferencesCollection.find(searchQuery)
                    .sort({ 
                    "value.top.creation_datetime": -1
                }
            ).skip(
                skip
            ).limit(
                rows
            );
        };
    return {
        getReferences: function(req, res) {
            var configuration = configurationManager.get();
            if (configuration.mode === 1) {
                var aliases = req.query.aliases;       
                if (!_.isArray(aliases)) {
                    aliases = [aliases];
                }
                var userType = req.query.user_type;                
                var config = _.pick(req.query, ['keywords', 'page', 'rows']);
                var referencesCollection = getReferencesFromAliases(req.rankedReferencesCollection, aliases, userType, config);
                
                 var result = {};
                referencesCollection.count(function(err, referencesCount) {
                    if (err || req.underscore.isNull(referencesCount)) {
                        res.status(404).end();
                        return;
                    }   
                        result.total_number_of_items = referencesCount;
                        referencesCollection.toArray(
                            function(err, references) {
                                if (err) {
                                    console.log(err);
                                    res.status(500).end();
                                    return;
                                }
                                var normalizedReferences = collectedReferencesManager.normalizeRankedReferences(references);

                                result.items = normalizedReferences;
                    
                                // res.setHeader("Content-Type", "application/json");
                                res.json(result);
                            });
                    });
            } else {
                networkModel.getRandomSeed(req.seedsConfiguration, function(err, seed) {
                    var url = seed.url + "/api/discovery/references";
                    req.request({ 
                        url: url, 
                        qs: req.query,
                        strictSSL: false,
                        json: true
                    }, function(err, response, body) {
                            if (err) {
                                console.log(err);
                                res.status(500).end();
                                return;
                            }
                            if (response.statusCode !== 200) {
                                console.log('An error happened while contacting ' + seed.url + '.');
                                res.status(404).end();
                                return;
                            }
                            
                            // res.setHeader("Content-Type", "application/json");
                            res.json(body);
                            return;
                        });
                    });
            }
        },
        getFilteredReferences: function(req, res) {
            var configuration = configurationManager.get();
            var peer;
            async.waterfall([
                function(cb) {
                    if (configuration.mode === 1) {
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
                    var url = peer_url + "/api/discovery/references";
                    req.request({ 
                        url: url, 
                        qs: req.query,
                        strictSSL: false,
                        json: true
                    }, function(err, response, body) {
                            if (err) {
                                cb(err, null);
                                return;
                            }
                            if (response.statusCode !== 200) {
                                console.log('An error happened while contacting ' + peer_url + '.');
                                res.status(404).end();
                                return;
                            }
                            cb(null, body);
                        });
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
                        
                        // res.setHeader("Content-Type", "application/json");
                        res.json(result);
                        return;
                    });
            });
        }
    };
};