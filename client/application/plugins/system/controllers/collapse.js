/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("system").controller(
    "systemCollapseController", ["$scope", function($scope) {  
        /* TO-DO: substitute the jQuery code with a directive. */
        /* jQuery code start */
        $scope.toggleWholeNetworkMenu = function() {
            $("#wholeNetworkMenu").slideDown();
            $("#configurationMenu").slideUp();
        }
        
        $scope.toggleConfigurationMenu = function() {
            $("#wholeNetworkMenu").slideUp();
            $("#configurationMenu").slideDown();
        }
        /* jQuery code end */        
    }]
);