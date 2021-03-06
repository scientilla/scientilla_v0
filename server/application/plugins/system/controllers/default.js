/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var _ = require("lodash");
var mongodb = require("mongodb");
var path = require("path");
var request = require("request");

var systemModel = require("../models/default.js")();

var configurationManager = require(path.resolve(__dirname + "/../../system/controllers/configuration.js"));
var datasetsManager = require("../../dataset/controllers/default.js")();
var identificationManager = require(path.resolve(__dirname + "/../../system/controllers/identification.js"));
var peersManager = require("../../peer/controllers/default.js")();
var referencesManager = require("../../reference/controllers/default.js")();
var repositoriesManager = require("../../repository/controllers/default.js")();
var usersManager = require("../../user/controllers/default.js")();

module.exports = function () {
    var isUserProfileComplete = function(user) {
        return ! (_.isNull(user.type) ||
            (user.type === 0 && 
                _.isEmpty(user.first_name) && 
                _.isEmpty(user.middle_name) && 
                _.isEmpty(user.last_name)) ||
            (user.type === 0 && _.isEmpty(user.birth_date)) ||
            (user.type === 0 && _.isEmpty(user.birth_city)) ||
            (user.type === 0 && _.isEmpty(user.birth_country)) ||
            (user.type === 0 && _.isEmpty(user.sex)) || 
            (user.type === 1 &&
                _.isEmpty(user.first_name) && 
                _.isEmpty(user.middle_name) && 
                _.isEmpty(user.last_name)) ||
            (user.type === 1 && _.isEmpty(user.birth_date)) ||
            (user.type === 1 && _.isEmpty(user.birth_city)) ||
            (user.type === 1 && _.isEmpty(user.birth_country)) ||
            (user.type === 1 && _.isEmpty(user.sex)) || 
            (user.type === 2 && _.isEmpty(user.business_name)));
    };
    return {
        checkUserCoherence: function(req, res, next) {
            req.usersCollection.findOne({_id: identificationManager.getDatabaseSpecificId(req.user.id)}, function(err, user) {
                if (err || req.underscore.isNull(user)) {
                    console.log(err);
                    res.status(401).end();
                    console.log('Unauthorized user');
                    return;
                } 
                if (!isUserProfileComplete(user)) {
                    res.status(500).end();
                    console.log('Unvalid User Type or User Information');
                    return;
                }
                if (_.isFunction(next)) {
                    next();
                }
            });
        },
        checkVersion: function() {
            var installedVersionNumber = require(path.resolve(__dirname + "/../../../../../") + path.sep + "version.json").number;
            request({
                method: "GET",
                url: "https://raw.githubusercontent.com/scientilla/scientilla/master/version.json", 
                strictSSL: false,
                json: true
            }, function (err, res, body) {
                if (!err && body != "") {
                    var distributedVersionNumber = body.number;
                    if (distributedVersionNumber > installedVersionNumber) {
                        var configuration = configurationManager.get();
                        configuration.update_availability = true;
                        configurationManager.set(configuration);
                    }
                }
            });
        },
        getStatus: function(req, res) {
            req.usersCollection.count(function(err, usersCount) {
                if (err) {
                    console.log(err);
                    res.status(404).end;
                    return;
                }
                var result = {"users-count": usersCount};
                res.json(result).end();
            });
        },
        getPublicCounts: function(req, res) {
            var counts = {};
            datasetsManager.getPublicDatasetsCount(req, res, function(err, publicDatasetsCount) {
                if (err || req.underscore.isNull(publicDatasetsCount)) {
                    counts.public_datasets = 0;
                } else {
                    counts.public_datasets = publicDatasetsCount;
                }
                peersManager.getPublicPeersCount(req, res, function(err, publicPeersCount) {
                    if (err || req.underscore.isNull(publicPeersCount)) {
                        counts.public_peers = 0;
                    } else {
                        counts.public_peers = publicPeersCount;
                    }
                    referencesManager.getPublicReferencesCount(req, res, function(err, publicReferencesCount) {
                        if (err || req.underscore.isNull(publicReferencesCount)) {
                            counts.public_references = 0;
                        } else {
                            counts.public_references = publicReferencesCount;
                        }                    
                        repositoriesManager.getPublicRepositoriesCount(req, res, function(err, publicRepositoriesCount) {
                            if (err || req.underscore.isNull(publicRepositoriesCount)) {
                                counts.public_repositories = 0;
                            } else {
                                counts.public_repositories = publicRepositoriesCount;
                            }
                            usersManager.getPublicUsersCount(req, res, function(err, publicUsersCount) {
                                if (err || req.underscore.isNull(publicUsersCount)) {
                                    counts.public_users = 0;
                                } else {
                                    counts.public_users = publicUsersCount;
                                }
                                
                                // res.setHeader("Content-Type", "application/json");
                                res.json(counts);                        
                            });
                        });
                    });
                });
            });                        
        }       
    };
};