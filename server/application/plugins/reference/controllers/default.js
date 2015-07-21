/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var _ = require("lodash");
var bibtexParseJs = require("bibtex-parse-js");
var fs = require("fs");
var mongodb = require("mongodb");
var path = require("path");

var identificationManager = require(path.resolve(__dirname + "/../../system/controllers/identification.js"));
var networkManager = require("../../network/models/default.js")();
var referenceManager = require("../models/default.js")();
var userManager = require("../../user/models/default.js")();

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
    var retrieveReferences = function(referencesCollection, keywords, currentPageNumber, numberOfItemsPerPage, userHashes) {        
        var keywordsRegexQuery = "^(?=.*(" + keywords.replace(" ", "))(?=.*(") + "))";
        var keywordsArray = keywords.split();
        var keywordsRegexArray = _.map(keywordsArray, (function(k) {return new RegExp(k)}));
        return referencesCollection.find({
            "$and": [
                { user_hash: { $in: userHashes } },
                {
                    "$or": [
                    {
                        title: { 
                            $regex: keywordsRegexQuery,
                            $options: 'i'
                        }
                    },
                    {
                        authors: { 
                            $regex: keywordsRegexQuery,
                            $options: 'i'
                        }
                    },
                    {
                        journal_name: { 
                            $regex: keywordsRegexQuery,
                            $options: 'i'
                        }
                    },
                    {
                        conference_name: { 
                            $regex: keywordsRegexQuery,
                            $options: 'i'
                        }
                    },
                    {
                        book_title: { 
                            $regex: keywordsRegexQuery,
                            $options: 'i'
                        }
                    },
                    {
                        tags: { 
                            $in: keywordsRegexArray
                        }
                    }
                ]}
            ]
        }, {"_tiar.tags":0, "_tiar.user_hash": 0}).sort(
            { 
                creation_datetime: -1 
            }
        ).skip(
            currentPageNumber > 0 ? ((currentPageNumber - 1) * numberOfItemsPerPage) : 0
        ).limit(
            numberOfItemsPerPage
        );
    };
    return {
        getReferences: function(req, res) {
            var keywords = _.isUndefined(req.query.keywords) ? '' : req.query.keywords;
            var currentPageNumber = _.isUndefined(req.query.current_page_number) ? 1 : parseInt(req.query.current_page_number);
            var numberOfItemsPerPage = _.isUndefined(req.query.number_of_items_per_page) ? 20 : parseInt(req.query.number_of_items_per_page); 
            var retrievedCollection = retrieveReferences(req.referencesCollection, keywords, currentPageNumber, numberOfItemsPerPage, req.user.hashes);
            var result = {};
            retrievedCollection.count(function(err, referencesCount) {
                if (err || req.underscore.isNull(referencesCount)) {
                    console.log(err);
                    res.status(404).end();
                    return;
                }
                result.total_number_of_items = referencesCount;
                retrievedCollection.toArray(function(err, references) {
                    if (err || req.underscore.isNull(references)) {
                        console.log(err);
                        res.status(404).end();
                        return;
                    }
                    result.items = cleanReferencesTags(references);
                    
                    // res.setHeader("Content-Type", "application/json");
                    res.json(result);
                });                
            });
        },
        getPublicReferences: function(req, res) {
            var keywords = _.isUndefined(req.query.keywords) ? '' : req.query.keywords;
            var datetime = _.isUndefined(req.query.datetime) ? '' : req.query.datetime;
            var currentPageNumber = _.isUndefined(req.query.current_page_number) ? 1 : parseInt(req.query.current_page_number);
            var numberOfItemsPerPage = _.isUndefined(req.query.number_of_items_per_page) ? 20 : parseInt(req.query.number_of_items_per_page); 
            var regexQuery = "^(?=.*(" + keywords.replace(" ", "))(?=.*(") + "))";
            var retrievedCollection = req.referencesCollection.find({ 
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
            }).sort(
                    { creation_datetime: -1 }
            ).skip(
                currentPageNumber > 0 ? ((currentPageNumber - 1) * numberOfItemsPerPage) : 0
            ).limit(
                numberOfItemsPerPage
            );
            
            var result = {};
            
            retrievedCollection.count(function(err, count) {
                console.log(count);
                if (err) {
                    console.log(err);
                    res.status(404).end();
                    return;
                }
                result.total_number_of_items = count;
                retrievedCollection.toArray(function(err, publicReferences) {
                    if (err || req.underscore.isNull(publicReferences)) {
                        console.log(err);
                        res.status(404).end();
                        return;
                    }
                    publicReferences = cleanReferencesTags(publicReferences);
                    result.items = publicReferences;

                    // res.setHeader("Content-Type", "application/json");
                    res.json(result);
                });            
            });
        },        
        getReference: function(req, res) {
            req.referencesCollection.findOne({_id: identificationManager.getDatabaseSpecificId(req.params.id)}, function(err, reference) {
                if (err || req.underscore.isNull(reference)) {
                    res.status(404).end();
                    return;
                }
                reference = cleanReferenceTags(reference);
                
                // res.setHeader("Content-Type", "application/json");
                res.json(reference);
            });                
        },
        getPublicReference: function(req, res) {           
            req.referencesCollection.findOne({_id: identificationManager.getDatabaseSpecificId(req.params.id), sharing_status: true}, function(err, publicReference) {
                if (err || req.underscore.isNull(publicReference)) {
                    res.status(404).end();
                    return;
                }
                
                // res.setHeader("Content-Type", "application/json");
                res.json(publicReference);
            });                
        },
        createReference: function(req, res) {
            if (_.isObject(req.files.file)) {
                req.body.source = {
                    type: "F"
                }
            }
            switch (req.body.source.type) {
                case "I":
                    // Cloning a reference from the installation 
                case "ID":
                    // Cloning a reference from an installation dataset
                case "PD":
                    // Cloning a reference from a peer dataset
                    // not implemented yet
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
                case "F":
                    // Importing references from a file
                    this.importReferences(req, res);
                    break;                    
                default:
                    // error
                    res.status(500).end();
                    return;
            };
        },        
        createNewReference: function(req, res) {
            var reference = referenceManager.createNewReference(req.body);
            reference.original_hash = referenceManager.getReferenceHash(reference);
            reference.clone_hash = reference.original_hash;
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
        importReferences: function(req, res) {
            var data = fs.readFileSync(req.files.file.path, { encoding: "utf8" });
            var aReferences = [];
            if (req.body.type == 0) {
                aReferences = bibtexParseJs.toJSON(data);
            } else {
                aReferences = referenceManager.convertRIStoJSON(data);
            }
            if (req.body.type == 0) {
                aReferences.forEach(function(oReference, nIndex, aReferences) {
                    var reference = {};
                    reference.title = !req.underscore.isUndefined(oReference.entryTags.title) ? oReference.entryTags.title.trim() : "";
                    reference.authors = !req.underscore.isUndefined(oReference.entryTags.author) ? oReference.entryTags.author.trim() : "";
                    reference.journal_name = !req.underscore.isUndefined(oReference.entryTags.journal) ? oReference.entryTags.journal.trim() : "";
                    reference.year = !req.underscore.isUndefined(oReference.entryTags.year) ? oReference.entryTags.year.trim() : "";
                    reference.pages = !req.underscore.isUndefined(oReference.entryTags.pages) ? oReference.entryTags.pages.trim() : "";
                    reference.original_hash = referenceManager.getReferenceHash(reference);
                    reference.clone_hash = reference.original_hash;
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
                            if (!err && references.length == 0) {
                                req.referencesCollection.insert(reference, { w: 1 }, function(err, reference) {
                                    if (err || req.underscore.isNull(reference)) {
                                        // 
                                    }
                                });
                            }
                        }
                    );
                    res.end();
                });
            } else {
                res.end();
            }
        },
        patchReference: function(req, res) {
            var refUpdate = req.body;
            refUpdate.last_modifier_id = req.user.id;
            refUpdate.last_modification_datetime = req.moment().format();    
            req.referencesCollection.update({_id: identificationManager.getDatabaseSpecificId(req.params.id)}, { $set: refUpdate }, { w: 1 }, function(err, count) {
                if (err || count === 0) {
                    console.log(err);
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
            !req.underscore.isUndefined(req.body.author_signatures) ? reference.author_signatures = req.body.author_signatures : null;
            !req.underscore.isUndefined(req.body.organizations) ? reference.organizations = req.body.organizations.trim() : null;
            !req.underscore.isUndefined(req.body.organization_signature) ? reference.organization_signature = req.body.organization_signature : null;
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
            !req.underscore.isUndefined(req.body.book_title) ? reference.book_title = req.body.book_title.trim() : null;
            !req.underscore.isUndefined(req.body.book_isbn) ? reference.book_isbn = req.body.book_isbn.trim() : null;
            !req.underscore.isUndefined(req.body.book_pages) ? reference.book_pages = req.body.book_pages.trim() : null;
            !req.underscore.isUndefined(req.body.book_editor) ? reference.book_editor = req.body.book_editor.trim() : null;
            !req.underscore.isUndefined(req.body.abstract) ? reference.abstract = req.body.abstract.trim() : null;
            !req.underscore.isUndefined(req.body.month) ? reference.month = req.body.month.trim() : null;
            !req.underscore.isUndefined(req.body.print_status) ? reference.print_status = req.body.print_status.trim() : null;
            !req.underscore.isUndefined(req.body.note) ? reference.note = req.body.note.trim() : null;
            !req.underscore.isUndefined(req.body.approving_status) ? reference.approving_status = req.body.approving_status : null;
            !req.underscore.isUndefined(req.body.sharing_status) ? reference.sharing_status = req.body.sharing_status : null;
            reference.clone_hash = referenceManager.getReferenceHash(reference);
            reference.author_signatures = referenceManager.getAuthorSignatures(reference, req.user.hash);
            reference.organization_signature = referenceManager.getOrganizationSignature(reference, req.user.hash);
            reference.organization_hashes = "";
            reference.user_hash = req.user.hash; 
            reference.last_modifier_id = req.user.id;
            reference.last_modification_datetime = req.moment().format();            
            req.referencesCollection.update({_id: identificationManager.getDatabaseSpecificId(req.params.id)}, { $set: reference }, { w: 1 }, function(err, count) {
                if (err || count === 0) {
                    console.log(err);
                    res.status(404).end();
                    return;
                }
                userManager.addReferenceAliases(req.usersCollection, req.user, reference, function(err, user) {
                    if (err) {
                        console.log(err);
                        res.status(500).end();
                        return;
                    }
                    res.end();
                });
            });
        },
        deleteReference: function(req, res) {          
            req.referencesCollection.remove({_id: identificationManager.getDatabaseSpecificId(req.params.id)}, { w: 1 }, function(err) {
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
            !req.underscore.isUndefined(req.body.book_title) ? reference.book_title = req.body.book_title.trim() : null;
            !req.underscore.isUndefined(req.body.book_isbn) ? reference.book_isbn = req.body.book_isbn.trim() : null;
            !req.underscore.isUndefined(req.body.book_pages) ? reference.book_pages = req.body.book_pages.trim() : null;
            !req.underscore.isUndefined(req.body.book_editor) ? reference.book_editor = req.body.book_editor.trim() : null;
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
                reference.book_title + ", " +
                reference.book_isbn + ", " +
                reference.book_pages + ", " +
                reference.book_editor + ", " +
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
            req.referencesCollection.update({_id: identificationManager.getDatabaseSpecificId(req.params.id)}, { $set: reference }, { w: 1 }, function(err, reference) {
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
            req.peersCollection.findOne({_id: identificationManager.getDatabaseSpecificId(peerId)}, function(err, peer) {
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
                    var reference = referenceManager.createNewReference(referenceData);
                    if (reference.clone_hash !== referenceManager.getReferenceHash(reference)) {
                        console.log("Hashes don't match, reference clone_hash is " + reference.clone_hash + " and the calculated clone_hash is " + referenceManager.getReferenceHash(reference));
                        res.status(404).end();
                        return;
                    }
                    reference.tags = _.union(reference.tags, peer.tags);
                    reference.user_hash = req.user.hash; 
                    reference.sharing_status = false;
                    reference.last_modifier_id = req.user.id;
                    reference.last_modification_datetime = req.moment().format(); 
                    delete reference._id;
                    
                    // res.setHeader("Content-Type", "application/json");
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
        },
        getPublicReferencesCount: function(req, res, callback) {
            callback(null, 0);
        },
        fixCorruptedReferences: function(referenceCollection, async) {
            referenceCollection
                .find()
                .toArray(function(err, references) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    var referencesToBeFixed = _.filter(references, function(r) {
                        return referenceManager.getReferenceHash(r) !== r.clone_hash;
                    });
                    async.each(
                        referencesToBeFixed, 
                        function(r, cb) {
                            var correctCloneHash = referenceManager.getReferenceHash(r);
                            referenceCollection.update({_id: r._id}, {$set: {clone_hash : correctCloneHash}}, function(){ cb(); });
                        }
                    ),
                    function(err) { 
                        console.log(err);
                    }
                });
        }
    };
};
