/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("reference").factory(
    "collectedReferencesService", function($http) {       
        var referencesProvider = {};
        
        referencesProvider.getReferences = function(keywords, token) {
            var params = {};
            if (keywords) {
                params.keywords = keywords;
            }
            return $http({
				method: "GET",
				url: "/api/collected-references",
                params: params,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };      
        
        return referencesProvider;
    }    
);