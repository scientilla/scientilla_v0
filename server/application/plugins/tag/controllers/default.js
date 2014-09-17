/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var network = require("../../network/models/default.js")();
var model = require("../models/default.js")();

module.exports = function () {
    return {
        getTags: function(req, res) {
            var keywords = req.query.keywords;
            if (!req.underscore.isArray(keywords)) {
                keywords = [keywords];
            }
            network.getTags(req.seedsConfiguration, keywords, function(err, tags) {
                if (err) {
                    res.status(404).end();
                    return;
                }
            });
        }
    };
};