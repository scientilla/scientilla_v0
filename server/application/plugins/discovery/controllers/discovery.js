/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */


//var discoveryManager = require("../../discovery/models/discovery.js")();
var _ = require("lodash");
var async = require("async");
var peerManager = require("../../peer/models/default.js")();

module.exports = function () {
        var getReferencesFromAliases = function(collectedReferencesCollection, aliases, cb) {
            var regexQuery = aliases.join("|");
            collectedReferencesCollection.find({                
                authors: { 
                    $regex: regexQuery,
                    $options: 'i'
                }
            }).sort({ 
                    creation_datetime: -1
                }
            ).toArray(cb);
        };
        var partitionReferences = function(referencesCollection, aliasesReferences, cb) {
            referencesCollection.find().toArray(function(err, signedReferences){
                console.log(_.map(signedReferences, 'original_hash'));
                if (err) {
                    cb(err, null);
                }
                var partitionedReferences = _.reduce(aliasesReferences, function(acc, ref) {
                    if (_.some(signedReferences, {original_hash: ref.original_hash})) {
                        acc.signed.push(ref);
                    } else {
                        ref.clonable = true;
                        acc.unsigned.push(ref);
                    }
                    return acc;
                }, {signed: [], unsigned: []});
                cb(err, partitionedReferences.unsigned, partitionedReferences.signed);
            });
        };
    return {
        getReferences: function(req, res) {
            if (req.installationConfiguration.seed) {

                async.waterfall([
                    function(cb) {
                        getReferencesFromAliases(req.collectedReferencesCollection, req.user.aliases, cb);
                    },
                    function(aliasesReferences, cb) {
                        partitionReferences(req.referencesCollection, aliasesReferences, cb);
                    }
                ], 
                function(err, unsignedReferences, signedReferences) {
                    if (err) {
                        console.log(err);
                        res.status(500).end();
                        return;
                    }
                    res.setHeader("Content-Type", "application/json");
                    res.json(unsignedReferences);
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