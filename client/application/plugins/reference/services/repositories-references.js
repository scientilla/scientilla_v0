/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("reference").factory(
    "repositoryReferencesService", function($http) {
        var repositoryReferencesProvider = {};
        
        repositoryReferencesProvider.aReferences = [];
       
        repositoryReferencesProvider.getReferences = function(id, token, keywords) {
            var url = "/api/repositories/" + id + "/references";
            keywords = keywords || "";
            if (keywords !== "") {
                url+="?keywords="+encodeURIComponent(keywords);
            }
            return $http({
				method: "GET",
				url: url,
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