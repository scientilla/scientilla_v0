/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var model = require("../models/repository-references.js")();
var _ = require("underscore");
var crypto = require("crypto");

module.exports = function () {
    var createReference = function(reference, repository) {
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
        
        var extractedReference = extract(reference, repository.extractors);
        
        var referenceFields = [
            'title', 'authors', 'organizations', 'tags', 'year', 'doi', 'journal_name', 'journal_acronym', 
            'journal_pissn', 'journal_eissn', 'journal_issnl', 'journal_volume', 'journal_year', 'conference_name', 
            'conference_acronym', 'conference_place', 'conference_year', 'book_title', 'book_isbn', 'book_pages', 
            'book_editor', 'book_year', 'abstract', 'month', 'print_status', 'note', 'approving_status', 'sharing_status'];
         
        
        var cleanedReference = {};
        referenceFields.forEach(function(field) {
            cleanedReference[field] = getCleanProperty(extractedReference, field);
        });
        
        return cleanedReference;
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
        getRepositoryReferences: function(req, res) {
            req.repositoriesCollection.findOne({ _id: req.params.id }, function(err, repository) {
                if (err || _.isNull(repository)) {
                    res.status(404).end();
                    return;
                }
                var url =  repository.url;
                var configParameters = ['keywords', 'page', 'rows'];
                configParameters.forEach(function(param){
                    var paramEncoded = 
                        _.isUndefined(req.query[param]) 
                        ? encodeURIComponent(repository.config[param])
                        : req.query[param];
                    var paramPlaceholder = '{{'+param+'}}';
                    url = url.replace(paramPlaceholder, paramEncoded);
                });
                req.request({ 
                    url: url, 
                    strictSSL: false,
                    json:true 
                }, function (error, response, repositoryReferences) {
                    if (error) {
                        res.status(404).end();
                        return;
                    }
                    req.referencesCollection
                        .find()
                        .toArray(function(err, existingReferences) {
                            var existingHashes = _.pluck(existingReferences, 'original_hash');
                            repositoryReferences = repositoryReferences.map(function(reference){
                                var newReference = createReference(reference, repository);
                                var hash = referenceHash(newReference);
                                newReference.clonable = !_.contains(existingHashes, hash);
                                return newReference;
                            });
                            res.setHeader("Content-Type", "application/json");
                            res.status(200).send(repositoryReferences).end();
                        });
                });
            });            
        }
    };
};