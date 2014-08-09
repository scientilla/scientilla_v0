/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var model = require("../models/activated-datasets.js")();

module.exports = function () {
    return {
        getActivatedDataset: function(req, res) {
            req.adCollection.findOne({ user_id: req.user.id }, function(err, activatedDataset) {
                if (err || req.underscore.isNull(activatedDataset)) {
                    res.status(404).end();
                    return;
                }
                
                res.setHeader("Content-Type", "application/json");
                res.json(activatedDataset);
            });            
        },        
        setDatasetAsActivated: function(req, res) { 
            var activatedDataset = {};
            activatedDataset.user_id = req.user.id;
            activatedDataset.dataset_id = req.params.id;
            !req.underscore.isUndefined(req.body.peer_id) ? activatedDataset.peer_id = req.body.peer_id : activatedDataset.peer_id = "";
            req.adCollection.update({ user_id: req.user.id }, { $set: activatedDataset }, { upsert: true, w: 1 }, function(err, activatedDataset) {
                if (err || req.underscore.isNull(activatedDataset)) {
                    res.status(404).end();
                    return;
                }
                
                res.end();
            });            
        } 
    };
};