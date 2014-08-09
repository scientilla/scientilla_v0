/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("dataset").factory(
    "activatedDatasetsService", function($http) {
        var activatedDatasetsProvider = {};
              
        activatedDatasetsProvider.getActivatedDataset = function(token) {
            return $http({
				method: "GET",
				url: "/api/activated-datasets",
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        activatedDatasetsProvider.setDatasetAsActivated = function(id, peerId, token) {
            return $http({
				method: "PUT",
				url: "/api/activated-datasets/" + id,
                data: {
                    peer_id: peerId
                },
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };        
        
        return activatedDatasetsProvider;
    }    
);