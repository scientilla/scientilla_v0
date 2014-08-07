/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/master/LICENSE)
 */

angular.module("system").factory(
    "systemStatusService", function($location) {
        var systemAuthenticationProvider = {};
        
        systemAuthenticationProvider.react = function(status, callback) {
            switch (status) {
                case 401:
                    $location.path("login");
                    break;
                    
                case 404:
                    if (callback) {
                        callback();
                    }
                    break;
                    
                case 500:
                    $location.path("edit-user");
                    break;
            }
        };        
        
        return systemAuthenticationProvider;
    }    
);