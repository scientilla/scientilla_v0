/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("setting").factory(
    "settingsService", function($http) {
        var settingsProvider = {};
        
        settingsProvider.getSettings = function(token) {
            return $http({
				method: "GET",
				url: "/api/settings",
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        return settingsProvider;
    }    
);