/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var model = require("../models/default.js")();

var _ = require("lodash");

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
                    _.isNull(user.type) ||
                    (user.type === 0 && _.isEmpty(user.first_name)) ||
                    (user.type === 0 && _.isEmpty(user.middle_name)) ||
                    (user.type === 0 && _.isEmpty(user.last_name)) ||
                    (user.type === 0 && _.isEmpty(user.birth_date)) ||
                    (user.type === 0 && _.isEmpty(user.birth_city)) ||
                    (user.type === 0 && _.isEmpty(user.birth_state)) ||
                    (user.type === 0 && _.isEmpty(user.birth_country)) ||
                    (user.type === 0 && _.isEmpty(user.sex)) || 
                    (user.type === 1 && _.isEmpty(user.first_name)) ||
                    (user.type === 1 && _.isEmpty(user.middle_name)) ||
                    (user.type === 1 && _.isEmpty(user.last_name)) ||
                    (user.type === 1 && _.isEmpty(user.birth_date)) ||
                    (user.type === 1 && _.isEmpty(user.birth_city)) ||
                    (user.type === 1 && _.isEmpty(user.birth_state)) ||
                    (user.type === 1 && _.isEmpty(user.birth_country)) ||
                    (user.type === 1 && _.isEmpty(user.sex)) || 
                    (user.type === 2 && _.isEmpty(user.business_name))
                ) {
                    res.status(500).end();
                    console.log('Unvalid User Type or User Information');
                }
            });
        } 
    };
};