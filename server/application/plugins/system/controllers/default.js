/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var model = require("../models/default.js")();

module.exports = function () {
    return {
        checkUserCoherence: function(req, res) {
            req.usersCollection.findOne({ _id: req.user.id }, function(err, user) {
                if (err || req.underscore.isNull(user)) {
                    res.status(401).end();
                    console.log('Unauthorized user');
                    return;
                } 
                if (
                    req.underscore.isEmpty(user.type) ||
                    (user.type === "1" && req.underscore.isEmpty(user.first_name)) ||
                    (user.type === "1" && req.underscore.isEmpty(user.middle_name)) ||
                    (user.type === "1" && req.underscore.isEmpty(user.last_name)) ||
                    (user.type === "2" && req.underscore.isEmpty(user.business_name)) ||
                    (user.type === "1" && req.underscore.isEmpty(user.birth_date)) ||
                    (user.type === "1" && req.underscore.isEmpty(user.birth_city)) ||
                    (user.type === "1" && req.underscore.isEmpty(user.birth_state)) ||
                    (user.type === "1" && req.underscore.isEmpty(user.birth_country)) ||
                    (user.type === "1" && req.underscore.isEmpty(user.sex))
                ) {
                    res.status(500).end();
                    console.log('Unvalid User Type or User Information');
                }
            });
        } 
    };
};