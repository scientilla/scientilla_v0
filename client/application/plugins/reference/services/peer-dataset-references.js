/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("reference").factory(
    "peerDatasetReferencesService", function($http) {
        var peerDatasetReferencesProvider = {};
        
        peerDatasetReferencesProvider.getReferences = function(peerId, datasetId, keywords, token) {
            return $http({
				method: "GET",
				url: "/api/peers/" + peerId + "/public-datasets/" + datasetId + "/references?keywords=" + keywords,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        peerDatasetReferencesProvider.getReference = function(peerId, datasetId, referenceId, token) {
            return $http({
				method: "GET",
				url: "/api/peers/" + peerId + "/public-datasets/" + datasetId + "/references/" + referenceId,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };        
        
        return peerDatasetReferencesProvider;
    }    
);