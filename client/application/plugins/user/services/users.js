/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("user").factory(
    "usersService", function($http, $window) {
        var usersProvider = {};
        
        usersProvider.updateUserInfo = function(data) {
            if (_.isEmpty(data)) {
                return;
            }
            if (data.token) {
                $window.sessionStorage.token = data.token;
            }
            $window.sessionStorage.userType = data.user_type;
            $window.sessionStorage.userRights = data.user_rights;
            $window.sessionStorage.userScientillaNominative = data.user_scientilla_nominative;
            if (data.peer_mode) {
                $window.sessionStorage.peerMode = data.peer_mode;
            }
            $window.sessionStorage.aliases = JSON.stringify(data.aliases);
        };
        
        usersProvider.deleteUserInfo = function() {
            delete $window.sessionStorage.token;
            delete $window.sessionStorage.userType;
            delete $window.sessionStorage.userRights;
            delete $window.sessionStorage.userScientillaNominative;
            delete $window.sessionStorage.peerMode;
            delete $window.sessionStorage.aliases;
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
        
        return usersProvider;
    }    
);