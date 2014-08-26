/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("network").controller(
    "networkBrowsingController", ["$scope", "networkSearchesService", "$window", "$location", function($scope, networkSearchesService, $window, $location) {
        /* TO-DO: substitute with a directive. */
        /* code start */            
        $("#help-button").popover({
            trigger: "focus"
        });
        /* code end */        
    }]
);