/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var request = require("request");
var _ = require("underscore");

var referenceManager = require("../../reference/models/default.js")();
var networkModel = require("../../network/models/default.js")();

module.exports = function () {
    var retrieveReferences = function(referencesCollection, keywords, currentPageNumber, numberOfItemsPerPage) {            
        var regexQuery = "^(?=.*(" + keywords.replace(" ", "))(?=.*(") + "))";
        return referencesCollection.find({                
            "$or": [
                {
                    title: { 
                        $regex: regexQuery,
                        $options: 'i'
                    }
                },
                {
                    authors: { 
                        $regex: regexQuery,
                        $options: 'i'
                    }
                }
            ]
        }).sort(
            { 
                creation_datetime: -1 
            }
        ).skip(
            currentPageNumber > 0 ? ((currentPageNumber - 1) * numberOfItemsPerPage) : 0
        ).limit(
            numberOfItemsPerPage
        );
    };    
    return {        
        getReferences: function(req, res) {
            var keywords = _.isUndefined(req.query.keywords) ? '' : req.query.keywords;
            var currentPageNumber = _.isUndefined(req.query.current_page_number) ? 1 : req.query.current_page_number;
            var numberOfItemsPerPage = _.isUndefined(req.query.number_of_items_per_page) ? 20 : req.query.number_of_items_per_page;            
            var result = {};            
            if (req.installationConfiguration.seed) {
                var retrievedCollection = retrieveReferences(req.collectedReferencesCollection, keywords, currentPageNumber, numberOfItemsPerPage);
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
                        // result.items = cleanReferencesTags(references);
                        result.items = references;
                        res.setHeader("Content-Type", "application/json");
                        res.json(result);               
                    });                
                });                
            } else {
                networkModel.getRandomSeed(req.seedsConfiguration, function(err, seed) {
                    if (err) {
                        //
                    }
                    req.request({ 
                        url: seed.url + "/api/world-network-references?keywords=" + keywords, 
                        strictSSL: false,
                        json: true 
                    }, function (error, response, references) {
                        if (error) {
                            res.status(404).end();
                            return;
                        }
                        res.setHeader("Content-Type", "application/json");
                        res.status(200).send(references).end();
                    });                    
                });                
            }
        }
    };
};
