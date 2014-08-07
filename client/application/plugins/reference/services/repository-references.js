/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/master/LICENSE)
 */

angular.module("reference").factory(
    "repositoryReferencesService", function($http) {
        var repositoryReferencesProvider = {};
        
        repositoryReferencesProvider.aReferences = [];
       
        repositoryReferencesProvider.getReferences = function(id, token) {
            return $http({
				method: "GET",
				url: "/api/repositories/" + id + "/references",
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        }; 
        
        repositoryReferencesProvider.getReference = function(referenceIndex) {   
            return repositoryReferencesProvider.aReferences[referenceIndex];
        };        
        
        return repositoryReferencesProvider;
    }    
);