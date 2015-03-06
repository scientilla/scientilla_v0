/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var _ = require("lodash");
var collectedReferencesManager = require("../../reference/models/collected-references.js")();

module.exports = function () {
    var retrieveReferences = function(rankedReferencesCollection, keywords, currentPageNumber, numberOfItemsPerPage, peerUrls, originalHashes) {
        var regexQuery = "^(?=.*(" + keywords.replace(" ", "))(?=.*(") + "))";
        var titleAuthorQuery = {
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
        };
        var originalHashesQuery = {
            "value.top.original_hash": {
                $in: originalHashes
            }
        };
        var searchCriteria = {$and: []};
        if (!_.isEmpty(originalHashes)) {
            searchCriteria.$and.push(originalHashesQuery);
        }
        else {
            searchCriteria.$and.push(titleAuthorQuery);
            if (!_.isEmpty(peerUrls)) {
                var peerQuery = {
                    "value.all.peer_url": {$in: peerUrls}
                };
                searchCriteria.$and.push(peerQuery);
            }
        }
        return rankedReferencesCollection.find(searchCriteria, {"_tiar.value.all.peer_url":0, "_tiar.value.top.original_hash":0}).sort(
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

    
    var getReferences = function(configuration, rankedReferencesCollection, keywords, currentPageNumber, numberOfItemsPerPage, peerUrls, originalHashes, cb) {
        var result = {};
        if (configuration.mode === 1) {
            var retrievedCollection = retrieveReferences(rankedReferencesCollection, keywords, currentPageNumber, numberOfItemsPerPage, peerUrls, originalHashes);
            retrievedCollection.count(function(err, referencesCount) {
                if (err || _.isNull(referencesCount)) {
                    console.log(err);
                    cb(err, null);
                    return;
                }
                result.total_number_of_items = referencesCount;
                retrievedCollection.toArray(function(err, references) {
                    if (err || _.isNull(references)) {
                        console.log(err);
                        cb(err, null);
                        return;
                    }
                    var normalizedReferences = collectedReferencesManager.normalizeRankedReferences(references);
                    result.items = normalizedReferences;

                    // res.setHeader("Content-Type", "application/json");
                    cb(null, result);
                });
            });
        } else {
            cb(new Error('no seed'), null);
        }
    };
    return {
        getReferences: getReferences
    };
};