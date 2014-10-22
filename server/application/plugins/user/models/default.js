/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var _ = require("lodash");

module.exports = function () {
    return {
        addReferenceAliases : function(usersCollection, user, reference, callback) {
            this.getUser(usersCollection, user.id, function(err, user) {
                if (err) {
                    callback(err, null);
                    return;
                }
                var aliases = user.aliases || [];
                if (reference.user_hash !== user.hash) {
                    callback(new Error('different hashes'), user);
                    return;
                }
                if ( _.isUndefined(reference.author_signatures) || 
                     _.isNull(reference.author_signatures) ||
                     _.isUndefined(reference.author_signatures.author_string) || 
                     _.isNull(reference.author_signatures.author_string)) {

                    callback(null, user);
                    return;
                }
                if (!_.contains(aliases, reference.author_signatures.author_string)) {
                    aliases.push(reference.author_signatures.author_string);
                }
                usersCollection.findAndModify({_id: user._id}, {}, {$set: {aliases: aliases}}, callback);
            });
        },
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