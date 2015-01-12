/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

// Resolves dependencies
var fs = require("fs");
var path = require("path");

var configurationManager = function configurationManager() {
    var configurationFilePath = path.resolve(__dirname + "/../../../../configuration/installation.json");
    
    var configurationData = {};
 
    this.load = function() {
        configurationData = JSON.parse(fs.readFileSync(configurationFilePath, { encoding: "utf8" }));
    };
    
    this.reload = function() {
        this.load();
    }
    
    this.save = function() {
        fs.writeFileSync(configurationFilePath, JSON.stringify(configurationData, null, 4), { encoding: "utf8" });
    };    
    
    this.get = function() {
        return configurationData;
    };
    
    this.set = function(newConfigurationData) {
        configurationData = newConfigurationData;
    };    

    if (configurationManager.caller != configurationManager.getInstance) {
        throw new Error("This object cannot be instantiated");
    }
};

configurationManager.instance = null;
 
configurationManager.getInstance = function() {
    if (this.instance === null) {
        this.instance = new configurationManager();
        this.instance.load();
    }
    return this.instance;
};
 
module.exports = configurationManager.getInstance();