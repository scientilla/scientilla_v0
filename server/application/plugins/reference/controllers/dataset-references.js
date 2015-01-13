/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var mongodb = require("mongodb");
var path = require("path");

var model = require("../models/dataset-references.js")();

var identificationManager = require(path.resolve(__dirname + "/../../system/controllers/identification.js"));

module.exports = function () {
    return {        
        getDatasetReferences: function(req, res) {
            var regexQuery = "^(?=.*(" + req.query.keywords.replace(" ", "))(?=.*(") + "))";
            req.datasetReferencesCollections[req.params.datasetId].find({
                "$or": [
                    {
                        title: { 
                            $regex: regexQuery,
                            $options: 'i'
                        }
                    },
                    {
                        authors: { 
                            $regex: regexQuery,
                            $options: 'i'
                        }
                    }
                ]                
            }).sort({ creation_datetime: -1 }).toArray(function(err, references) {
                if (err || req.underscore.isNull(references)) {
                    res.status(404).end();
                    return;
                }
                
                // res.setHeader("Content-Type", "application/json");
                res.json(references);
            });            
        },
        getPublicDatasetReferences: function(req, res) {
            var regexQuery = "^(?=.*(" + req.query.keywords.replace(" ", "))(?=.*(") + "))";
            req.datasetReferencesCollections[req.params.datasetId].find({
                "$or": [
                    {
                        title: { 
                            $regex: regexQuery,
                            $options: 'i'
                        }
                    },
                    {
                        authors: { 
                            $regex: regexQuery,
                            $options: 'i'
                        }
                    }
                ]                
            }).sort({ creation_datetime: -1 }).toArray(function(err, references) {
                if (err || req.underscore.isNull(references)) {
                    res.status(404).end();
                    return;
                }
                
                // res.setHeader("Content-Type", "application/json");
                res.json(references);
            });            
        },        
        getDatasetReference: function(req, res) {
            req.datasetReferencesCollections[req.params.datasetId].findOne({_id: identificationManager.getDatabaseSpecificId(req.params.referenceId)}, function(err, reference) {
                if (err || req.underscore.isNull(reference)) {
                    res.status(404).end();
                    return;
                }
                
                // res.setHeader("Content-Type", "application/json");
                res.json(reference);
            });                
        },
        getPublicDatasetReference: function(req, res) {
            req.datasetReferencesCollections[req.params.datasetId].findOne({_id: identificationManager.getDatabaseSpecificId(req.params.referenceId)}, function(err, reference) {
                if (err || req.underscore.isNull(reference)) {
                    res.status(404).end();
                    return;
                }
                
                // res.setHeader("Content-Type", "application/json");
                res.json(reference);
            });                
        },        
        storeDatasetReference: function(req, res) {
            var reference = {};
            !req.underscore.isUndefined(req.body.title) ? reference.title = req.body.title.trim() : reference.title = "";            
            !req.underscore.isUndefined(req.body.authors) ? reference.authors = req.body.authors.trim() : reference.authors = "";
            !req.underscore.isUndefined(req.body.organizations) ? reference.organizations = req.body.organizations.trim() : reference.organizations = "";
            !req.underscore.isUndefined(req.body.tags) ? reference.tags = req.body.tags.trim() : reference.tags = "";            
            !req.underscore.isUndefined(req.body.year) ? reference.year = req.body.year.trim() : reference.year = "";
            !req.underscore.isUndefined(req.body.doi) ? reference.doi = req.body.doi.trim() : reference.doi = "";    
            !req.underscore.isUndefined(req.body.journal_name) ? reference.journal_name = req.body.journal_name.trim() : reference.journal_name = "";
            !req.underscore.isUndefined(req.body.journal_acronym) ? reference.journal_acronym = req.body.journal_acronym.trim() : reference.journal_acronym = "";
            !req.underscore.isUndefined(req.body.journal_pissn) ? reference.journal_pissn = req.body.journal_pissn.trim() : reference.journal_pissn = "";
            !req.underscore.isUndefined(req.body.journal_eissn) ? reference.journal_eissn = req.body.journal_eissn.trim() : reference.journal_eissn = "";
            !req.underscore.isUndefined(req.body.journal_issnl) ? reference.journal_issnl = req.body.journal_issnl.trim() : reference.journal_issnl = "";
            !req.underscore.isUndefined(req.body.journal_volume) ? reference.journal_volume = req.body.journal_volume.trim() : reference.journal_volume = "";
            !req.underscore.isUndefined(req.body.journal_year) ? reference.journal_year = req.body.journal_year.trim() : reference.journal_year = "";
            !req.underscore.isUndefined(req.body.conference_name) ? reference.conference_name = req.body.conference_name.trim() : reference.conference_name = "";
            !req.underscore.isUndefined(req.body.conference_acronym) ? reference.conference_acronym = req.body.conference_acronym.trim() : reference.conference_acronym = "";
            !req.underscore.isUndefined(req.body.conference_place) ? reference.conference_place = req.body.conference_place.trim() : reference.conference_place = "";
            !req.underscore.isUndefined(req.body.conference_year) ? reference.conference_year = req.body.conference_year.trim() : reference.conference_year = "";
            !req.underscore.isUndefined(req.body.book_title) ? reference.book_title = req.body.book_title.trim() : reference.book_title = "";
            !req.underscore.isUndefined(req.body.book_isbn) ? reference.book_isbn = req.body.book_isbn.trim() : reference.book_isbn = "";
            !req.underscore.isUndefined(req.body.book_pages) ? reference.book_pages = req.body.book_pages.trim() : reference.book_pages = "";
            !req.underscore.isUndefined(req.body.book_editor) ? reference.book_editor = req.body.book_editor.trim() : reference.book_editor = "";
            !req.underscore.isUndefined(req.body.book_year) ? reference.book_year = req.body.book_year.trim() : reference.book_year = "";
            !req.underscore.isUndefined(req.body.abstract) ? reference.abstract = req.body.abstract.trim() : reference.abstract = "";
            !req.underscore.isUndefined(req.body.month) ? reference.month = req.body.month.trim() : reference.month = "";
            !req.underscore.isUndefined(req.body.print_status) ? reference.print_status = req.body.print_status.trim() : reference.print_status = "";
            !req.underscore.isUndefined(req.body.note) ? reference.note = req.body.note.trim() : reference.note = ""; 
            !req.underscore.isUndefined(req.body.approving_status) ? reference.approving_status = req.body.approving_status : reference.approving_status = "";
            !req.underscore.isUndefined(req.body.sharing_status) ? reference.sharing_status = req.body.sharing_status : reference.sharing_status = "";
            !req.underscore.isUndefined(req.body.hash) ? reference.hash = req.body.hash : reference.hash = "";   
            !req.underscore.isUndefined(req.body.clone_hash) ? reference.clone_hash = req.body.clone_hash : reference.clone_hash = "";
            !req.underscore.isUndefined(req.body.author_hashes) ? reference.author_hashes = req.body.author_hashes : reference.author_hashes = "";
            !req.underscore.isUndefined(req.body.organization_hashes) ? reference.organization_hashes = req.body.organization_hashes : reference.organization_hashes = "";
            !req.underscore.isUndefined(req.body.user_hashes) ? reference.user_hashes = req.body.user_hashes : reference.user_hashes = "";
            reference.creator_id = req.user.id;
            reference.creation_datetime = req.moment().format();
            reference.last_modifier_id = "";
            reference.last_modification_datetime = "";
            req.datasetReferencesCollections[req.params.datasetId].insert(reference, {w:1}, function(err, reference) {
                if (err || req.underscore.isNull(reference)) {
                    res.status(404).end();
                    return;
                }
                
                res.end();
            });
        } 
    };
};