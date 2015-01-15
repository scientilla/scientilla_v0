/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

// Resolves dependencies
var _ = require("lodash");
var async = require("async");
var mongodb = require("mongodb");
var path = require("path");
var request = require("request");

var collectedReferencesManager = require("../../reference/models/collected-references.js")();
var configurationManager = require(path.resolve(__dirname + "/../../system/controllers/configuration.js"));
var identificationManager = require(path.resolve(__dirname + "/../../system/controllers/identification.js"));
var networkModel = require("../../network/models/default.js")();
var referenceManager = require("../../reference/models/default.js")();

module.exports = function () {
    var objsArray2MongoSearchQuery = function(objsArray) {
        var searchCriteria = _.map(
            objsArray, 
            function(r){
                var propCriteria = _.mapValues(
                    r, 
                    function(val, key) {
                        var propCriterion = {};
                        propCriterion[key] = val;
                        return propCriterion;
                    });
                var searchCriterion =  {$and: propCriteria};
                return searchCriterion;
            });
        var searchQuery = {$or: searchCriteria};
        return searchQuery;
    };
    var retrieveReferences = function(rankedReferencesCollection, keywords, currentPageNumber, numberOfItemsPerPage) {            
        var regexQuery = "^(?=.*(" + keywords.replace(" ", "))(?=.*(") + "))";
        return rankedReferencesCollection.find({                
            "$or": [
                {
                    "value.top.title": { 
                        $regex: regexQuery,
                        $options: 'i'
                    }
                },
                {
                    "value.top.authors": { 
                        $regex: regexQuery,
                        $options: 'i'
                    }
                }
            ]
        }).sort(
            { 
                original_hash: 1,
                clone_hash: 1,                
                creation_datetime: -1 
            }
        ).skip(
            currentPageNumber > 0 ? ((currentPageNumber - 1) * numberOfItemsPerPage) : 0
        ).limit(
            numberOfItemsPerPage
        );
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
            var configuration = configurationManager.get();
            var keywords = _.isUndefined(req.query.keywords) ? '' : req.query.keywords;
            var currentPageNumber = _.isUndefined(req.query.current_page_number) ? 1 : parseInt(req.query.current_page_number);
            var numberOfItemsPerPage = _.isUndefined(req.query.number_of_items_per_page) ? 20 : parseInt(req.query.number_of_items_per_page);            
            var result = {};            
            if (configuration.mode === 2) {
                var retrievedCollection = retrieveReferences(req.localRankedReferencesCollection, keywords, currentPageNumber, numberOfItemsPerPage);
                retrievedCollection.count(function(err, referencesCount) {
                    if (err || req.underscore.isNull(referencesCount)) {
                        res.status(404).end();
                        return;
                    }
                    result.total_number_of_items = referencesCount;
                    retrievedCollection.toArray(function(err, references) {
                        if (err || req.underscore.isNull(references)) {
                            res.status(404).end();
                            return;
                        }
                        var normalizedReferences = collectedReferencesManager.normalizeRankedReferences(references);
                        resolveReferencePeers(normalizedReferences, req.peersCollection, function(resolvedReferences) {
                            result.items = resolvedReferences;
                            
                            // res.setHeader("Content-Type", "application/json");
                            res.json(result);                             
                        });              
                    });                
                });                
            } else {
                networkModel.getRandomSeed(req.seedsConfiguration, function(err, seed) {
                    if (err) {
                        console.log(err);
                        res.status(404).end();
                        return;
                    }
                    req.request({ 
                        url: seed.url + "/api/world-network-references/", 
                        strictSSL: false,
                        json: true,
                        qs: req.query
                    }, function (error, response, result) {
                        if (error) {
                            res.status(404).end();
                            return;
                        }
                        resolveReferencePeers(result.items, req.peersCollection, function(resolvedReferences) {
                            result.items = resolvedReferences;
                            
                            // res.setHeader("Content-Type", "application/json");
                            res.status(200).send(result).end();
                        });
                    });                    
                });                
            }
        },
        getRankedReference: function(req, res) {
            var configuration = configurationManager.get();
            var id = req.params.id;
            if (configuration.mode === 2) {
                req.rankedReferencesCollection.findOne({_id: identificationManager.getDatabaseSpecificId(id)}, function(err, rankedReference) {
                    if (err || req.underscore.isNull(rankedReference)) {
                        console.log(err);
                        res.status(404).end();
                        return;
                    }
                    var searchQuery = objsArray2MongoSearchQuery(rankedReference.value.all);
                    req.collectedReferencesCollection.find(searchQuery)
                        .toArray(function(err, references) {
                            if (err || req.underscore.isNull(references)) {
                                res.status(404).end();
                                return;
                            }
                            var result = {items: references, total_number_of_items: references.length};
                            
                            // res.setHeader("Content-Type", "application/json");
                            res.status(200).send(result).end();
                        });            
                });                
            } else {
                networkModel.getRandomSeed(
                    req.seedsConfiguration, 
                    function(err, seed) {
                        if (err) {
                            console.log(err);
                            res.status(404).end();
                            return;
                        } else {
                            var url = seed.url + "/api/world-network-references/" + req.params.id + "/";
                            req.request({ 
                                url: url, 
                                strictSSL: false,
                                json: true
                            }, function(err, response, body) {
                                    if (err) {
                                        console.log(err);
                                        res.status(404).end();
                                        return;
                                    }
                                    
                                    // res.setHeader("Content-Type", "application/json");
                                    res.status(200).json(body).end();
                                });
                        }
                    });
            }
        }
    };
};
