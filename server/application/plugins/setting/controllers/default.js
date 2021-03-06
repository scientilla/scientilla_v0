/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
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
            // res.setHeader("Content-Type", "application/json");
            res.json(configurationManager.get());           
        },
        
        updateSettings: function(req, res) {
            var settings = {};
            settings.port = !req.underscore.isUndefined(req.body.port) ? ('' + req.body.port).trim() : 443;      
            settings.ssl_key_path = !req.underscore.isUndefined(req.body.ssl_key_path) ? ('' + req.body.ssl_key_path).trim() : '';
            settings.ssl_cert_path = !req.underscore.isUndefined(req.body.ssl_cert_path) ? ('' + req.body.ssl_cert_path).trim() : '';
            settings.name = !req.underscore.isUndefined(req.body.name) ? ('' + req.body.name).trim() : ''; 
            settings.url = !req.underscore.isUndefined(req.body.url) ? ('' + req.body.url).trim() : '';
            settings.secret = !req.underscore.isUndefined(req.body.secret) ? ('' + req.body.secret).trim() : 'scientilla';
            settings.owner_user_id = !req.underscore.isUndefined(req.body.owner_user_id) ? ('' + req.body.owner_user_id).trim() : '';
            settings.mode = !req.underscore.isUndefined(req.body.mode) ? req.body.mode : false;
            settings.files_routing = !req.underscore.isUndefined(req.body.files_routing) ? req.body.files_routing : false;
            settings.database_type = !req.underscore.isUndefined(req.body.database_type) ? req.body.database_type : "tingodb";
            settings.database_host = !req.underscore.isUndefined(req.body.database_host) ? req.body.database_host : "localhost";
            settings.database_port = !req.underscore.isUndefined(req.body.database_port) ? req.body.database_port : 27017;
            configurationManager.set(settings);
            configurationManager.save();
            configurationManager.reload();
            res.end();
        }        
    };
};