/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var model = require("../models/repository-references.js")();

module.exports = function () {
    return {        
        getRepositoryReferences: function(req, res) {
            req.repositoriesCollection.findOne({ _id: req.params.id }, function(err, repository) {
                if (err || req.underscore.isNull(repository)) {
                    res.status(404).end();
                    return;
                }
                var keywordsEncoded = req.underscore.isUndefined(req.query.keywords) 
                                        ? encodeURIComponent(repository.keywords)
                                        : req.query.keywords;
                var url =  repository.url.replace('{{keywords}}', keywordsEncoded);
                url =  url.replace('{{rows}}', repository.rows);
                req.request({ 
                    url: url, 
                    strictSSL: false 
                }, function (error, response, body) {
                    if (error) {
                        res.status(404).end();
                        return;
                    }
                    res.setHeader("Content-Type", "application/json");
                    res.status(200).send(body).end();
                });
            });            
        }
    };
};