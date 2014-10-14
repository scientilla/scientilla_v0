/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var networkManager = require("../../network/models/default.js")();
var referenceManager = require("../models/default.js")();
var _ = require("lodash");

module.exports = function () {
    var cleanReferenceTags = function(reference) {
        if (_.isArray(reference.tags)) {
            return reference;
        }
        if (_.isNull(reference.tags) || _.isEmpty(reference.tags)) {
            reference.tags = [];
        } else {
            reference.tags = reference.tags.split(', ');
        }
        return reference;
    };
    var cleanReferencesTags = function(references) {
        var cleanedReferences = _.map(
            references, 
            function(r) {
                return cleanReferenceTags(r);
        });
        return cleanedReferences;
    };
    return {
        getReferences: function(req, res) {
            var keywords = _.isUndefined(req.query.keywords) ? '' : req.query.keywords;
            var datetime = _.isUndefined(req.query.datetime) ? '' : req.query.datetime;
            var regexQuery = "^(?=.*(" + keywords.replace(" ", "))(?=.*(") + "))";
            req.referencesCollection.find({
                last_modification_datetime: {
                    $gt: datetime
                },                
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
                references = cleanReferencesTags(references);
                res.setHeader("Content-Type", "application/json");
                res.json(references);
            });            
        },
        getPublicReferences: function(req, res) {
            var keywords = _.isUndefined(req.query.keywords) ? '' : req.query.keywords;
            var datetime = _.isUndefined(req.query.datetime) ? '' : req.query.datetime;
            var regexQuery = "^(?=.*(" + keywords.replace(" ", "))(?=.*(") + "))";
            req.referencesCollection.find({ 
                sharing_status: true,
                last_modification_datetime: {
                    $gt: datetime
                },
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
            }).sort({ creation_datetime: -1 }).toArray(function(err, publicReferences) {
                if (err || req.underscore.isNull(publicReferences)) {
                    res.status(404).end();
                    return;
                }
                publicReferences = cleanReferencesTags(publicReferences);
                res.setHeader("Content-Type", "application/json");
                res.json(publicReferences);
            });            
        },        
        getReference: function(req, res) {
            req.referencesCollection.findOne({ _id: req.params.id }, function(err, reference) {
                if (err || req.underscore.isNull(reference)) {
                    res.status(404).end();
                    return;
                }
                reference = cleanReferenceTags(reference);
                res.setHeader("Content-Type", "application/json");
                res.json(reference);
            });                
        },
        getPublicReference: function(req, res) {
            req.referencesCollection.findOne({ _id: req.params.id, sharing_status: true }, function(err, publicReference) {
                if (err || req.underscore.isNull(publicReference)) {
                    res.status(404).end();
                    return;
                }
                
                res.setHeader("Content-Type", "application/json");
                res.json(publicReference);
            });                
        },        
        createReference: function(req, res) {
            switch (req.body.source.type) {
                case "I":
                    // Cloning a reference from the installation 
                case "ID":
                    // Cloning a reference from an installation dataset
                case "PD":
                    // Cloning a reference from a peer dataset
                    
                    /*not implemented yet */
                    res.status(404).end();
                    return;
                case "P":
                    // Cloning a reference from a peer
                    
                    this.cloneReferenceFromPeer(req, res);
                    return;
                case "R":
                    // Cloning a reference from a repository
                case "N":
                    // Creating a new reference
                    
                    this.createNewReference(req, res);
                    break;
                default:
                    /* error!!! */
                    res.status(500).end();
                    return;
            };
        },        
        createNewReference: function(req, res) {
            var reference = referenceManager.createNewReference(req.body);
            reference.original_hash = referenceManager.getReferenceHash(reference);
            reference.clone_hash = reference.original_hash;
            reference.author_hashes = "";
            reference.organization_hashes = "";
            reference.user_hash = req.user.hash;
            reference.creator_id = req.user.id;
            reference.creation_datetime = req.moment().format();
            reference.last_modifier_id = req.user.id;
            reference.last_modification_datetime = req.moment().format();   
            req.referencesCollection
                .find({ 
                    original_hash: reference.original_hash,
                    user_hash: { $in: req.user.hashes }
                })
                .toArray(function(err, references) {
                    if (err) {
                        console.log(err);
                        res.status(404).end();
                        return;
                    }
                    if (references.length > 0) {
                        console.log('Publication duplicated');
                        res.status(409).end();
                        return;
                    }
                    req.referencesCollection.insert(reference, { w: 1 }, function(err, reference) {
                        if (err || req.underscore.isNull(reference)) {
                            console.log(err);
                            res.status(404).end();
                            return;
                        }
                        res.end();
                    });
                }
            );
        },
        updateReference: function(req, res) {
            var reference = {};
            !req.underscore.isUndefined(req.body.title) ? reference.title = req.body.title.trim() : null;      
            !req.underscore.isUndefined(req.body.authors) ? reference.authors = req.body.authors.trim() : null;
            !req.underscore.isUndefined(req.body.author_hash) ? reference.author_hash = req.body.author_hash : null;
            !req.underscore.isUndefined(req.body.organizations) ? reference.organizations = req.body.organizations.trim() : null;
            !req.underscore.isUndefined(req.body.tags) ? reference.tags = req.body.tags : []; 
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
            reference.clone_hash = referenceManager.getReferenceHash(reference);
            reference.author_hash = referenceManager.getAuthorHash(reference, req.user.hash);
            reference.organization_hashes = "";
            reference.user_hash = req.user.hash; 
            reference.last_modifier_id = req.user.id;
            reference.last_modification_datetime = req.moment().format();            
            req.referencesCollection.update({ _id: req.params.id }, { $set: reference }, { w: 1 }, function(err, reference) {
                if (err || req.underscore.isNull(reference)) {
                    res.status(404).end();
                    return;
                }
                res.end();
            });
        },
        deleteReference: function(req, res) {          
            req.referencesCollection.remove({ _id: req.params.id }, { w: 1 }, function(err) {
                if (err) {
                    res.status(500).end();
                    return;
                }
                res.end();
            });
        },
        /* to be deleted soon */
        cloneReference: function(req, res) {
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
            switch (req.body.source.type) {
                case "I":
                    // Cloning a reference from the installation 
                    reference.original_hash = "";
                    break;
                    
                case "ID":
                    // Cloning a reference from an installation dataset
                    reference.original_hash = "";
                    break;
                
                case "P":
                    // Cloning a reference from a peer
                    this.cloneReferenceFromPeer(req, res);
                    return;
                case "PD":
                    // Cloning a reference from a peer dataset
                    reference.original_hash = "";
                    break;
                    
                case "R":
                    // Cloning a reference from a repository
                    reference.original_hash = "";
                    break;
                
                default:
                    reference.original_hash = "";
                    break;
            }
            var cloneHash = (
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
            reference.clone_hash = 
                req.crypto
                    .createHash("sha256")
                    .update(cloneHash)
                    .digest("hex");
            reference.author_hashes = "";
            reference.organization_hashes = "";
            reference.user_hash = req.user.hash; 
            reference.last_modifier_id = req.user.id;
            reference.last_modification_datetime = req.moment().format();            
            req.referencesCollection.update({ _id: req.params.id }, { $set: reference }, { w: 1 }, function(err, reference) {
                if (err || req.underscore.isNull(reference)) {
                    res.status(404).end();
                    return;
                }
                res.end();
            });
        }, 
        cloneReferenceFromPeer: function(req, res) {
            if (_.isNull(req.body.source.peer_id)) {
                res.status(400).end();
                return;
            }
            if (_.isNull(req.body.source.reference_id)) {
                res.status(400).end();
                return;
            }
            var peerId = req.body.source.peer_id;
            var referenceId = req.body.source.reference_id;
            req.peersCollection.findOne({ _id: peerId }, function(err, peer) {
                if (err || req.underscore.isNull(peer)) {
                    res.status(404).end();
                    return;
                }
                var url = peer.url + "/api/public-references/" + referenceId + "/";
                req.request({ 
                    url: url, 
                    strictSSL: false,
                    json: true
                }, function (error, response, referenceData) {
                    if (error) {
                        console.log(error);
                        res.status(400).end();
                        return;
                    }
                    var reference = referenceManager.createReference(referenceData);
                    reference.original_hash = referenceManager.getReferenceHash(reference);
                    reference.clone_hash = reference.original_hash;
                    reference.user_hash = req.user.hash; 
                    reference.last_modifier_id = req.user.id;
                    reference.last_modification_datetime = req.moment().format(); 
                    delete reference._id;
                    res.setHeader("Content-Type", "application/json");
                    req.referencesCollection
                        .find({ 
                            original_hash: reference.original_hash,
                            user_hash: { $in: req.user.hashes }
                        })
                        .toArray(function(err, references) {
                            if (err) {
                                console.log(err);
                                res.status(404).end();
                                return;
                            }
                            if (references.length > 0) {
                                res.status(409).end();
                                return;
                            }
                            req.referencesCollection.insert(reference, { w: 1 }, function(err, reference) {
                                if (err || req.underscore.isNull(reference)) {
                                    console.log(err);
                                    res.status(404).end();
                                    return;
                                }
                                res.end();
                                return;
                            });
                        }
                    );
                });
            });
        }
    };
};
