/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("setting").factory(
    "settingsService", function($http) {
        var settingsProvider = {};
        
        settingsProvider.updateExchangedInformation = function(data) {
            if (_.isEmpty(data)) {
                return;
            }
            if (data.peer_mode) {
                $window.sessionStorage.peerMode = data.peer_mode;
            }
        };
        
        settingsProvider.deleteExchangedInformation = function() {
            delete $window.sessionStorage.peerMode;
        };        
        
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
        
        settingsProvider.updateSettings = function(data, token) {
            return $http({
				method: "PUT",
				url: "/api/settings",
                data: data,
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