/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/master/LICENSE)
 */

angular.module("reference").factory(
    "datasetReferencesService", function($http) {
        var datasetReferencesProvider = {};
        
        datasetReferencesProvider.getReferences = function(id, token) {
            return $http({
				method: "GET",
				url: "/api/datasets/" + id + "/references",
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        datasetReferencesProvider.getReference = function(datasetId, referenceId, token) {
            return $http({
				method: "GET",
				url: "/api/datasets/" + datasetId + "/references/" + referenceId,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };        
        
        datasetReferencesProvider.storeReference = function(id, data, token) {
            return $http({
				method: "POST",
				url: "/api/datasets/" + id + "/references",
                data: data,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };        
        
        return datasetReferencesProvider;
    }    
);