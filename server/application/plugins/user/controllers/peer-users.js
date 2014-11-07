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

module.exports = function () {
    return {
        discoverUsers: function(peersCollection, usersCollection, collectedUsersCollection) {
            async.series([
                function(callback) {
                    collectedUsersCollection.find({ peer_url: configurationManager.get().url }).sort({ last_modification_datetime: -1 }).limit(1).toArray(function(err, collectedUsers) {
                        if (err || _.isNull(collectedUsers)) {
                            return; 
                        }
                        var datetime = collectedUsers.length === 0 ? "" : collectedUsers[0].last_modification_datetime;
                        usersCollection.find({ 
                            status: "U",
                            last_modification_datetime: {
                                $gt: datetime
                            }                
                        }).sort({ creation_datetime: -1 }).toArray(function(err, publicUsers) {
                            if (err || _.isNull(publicUsers)) {
                                // return;
                            } else {
                                for (key in publicUsers) {
                                    publicUsers[key].peer_url = configurationManager.get().url;
                                    collectedUsersCollection.update({ peer_url: configurationManager.get().url, hash: publicUsers[key].hash }, { $set: publicUsers[key] }, { upsert: true, w: 1 }, function(err, storedCollectedUser) {
                                        if (err || _.isNull(storedCollectedUser)) {
                                            // return; 
                                        }
                                    });
                                }
                            }
                            callback();
                        });                        
                    });
                },
                function(callback) {
                    peersCollection.find({}).sort({ users_discovering_hits: 1 }).limit(1).toArray(function(err, peers) {
                        if (err || _.isNull(peers)) {
                            return; 
                        }
                        collectedUsersCollection.find({ peer_url: peers[0].url }).sort({ last_modification_datetime: -1 }).limit(1).toArray(function(err, collectedUsers) {
                            if (err || _.isNull(collectedUsers)) {
                                return; 
                            }
                            var datetime = collectedUsers.length === 0 ? "" : collectedUsers[0].last_modification_datetime;                            
                            request({ 
                                url: peers[0].url + "/api/public-users?datetime=" + encodeURIComponent(datetime), 
                                strictSSL: false,
                                json: true 
                            }, function (err, res, peerUsers) {
                                if (err || _.isNull(peerUsers)) {
                                    // return;
                                } else {
                                    for (key in peerUsers) {
                                        peerUsers[key].peer_url = peers[0].url;
                                        collectedUsersCollection.update({ peer_url: peers[0].url, hash: peerUsers[key].hash }, { $set: peerUsers[key] }, { upsert: true, w: 1 }, function(err, storedCollectedUser) {
                                            if (err || _.isNull(storedCollectedUser)) {
                                                // return; 
                                            }
                                        });
                                    }
                                }
                                peersCollection.update({ _id: peers[0]._id }, { $set: { users_discovering_hits: (peers[0].users_discovering_hits + 1) } }, { w: 1 }, function(err, peer) {
                                    if (err) {
                                        return;
                                    }
                                });
                                callback();
                            });
                        });
                    });                                    
                }
            ]); 
        }
    };
};
