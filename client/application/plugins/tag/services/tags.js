/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("tags").factory(
    "tagsService", function($http) {
        var tagsProvider = {};
        
        tagsProvider.getTags = function(keywords, token) {
            return $http({
				method: "GET",
				url: "/api/tags",
                data: {keywords: keywords},
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };
        
        return tagsProvider;
    }
);