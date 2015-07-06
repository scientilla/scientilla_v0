/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

var _ = require("lodash");
var mongodb = require("mongodb");
var path = require("path");

var identificationManager = require(path.resolve(__dirname + "/../../system/controllers/identification.js"));

module.exports = function () {
    var createNewUser = function(user) {
        var newUserFields = [
            "type",
            "scientilla_nominative",
            "first_name",
            "middle_name",
            "last_name",
            "business_name",
            "birth_date",
            "birth_city",
            "birth_state",
            "birth_country",
            "sex",
            "hash",
            "hashes",
            "aliases",
            "creation_datetime",
            "last_modification_datetime"
        ];
        
        return buildUser(user, newUserFields);
    };
    
    var buildUser = function(user, userFields) {
        var getCleanProperty = function(user, field) {
            var cleanItem = function(item) {
                if (typeof item === "string") {
                    return item.trim();
                }
                return item;
            };
            return (_.isUndefined(user[field]) || _.isNull(user[field])) ? "" : cleanItem(user[field]);
        };
           
        var cleanedUser = {};
        
        userFields.forEach(function(field) {
            cleanedUser[field] = getCleanProperty(user, field);
        });
        
        return cleanedUser;
    };    
    
    return {
        createNewUser: createNewUser,
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
                usersCollection.findAndModify({_id: identificationManager.getDatabaseSpecificId(user._id)}, {}, {$set: {aliases: aliases}}, callback);
            });
        },
        getUser: function(usersCollection, userId, callback) {
            usersCollection.findOne({_id: identificationManager.getDatabaseSpecificId(userId)}, function(err, user) {
                if (err) {
                    callback(err, null);
                    return;
                }
                if (_.isNull(user)) {
                    callback(new Error('No user found'), null);
                    return;
                }
                
                callback(null, user);
            });                
        }
    };
};