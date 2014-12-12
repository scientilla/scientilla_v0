/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("user").factory(
    "usersService", function($http, $window) {
        var usersProvider = {};
        
        usersProvider.updateExchangedInformation = function(data, callback) {
            if (_.isEmpty(data)) {
                return;
            }
            if (data.user_token) {
                $window.sessionStorage.userToken = data.user_token;
            }
            if (data.user_type) {
                $window.sessionStorage.userType = data.user_type;
            }
            if (data.user_rights) {
                $window.sessionStorage.userRights = data.user_rights;
            }
            if (data.user_scientilla_nominative) {
                $window.sessionStorage.userScientillaNominative = data.user_scientilla_nominative;
            }
            if (data.user_aliases) {
                $window.sessionStorage.userAliases = JSON.stringify(data.user_aliases);
            }
            callback();
        };       
        
        usersProvider.deleteExchangedInformation = function(callback) {
            delete $window.sessionStorage.userToken;
            delete $window.sessionStorage.userType;
            delete $window.sessionStorage.userRights;
            delete $window.sessionStorage.userScientillaNominative;
            delete $window.sessionStorage.userAliases;
            callback();
        };        
        
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
        
        usersProvider.loginUser = function(data) {
            return $http({
				method: "POST",
				url: "/api/logged-users",
                data: data,
                cache: false,
                timeout: 30000
			});
        };        
        
        
        usersProvider.deleteUser = function(userId, token) {
            return $http({
				method: "DELETE",
				url: "/api/users/" + userId,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
            
        };
        
        usersProvider.deleteUserAsync = function(userId, token, callback) {
            usersProvider
                .deleteUser(userId, token)
                .success(function(data, status, headers, config) {
                    if (_.isFunction(callback)) {
                        callback({userId: userId, status: status});
                    }
                }).error(function(data, status, headers, config) {
                    if (_.isFunction(callback)) {
                        callback({userId: userId, status: status});
                    }
                });
        };
        
        return usersProvider;
    }    
);