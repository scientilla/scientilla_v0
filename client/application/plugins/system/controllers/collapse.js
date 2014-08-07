/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/master/LICENSE)
 */

angular.module("system").controller(
    "systemCollapseController", ["$scope", function($scope) {  
        /* TO-DO: substitute the jQuery code with a directive. */
        /* jQuery code start */        
        $scope.toggleSettingsMenu = function() {
            $("#settingsMenu").slideDown();
            $("#referencesMenu").slideUp();
            $("#datasetsMenu").slideUp();
            $("#peersMenu").slideUp();
            $("#repositoriesMenu").slideUp();
        }
        $scope.toggleReferencesMenu = function() {
            $("#settingsMenu").slideUp();
            $("#referencesMenu").slideDown();
            $("#datasetsMenu").slideUp();
            $("#peersMenu").slideUp();
            $("#repositoriesMenu").slideUp();            
        }
        $scope.toggleDatasetsMenu = function() {
            $("#settingsMenu").slideUp();
            $("#referencesMenu").slideUp();
            $("#datasetsMenu").slideDown();
            $("#peersMenu").slideUp();
            $("#repositoriesMenu").slideUp();            
        }
        $scope.togglePeersMenu = function() {
            $("#settingsMenu").slideUp();
            $("#referencesMenu").slideUp();
            $("#datasetsMenu").slideUp();
            $("#peersMenu").slideDown();
            $("#repositoriesMenu").slideUp();            
        }
        $scope.toggleRepositoriesMenu = function() {
            $("#settingsMenu").slideUp();
            $("#referencesMenu").slideUp();
            $("#datasetsMenu").slideUp();
            $("#peersMenu").slideUp(); 
            $("#repositoriesMenu").slideDown();
        }
        /* jQuery code end */        
    }]
);