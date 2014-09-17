/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

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
        }
    };
};