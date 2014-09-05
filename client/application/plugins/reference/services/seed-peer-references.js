/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("reference").factory(
    "seedPeerReferencesService", function($http) {
        var seedPeerReferencesProvider = {};
        
        seedPeerReferencesProvider.getReferences = function(seedPeerIndex, keywords, token) {
            return $http({
				method: "GET",
				url: "/api/seed-peers/" + seedPeerIndex + "/public-references?keywords=" + keywords,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };        
        
        seedPeerReferencesProvider.getReference = function(seedPeerIndex, referenceId, token) {
            return $http({
				method: "GET",
				url: "/api/seed-peers/" + seedPeerIndex + "/public-references/" + referenceId,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };                              
        
        return seedPeerReferencesProvider;
    }    
);