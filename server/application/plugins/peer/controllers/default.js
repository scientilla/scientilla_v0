/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/master/LICENSE)
 */

var model = require("../models/default.js")();

module.exports = function () {
    return {
        getPeers: function(req, res) {
            req.collection.find({}).toArray(function(err, peers) {
                if (err || req.underscore.isNull(peers)) {
                    res.status(404).end();
                    return;
                }
                
                res.setHeader("Content-Type", "application/json");
                res.json(peers);
            });
        },
        getPublicPeers: function(req, res) {
            req.collection.find({ sharing_status: true }).toArray(function(err, peers) {
                if (err || req.underscore.isNull(peers)) {
                    res.status(404).end();
                    return;
                }
                
                res.setHeader("Content-Type", "application/json");
                res.json(peers);
            });            
        },        
        getPeer: function(req, res) {
            req.collection.findOne({ _id: req.params.id }, function(err, peer) {
                if (err || req.underscore.isNull(peer)) {
                    res.status(404).end();
                    return;
                }
                
                res.setHeader("Content-Type", "application/json");
                res.json(peer);
            });            
        },
        getPublicPeer: function(req, res) {
            req.collection.findOne({ _id: req.params.id, sharing_status: true }, function(err, peer) {
                if (err || req.underscore.isNull(peer)) {
                    res.status(404).end();
                    return;
                }
                
                res.setHeader("Content-Type", "application/json");
                res.json(peer);
            });            
        },        
        createPeer: function(req, res) {
            var peer = {};
            !req.underscore.isUndefined(req.body.name) ? peer.name = req.body.name.trim() : peer.name = "";
            !req.underscore.isUndefined(req.body.url) ? peer.url = req.body.url.trim() : peer.url = "";
            !req.underscore.isUndefined(req.body.sharing_status) ? peer.sharing_status = req.body.sharing_status : peer.sharing_status = ""; 
            peer.creator_id = req.user.id;
            peer.creation_datetime = req.moment().format();
            peer.last_modifier_id = "";
            peer.last_modification_datetime = "";            
            req.collection.insert(peer, {w:1}, function(err, peer) {
                if (err || req.underscore.isNull(peer)) {
                    res.status(404).end();
                    return;
                }
                
                res.end();
            });            
        },
        updatePeer: function(req, res) { 
            var peer = {};
            !req.underscore.isUndefined(req.body.name) ? peer.name = req.body.name.trim() : null;
            !req.underscore.isUndefined(req.body.url) ? peer.url = req.body.url.trim() : null; 
            !req.underscore.isUndefined(req.body.sharing_status) ? peer.sharing_status = req.body.sharing_status : null;
            peer.last_modifier_id = req.user.id;
            peer.last_modification_datetime = req.moment().format();         
            req.collection.update({ _id: req.params.id }, { $set: peer }, {w: 1}, function(err, peer) {
                if (err || req.underscore.isNull(peer)) {
                    res.status(404).end();
                    return;
                }
                
                res.end();
            });            
        } 
    };
};