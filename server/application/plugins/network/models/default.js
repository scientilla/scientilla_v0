/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var peerManager = require("../../peer/models/default.js")();
var _ = require("underscore");
var request = require("request");
var configurationManager = require("../../system/controllers/configuration.js");


module.exports = function () {
    return {
        getRandomSeed: function(seedConfiguration, callback) {
            peerManager.getSeedPeers(seedConfiguration, function(err, seeds){
                if (err) {
                    callback(err, null);
                }
                var seed = _.sample(seeds);
                callback(null, seed);
            });
        },
       
        getTags: function(seedConfiguration, keywords, callback) {
            this.getRandomSeed(seedConfiguration, function(err, seed){
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
        },
        
        getSeedUrl: function(req, cb) {
            var configuration = configurationManager.get();
            if (configuration.mode === 1) {
                var peerUrl = configuration.url;
                cb(null, peerUrl);
            } else {
                this.getRandomSeed(
                    req.seedsConfiguration, 
                    function(err, seed) {
                        if (err) {
                            cb(err, null);
                        } else {
                            cb(null, seed.url);
                        }
                    });
            }
        }
    };
};