/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var model = require("../models/activated-repositories.js")();

module.exports = function () {
    return {
        getActivatedRepository: function(req, res) {
            req.arCollection.findOne({ user_id: req.user.id }, function(err, activatedRepository) {
                if (err || req.underscore.isNull(activatedRepository)) {
                    res.status(404).end();
                    return;
                }
                
                res.setHeader("Content-Type", "application/json");
                res.json(activatedRepository);
            });            
        },        
        setRepositoryAsActivated: function(req, res) {
            var activatedRepository = {};
            activatedRepository.user_id = req.user.id;
            activatedRepository.repository_id = req.params.id;
            req.arCollection.update({ user_id: req.user.id }, { $set: activatedRepository }, { upsert: true, w: 1 }, function(err, activatedRepository) {
                if (err || req.underscore.isNull(activatedRepository)) {
                    res.status(404).end();
                    return;
                }
                
                res.end();
            });            
        } 
    };
};