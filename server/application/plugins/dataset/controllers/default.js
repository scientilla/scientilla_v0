/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var mongodb = require("mongodb");
var path = require("path");

var model = require("../models/default.js")();

var identificationManager = require(path.resolve(__dirname + "/../../system/controllers/identification.js"));

module.exports = function () {
    return {
        getDatasets: function(req, res) {
            var regexQuery = "^(?=.*(" + req.query.keywords.replace(" ", "))(?=.*(") + "))";
            req.datasetsCollection.find({
                "$or": [
                    {
                        name: { 
                            $regex: regexQuery,
                            $options: 'i'
                        }
                    }
                ]                
            }).sort({ creation_datetime: -1 }).toArray(function(err, datasets) {
                if (err || req.underscore.isNull(datasets)) {
                    res.status(404).end();
                    return;
                }
                
                // res.setHeader("Content-Type", "application/json");
                res.json(datasets);
            });            
        },
        getPublicDatasets: function(req, res) {
            var regexQuery = "^(?=.*(" + req.query.keywords.replace(" ", "))(?=.*(") + "))";
            req.datasetsCollection.find({ 
                sharing_status: true,
                "$or": [
                    {
                        name: { 
                            $regex: regexQuery,
                            $options: 'i'
                        }
                    }
                ]                
            }).sort({ creation_datetime: -1 }).toArray(function(err, datasets) {
                if (err || req.underscore.isNull(datasets)) {
                    res.status(404).end();
                    return;
                }
                
                // res.setHeader("Content-Type", "application/json");
                res.json(datasets);
            });            
        },        
        getDataset: function(req, res) {
            req.datasetsCollection.findOne({_id: identificationManager.getDatabaseSpecificId(req.params.id)}, function(err, dataset) {
                if (err || req.underscore.isNull(dataset)) {
                    res.status(404).end();
                    return;
                }
                
                // res.setHeader("Content-Type", "application/json");
                res.json(dataset);
            });            
        },
        getPublicDataset: function(req, res) {
            req.datasetsCollection.findOne({_id: identificationManager.getDatabaseSpecificId(req.params.id), sharing_status: true}, function(err, dataset) {
                if (err || req.underscore.isNull(dataset)) {
                    res.status(404).end();
                    return;
                }
                
                // res.setHeader("Content-Type", "application/json");
                res.json(dataset);
            });            
        },        
        createDataset: function(req, res) {
            var dataset = {};
            !req.underscore.isUndefined(req.body.name) ? dataset.name = req.body.name.trim() : dataset.name = "";
            !req.underscore.isUndefined(req.body.status) ? dataset.status = req.body.status.trim() : dataset.status = "";
            !req.underscore.isUndefined(req.body.initiated_at) ? dataset.initiated_at = req.body.initiated_at.trim() : dataset.initiated_at = "";
            !req.underscore.isUndefined(req.body.completed_at) ? dataset.completed_at = req.body.completed_at.trim() : dataset.completed_at = "";
            !req.underscore.isUndefined(req.body.sharing_status) ? dataset.sharing_status = req.body.sharing_status : dataset.sharing_status = "";
            dataset.creator_id = req.user.id;
            dataset.creation_datetime = req.moment().format();
            dataset.last_modifier_id = "";
            dataset.last_modification_datetime = "";             
            req.datasetsCollection.insert(dataset, {w:1}, function(err, dataset) {
                if (err || req.underscore.isNull(dataset)) {
                    res.status(404).end();
                    return;
                }
                
                res.end();
            });            
        },
        updateDataset: function(req, res) { 
            var dataset = {};
            !req.underscore.isUndefined(req.body.name) ? dataset.name = req.body.name.trim() : null;
            !req.underscore.isUndefined(req.body.status) ? dataset.status = req.body.status.trim() : null;
            !req.underscore.isUndefined(req.body.initiated_at) ? dataset.initiated_at = req.body.initiated_at.trim() : null;
            !req.underscore.isUndefined(req.body.completed_at) ? dataset.completed_at = req.body.completed_at.trim() : null;
            !req.underscore.isUndefined(req.body.sharing_status) ? dataset.sharing_status = req.body.sharing_status : null;
            dataset.last_modifier_id = req.user.id;
            dataset.last_modification_datetime = req.moment().format();         
            req.datasetsCollection.update({_id: identificationManager.getDatabaseSpecificId(req.params.id)}, { $set: dataset }, {w: 1}, function(err, dataset) {
                if (err || req.underscore.isNull(dataset)) {
                    res.status(404).end();
                    return;
                }
                
                res.end();
            });            
        },
        getPublicDatasetsCount: function(req, res, callback) {
            callback(null, 0);
        }
    };
};