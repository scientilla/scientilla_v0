/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var model = require("../models/repository-references.js")();

module.exports = function () {
    var createReference = function(_, reference) {
        var cleanItem = function(item) {
            if (typeof item === "string") {
                return item.trim();
            }
            return item;
        };
        var cleanedReference = {};
        
        cleanedReference.title = !_.isUndefined(reference.title) ? cleanItem(reference.title) : "";            
        cleanedReference.authors = !_.isUndefined(reference.authors) ? cleanItem(reference.authors) : "";
        cleanedReference.organizations = !_.isUndefined(reference.organizations) ? cleanItem(reference.organizations) : "";
        cleanedReference.tags = !_.isUndefined(reference.tags) ? cleanItem(reference.tags) : "";            
        cleanedReference.year = !_.isUndefined(reference.year) ? cleanItem(reference.year) : "";
        cleanedReference.doi = !_.isUndefined(reference.doi) ? cleanItem(reference.doi) : "";    
        cleanedReference.journal_name = !_.isUndefined(reference.journal_name) ? cleanItem(reference.journal_name) : "";
        cleanedReference.journal_acronym = !_.isUndefined(reference.journal_acronym) ? cleanItem(reference.journal_acronym) : "";
        cleanedReference.journal_pissn = !_.isUndefined(reference.journal_pissn) ? cleanItem(reference.journal_pissn) : "";
        cleanedReference.journal_eissn = !_.isUndefined(reference.journal_eissn) ? cleanItem(reference.journal_eissn) : "";
        cleanedReference.journal_issnl = !_.isUndefined(reference.journal_issnl) ? cleanItem(reference.journal_issnl) : "";
        cleanedReference.journal_volume = !_.isUndefined(reference.journal_volume) ? cleanItem(reference.journal_volume) : "";
        cleanedReference.journal_year = !_.isUndefined(reference.journal_year) ? cleanItem(reference.journal_year) : "";
        cleanedReference.conference_name = !_.isUndefined(reference.conference_name) ? cleanItem(reference.conference_name) : "";
        cleanedReference.conference_acronym = !_.isUndefined(reference.conference_acronym) ? cleanItem(reference.conference_acronym) : "";
        cleanedReference.conference_place = !_.isUndefined(reference.conference_place) ? cleanItem(reference.conference_place) : "";
        cleanedReference.conference_year = !_.isUndefined(reference.conference_year) ? cleanItem(reference.conference_year) : "";
        cleanedReference.book_title = !_.isUndefined(reference.book_title) ? cleanItem(reference.book_title) : "";
        cleanedReference.book_isbn = !_.isUndefined(reference.book_isbn) ? cleanItem(reference.book_isbn) : "";
        cleanedReference.book_pages = !_.isUndefined(reference.book_pages) ? cleanItem(reference.book_pages) : "";
        cleanedReference.book_editor = !_.isUndefined(reference.book_editor) ? cleanItem(reference.book_editor) : "";
        cleanedReference.book_year = !_.isUndefined(reference.book_year) ? cleanItem(reference.book_year) : "";
        cleanedReference.abstract = !_.isUndefined(reference.abstract) ? cleanItem(reference.abstract) : "";
        cleanedReference.month = !_.isUndefined(reference.month) ? cleanItem(reference.month) : "";
        cleanedReference.print_status = !_.isUndefined(reference.print_status) ? cleanItem(reference.print_status) : "";
        cleanedReference.note = !_.isUndefined(reference.note) ? cleanItem(reference.note) : "";       
        cleanedReference.approving_status = !_.isUndefined(reference.approving_status) ? cleanItem(reference.approving_status) : "";
        cleanedReference.sharing_status = !_.isUndefined(reference.sharing_status) ? cleanItem(reference.sharing_status) : "";
            
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