/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("discovery").factory(
    "discoveryService", function($http) {
        var discoveryProvider = {};
        
        discoveryProvider.getReferences = function(config, token, success, error){
            $http({
				method: "GET",
				url: "/api/discovery/filtered-references",
                params: config,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			}).success(function(data, status, headers, config) {
                if (_.isFunction(success)) {
                    success({data: data, status: status});
                }
            }).error(function(data, status, headers, config) {
                if (_.isFunction(error)) {
                    error({data: data, status: status});
                }
            });
        };
        return discoveryProvider;
    }
);