/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

// Resolves dependencies
var _ = require("lodash");

var model = require("../models/collected-references.js")();

// Defines actions
module.exports = function () {
    return {        
        getReferences: function(req, res) {
            var keywords = _.isUndefined(req.query.keywords) ? '' : req.query.keywords;
            var regexQuery = "^(?=.*(" + keywords.replace(" ", "))(?=.*(") + "))";
            req.collectedReferencesCollection.find({               
                "$or": [
                    {
                        title: { 
                            $regex: regexQuery,
                            $options: 'i'
                        }
                    },
                    {
                        authors: { 
                            $regex: regexQuery,
                            $options: 'i'
                        }
                    }
                ]
            }).sort({ creation_datetime: -1 }).toArray(function(err, references) {
                if (err || req.underscore.isNull(references)) {
                    res.status(404).end();
                    return;
                }
                res.setHeader("Content-Type", "application/json");
                res.json(references);
            });            
        },
    };
};
