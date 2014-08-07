/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/master/LICENSE)
 */

var model = require("../models/default.js")();

module.exports = function () {
    return {
        getRepositories: function(req, res) {
            req.collection.find({}).sort({ creation_datetime: -1 }).toArray(function(err, repositories) {
                if (err || req.underscore.isNull(repositories)) {
                    res.status(404).end();
                    return;
                }
                
                res.setHeader("Content-Type", "application/json");
                res.json(repositories);
            });            
        },
        getPublicRepositories: function(req, res) {
            req.collection.find({ sharing_status: true }).sort({ creation_datetime: -1 }).toArray(function(err, repositories) {
                if (err || req.underscore.isNull(repositories)) {
                    res.status(404).end();
                    return;
                }
                
                res.setHeader("Content-Type", "application/json");
                res.json(repositories);
            });            
        },        
        getRepository: function(req, res) {
            req.collection.findOne({ _id: req.params.id }, function(err, repository) {
                if (err || req.underscore.isNull(repository)) {
                    res.status(404).end();
                    return;
                }
                
                res.setHeader("Content-Type", "application/json");
                res.json(repository);
            });            
        },        
        createRepository: function(req, res) {
            var repository = {};
            !req.underscore.isUndefined(req.body.name) ? repository.name = req.body.name.trim() : repository.name = "";
            !req.underscore.isUndefined(req.body.url) ? repository.url = req.body.url.trim() : repository.url = "";
            !req.underscore.isUndefined(req.body.query) ? repository.query = req.body.query.trim() : repository.query = "";
            !req.underscore.isUndefined(req.body.parameter) ? repository.parameter = req.body.parameter.trim() : repository.parameter = ""; 
            !req.underscore.isUndefined(req.body.sharing_status) ? repository.sharing_status = req.body.sharing_status : repository.sharing_status = "";
            repository.creator_id = req.user.id;
            repository.creation_datetime = req.moment().format();
            repository.last_modifier_id = "";
            repository.last_modification_datetime = "";            
            req.collection.insert(repository, {w:1}, function(err, repository) {
                if (err || req.underscore.isNull(repository)) {
                    res.status(404).end();
                    return;
                }
                
                res.end();
            });
        },
        updateRepository: function(req, res) { 
            var repository = {};
            !req.underscore.isUndefined(req.body.name) ? repository.name = req.body.name.trim() : null;
            !req.underscore.isUndefined(req.body.url) ? repository.url = req.body.url.trim() : null;  
            !req.underscore.isUndefined(req.body.query) ? repository.query = req.body.query.trim() : null;   
            !req.underscore.isUndefined(req.body.parameter) ? repository.parameter = req.body.parameter.trim() : null; 
            !req.underscore.isUndefined(req.body.sharing_status) ? repository.sharing_status = req.body.sharing_status : null;
            repository.last_modifier_id = req.user.id;
            repository.last_modification_datetime = req.moment().format();         
            req.collection.update({ _id: req.params.id }, { $set: repository }, {w: 1}, function(err, repository) {
                if (err || req.underscore.isNull(repository)) {
                    res.status(404).end();
                    return;
                }
                
                res.end();
            });            
        } 
    };
};