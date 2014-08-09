/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("system").controller(
    "systemLayoutController", ["$scope", "$location", function($scope, $location) {
        $scope.bSidebarVisualizationStatus = false;
        
        $scope.toggleSidebar = function() {
            $scope.bSidebarVisualizationStatus = !$scope.bSidebarVisualizationStatus;
            /* TO-DO: substitute the jQuery code with a directive. */
            /* jQuery code start */
            if (!$scope.bSidebarVisualizationStatus) {
                $("#sidebar-container").stop(true).animate({"left": "-270px"});
                $("#toolbar-and-content-container").stop(true).animate({"left": "0px"});
            } else {
                $("#toolbar-and-content-container").stop(true).animate({"left": "270px"});
                $("#sidebar-container").stop(true).animate({"left": "0px"});               
            }
            /* jQuery code end */
        };
        
        $scope.toggleMenu = function() {
            console.log($location.path());
        }
    }]
);