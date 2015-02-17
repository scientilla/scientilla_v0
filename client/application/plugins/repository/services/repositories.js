/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("repository").factory(
    "repositoriesService", function($http) {
        var repositoriesProvider = {};
        
        repositoriesProvider.getRepositories = function(token, config) {
            return $http({
                method: "GET",
                url: "/api/repositories",
                cache: false,
                params: config,
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
        
        repositoriesProvider.importRepository = function(id, token) {
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
        
        repositoriesProvider.exportRepository = function(id, token) {
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
        
        return repositoriesProvider;
    }    
);