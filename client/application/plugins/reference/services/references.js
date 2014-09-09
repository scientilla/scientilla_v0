/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("reference").factory(
    "referencesService", function($http) {
        var referencesProvider = {};
        
        referencesProvider.getReferences = function(keywords, token) {
            return $http({
				method: "GET",
				url: "/api/references?keywords=" + keywords,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        referencesProvider.getReference = function(id, token) {
            return $http({
				method: "GET",
				url: "/api/references/" + id,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };        
        
        referencesProvider.getReceivedReferences = function(token) {
            return $http({
				method: "GET",
				url: "/api/received-references",
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        referencesProvider.createReference = function(data, token) {
            return $http({
				method: "POST",
				url: "/api/references",
                data: data,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        referencesProvider.updateReference = function(data, token) {
            return $http({
				method: "PUT",
				url: "/api/references/" + data.id,
                data: data,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        referencesProvider.deleteReference = function(data, token) {
            return $http({
				method: "DELETE",
				url: "/api/references/" + data.id,
                data: data,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };        
        
        referencesProvider.setReferenceAsApproved = function(id, token) {
            return $http({
				method: "PUT",
				url: "/api/references/" + id,
                data: { approving_status: true },
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        referencesProvider.setReferenceAsNotApproved = function(id, token) {
            return $http({
				method: "PUT",
				url: "/api/references/" + id,
                data: { approving_status: false },
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };        
        
        referencesProvider.setReferenceAsShared = function(id, token) {
            return $http({
				method: "PUT",
				url: "/api/references/" + id,
                data: { sharing_status: true },
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        referencesProvider.setReferenceAsNotShared = function(id, token) {
            return $http({
				method: "PUT",
				url: "/api/references/" + id,
                data: { sharing_status: false },
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };        
        
        return referencesProvider;
    }    
);