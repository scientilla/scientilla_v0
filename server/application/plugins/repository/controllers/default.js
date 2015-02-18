/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

// Resolves dependencies
var _ = require("lodash");
var mongodb = require("mongodb");
var path = require("path");

var model = require("../models/default.js")();

var configurationManager = require(path.resolve(__dirname + "/../../system/controllers/configuration.js"));
var identificationManager = require(path.resolve(__dirname + "/../../system/controllers/identification.js"));

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
            var config = _.pick(req.query, ['keywords', 'page', 'rows']);
            var page = config.page || 1;
            var rows = config.rows || 20;
            var skip = (page - 1) * rows;
            var keywords = config.keywords || "";
            var result = {};
            var regexQuery = "^(?=.*(" + keywords.replace(" ", "))(?=.*(") + "))";
            
            var repositoriesCollection = req.repositoriesCollection
            .find({
                $or: [
                    {
                        name : { 
                            $regex: regexQuery,
                            $options: 'i'
                        }
                    }
                ]
            })
            .sort({ creation_datetime: -1 })
            .skip(
                skip
            ).limit(
                rows
            );
    
            repositoriesCollection.count(function(err, count) {
                if (err) {
                    console.log(err);
                    res.status(404).end();
                    return;
                }
                result.total_number_of_items = count;
                repositoriesCollection.toArray(function(err, repositories) {
                    if (err || req.underscore.isNull(repositories)) {
                        console.log(err);
                        res.status(404).end();
                        return;
                    }
                    result.items = repositories;
                    // res.setHeader("Content-Type", "application/json");
                    res.json(result);
                });
            });    
        },
        getPublicRepositories: function(req, res) {
            req.repositoriesCollection.find({ sharing_status: true }).sort({ creation_datetime: -1 }).toArray(function(err, repositories) {
                if (err || req.underscore.isNull(repositories)) {
                    res.status(404).end();
                    return;
                }
                
                // res.setHeader("Content-Type", "application/json");
                res.json(repositories);
            });            
        },        
        getRepository: function(req, res) {
            req.repositoriesCollection.findOne({_id: identificationManager.getDatabaseSpecificId(req.params.id)}, function(err, repository) {
                if (err || req.underscore.isNull(repository)) {
                    console.log(err);
                    res.status(404).end();
                    return;
                }
                repository.extractors = getCleanExtractors(repository.extractors);
                
                /*
                if (!_.isUndefined(res.query.mode) && res.query.mode == "data-as-file") {
                    res.setHeader("Content-disposition", "attachment; filename=" + repository.name + ".json");
                }
                */
                // res.setHeader("Content-Type", "application/json");
                res.json(repository);
            });            
        },        
        createRepository: function(req, res) {
            var repository = {};
            if (_.isObject(req.files.file)) {
                var importedRepository = require(req.files.file.path);
                repository.name = importedRepository.name;
                repository.version = importedRepository.version;
                repository.url = importedRepository.url;
                repository.config = importedRepository.config;
                repository.extractors = importedRepository.extractors;
                repository.sharing_status = false;
            } else {
                !req.underscore.isUndefined(req.body.name) ? repository.name = req.body.name.trim() : repository.name = "";
                !req.underscore.isUndefined(req.body.version) ? repository.version = req.body.version.trim() : repository.version = "";
                !req.underscore.isUndefined(req.body.url) ? repository.url = req.body.url.trim() : repository.url = "";
                !req.underscore.isUndefined(req.body.config) ? repository.config = trimObject(req.body.config) : repository.config = getEmptyConfig();
                !req.underscore.isUndefined(req.body.extractors) ? repository.extractors = trimObject(req.body.extractors) : repository.extractors = getDefaultExtractors();
                !req.underscore.isUndefined(req.body.sharing_status) ? repository.sharing_status = req.body.sharing_status : repository.sharing_status = false; 
            }
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
            !req.underscore.isUndefined(req.body.version) ? repository.version = req.body.version.trim() : null;
            !req.underscore.isUndefined(req.body.url) ? repository.url = req.body.url.trim() : null;  
            !req.underscore.isUndefined(req.body.config) ? repository.config = trimObject(req.body.config) : repository.config = getEmptyConfig();
            !req.underscore.isUndefined(req.body.extractors) ? repository.extractors = trimObject(req.body.extractors) : repository.extractors = getDefaultExtractors();
            !req.underscore.isUndefined(req.body.sharing_status) ? repository.sharing_status = req.body.sharing_status : null;
            repository.last_modifier_id = req.user.id;
            repository.last_modification_datetime = req.moment().format();         
            req.repositoriesCollection.update({_id: identificationManager.getDatabaseSpecificId(req.params.id)}, { $set: repository }, {w: 1}, function(err, repository) {
                if (err || req.underscore.isNull(repository)) {
                    res.status(404).end();
                    return;
                }
                
                res.end();
            });            
        },
        deleteRepository: function(req, res) {          
            req.repositoriesCollection.remove({_id: identificationManager.getDatabaseSpecificId(req.params.id)}, {w: 1}, function(err) {
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
        },
        getPublicRepositoriesCount: function(req, res, callback) {
            callback(null, 0);
        } 
    };
};