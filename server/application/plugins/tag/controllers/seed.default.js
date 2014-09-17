/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var model = require("../models/default.js")();

module.exports = function () {
    var tags = [
        'health.surgery.robotics',
        'engineering.robotics.artificial intelligence'
    ];
    return {
        getTags: function(req, res) {
            var searchTerms = req.query.keywords || [];
            if (!req.underscore.isArray(searchTerms)) {
                searchTerms = [searchTerms];
            }
            var cleanedSearchTerms = req.underscore.map(searchTerms, function(t){return t.replace(/[^a-zA-Z]/, '');});
            var searchRegex = new RegExp('(' + cleanedSearchTerms.join(').*?(') + ')');
            var filteredTags = req.underscore.filter(
                    tags, 
                    function(t) {
                        return searchRegex.test(t);
                });
            res.json(filteredTags);
        }
    };
};