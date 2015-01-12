/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("reference").factory(
    "collectedReferencesService", function($http) {       
        var referencesProvider = {};
        
        referencesProvider.getReferences = function(keywords, currentPageNumber, numberOfItemsPerPage, token) {
            var params = {};
            if (keywords) {
                params.keywords = keywords;
            }
            if (currentPageNumber) {
                params.current_page_number = currentPageNumber;
            }
            if (numberOfItemsPerPage) {
                params.number_of_items_per_page = numberOfItemsPerPage;
            }            
            return $http({
				method: "GET",
				url: "/api/collected-references",
                params: params,
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