/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("repository").factory(
    "activatedRepositoriesService", function($http) {
        var activatedRepositoriesProvider = {};
              
        activatedRepositoriesProvider.getActivatedRepository = function(token) {
            return $http({
				method: "GET",
				url: "/api/activated-repositories",
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        activatedRepositoriesProvider.setRepositoryAsActivated = function(id, token) {
            return $http({
				method: "PUT",
				url: "/api/activated-repositories/" + id,               
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };        
        
        return activatedRepositoriesProvider;
    }    
);