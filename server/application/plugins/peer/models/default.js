/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var _ = require("lodash");

module.exports = function () {
    return {
        getSeedPeers: function(seedsConfiguration, callback) {
            var seedPeers = [];
            for (var key in seedsConfiguration) {
                seedPeers[seedPeers.length] = {
                    url: seedsConfiguration[key]
                };
            }
            callback(null, seedPeers);
        },
        getPublicPeers: function(peersCollection, callback) {
            peersCollection.find({ sharing_status: true }).toArray(callback);            
        }   
    };
};