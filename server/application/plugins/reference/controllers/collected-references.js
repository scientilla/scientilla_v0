/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

// Resolves dependencies
var _ = require("lodash");

var model = require("../models/collected-references.js")();

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
        rankReferences: function(collectedReferencesCollection, cb) {
            collectedReferencesCollection.mapReduce(
                function() { emit(this.original_hash, this); },
                function(original_hash, references) {
                    return references;
                },
                {
                    query: {original_hash: { $exists: true }},
                    out: { replace: 'ranked-references.db' },
                    finalize: function(original_hash, references) {
                        if (!_.isArray(references)) {
                            references = [references];
                        }
                        var groupedReferences = _.groupBy(references, 'clone_hash');
                        var top = _.first(_.max(_.values(groupedReferences), 'length'));
                        var all = _.map(
                            references, 
                            function(r) { 
                                return _.pick(r, ['peer_url', 'original_hash', 'user_hash', 'clone_hash']);
                            });
                        var affiliations = _.flatten(_.map(
                            references,
                            function(r) {
                                if (_.isUndefined(r.author_signatures)) {
                                    return [];
                                }
                                if (_.isUndefined(r.author_signatures.organizations)) {
                                    return [];
                                }
                                return r.author_signatures.organizations;
                            }));
                        var result = {
                            top: top,
                            all: all,
                            affiliations: affiliations
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
            var currentPageNumber = _.isUndefined(req.query.current_page_number) ? 1 : req.query.current_page_number;
            var numberOfItemsPerPage = _.isUndefined(req.query.number_of_items_per_page) ? 20 : req.query.number_of_items_per_page;            
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
                        res.setHeader("Content-Type", "application/json");
                        res.json(result);                
                    });                
            });            
        },
        getReference: function(req, res) {
            req.collectedReferencesCollection.findOne({ _id: req.params.id }, function(err, reference) {
                if (err || req.underscore.isNull(reference)) {
                    res.status(404).end();
                    return;
                }
                res.setHeader("Content-Type", "application/json");
                res.json(reference);
            });                
        }        
    };
};
