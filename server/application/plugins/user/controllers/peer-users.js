/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var async = require("async");
var path = require("path");
var request = require("request");
var _ = require("underscore");

var configurationManager = require(path.resolve(__dirname + "/../../system/controllers/configuration.js"));

var userManager = require("../../user/models/default.js")();

module.exports = function () {
    var updateUsersDiscoveringHits = function(peersCollection, currentPeer, callback) {
        peersCollection.update({ _id: currentPeer._id }, { $set: { users_discovering_hits: (currentPeer.users_discovering_hits + 1) } }, { w: 1}, function(err, peer) {
            callback();
        });
    };    
    return {
        discoverUsers: function(peersCollection, usersCollection, collectedUsersCollection) {
            async.series([
                function(firstSeriesCallback) {
                    collectedUsersCollection.find({ peer_url: configurationManager.get().url }).sort({ last_modification_datetime: -1 }).limit(1).toArray(function(err, collectedUsers) {
                        if (err || _.isNull(collectedUsers)) {
                            firstSeriesCallback();
                            return; 
                        }
                        var datetime = (_.isNull(collectedUsers.length) || _.isUndefined(collectedUsers.length) || collectedUsers.length == 0) ? "" : collectedUsers[0].last_modification_datetime;
                        usersCollection.find({ 
                            status: "U",
                            last_modification_datetime: {
                                $gt: datetime
                            }                
                        }).sort({ creation_datetime: -1 }).toArray(function(err, publicUsers) {
                            if (err || _.isNull(publicUsers)) {
                                firstSeriesCallback();
                                return;
                            } else {
                                async.series([
                                    function(secondSeriesCallback) {
                                        async.eachSeries(
                                            publicUsers,
                                            function(publicUser, eachSeriesCallback) {
                                                var cleanedPublicUser = userManager.createNewUser(publicUser);
                                                cleanedPublicUser.peer_url = configurationManager.get().url;
                                                collectedUsersCollection.update({ peer_url: configurationManager.get().url, hash: cleanedPublicUser.hash }, { $set: cleanedPublicUser }, { upsert: true, w: 1 }, function(err, storedCollectedUser) {
                                                    if (err || _.isNull(storedCollectedUser)) {
                                                        // return; 
                                                    }
                                                    eachSeriesCallback();
                                                });
                                            }
                                        );
                                        secondSeriesCallback();
                                    },
                                    function(secondSeriesCallback) {
                                        firstSeriesCallback();
                                    }
                                ]);                                
                            }
                        });                        
                    });
                },
                function(firstSeriesCallback) {
                    peersCollection.find({}).sort({ users_discovering_hits: 1 }).limit(1).toArray(function(err, peers) {
                        if (err || _.isNull(peers)) {
                            firstSeriesCallback();
                            return; 
                        }
                        if (peers.length > 0) {
                            collectedUsersCollection.find({ peer_url: peers[0].url }).sort({ last_modification_datetime: -1 }).limit(1).toArray(function(err, collectedUsers) {
                                if (err || _.isNull(collectedUsers)) {
                                    firstSeriesCallback();
                                    return; 
                                }
                                var datetime = (_.isNull(collectedUsers.length) || _.isUndefined(collectedUsers.length) || collectedUsers.length == 0) ? "" : collectedUsers[0].last_modification_datetime;
                                request({ 
                                    url: peers[0].url + "/api/public-users?datetime=" + encodeURIComponent(datetime), 
                                    strictSSL: false,
                                    json: true 
                                }, function (err, res, peerUsers) {
                                    if (err || _.isNull(peerUsers)) {
                                        updateUsersDiscoveringHits(peersCollection, peers[0], firstSeriesCallback);
                                    } else {
                                        async.series([
                                            function(secondSeriesCallback) { 
                                                async.eachSeries(
                                                    peerUsers,
                                                    function(peerUser, eachSeriesCallback) {
                                                        var cleanedPeerUser = userManager.createNewUser(peerUser);
                                                        cleanedPeerUser.peer_url = peers[0].url;
                                                        collectedUsersCollection.update({ peer_url: peers[0].url, hash: cleanedPeerUser.hash }, { $set: cleanedPeerUser }, { upsert: true, w: 1 }, function(err, storedCollectedUser) {
                                                            if (err || _.isNull(storedCollectedUser)) {
                                                                // return; 
                                                            }
                                                            eachSeriesCallback();
                                                        });
                                                    }
                                                );
                                                secondSeriesCallback();
                                            },
                                            function(secondSeriesCallback) {
                                                updateUsersDiscoveringHits(peersCollection, peers[0], firstSeriesCallback);
                                            }
                                        ]);
                                    }
                                });
                            });
                        }
                    });                                    
                }
            ]); 
        }
    };
};
