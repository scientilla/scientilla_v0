/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/master/LICENSE)
 */

angular.module("dataset").factory(
    "peerDatasetsService", function($http) {
        var peerDatasetsProvider = {};
        
        peerDatasetsProvider.getDatasets = function(peerId, token) {
            return $http({
				method: "GET",
				url: "/api/peers/" + peerId + "/public-datasets",
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        peerDatasetsProvider.getDataset = function(peerId, datasetId, token) {
            return $http({
				method: "GET",
				url: "/api/peers/" + peerId + "/public-datasets/" + datasetId,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };        
        
        return peerDatasetsProvider;
    }    
);