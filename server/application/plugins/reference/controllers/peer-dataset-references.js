/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var mongodb = require("mongodb");
var path = require("path");

var model = require("../models/peer-dataset-references.js")();

var identificationManager = require(path.resolve(__dirname + "/../../system/controllers/identification.js"));

module.exports = function () {
    return {        
        getPeerPublicDatasetReferences: function(req, res) {
            req.peersCollection.findOne({_id: identificationManager.getDatabaseSpecificId(req.params.peerId)}, function(err, peer) {
                if (err || req.underscore.isNull(peer)) {
                    res.status(404).end();
                    return;
                }
                req.request({ 
                    url: peer.url + "/api/public-datasets/" + req.params.datasetId + "/references?keywords=" + req.query.keywords, 
                    strictSSL: false 
                }, function (error, response, body) {
                    if (error) {
                        res.status(404).end();
                        return;
                    }
                    res.setHeader("Content-Type", "application/json");
                    res.status(200).send(body).end();
                });                
            });            
        },
        
        getPeerPublicDatasetReference: function(req, res) {
            req.peersCollection.findOne({_id: identificationManager.getDatabaseSpecificId(req.params.peerId)}, function(err, peer) {
                if (err || req.underscore.isNull(peer)) {
                    res.status(404).end();
                    return;
                }
                req.request({ 
                    url: peer.url + "/api/public-datasets/" + req.params.datasetId + "/references/" + req.params.referenceId, 
                    strictSSL: false 
                }, function (error, response, body) {
                    if (error) {
                        res.status(404).end();
                        return;
                    }
                    res.setHeader("Content-Type", "application/json");
                    res.status(200).send(body).end();
                });                
            });            
        }        
    };
};