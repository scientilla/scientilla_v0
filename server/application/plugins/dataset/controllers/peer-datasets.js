/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var mongodb = require("mongodb");
var path = require("path");

var model = require("../models/peer-datasets.js")();

var identificationManager = require(path.resolve(__dirname + "/../../system/controllers/identification.js"));

module.exports = function () {
    return {        
        getPeerPublicDatasets: function(req, res) {
            req.peersCollection.findOne({_id: identificationManager.getDatabaseSpecificId(req.params.id)}, function(err, peer) {
                if (err || req.underscore.isNull(peer)) {
                    res.status(404).end();
                    return;
                }
                req.request({ 
                    url: peer.url + "/api/public-datasets?keywords=" + req.query.keywords, 
                    strictSSL: false 
                }, function (error, response, body) {
                    if (error) {
                        res.status(404).end();
                        return;
                    }
                    
                    // res.setHeader("Content-Type", "application/json");
                    res.status(200).send(body).end();
                });
            });            
        },
        
        getPeerPublicDataset: function(req, res) {
            req.peersCollection.findOne({_id: identificationManager.getDatabaseSpecificId(req.params.peerId)}, function(err, peer) {
                if (err || req.underscore.isNull(peer)) {
                    res.status(404).end();
                    return;
                }
                req.request({ 
                    url: peer.url + "/api/public-datasets/" + req.params.datasetId, 
                    strictSSL: false 
                }, function (error, response, body) {
                    if (error) {
                        res.status(404).end();
                        return;
                    }
                    
                    // res.setHeader("Content-Type", "application/json");
                    res.status(200).send(body).end();
                });
            });            
        }        
    };
};