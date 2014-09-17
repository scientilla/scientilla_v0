/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var peerManager = require("../../peer/models/default.js")();
var _ = require("underscore");
var request = require("request");


module.exports = function () {
    var getRandomSeed =  function(seedConfiguration, callback) {
        peerManager.getSeedPeers(seedConfiguration, function(err, seeds){
            if (err) {
                callback(err, null);
            }
            var seed = _.sample(seeds);
            callback(null, seed);
        });
    };
    return {
        getTags: function(seedConfiguration, keywords, callback) {
            getRandomSeed(seedConfiguration, function(err, seed){
                if (err) {
                    callback(err, null);
                }
                request({ 
                    url: seed.url + "/api/tags", 
                    qs: {keywords: keywords},
                    strictSSL: false,
                    json:true
                }, function (err, response, body) {
                    if (err) {
                        callback(err, null);
                    }
                    callback(err, body);
                });
            });
        }
    };
};