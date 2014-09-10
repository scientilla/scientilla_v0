/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var model = require("../models/repository-references.js")();

module.exports = function () {
    var createReference = function(_, reference) {
        var getCleanProperty = function(reference, field) {
            var cleanItem = function(item) {
                if (typeof item === "string") {
                    return item.trim();
                }
                return item;
            };
            return (_.isUndefined(reference[field]) || _.isNull(reference[field])) ? "" : cleanItem(reference[field]);
        };
        
        var cleanedReference = {};
        
        var referenceFields = [
            'title', 'authors', 'organizations', 'tags', 'year', 'doi', 'journal_name', 'journal_acronym', 
            'journal_pissn', 'journal_eissn', 'journal_issnl', 'journal_volume', 'journal_year', 'conference_name', 
            'conference_acronym', 'conference_place', 'conference_year', 'book_title', 'book_isbn', 'book_pages', 
            'book_editor', 'book_year', 'abstract', 'month', 'print_status', 'note', 'approving_status', 'sharing_status'];
         
        referenceFields.forEach(function(field) {
            cleanedReference[field] = getCleanProperty(reference, field);
        });
        
        return cleanedReference;
    };
    var referenceHash = function(crypto, reference) {
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
                if (err || req.underscore.isNull(repository)) {
                    res.status(404).end();
                    return;
                }
                var url =  repository.url;
                var configParameters = ['keywords', 'page', 'rows'];
                configParameters.forEach(function(param){
                    var paramEncoded = 
                        req.underscore.isUndefined(req.query[param]) 
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
                            var existingHashes = req.underscore.pluck(existingReferences, 'hash');
                            repositoryReferences = repositoryReferences.map(function(reference){
                                var newReference = createReference(req.underscore, reference);
                                var hash = referenceHash(req.crypto, newReference);
                                newReference.clonable = !req.underscore.contains(existingHashes, hash);
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