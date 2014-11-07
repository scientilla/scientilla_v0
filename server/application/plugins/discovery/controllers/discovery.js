/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */


//var discoveryManager = require("../../discovery/models/discovery.js")();
var _ = require("lodash");
var async = require("async");
var peerManager = require("../../peer/models/default.js")();
var configurationManager = require("../../system/controllers/configuration.js");

module.exports = function () {
        var getReferencesFromAliases = function(collectedReferencesCollection, aliases, config, cb) {
            var aliasesQuery = aliases.join("|");
            var keywords = config.keywords || "";
            var page = config.page || 1;
            var rows = config.rows || 20;
            var skip = (page - 1) * rows;
            var keywordsQuery = "^(?=.*(" + keywords.replace(" ", "))(?=.*(") + "))";
            
            collectedReferencesCollection.find({
                $and: [
                    {authors: { 
                        $regex: aliasesQuery,
                        $options: 'i'
                    }},
                    {title: {
                        $regex: keywordsQuery,
                        $options: 'i'
                    }}
                ]
            }).sort({ 
                    creation_datetime: -1
                }
            ).skip(
                skip
            ).limit(
                rows
            ).toArray(cb);
        };
        var getClonableReferences = function(referencesCollection, aliasesReferences, cb) {
            referencesCollection.find().toArray(function(err, signedReferences){
                if (err) {
                    cb(err, null);
                }
                var clonableReferences = _.reduce(aliasesReferences, function(acc, ref) {
                    if (_.some(signedReferences, {original_hash: ref.original_hash})) {
                        ref.clonable = false;
                    } else {
                        ref.clonable = true;
                    }
                    acc.push(ref);
                    return acc;
                }, []);
                cb(err, clonableReferences);
            });
        };
    return {
        getReferences: function(req, res) {
            var configuration = configurationManager.get();
            if (configuration.seed) {

                async.waterfall([
                    function(cb) {
                        getReferencesFromAliases(req.collectedReferencesCollection, req.user.aliases, req.query, cb);
                    },
                    function(aliasesReferences, cb) {
                        getClonableReferences(req.referencesCollection, aliasesReferences, cb);
                    }
                ], 
                function(err, references) {
                    if (err) {
                        console.log(err);
                        res.status(500).end();
                        return;
                    }
                    res.setHeader("Content-Type", "application/json");
                    res.json(references);
                    return;
                });
            } else {
                console.log('no seed');
                res.status(500).end();
                return;
            }
        }
    };
};