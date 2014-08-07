/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/master/LICENSE)
 */

angular.module("dataset").factory(
    "datasetsService", function($http) {
        var datasetsProvider = {};
        
        datasetsProvider.getDatasets = function(token) {
            return $http({
				method: "GET",
				url: "/api/datasets",
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        datasetsProvider.getDataset = function(id, token) {
            return $http({
				method: "GET",
				url: "/api/datasets/" + id,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        }; 
        
        datasetsProvider.createDataset = function(data, token) {
            return $http({
				method: "POST",
				url: "/api/datasets",
                data: data,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        datasetsProvider.updateDataset = function(data, token) {
            return $http({
				method: "PUT",
				url: "/api/datasets/" + data.id,
                data: data,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        datasetsProvider.setDatasetAsShared = function(id, token) {
            return $http({
				method: "PUT",
				url: "/api/datasets/" + id,
                data: { sharing_status: true },
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        datasetsProvider.setDatasetAsNotShared = function(id, token) {
            return $http({
				method: "PUT",
				url: "/api/datasets/" + id,
                data: { sharing_status: false },
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        return datasetsProvider;
    }    
);