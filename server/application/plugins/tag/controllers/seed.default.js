/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var model = require("../models/default.js")();
var _ = require("lodash");

module.exports = function () {
    var tags = [
        'health.surgery.robotics',
        'engineering.robotics.artificial intelligence'
    ];
    return {
        extractTags: function(collectedReferencesCollection, cb) {
            collectedReferencesCollection.mapReduce(
                function() { 
                    _.forEach(this.tags, function(t) {emit(t, 1); }); 
                },
                function(tag, count) {
                    return count;
                },
                {
                    query: {tags: { $exists: true }},
                    out: { replace: 'tags.db' },
                    finalize: function(tag, count) {
                        if (!_.isArray(count)) {
                            count = [count];
                        }
                        var totalCount = count.length;
                        return {tag: tag, count: totalCount};
                    }
                }
            );
            if (_.isFunction(cb)) {
                cb();
            }
        },
        getTags: function(req, res) {
            var searchTerms = req.query.keywords || [];
            if (!_.isArray(searchTerms)) {
                searchTerms = [searchTerms];
            }
            var cleanedSearchTerms = _.map(searchTerms, function(t){return t.replace(/[^a-zA-Z.]/, '');});
            var regexTerms = _.map(cleanedSearchTerms, function(s) {return new RegExp(s, "i");});
            req.tagsCollection.find({
                _id : {$in : regexTerms}
            })
                .sort({ "value.count": -1 })
                .toArray(function(err, tagsObj) {
                    if (err) {
                        console.log(err);
                        res.status(404).end();
                        return;
                    }
                    var tags = _.pluck(tagsObj, '_id');
                    res.json(tags);
                });
        }
    };
};