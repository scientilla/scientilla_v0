/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
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
                    out: { replace: 'tags' },
                    finalize: function(tag, count) {
                        if (!_.isArray(count)) {
                            count = [count];
                        }
                        var totalCount = count.length;
                        return {tag: tag, count: totalCount};
                    }
                },
                cb
            );
        },
        getTags: function(req, res) {
            var searchTerms = req.query.keywords || [];
            if (!_.isArray(searchTerms)) {
                searchTerms = [searchTerms];
            }
            var cleanedSearchTerms = _.map(searchTerms, function(t){return t.replace(/[^a-zA-Z.]/, '');});
            var regexTerms = _.map(cleanedSearchTerms, function(s) {return new RegExp(s, "i");});
            req.tagsCollection.find({
                /* tingodb bug? */
                // _id : {$in : regexTerms}
            })
                .sort({ "value.count": -1 })
                .toArray(function(err, tagsObj) {
                    if (err) {
                        console.log(err);
                        res.status(404).end();
                        return;
                    }
                    var filteredTagsObj = _.filter(
                            tagsObj, 
                            function(t) { 
                                return _.any(regexTerms, function(rt) {
                                    return rt.test(t._id);
                                });
                            });
                    var tags = _.pluck(filteredTagsObj, '_id');
                    res.json(tags);
                });
        }
    };
};
