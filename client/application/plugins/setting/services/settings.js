/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("setting").factory(
    "settingsService", function($http, $window) {
        var settingsProvider = {};
        
        settingsProvider.updateExchangedInformation = function(data, callback) {
            if (_.isEmpty(data)) {
                return;
            }
            if (data.peer_mode) {
                $window.sessionStorage.peerMode = data.peer_mode;
            }
            if (data.url) {
                $window.sessionStorage.url = data.url;
            }
            callback();
        };
        
        settingsProvider.deleteExchangedInformation = function(callback) {
            delete $window.sessionStorage.peerMode;
            callback();
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