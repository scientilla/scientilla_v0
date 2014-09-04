/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("system").controller(
    "systemLayoutController", ["$scope", "$window", "$location", function($scope, $window, $location) {
        $scope.bSidebarVisualizationStatus = false;
        $scope.userScientillaNominative = "SCIENTILLA";
        
        $scope.toggleSidebar = function() {
            $scope.bSidebarVisualizationStatus = !$scope.bSidebarVisualizationStatus;
            /* TO-DO: substitute the jQuery code with a directive. */
            /* jQuery code start */
            if (!$scope.bSidebarVisualizationStatus) {
                $("#sidebar-container").stop(true).animate({"left": "-270px"});
                $("#toolbar-and-content-container").stop(true).animate({"left": "0px", "border-width": "0px 0px 0px 1px"});
            } else {
                $("#toolbar-and-content-container").stop(true).animate({"left": "270px", "border-width": "0px 0px 0px 1px"});
                $("#sidebar-container").stop(true).animate({"left": "0px"});                
            }
            /* jQuery code end */
        };
        
        $scope.toggleMenu = function() {

        }
        
        $scope.updateScientillaNominative = function updateScientillaNominative() {
            $scope.userScientillaNominative = $window.sessionStorage.userScientillaNominative;
            
            return updateScientillaNominative;
        }();
        
        $scope.$on("scientillaNominativeUpdateEvent", $scope.updateScientillaNominative);        
    }]
);