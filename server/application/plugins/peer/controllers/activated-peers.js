/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/master/LICENSE)
 */

var model = require("../models/activated-peers.js")();

module.exports = function () {
    return {
        getActivatedPeer: function(req, res) {
            req.apCollection.findOne({ user_id: req.user.id }, function(err, activatedPeer) {
                if (err || req.underscore.isNull(activatedPeer)) {
                    res.status(404).end();
                    return;
                }
                
                res.setHeader("Content-Type", "application/json");
                res.json(activatedPeer);
            });            
        },        
        setPeerAsActivated: function(req, res) { 
            var activatedPeer = {};
            activatedPeer.user_id = req.user.id;
            activatedPeer.peer_id = req.params.id; 
            req.apCollection.update({ user_id: req.user.id }, { $set: activatedPeer }, { upsert: true, w: 1 }, function(err, activatedPeer) {
                if (err || req.underscore.isNull(activatedPeer)) {
                    res.status(404).end();
                    return;
                }
                
                res.end();
            });            
        } 
    };
};