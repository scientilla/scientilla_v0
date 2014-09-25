/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var _ = require("lodash");

module.exports = function () {
    return {
       getUser: function(usersCollection, userId, callback) {
            usersCollection.findOne({ _id: userId }, function(err, user) {
                if (err) {
                    callback(err, null);
                    return;
                }
                if (_.isNull(user)) {
                    callback(new Error('No user found'), null);
                }
                
                callback(null, user);
            });                
        }
    };
};