/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("peer").factory(
    "peersService", function($http) {
        var peersProvider = {};
        
        peersProvider.getPeers = function(token) {
            return $http({
				method: "GET",
				url: "/api/peers",
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        peersProvider.getSeedPeers = function(token) {
            return $http({
				method: "GET",
				url: "/api/seed-peers",
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        peersProvider.getAggregatedPeers = function(token) {
            return $http({
				method: "GET",
				url: "/api/aggregated-peers",
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };        
        
        peersProvider.getPeer = function(id, token) {
            return $http({
				method: "GET",
				url: "/api/peers/" + id,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        peersProvider.createPeer = function(data, token) {
            return $http({
				method: "POST",
				url: "/api/peers",
                data: data,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        peersProvider.updatePeer = function(data, token) {
            return $http({
				method: "PUT",
				url: "/api/peers/" + data.id,
                data: data,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        peersProvider.deletePeer = function(data, token) {
            return $http({
				method: "DELETE",
				url: "/api/peers/" + data.id,
                data: data,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };        
        
        peersProvider.setPeerAsShared = function(id, token) {
            return $http({
				method: "PUT",
				url: "/api/peers/" + id,
                data: { sharing_status: true },
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        peersProvider.setPeerAsNotShared = function(id, token) {
            return $http({
				method: "PUT",
				url: "/api/peers/" + id,
                data: { sharing_status: false },
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        peersProvider.setPeerAsAggregated = function(id, token) {
            return $http({
				method: "PUT",
				url: "/api/peers/" + id,
                data: { aggregating_status: true },
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        peersProvider.setPeerAsNotAggregated = function(id, token) {
            return $http({
				method: "PUT",
				url: "/api/peers/" + id,
                data: { aggregating_status: false },
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        return peersProvider;
    }    
);