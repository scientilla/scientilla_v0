/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

// Resolves dependencies
var mongodb = require("mongodb");

var identificationManager = function identificationManager() {      
    this.getDatabaseSpecificId = function(id) {
        return id.length === 24 ? new mongodb.ObjectID(id) : id;
    };    

    if (identificationManager.caller != identificationManager.getInstance) {
        throw new Error("This object cannot be instantiated");
    }
};

identificationManager.instance = null;
 
identificationManager.getInstance = function() {
    if (this.instance === null) {
        this.instance = new identificationManager();
    }
    return this.instance;
};
 
module.exports = identificationManager.getInstance();