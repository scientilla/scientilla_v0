/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("repository").factory(
    "peerRepositoriesService", function($http) {
        var peerRepositoriesProvider = {};
        
        peerRepositoriesProvider.getRepositories = function(peerUrl) {
            return $http({
				method: "GET",
				url: peerUrl + "/api/public-repositories",
                cache: false,
                timeout: 30000
			});
        };                              
        
        return peerRepositoriesProvider;
    }    
);