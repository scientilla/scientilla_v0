/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

// Resolves dependencies
var _ = require("lodash");
var mongodb = require("mongodb");
var path = require("path");

var model = require("../models/collected-references.js")();

var identificationManager = require(path.resolve(__dirname + "/../../system/controllers/identification.js"));

// Defines actions
module.exports = function () {
    var retrieveReferences = function(referencesCollection, peers, keywords, currentPageNumber, numberOfItemsPerPage) {
        var regexQuery = "^(?=.*(" + keywords.replace(" ", "))(?=.*(") + "))";
        return referencesCollection.find({                
            "$and": [
                {
                    peer_url: {
                        $in: peers
                    }
                },
                {
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
    
    return {
        rankGlobalReferences: function(collectedReferencesCollection, cb) {
            this.rankReferences(collectedReferencesCollection, 'ranked_references', cb);
        },

        rankLocalReferences: function(collectedReferencesCollection, cb) {
            this.rankReferences(collectedReferencesCollection, 'local_ranked_references', cb);
        },

        rankReferences: function(collectedReferencesCollection, outputFile, cb) {
            collectedReferencesCollection.mapReduce(
                function() { emit(this.original_hash, this); },
                function(original_hash, references) {
                    return references;
                },
                {
                    query: {original_hash: { $exists: true }},
                    out: { replace: outputFile },
                    finalize: function(original_hash, references) {
                        if (!Array.isArray(references)) {
                            references = [references];
                        }
//                        var groupedReferences = _.groupBy(references, 'clone_hash');
                        var groupedReferences = references.reduce(function(res, r) {
                            var refHash = r.clone_hash;
                            if (!res.hasOwnProperty(refHash)) {
                                res[refHash] = [];
                            }
                            res[refHash].push(r);
                            return res;
                        }, {});
//                        var top = _.first(_.max(_.values(groupedReferences), 'length'));
                        var top = Object
                                .keys(groupedReferences)
                                .map(function(k){return groupedReferences[k];})
                                .reduce(function(bestGroup, refsGroup){
                                    return (bestGroup.length > refsGroup.length) ? bestGroup : refsGroup;
                                }, [])[0];
                        var all = references.map(
                            function(r) { 
                                return {
                                    peer_url: r.peer_url, 
                                    original_hash: r.original_hash, 
                                    user_hash: r.user_hash, 
                                    clone_hash: r.clone_hash
                                };
                            });
                        //flatmap
                        var affiliations = references.map(
                            function(r) {
                                if (!("author_signatures" in r)) {
                                    return [];
                                }
                                if (!("organizations" in r.author_signatures)) {
                                    return [];
                                }
                                return r.author_signatures.organizations;
                            }).reduce(
                                    function(res, orgs){
                                        return res.concat(orgs);
                                    }, []);
                        var sources_cache = references.map(function(r) { return r.peer_url;});
                        var result = {
                            top: top,
                            all: all,
                            affiliations: affiliations,
                            sources_cache: sources_cache
                        };
                        return result;
                    }
                },
                cb
            );
        },
        getReferences: function(req, res) {
            var keywords = _.isUndefined(req.query.keywords) ? "" : req.query.keywords;
            var networkPeers = _.isUndefined(req.query.network_peers) ? [] : req.query.network_peers;
            var currentPageNumber = _.isUndefined(req.query.current_page_number) ? 1 : parseInt(req.query.current_page_number);
            var numberOfItemsPerPage = _.isUndefined(req.query.number_of_items_per_page) ? 20 : parseInt(req.query.number_of_items_per_page);            
            var retrievedCollection = retrieveReferences(req.collectedReferencesCollection, networkPeers, keywords, currentPageNumber, numberOfItemsPerPage);
            var result = {};
            retrievedCollection.count(function(err, referencesCount) {
                if (err || req.underscore.isNull(referencesCount)) {
                    res.status(404).end();
                    return;
                }
                result.total_number_of_items = referencesCount;
                retrievedCollection
                    .toArray(function(err, references) {
                        if (err || req.underscore.isNull(references)) {
                            res.status(404).end();
                            return;
                        }
                        result.items = references;
                        
                        // res.setHeader("Content-Type", "application/json");
                        res.json(result);                
                    });                
            });            
        },
        getReference: function(req, res) {
            req.collectedReferencesCollection.findOne({_id: identificationManager.getDatabaseSpecificId(req.params.id)}, function(err, reference) {
                if (err || req.underscore.isNull(reference)) {
                    res.status(404).end();
                    return;
                }
                
                // res.setHeader("Content-Type", "application/json");
                res.json(reference);
            });                
        }        
    };
};
