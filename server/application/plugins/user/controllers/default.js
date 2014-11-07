/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

// Resolves dependencies
var _ = require("lodash");
var crypto = require("crypto");
var path = require("path");

var model = require("../models/default.js")();
var configurationManager = require(path.resolve(__dirname + "/../../system/controllers/configuration.js"));
var userManager = require("../../user/models/default.js")();

// Defines actions
module.exports = function () {
    var getDefaultUser = function() {
        var user = {};
        user.type = 0;
        user.rights = 0;
        user.scientilla_nominative = "";
        user.first_name = "";
        user.middle_name = "";
        user.last_name = "";
        user.business_name = "";
        user.birth_date = "";
        user.birth_city = "";
        user.birth_state = "";
        user.birth_country = "";
        user.sex = "";
        user.email = "";
        user.username = "";
        user.hashes = [];
        return user;
    };
    
    var getUserAliases = function(user) {
        var firstLetter = function(string) {return string.charAt(0).toUpperCase();};
        var capitalize = function (str){
            return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        };
        var first_name = capitalize(user.first_name);
        var last_name = capitalize(user.last_name);
        var initial_first_name = firstLetter(first_name);
        
        var aliases = [];
        aliases.push(first_name + " " + last_name);
        aliases.push(last_name + " " + first_name);
        aliases.push(last_name + " " + initial_first_name + ".");
        aliases.push(initial_first_name + ". " + last_name + "");
        aliases = _.uniq(_.union(aliases, user.aliases));
        return aliases;
    };
    
    var getFullUser = function(user){
        var fullUser = _.defaults(user, getDefaultUser());
        if (_.isEmpty(fullUser.hashes)) {
            fullUser.hashes = [fullUser.hash];
        }
        return fullUser;
    };
    
    var getUserHash = function(user) {
        switch (user.type) {
            case 0:
            case 1:
                return crypto.createHash("sha256").update(
                    (
                        user.first_name + ", " +
                        user.middle_name + ", " +
                        user.last_name + ", " +
                        user.birth_date + ", " +
                        user.birth_city + ", " +
                        user.birth_state + ", " +
                        user.birth_country + ", " +
                        user.sex
                    ).trim()
                ).digest("hex");
                break;
            case 2:
                return crypto.createHash("sha256").update(
                    (
                        user.business_name
                    ).trim()
                ).digest("hex");                    
                break;
        }
    };
    
    return {
        getUsers: function(req, res) {
            req.usersCollection.find({}).sort({ creation_datetime: -1 }).toArray(function(err, users) {
                if (err || req.underscore.isNull(users)) {
                    res.status(404).end();
                    return;
                }
                
                res.setHeader("Content-Type", "application/json");
                res.json(users);
            });
        },
        getPublicUsers: function(req, res) {
            var datetime = _.isUndefined(req.query.datetime) ? '' : req.query.datetime;
            req.usersCollection.find({
                status: "U",
                last_modification_datetime: {
                    $gt: datetime
                }                
            }, {
                _id: 0,
                type: 1,
                rights: 0,
                scientilla_nominative: 1,
                first_name: 1,
                middle_name: 1,
                last_name: 1,
                business_name: 1,
                birth_date: 1,
                birth_city: 1,
                birth_state: 1,
                birth_country: 1,
                sex: 1,
                email: 0,
                username: 0,
                password: 0,
                status: 0,
                hash: 1,
                hashes: 1,
                aliases: 1,
                creator_id: 0,
                creation_datetime: 1,
                last_modifier_id: 0,
                last_modification_datetime: 1
            }).sort({ creation_datetime: -1 }).toArray(function(err, publicUsers) {
                if (err || req.underscore.isNull(publicUsers)) {
                    res.status(404).end();
                    return;
                }
                res.setHeader("Content-Type", "application/json");
                res.json(publicUsers);
            });            
        },
        getUser: function(req, res) {
            req.usersCollection.findOne({ _id: req.params.id }, function(err, user) {
                if (err || req.underscore.isNull(user)) {
                    res.status(404).end();
                    return;
                }
                
                res.setHeader("Content-Type", "application/json");
                res.json(user);
            });                
        },
        getLoggedUser: function(req, res) {
            req.usersCollection.findOne({ _id: req.user.id }, function(err, user) {
                if (err || req.underscore.isNull(user)) {
                    res.status(404).end();
                    return;
                }
                
                res.setHeader("Content-Type", "application/json");
                res.json(user);
            });                
        },        
        createUser: function(req, res) {
            var user = {};
            user.type = !req.underscore.isUndefined(req.body.type) ? req.body.type : "";
            user.rights = !req.underscore.isUndefined(req.body.rights) ? req.body.rights : "";
            user.scientilla_nominative = !req.underscore.isUndefined(req.body.scientilla_nominative) ? req.body.scientilla_nominative.trim() : "";
            user.first_name = !req.underscore.isUndefined(req.body.first_name) ? req.body.first_name.trim() : "";
            user.middle_name = !req.underscore.isUndefined(req.body.middle_name) ? req.body.middle_name.trim() : "";
            user.last_name = !req.underscore.isUndefined(req.body.last_name) ? req.body.last_name.trim() : "";
            user.business_name = !req.underscore.isUndefined(req.body.business_name) ? req.body.business_name.trim() : "";
            user.birth_date = !req.underscore.isUndefined(req.body.birth_date) ? req.body.birth_date.trim() : "";
            user.birth_city = !req.underscore.isUndefined(req.body.birth_city) ? req.body.birth_city.trim() : "";
            user.birth_state = !req.underscore.isUndefined(req.body.birth_state) ? req.body.birth_state.trim() : "";
            user.birth_country = !req.underscore.isUndefined(req.body.birth_country) ? req.body.birth_country.trim() : "";
            user.sex = !req.underscore.isUndefined(req.body.sex) ? req.body.sex.trim() : "";
            user.email = !req.underscore.isUndefined(req.body.email) ? req.body.email.trim() : "";
            user.username = !req.underscore.isUndefined(req.body.username) ? req.body.username.trim() : "";
            var passwordToEncrypt = !req.underscore.isUndefined(req.body.password) ? req.body.password.trim() : "";
            var encryptionSalt = req.bcryptNodejs.genSaltSync();
            var encryptedPassword = req.bcryptNodejs.hashSync(passwordToEncrypt);
            user.password = encryptedPassword;
            user.status = !req.underscore.isUndefined(req.body.status) ? req.body.status.trim() : "";
            user.hash = getUserHash(user);
            user.hashes = [user.hash];
            user.aliases = getUserAliases(user);
            user.creator_id = req.user.id;
            user.creation_datetime = req.moment().format();
            user.last_modifier_id = req.user.id;
            user.last_modification_datetime = req.moment().format();            
            req.usersCollection.insert(user, {w:1}, function(err, user) {
                if (err || req.underscore.isNull(user)) {
                    res.status(404).end();
                    return;
                }
                
                res.end();
            });
        },
        updateUser: function(req, res) { 
            req.usersCollection.findOne({ _id: req.params.id }, function(err, user) {
                if (err || req.underscore.isNull(user)) {
                    console.log(err);
                    res.status(500).end();
                    return;
                }
                user.type = !req.underscore.isUndefined(req.body.type) ? req.body.type : "";
                user.rights = !req.underscore.isUndefined(req.body.rights) ? req.body.rights : "";
                user.scientilla_nominative = !req.underscore.isUndefined(req.body.scientilla_nominative) ? req.body.scientilla_nominative.trim() : "";
                user.first_name = !req.underscore.isUndefined(req.body.first_name) ? req.body.first_name.trim() : "";
                user.middle_name = !req.underscore.isUndefined(req.body.middle_name) ? req.body.middle_name.trim() : "";
                user.last_name = !req.underscore.isUndefined(req.body.last_name) ? req.body.last_name.trim() : "";
                user.business_name = !req.underscore.isUndefined(req.body.business_name) ? req.body.business_name.trim() : "";
                user.birth_date = !req.underscore.isUndefined(req.body.birth_date) ? req.body.birth_date.trim() : "";
                user.birth_city = !req.underscore.isUndefined(req.body.birth_city) ? req.body.birth_city.trim() : "";
                user.birth_state = !req.underscore.isUndefined(req.body.birth_state) ? req.body.birth_state.trim() : "";
                user.birth_country = !req.underscore.isUndefined(req.body.birth_country) ? req.body.birth_country.trim() : "";
                user.sex = !req.underscore.isUndefined(req.body.sex) ? req.body.sex.trim() : "";
                user.email = !req.underscore.isUndefined(req.body.email) ? req.body.email.trim() : "";
                user.username = !req.underscore.isUndefined(req.body.username) ? req.body.username.trim() : "";
                var passwordToEncrypt = !req.underscore.isUndefined(req.body.password) ? req.body.password.trim() : "";
                if (passwordToEncrypt != "") {
                    var encryptionSalt = req.bcryptNodejs.genSaltSync();
                    var encryptedPassword = req.bcryptNodejs.hashSync(passwordToEncrypt);
                    user.password = encryptedPassword;
                }
                user.status = !req.underscore.isUndefined(req.body.status) ? req.body.status.trim() : "";          
                user.hash = getUserHash(user);
                if (_.isUndefined(user.hashes)) {
                    user.hashes = [];
                }
                if (!_.contains(user.hashes, user.hash)) {
                    user.hashes.push(user.hash);
                }
                user.aliases = getUserAliases(user);
                user.last_modifier_id = req.user.id;
                user.last_modification_datetime = req.moment().format();                
                req.usersCollection.update({ _id: req.params.id }, { $set: user }, {w: 1}, function(err, user) {
                    if (err || req.underscore.isNull(user)) {
                        console.log(err);
                        res.status(404).end();
                        return;
                    }
                    res.end();
                });
            });
        },
        updateLoggedUser: function(req, res) { 
            req.usersCollection.findOne({ _id: req.user.id }, function(err, user) {
                if (err || req.underscore.isNull(user)) {
                    console.log(err);
                    res.status(500).end();
                    return;
                }
                user.type = !req.underscore.isUndefined(req.body.type) ? req.body.type : "";
                user.rights = !req.underscore.isUndefined(req.body.rights) ? req.body.rights : "";
                user.scientilla_nominative = !req.underscore.isUndefined(req.body.scientilla_nominative) ? req.body.scientilla_nominative.trim() : "";
                user.first_name = !req.underscore.isUndefined(req.body.first_name) ? req.body.first_name.trim() : "";
                user.middle_name = !req.underscore.isUndefined(req.body.middle_name) ? req.body.middle_name.trim() : "";
                user.last_name = !req.underscore.isUndefined(req.body.last_name) ? req.body.last_name.trim() : "";
                user.business_name = !req.underscore.isUndefined(req.body.business_name) ? req.body.business_name.trim() : "";
                user.birth_date = !req.underscore.isUndefined(req.body.birth_date) ? req.body.birth_date.trim() : "";
                user.birth_city = !req.underscore.isUndefined(req.body.birth_city) ? req.body.birth_city.trim() : "";
                user.birth_state = !req.underscore.isUndefined(req.body.birth_state) ? req.body.birth_state.trim() : "";
                user.birth_country = !req.underscore.isUndefined(req.body.birth_country) ? req.body.birth_country.trim() : "";
                user.sex = !req.underscore.isUndefined(req.body.sex) ? req.body.sex.trim() : "";
                user.email = !req.underscore.isUndefined(req.body.email) ? req.body.email.trim() : "";
                user.username = !req.underscore.isUndefined(req.body.username) ? req.body.username.trim() : "";
                var passwordToEncrypt = !req.underscore.isUndefined(req.body.password) ? req.body.password.trim() : "";
                if (passwordToEncrypt != "") {
                    var encryptionSalt = req.bcryptNodejs.genSaltSync();
                    var encryptedPassword = req.bcryptNodejs.hashSync(passwordToEncrypt);
                    user.password = encryptedPassword;
                }
                user.status = !req.underscore.isUndefined(req.body.status) ? req.body.status.trim() : "";         
                user.hash = getUserHash(user);
                if (_.isUndefined(user.hashes)) {
                    user.hashes = [];
                }
                if (!_.contains(user.hashes, user.hash)) {
                    user.hashes.push(user.hash);
                }
                user.aliases = getUserAliases(user);
                user.last_modifier_id = req.user.id;
                user.last_modification_datetime = req.moment().format();                
                req.usersCollection.update({ _id: req.user.id }, { $set: user }, {w: 1}, function(err, user) {
                    if (err || req.underscore.isNull(user)) {
                        console.log(err);
                        res.status(404).end();
                        return;
                    }

                    res.end();
                });
            });
        },        
        loginUser: function(req, res){
            var installationConfiguration = configurationManager.get();
            req.usersCollection.find({}).toArray(function(err, users) {
                if (err || req.underscore.isNull(users)) {
                    var errorMsg = "Error while checking for users";
                    console.log(errorMsg);
                    res.status(500).end();
                    return;
                }		
                if (users.length === 0) {
                    console.log("Needed to Create the Default User");
                    var user = {};
                    user.type = 0;
                    user.rights = 0;
                    user.scientilla_nominative = "";
                    user.first_name = "";
                    user.middle_name = "";
                    user.last_name = "";
                    user.business_name = "";
                    user.birth_date = "";
                    user.birth_city = "";
                    user.birth_state = "";
                    user.birth_country = "";
                    user.sex = "";
                    user.email = "";
                    user.username = "";
                    var passwordToEncrypt = "";
                    var encryptionSalt = req.bcryptNodejs.genSaltSync();
                    var encryptedPassword = req.bcryptNodejs.hashSync(passwordToEncrypt);
                    user.password = encryptedPassword;
                    user.status = "U";
                    user.hash = getUserHash(user);
                    user.hashes = [user.hash];
                    user.aliases = getUserAliases(user);
                    req.usersCollection.insert(user, { w: 1 }, function(err, users) {
                        if (err || req.underscore.isNull(users)) {
                            var errorMsg = "Failed to Create the Default User";
                            console.log(errorMsg);
                            res.status(500).end();
                            return;
                        }
                        var user = users[0];
                        installationConfiguration.owner_user_id = user._id;
                        req.fs.writeFile("./configuration/installation.json", JSON.stringify(installationConfiguration, null, 4), function(err) {
                            if (err) {
                                console.log(err);
                                res.status(500).end();
                                return;
                            }
                            var userDataForToken = {
                                first_name: user.first_name,
                                middle_name: user.middle_name,
                                last_name: user.last_name,
                                business_name: user.business_name,
                                email: user.email,
                                hash: user.hash,
                                id: user._id,
                                hashes: user.hashes,
                                aliases: user.aliases
                            };

                            var token = req.jsonWebToken.sign(userDataForToken, "scientilla", { expiresInMinutes: 60 });

                            res.setHeader("Content-Type", "application/json");
                            res.json({
                                token: token,
                                user_type: user.type,
                                user_rights: user.rights,
                                user_scientilla_nominative: user.scientilla_nominative
                            });
                            return;
                        }); 
                    });								
                } else {
                    req.async.waterfall([
                        function(callback) {
                            req.usersCollection.findOne({ username: req.body.username }, function(err, user) {
                                if (err || req.underscore.isNull(user)) {
                                    callback(new Error('user not found'));
                                    return;
                                }
                                if (!req.bcryptNodejs.compareSync(req.body.password, user.password)) {
                                    callback(new Error('wrong password'));
                                    return;                            
                                }
                                user = getFullUser(user);
                                callback(null, user);
                            });
                        },
                        function(user, callback) {
                            userManager.getUser(req.usersCollection, installationConfiguration.owner_user_id, function(err, owner) {
                                if (err) {
                                    callback(err);
                                    return;
                                }
                                owner = getFullUser(owner);
                                callback(null, user, owner);
                            });

                        }],
                        function(err, user, owner) {
                            if (err) {
                                console.log(err);
                                res.status(500).end();
                                return;
                            }
                            var hash = user.rights === 1 ? owner.hash : user.hash;
                            var hashes = user.rights === 1 ? owner.hashes : user.hashes;
                            var userDataForToken = {
                                first_name: user.first_name,
                                middle_name: user.middle_name,
                                last_name: user.last_name,
                                business_name: user.business_name,
                                email: user.email,
                                hash: hash,
                                id: user._id,
                                hashes: hashes,
                                aliases: user.aliases
                            };

                            var token = req.jsonWebToken.sign(userDataForToken, "scientilla", { expiresInMinutes: 60 });

                            res.setHeader("Content-Type", "application/json");
                            res.json({
                                token: token,
                                user_type: user.type,
                                user_rights: user.rights,
                                user_scientilla_nominative: user.scientilla_nominative,
                                peer_mode: installationConfiguration.seed,
                            });
                        }
                    );					
                }
            });
        }
    };
};