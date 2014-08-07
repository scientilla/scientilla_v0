/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/master/LICENSE)
 */

angular.module("reference").factory(
    "peerReferencesService", function($http) {
        var peerReferencesProvider = {};
        
        peerReferencesProvider.getReferences = function(id, token) {
            return $http({
				method: "GET",
				url: "/api/peers/" + id + "/public-references",
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };        
        
        peerReferencesProvider.getReference = function(peerId, referenceId, token) {
            return $http({
				method: "GET",
				url: "/api/peers/" + peerId + "/public-references/" + referenceId,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };                              
        
        return peerReferencesProvider;
    }    
);