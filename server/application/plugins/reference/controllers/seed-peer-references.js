/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var model = require("../models/seed-peer-references.js")();

module.exports = function () {
    return {        
        getSeedPeerPublicReferences: function(req, res) {
            req.request({ 
                url: req.seedsConfiguration.urls[req.params.seedPeerIndex] + "/api/public-references?keywords=" + req.query.keywords, 
                strictSSL: false 
            }, function (error, response, body) {
                if (error) {
                    res.status(404).end();
                    return;
                }
                
                // res.setHeader("Content-Type", "application/json");
                res.status(200).send(body).end();
            });           
        },
        
        getSeedPeerPublicReference: function(req, res) {
            req.request({ 
                url: req.seedsConfiguration.urls[req.params.seedPeerIndex] + "/api/public-references/" + req.params.referenceId, 
                strictSSL: false 
            }, function (error, response, body) {
                if (error) {
                    res.status(404).end();
                    return;
                }
                
                // res.setHeader("Content-Type", "application/json");
                res.status(200).send(body).end();
            });            
        }        
    };
};