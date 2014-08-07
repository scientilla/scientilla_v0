/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/master/LICENSE)
 */

var model = require("../models/default.js")();

module.exports = function () {
    return {
        getReferences: function(req, res) {
            req.collection.find({}).sort({ creation_datetime: -1 }).toArray(function(err, references) {
                if (err || req.underscore.isNull(references)) {
                    res.status(404).end();
                    return;
                }
                
                res.setHeader("Content-Type", "application/json");
                res.json(references);
            });            
        },
        getPublicReferences: function(req, res) {
            req.collection.find({ sharing_status: true }).sort({ creation_datetime: -1 }).toArray(function(err, publicReferences) {
                if (err || req.underscore.isNull(publicReferences)) {
                    res.status(404).end();
                    return;
                }
                
                res.setHeader("Content-Type", "application/json");
                res.json(publicReferences);
            });            
        },        
        getReference: function(req, res) {
            req.collection.findOne({ _id: req.params.id }, function(err, reference) {
                if (err || req.underscore.isNull(reference)) {
                    res.status(404).end();
                    return;
                }
                
                res.setHeader("Content-Type", "application/json");
                res.json(reference);
            });                
        },
        getPublicReference: function(req, res) {
            req.collection.findOne({ _id: req.params.id, sharing_status: true }, function(err, publicReference) {
                if (err || req.underscore.isNull(publicReference)) {
                    res.status(404).end();
                    return;
                }
                
                res.setHeader("Content-Type", "application/json");
                res.json(publicReference);
            });                
        },        
        createReference: function(req, res) {
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
            if (req.underscore.isUndefined(req.body.hash)) {
                reference.hash = req.crypto.createHash("sha256").update(
                    (
                        reference.title + ", " +
                        reference.authors + ", " +
                        reference.organizations + ", " +
                        reference.title + ", " +
                        reference.year + ", " +
                        reference.doi + ", " +
                        reference.journal_name + ", " +
                        reference.journal_acronym + ", " +
                        reference.journal_pissn + ", " +
                        reference.journal_eissn + ", " +
                        reference.journal_issnl + ", " +
                        reference.journal_volume + ", " +
                        reference.journal_year + ", " +
                        reference.conference_name + ", " +
                        reference.conference_acronym + ", " +
                        reference.conference_place + ", " +
                        reference.conference_year + ", " +
                        reference.book_title + ", " +
                        reference.book_isbn + ", " +
                        reference.book_pages + ", " +
                        reference.book_editor + ", " +
                        reference.book_year + ", " +
                        reference.abstract + ", " +
                        reference.month + ", " +
                        reference.abstract
                    ).trim()
                ).digest("hex"); 
            } else {
                reference.hash = req.body.hash;
            }
            if (!req.underscore.isUndefined(req.body.hash)) {
                reference.clone_hash = req.crypto.createHash("sha256").update(
                    (
                        reference.title + ", " +
                        reference.authors + ", " +
                        reference.organizations + ", " +
                        reference.title + ", " +
                        reference.year + ", " +
                        reference.doi + ", " +
                        reference.journal_name + ", " +
                        reference.journal_acronym + ", " +
                        reference.journal_pissn + ", " +
                        reference.journal_eissn + ", " +
                        reference.journal_issnl + ", " +
                        reference.journal_volume + ", " +
                        reference.journal_year + ", " +
                        reference.conference_name + ", " +
                        reference.conference_acronym + ", " +
                        reference.conference_place + ", " +
                        reference.conference_year + ", " +
                        reference.book_title + ", " +
                        reference.book_isbn + ", " +
                        reference.book_pages + ", " +
                        reference.book_editor + ", " +
                        reference.book_year + ", " +
                        reference.abstract + ", " +
                        reference.month + ", " +
                        reference.abstract
                    ).trim()
                ).digest("hex");
            } else {
                reference.clone_hash = "";
            }
            reference.author_hashes = "";
            reference.organization_hashes = "";
            reference.user_hash = "";
            reference.creator_id = req.user.id;
            reference.creation_datetime = req.moment().format();
            reference.last_modifier_id = "";
            reference.last_modification_datetime = "";            
            req.collection.insert(reference, {w:1}, function(err, reference) {
                if (err || req.underscore.isNull(reference)) {
                    res.status(404).end();
                    return;
                }
                
                res.end();
            });
        },
        updateReference: function(req, res) {
            var reference = {};
            !req.underscore.isUndefined(req.body.title) ? reference.title = req.body.title.trim() : null;      
            !req.underscore.isUndefined(req.body.authors) ? reference.authors = req.body.authors.trim() : null;
            !req.underscore.isUndefined(req.body.organizations) ? reference.organizations = req.body.organizations.trim() : null;
            !req.underscore.isUndefined(req.body.tags) ? reference.tags = req.body.tags.trim() : null; 
            !req.underscore.isUndefined(req.body.year) ? reference.year = req.body.year.trim() : null;
            !req.underscore.isUndefined(req.body.doi) ? reference.doi = req.body.doi.trim() : null;
            !req.underscore.isUndefined(req.body.journal_name) ? reference.journal_name = req.body.journal_name.trim() : null;
            !req.underscore.isUndefined(req.body.journal_acronym) ? reference.journal_acronym = req.body.journal_acronym.trim() : null;
            !req.underscore.isUndefined(req.body.journal_pissn) ? reference.journal_pissn = req.body.journal_pissn.trim() : null;
            !req.underscore.isUndefined(req.body.journal_eissn) ? reference.journal_eissn = req.body.journal_eissn.trim() : null;
            !req.underscore.isUndefined(req.body.journal_issnl) ? reference.journal_issnl = req.body.journal_issnl.trim() : null;
            !req.underscore.isUndefined(req.body.journal_volume) ? reference.journal_volume = req.body.journal_volume.trim() : null;
            !req.underscore.isUndefined(req.body.journal_year) ? reference.journal_year = req.body.journal_year.trim() : null;
            !req.underscore.isUndefined(req.body.conference_name) ? reference.conference_name = req.body.conference_name.trim() : null;
            !req.underscore.isUndefined(req.body.conference_acronym) ? reference.conference_acronym = req.body.conference_acronym.trim() : null;
            !req.underscore.isUndefined(req.body.conference_place) ? reference.conference_place = req.body.conference_place.trim() : null;
            !req.underscore.isUndefined(req.body.conference_year) ? reference.conference_year = req.body.conference_year.trim() : null;
            !req.underscore.isUndefined(req.body.book_title) ? reference.book_title = req.body.book_title.trim() : null;
            !req.underscore.isUndefined(req.body.book_isbn) ? reference.book_isbn = req.body.book_isbn.trim() : null;
            !req.underscore.isUndefined(req.body.book_pages) ? reference.book_pages = req.body.book_pages.trim() : null;
            !req.underscore.isUndefined(req.body.book_editor) ? reference.book_editor = req.body.book_editor.trim() : null;
            !req.underscore.isUndefined(req.body.book_year) ? reference.book_year = req.body.book_year.trim() : null;
            !req.underscore.isUndefined(req.body.abstract) ? reference.abstract = req.body.abstract.trim() : null;
            !req.underscore.isUndefined(req.body.month) ? reference.month = req.body.month.trim() : null;
            !req.underscore.isUndefined(req.body.print_status) ? reference.print_status = req.body.print_status.trim() : null;
            !req.underscore.isUndefined(req.body.note) ? reference.note = req.body.note.trim() : null;
            !req.underscore.isUndefined(req.body.approving_status) ? reference.approving_status = req.body.approving_status : null;
            !req.underscore.isUndefined(req.body.sharing_status) ? reference.sharing_status = req.body.sharing_status : null;
            if (!req.underscore.isUndefined(req.body.clone_hash)) {
                reference.clone_hash = req.crypto.createHash("sha256").update(
                    (
                        reference.title + ", " +
                        reference.authors + ", " +
                        reference.organizations + ", " +
                        reference.title + ", " +
                        reference.year + ", " +
                        reference.doi + ", " +
                        reference.journal_name + ", " +
                        reference.journal_acronym + ", " +
                        reference.journal_pissn + ", " +
                        reference.journal_eissn + ", " +
                        reference.journal_issnl + ", " +
                        reference.journal_volume + ", " +
                        reference.journal_year + ", " +
                        reference.conference_name + ", " +
                        reference.conference_acronym + ", " +
                        reference.conference_place + ", " +
                        reference.conference_year + ", " +
                        reference.book_title + ", " +
                        reference.book_isbn + ", " +
                        reference.book_pages + ", " +
                        reference.book_editor + ", " +
                        reference.book_year + ", " +
                        reference.abstract + ", " +
                        reference.month + ", " +
                        reference.abstract
                    ).trim()
                ).digest("hex");
            } else {
                reference.clone_hash = "";
            }
            reference.author_hashes = "";
            reference.organization_hashes = "";
            reference.user_hash = ""; 
            reference.last_modifier_id = req.user.id;
            reference.last_modification_datetime = req.moment().format();          
            req.collection.update({ _id: req.params.id }, { $set: reference }, {w: 1}, function(err, reference) {
                if (err || req.underscore.isNull(reference)) {
                    res.status(404).end();
                    return;
                }
                
                res.end();
            });
        }        
    };
};