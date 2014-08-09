/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("peer").factory(
    "activatedPeersService", function($http) {
        var activatedPeersProvider = {};
              
        activatedPeersProvider.getActivatedPeer = function(token) {
            return $http({
				method: "GET",
				url: "/api/activated-peers",
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        activatedPeersProvider.setPeerAsActivated = function(id, token) {
            return $http({
				method: "PUT",
				url: "/api/activated-peers/" + id,                
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };        
        
        return activatedPeersProvider;
    }    
);