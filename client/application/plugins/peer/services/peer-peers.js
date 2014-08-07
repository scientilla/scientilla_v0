/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/master/LICENSE)
 */

angular.module("peer").factory(
    "peerPeersService", function($http) {
        var peerPeersProvider = {};
        
        peerPeersProvider.getPeers = function(peerUrl) {
            return $http({
				method: "GET",
				url: peerUrl + "/api/public-peers",
                cache: false,
                timeout: 30000
			});
        };                              
        
        return peerPeersProvider;
    }    
);