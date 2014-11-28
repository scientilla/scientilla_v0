/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

// Resolves dependencies
var path = require("path");

var configurationManager = require(path.resolve(__dirname + "/../../system/controllers/configuration.js"));

var model = require("../models/default.js")();

// Defines actions
module.exports = function () {
    return {
        getSettings: function(req, res) {
            res.setHeader("Content-Type", "application/json");
            res.json(configurationManager.get());           
        },
        
        updateSettings: function(req, res) {
            var settings = {};
            settings.port = !req.underscore.isUndefined(req.body.port) ? ('' + req.body.port).trim() : 443;      
            settings.ssl_key_path = !req.underscore.isUndefined(req.body.ssl_key_path) ? ('' + req.body.ssl_key_path).trim() : '';
            settings.ssl_cert_path = !req.underscore.isUndefined(req.body.ssl_cert_path) ? ('' + req.body.ssl_cert_path).trim() : '';
            settings.name = !req.underscore.isUndefined(req.body.name) ? ('' + req.body.name).trim() : ''; 
            settings.url = !req.underscore.isUndefined(req.body.url) ? ('' + req.body.url).trim() : '';
            settings.owner_user_id = !req.underscore.isUndefined(req.body.owner_user_id) ? ('' + req.body.owner_user_id).trim() : '';
            settings.seed = !req.underscore.isUndefined(req.body.seed) ? req.body.seed : false;
            configurationManager.set(settings);
            configurationManager.save();
            configurationManager.reload();
            res.end();
        }        
    };
};