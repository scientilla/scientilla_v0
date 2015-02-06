/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("user").factory(
    "networkUsersService", function($http) {
        var networkUsersProvider = {};
        
        networkUsersProvider.getUsers = function(keywords, userType, currentPageNumber, numberOfItemsPerPage, token) {
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
            if (userType) {
                switch (userType) {
                    case "researchers":
                        params.user_type = 1;
                        break;
                    case "organizations":
                        params.user_type = 2;
                        break;                    
                }
            }     
            return $http({
				method: "GET",
				url: "/api/network-users",
                params: params,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };        
        
        networkUsersProvider.getUser = function(userId, token) {
            return $http({
				method: "GET",
				url: "/api/network-users/" + userId,
                cache: false,
                timeout: 30000,
                headers: {
                    Authorization: 'Bearer ' + token
                }
			});
        };                              
        
        return networkUsersProvider;
    }    
);