/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var _ = require("lodash");
var crypto = require("crypto");

module.exports = function () {
    var createNewReference = function(reference) {
        var newReferenceFields = [
            "title",
            "authors",
            "organizations",
            "tags",
            "year",
            "doi",
            "journal_name",
            "journal_acronym",
            "journal_pissn",
            "journal_eissn",
            "journal_issnl",
            "journal_volume",
            "journal_year",
            "conference_name",
            "conference_acronym",
            "conference_place",
            "conference_year",
            "book_title",
            "book_isbn",
            "book_pages",
            "book_editor",
            "book_year",
            "abstract",
            "month",
            "print_status",
            "note",
            "approving_status",
            "sharing_status",
            "original_hash",
            "clone_hash",
            "organization_hashes",
            "user_hash",
            "creation_datetime",
            "last_modification_datetime",
            "peer_url"
        ];
        
        return buildReference(reference, newReferenceFields);
    };
    
    var createReference = function(reference, repository) {
        var referenceFields = [
            "_id",
            "title",
            "authors",
            "organizations",
            "tags",
            "year",
            "doi",
            "journal_name",
            "journal_acronym",
            "journal_pissn",
            "journal_eissn",
            "journal_issnl",
            "journal_volume",
            "journal_year",
            "conference_name",
            "conference_acronym",
            "conference_place",
            "conference_year",
            "book_title",
            "book_isbn",
            "book_pages",
            "book_editor",
            "book_year",
            "abstract",
            "month",
            "print_status",
            "note",
            "approving_status",
            "sharing_status",
            "original_hash",
            "clone_hash",
            "organization_hashes",
            "user_hash",
            "creation_datetime",
            "last_modification_datetime",
            "versions",
            "reliability",
            "others",
            "confirmedBy",
            "peer_url"
        ];
        
        return buildReference(reference, referenceFields, repository);
    };
    
    var buildReference = function(reference, referenceFields, repository) {
        var getCleanProperty = function(reference, field) {
            var cleanItem = function(item) {
                if (typeof item === "string") {
                    return item.trim();
                }
                return item;
            };
            return (_.isUndefined(reference[field]) || _.isNull(reference[field])) ? "" : cleanItem(reference[field]);
        };
        
        var extract = function(reference, extractors) {
            var extractedReference = {};
            for(var key in extractors) {
                var extractorField = extractors[key].field;
                var extractorRegex = new RegExp(extractors[key].regex);
                if (!_.isUndefined(reference[extractorField]) && !_.isNull(reference[extractorField])) {
                    var matches = reference[extractorField].match(extractorRegex);
                    if (!_.isNull(matches) && matches.length > 0) {
                        extractedReference[key] = _.last(matches);
                    } else {
                        extractedReference[key] = "";
                    }
                }
            }
            return extractedReference;
        };
        
        var localReference = (_.isNull(repository) || _.isUndefined(repository)) ? reference : extract(reference, repository.extractors);
           
        var cleanedReference = {};
        
        referenceFields.forEach(function(field) {
            cleanedReference[field] = getCleanProperty(localReference, field);
        });
        
        return cleanedReference;
    };
    
    var extract = function(listStr) {
       if (listStr !== "") { 
            return listStr.replace(" and ", ", ").split(", "); 
        } else {
            return [];
        } 
    };
    
    var extractAuthors = function(reference) {
        return extract(reference.authors);
    };
    
    var getAuthorSignatures = function(reference, userHash) {
        var author_signatures = reference.author_signatures;
        if (_.isUndefined(author_signatures) || _.isNull(author_signatures) || _.isString(author_signatures)) {
            return author_signatures;
        }
        var authors = extractAuthors(reference);
        var author_index = author_signatures.author_index;
        if (!_.isUndefined(author_index) && !_.isEmpty(author_index)) {
            var author_string = authors[author_index];
            author_signatures.author_string = author_string;
            
        }
        author_signatures.author_hash = userHash;
        return author_signatures;
    };
    
    var getOrganizationSignature = function(reference, userHash) {
        var organization_signature = reference.organization_signature;
        if (_.isUndefined(organization_signature) || _.isNull(organization_signature) || _.isString(organization_signature)) {
            return organization_signature;
        }
        var authors = extractAuthors(reference);
        if (_.isArray(organization_signature.authors)) {
            organization_signature.authors = _.reduce(
                organization_signature.authors,
                function(res, author){
                    if (!author) {
                        return res;
                    }
                    var author_index = author.author_index;
                    if (_.isUndefined(author_index)) {
                        return res;
                    }
                    var newAuthor = author;
                    var author_index = author.author_index;
                    var author_string = authors[author_index];
                    newAuthor.author_string = author_string;
                    res.push(newAuthor);
                    return res;
                }, 
                []);
        }
        organization_signature.organization_hash = userHash;
        return organization_signature;
    };

    var referenceHash = function(reference) {
        var hashBase = (
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
        ).trim();
        return crypto
            .createHash("sha256")
            .update(hashBase)
            .digest("hex"); 
    };
    return {
        getOrganizationSignature: getOrganizationSignature,
        getAuthorSignatures: getAuthorSignatures,
        createNewReference: createNewReference,
        createReference: createReference,
        getReferenceHash: referenceHash,
        getVerifiedReferences: function(referencesCollection, userHashes, references, repository, callback) {
            referencesCollection
                .find({user_hash: { $in: userHashes }})
                .toArray(function(err, existingReferences) {
                    if (err) {
                        callback(err, null);
                        return;
                    }
                    var verifiedReferences = references.map(function(reference){
                        var verifiedReferences = createReference(reference, repository);
                        var hash = referenceHash(verifiedReferences);
                        verifiedReferences.clonable = !_.some(existingReferences, {original_hash: hash});
                        return verifiedReferences;
                    });
                    callback(null, verifiedReferences);
                });
            }
    };
};