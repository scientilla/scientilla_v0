/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("dataset").factory(
    "peerDatasetsService", function($http) {
        var peerDatasetsProvider = {};
        
        peerDatasetsProvider.getDatasets = function(peerId, keywords, token) {
            return $http({
				method: "GET",
				url: "/api/peers/" + peerId + "/public-datasets?keywords=" + keywords,
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