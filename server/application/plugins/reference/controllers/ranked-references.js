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
var rankedReferencesManager = require("../../reference/models/ranked-references.js")();
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
    
    return {
        getReferences: function(req, res) {
            var configuration = configurationManager.get();
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
                function(err, result) {
                    if (err) {
                        console.log(err);
                        res.status(404).end();
                        return;
                    }
                    res.json(result);
                }
            );
        },
        getRankedReference: function(req, res) {
            var configuration = configurationManager.get();
            if (configuration.mode === 1) {
                var id = req.params.id;
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
                                console.log(err);
                                res.status(404).end();
                                return;
                            }
                            var result = {items: references, total_number_of_items: references.length};

                            // res.setHeader("Content-Type", "application/json");
                            res.status(200).send(result).end();
                        });
                });
            } else {
                res.status(404).end();
            }
        }
    };
};
