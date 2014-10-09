/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var referenceManager = require("../../reference/models/default.js")();
var model = require("../models/repository-references.js")();
var _ = require("underscore");
var crypto = require("crypto");

module.exports = function () {
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
                    json: true 
                }, function (error, response, repositoryReferences) {
                    if (error) {
                        res.status(404).end();
                        return;
                    }
                    referenceManager.getVerifiedReferences(
                        req.referencesCollection,
                        req.user.hashes,
                        repositoryReferences, 
                        repository,
                        function (err, verifiedReferences) {
                            if (err) {
                                res.status(404).end();
                                return;
                            }
                            res.setHeader("Content-Type", "application/json");
                            res.status(200).send(verifiedReferences).end();
                        }
                    );
                });
            });            
        }
    };
};