/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("repository").factory(
    "repositoriesService", function($http) {
        var repositoriesProvider = {};
        
        repositoriesProvider.getRepositories = function(token) {
            return $http({
				method: "GET",
				url: "/api/repositories",
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        repositoriesProvider.getRepository = function(id, token) {
            return $http({
				method: "GET",
				url: "/api/repositories/" + id,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };         
        
        repositoriesProvider.createRepository = function(data, token) {
            return $http({
				method: "POST",
				url: "/api/repositories",
                data: data,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        repositoriesProvider.createRepository = function(data, token) {
            return $http({
				method: "POST",
				url: "/api/repositories",
                data: data,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        repositoriesProvider.updateRepository = function(data, token) {
            return $http({
				method: "PUT",
				url: "/api/repositories/" + data.id,
                data: data,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        repositoriesProvider.deleteRepository = function(data, token) {
            return $http({
				method: "DELETE",
				url: "/api/repositories/" + data.id,
                data: data,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        return repositoriesProvider;
    }    
);