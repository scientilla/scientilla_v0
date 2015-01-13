/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("reference").factory(
    "peerReferencesService", function($http) {
        var peerReferencesProvider = {};
        
        peerReferencesProvider.getReferences = function(id, keywords, token) {
            return $http({
				method: "GET",
				url: "/api/peers/" + id + "/public-references?keywords=" + keywords,
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