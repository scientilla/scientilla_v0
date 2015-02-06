/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

// Resolves dependencies
var _ = require("lodash");
var async = require("async");
var path = require("path");
var request = require("request");

var configurationManager = require(path.resolve(__dirname + "/../../system/controllers/configuration.js"));

var networkModel = require("../../network/models/default.js")();

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
    
    var retrieveUsers = function(users, keywords, userType, currentPageNumber, numberOfItemsPerPage) {            
        var regexQuery = "^(?=.*(" + keywords.replace(" ", "))(?=.*(") + "))";
        return users.find({
            type: userType,
            "$or": [
                {
                    "scientilla_nominative": { 
                        $regex: regexQuery,
                        $options: 'i'
                    }
                },
                {
                    "first_name": { 
                        $regex: regexQuery,
                        $options: 'i'
                    }
                },
                {
                    "middle_name": { 
                        $regex: regexQuery,
                        $options: 'i'
                    }
                },
                {
                    "last_name": { 
                        $regex: regexQuery,
                        $options: 'i'
                    }
                },
                {
                    "business_name": { 
                        $regex: regexQuery,
                        $options: 'i'
                    }
                }
            ]
        }).skip(
            currentPageNumber > 0 ? ((currentPageNumber - 1) * numberOfItemsPerPage) : 0
        ).limit(
            numberOfItemsPerPage
        );
    };
    
    var resolveUserPeers = function(users, peersCollection, finalizationCallback) {
        async.mapSeries(
            users,
            function(user, iterationCallback) {
                peersCollection.find({ url: user.peer_url }).toArray(function(error, peers) {
                    if (error || _.isNull(peers) || _.isUndefined(peers) || peers.length === 0) {
                        iterationCallback(error, user);
                        return;
                    }
                    user.peer_id = peers[0]._id;
                    iterationCallback(null, user);
                });
            },
            function(error, resolvedUsers) {
                finalizationCallback(resolvedUsers);
            }
        );
    };
    
    return {        
        getUsers: function(req, res) {
            var keywords = _.isUndefined(req.query.keywords) ? '' : req.query.keywords;
            var userType = _.isUndefined(req.query.user_type) ? '' : parseInt(req.query.user_type, 10);
            var currentPageNumber = _.isUndefined(req.query.current_page_number) ? 1 : parseInt(req.query.current_page_number);
            var numberOfItemsPerPage = _.isUndefined(req.query.number_of_items_per_page) ? 20 : parseInt(req.query.number_of_items_per_page);            
            var result = {};            
            if (configurationManager.get().mode === 2) {
                var retrievedCollection = retrieveUsers(req.localCollectedUsersCollection, keywords, userType, currentPageNumber, numberOfItemsPerPage);
                retrievedCollection.count(function(err, usersCount) {
                    if (err || req.underscore.isNull(usersCount)) {
                        res.status(404).end();
                        return;
                    }
                    result.total_number_of_items = usersCount;
                    retrievedCollection.toArray(function(err, users) {
                        if (err || req.underscore.isNull(users)) {
                            res.status(404).end();
                            return;
                        }
                        resolveUserPeers(users, req.peersCollection, function(resolvedUsers) {
                            result.items = resolvedUsers;
                            // res.setHeader("Content-Type", "application/json");
                            res.json(result);                             
                        });              
                    });                
                });                
            } else {
                networkModel.getRandomSeed(req.seedsConfiguration, function(err, seed) {
                    if (err) {
                        //
                    }
                    req.request({ 
                        url: seed.url + "/api/public-local-network-users/", 
                        strictSSL: false,
                        json: true,
                        qs: req.query
                    }, function (error, response, result) {
                        if (error) {
                            res.status(404).end();
                            return;
                        }
                        resolveUserPeers(result.items, req.peersCollection, function(resolvedUsers) {
                            result.items = resolvedUsers;
                            // res.setHeader("Content-Type", "application/json");
                            res.status(200).send(result).end();
                        });
                    });                    
                });                
            }
        }
    };
};
