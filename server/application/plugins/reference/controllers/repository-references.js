/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var model = require("../models/repository-references.js")();

module.exports = function () {
    var createReference = function(_, reference) {
        var cleanedReference = {};
        
        !_.isUndefined(reference.title) ? cleanedReference.title = reference.title.trim() : cleanedReference.title = "";            
        !_.isUndefined(reference.authors) ? cleanedReference.authors = reference.authors.trim() : cleanedReference.authors = "";
        !_.isUndefined(reference.organizations) ? cleanedReference.organizations = reference.organizations.trim() : cleanedReference.organizations = "";
        !_.isUndefined(reference.tags) ? cleanedReference.tags = reference.tags.trim() : cleanedReference.tags = "";            
        !_.isUndefined(reference.year) ? cleanedReference.year = reference.year.trim() : cleanedReference.year = "";
        !_.isUndefined(reference.doi) ? cleanedReference.doi = reference.doi.trim() : cleanedReference.doi = "";    
        !_.isUndefined(reference.journal_name) ? cleanedReference.journal_name = reference.journal_name.trim() : cleanedReference.journal_name = "";
        !_.isUndefined(reference.journal_acronym) ? cleanedReference.journal_acronym = reference.journal_acronym.trim() : cleanedReference.journal_acronym = "";
        !_.isUndefined(reference.journal_pissn) ? cleanedReference.journal_pissn = reference.journal_pissn.trim() : cleanedReference.journal_pissn = "";
        !_.isUndefined(reference.journal_eissn) ? cleanedReference.journal_eissn = reference.journal_eissn.trim() : cleanedReference.journal_eissn = "";
        !_.isUndefined(reference.journal_issnl) ? cleanedReference.journal_issnl = reference.journal_issnl.trim() : cleanedReference.journal_issnl = "";
        !_.isUndefined(reference.journal_volume) ? cleanedReference.journal_volume = reference.journal_volume.trim() : cleanedReference.journal_volume = "";
        !_.isUndefined(reference.journal_year) ? cleanedReference.journal_year = reference.journal_year.trim() : cleanedReference.journal_year = "";
        !_.isUndefined(reference.conference_name) ? cleanedReference.conference_name = reference.conference_name.trim() : cleanedReference.conference_name = "";
        !_.isUndefined(reference.conference_acronym) ? cleanedReference.conference_acronym = reference.conference_acronym.trim() : cleanedReference.conference_acronym = "";
        !_.isUndefined(reference.conference_place) ? cleanedReference.conference_place = reference.conference_place.trim() : cleanedReference.conference_place = "";
        !_.isUndefined(reference.conference_year) ? cleanedReference.conference_year = reference.conference_year.trim() : cleanedReference.conference_year = "";
        !_.isUndefined(reference.book_title) ? cleanedReference.book_title = reference.book_title.trim() : cleanedReference.book_title = "";
        !_.isUndefined(reference.book_isbn) ? cleanedReference.book_isbn = reference.book_isbn.trim() : cleanedReference.book_isbn = "";
        !_.isUndefined(reference.book_pages) ? cleanedReference.book_pages = reference.book_pages.trim() : cleanedReference.book_pages = "";
        !_.isUndefined(reference.book_editor) ? cleanedReference.book_editor = reference.book_editor.trim() : cleanedReference.book_editor = "";
        !_.isUndefined(reference.book_year) ? cleanedReference.book_year = reference.book_year.trim() : cleanedReference.book_year = "";
        !_.isUndefined(reference.abstract) ? cleanedReference.abstract = reference.abstract.trim() : cleanedReference.abstract = "";
        !_.isUndefined(reference.month) ? cleanedReference.month = reference.month.trim() : cleanedReference.month = "";
        !_.isUndefined(reference.print_status) ? cleanedReference.print_status = reference.print_status.trim() : cleanedReference.print_status = "";
        !_.isUndefined(reference.note) ? cleanedReference.note = reference.note.trim() : cleanedReference.note = "";       
        !_.isUndefined(reference.approving_status) ? cleanedReference.approving_status = reference.approving_status : cleanedReference.approving_status = "";
        !_.isUndefined(reference.sharing_status) ? cleanedReference.sharing_status = reference.sharing_status : cleanedReference.sharing_status = "";
            
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