/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/master/LICENSE)
 */

angular.module("user").factory(
    "usersService", function($http) {
        var usersProvider = {};
        
        usersProvider.getUsers = function(token) {
            return $http({
				method: "GET",
				url: "/api/users",
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        usersProvider.getUser = function(id, token) {
            return $http({
				method: "GET",
				url: "/api/users/" + id,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        usersProvider.getLoggedUser = function(token) {
            return $http({
				method: "GET",
				url: "/api/logged-users",
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };        
        
        usersProvider.createUser = function(data, token) {
            return $http({
				method: "POST",
				url: "/api/users",
                data: data,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        usersProvider.updateUser = function(data, token) {           
            return $http({
				method: "PUT",
				url: "/api/users/" + data.id,
                data: data,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        usersProvider.updateLoggedUser = function(data, token) {           
            return $http({
				method: "PUT",
				url: "/api/logged-users",
                data: data,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };        
        
        usersProvider.loginUser = function(data, token) {
            return $http({
				method: "POST",
				url: "/api/logged-users",
                data: data,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };        
        
        return usersProvider;
    }    
);