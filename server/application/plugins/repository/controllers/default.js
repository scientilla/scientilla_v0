/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

// Resolves dependencies
var _ = require("lodash");
var path = require("path");

var configurationManager = require(path.resolve(__dirname + "/../../system/controllers/configuration.js"));

var model = require("../models/default.js")();

// Defines actions
module.exports = function () {
    var extractorFields = [
            'title', 'authors', 'organizations', 'tags', 'year', 'doi', 'journal_name', 'journal_acronym', 
            'journal_pissn', 'journal_eissn', 'journal_issnl', 'journal_volume', 'journal_year', 'conference_name', 
            'conference_acronym', 'conference_place', 'conference_year', 'book_title', 'book_isbn', 'book_pages', 
            'book_editor', 'book_year', 'abstract', 'month', 'print_status', 'note', 'approving_status', 'sharing_status'];
        
    var getEmptyConfig = function(){
        var defaultRows = 20; 
        var defaultPage = 1; 
        return {
            keywords: "",
            rows: defaultRows,
            page: defaultPage
        };
    };
    
    var getDefaultExtractors = function(){
        var extractors = {};
        extractorFields.forEach(function(extractorField){
            extractors[extractorField] = {
                field: extractorField,
                regex: ".*"
            }; 
        });
        return extractors;
    };
    var getCleanExtractors = function(extractors) {
        var defaultExtractors = getDefaultExtractors();
        var cleanExtractors = _.merge(defaultExtractors, extractors);
        return cleanExtractors;
    };
    
    var trimObject = function(obj) {
        if (typeof obj !== "object") {
            return obj;
        }
        for(var key in obj) {
            if(obj.hasOwnProperty(key) && typeof obj[key] === "string") {
                obj[key] = obj[key].trim();
            }
            if(obj.hasOwnProperty(key) && typeof obj[key] === "object") {
                obj[key] = trimObject(obj[key]);
            }
        }
        return obj;
    };
    return {
        getRepositories: function(req, res) {
            req.repositoriesCollection.find({}).sort({ creation_datetime: -1 }).toArray(function(err, repositories) {
                if (err || req.underscore.isNull(repositories)) {
                    res.status(404).end();
                    return;
                }
                
                res.setHeader("Content-Type", "application/json");
                res.json(repositories);
            });            
        },
        getPublicRepositories: function(req, res) {
            req.repositoriesCollection.find({ sharing_status: true }).sort({ creation_datetime: -1 }).toArray(function(err, repositories) {
                if (err || req.underscore.isNull(repositories)) {
                    res.status(404).end();
                    return;
                }
                
                res.setHeader("Content-Type", "application/json");
                res.json(repositories);
            });            
        },        
        getRepository: function(req, res) {
            req.repositoriesCollection.findOne({ _id: req.params.id }, function(err, repository) {
                if (err || req.underscore.isNull(repository)) {
                    console.log(err);
                    res.status(404).end();
                    return;
                }
                repository.extractors = getCleanExtractors(repository.extractors);
                
                res.setHeader("Content-Type", "application/json");
                res.json(repository);
            });            
        },
        getPublicRepositoriesCount: function(req, res, callback) {
            req.repositoriesCollection.find({ 
                sharing_status: true                
            }).count(function(err, publicRepositoriesCount) {
                if (err || req.underscore.isNull(publicRepositoriesCount)) {
                    callback(err, null);
                    return;
                }
                callback(null, publicRepositoriesCount);
            });
        },        
        createRepository: function(req, res) {
            var repository = {};
            !req.underscore.isUndefined(req.body.name) ? repository.name = req.body.name.trim() : repository.name = "";
            !req.underscore.isUndefined(req.body.url) ? repository.url = req.body.url.trim() : repository.url = "";
            !req.underscore.isUndefined(req.body.config) ? repository.config = trimObject(req.body.config) : repository.config = getEmptyConfig();
            !req.underscore.isUndefined(req.body.extractors) ? repository.extractors = trimObject(req.body.extractors) : repository.extractors = getDefaultExtractors();
            !req.underscore.isUndefined(req.body.sharing_status) ? repository.sharing_status = req.body.sharing_status : repository.sharing_status = "";
            repository.creator_id = req.user.id;
            repository.creation_datetime = req.moment().format();
            repository.last_modifier_id = "";
            repository.last_modification_datetime = "";            
            req.repositoriesCollection.insert(repository, {w:1}, function(err, repository) {
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
            !req.underscore.isUndefined(req.body.config) ? repository.config = trimObject(req.body.config) : repository.config = getEmptyConfig();
            !req.underscore.isUndefined(req.body.extractors) ? repository.extractors = trimObject(req.body.extractors) : repository.extractors = getDefaultExtractors();
            !req.underscore.isUndefined(req.body.sharing_status) ? repository.sharing_status = req.body.sharing_status : null;
            repository.last_modifier_id = req.user.id;
            repository.last_modification_datetime = req.moment().format();         
            req.repositoriesCollection.update({ _id: req.params.id }, { $set: repository }, {w: 1}, function(err, repository) {
                if (err || req.underscore.isNull(repository)) {
                    res.status(404).end();
                    return;
                }
                
                res.end();
            });            
        },
        deleteRepository: function(req, res) {          
            req.repositoriesCollection.remove({ _id: req.params.id }, {w: 1}, function(err) {
                if (err) {
                    res.status(500).end();
                    return;
                }
                
                res.end();
            });            
        },
        discoverRepositories: function(seedsConfiguration, peersCollection) {
            for (key in seedsConfiguration) {
                
            }
        } 
    };
};