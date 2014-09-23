/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("system").controller(
    "systemCollapseController", ["$scope", function($scope) {  
        /* TO-DO: substitute the jQuery code with a directive. */
        /* jQuery code start */
        $scope.toggleReferencesMenu = function() {
            // $("#referencesMenu").slideDown();
            // $("#networkReferencesMenu").slideUp();
            $("#worldNetworkMenu").slideUp();
            $("#configurationMenu").slideUp();
            // $("#logoutMenu").slideUp();
        }
        
        $scope.toggleNetworkReferencesMenu = function() {
            // $("#referencesMenu").slideUp();
            // $("#networkReferencesMenu").slideDown();
            $("#worldNetworkMenu").slideUp();
            $("#configurationMenu").slideUp();
            // $("#logoutMenu").slideUp();
        }        
        
        $scope.toggleWorldNetworkMenu = function() {
            // $("#referencesMenu").slideUp();
            // $("#networkReferencesMenu").slideUp();
            $("#worldNetworkMenu").slideDown();
            $("#configurationMenu").slideUp();
            // $("#logoutMenu").slideUp();
        }
        
        $scope.toggleConfigurationMenu = function() {
            // $("#referencesMenu").slideUp();
            // $("#networkReferencesMenu").slideUp();
            $("#worldNetworkMenu").slideUp();
            $("#configurationMenu").slideDown();
            // $("#logoutMenu").slideUp();
        }
        
        $scope.toggleLogoutMenu = function() {
            // $("#referencesMenu").slideUp();
            // $("#networkReferencesMenu").slideUp();
            $("#worldNetworkMenu").slideUp();
            $("#configurationMenu").slideUp();
            // $("#logoutMenu").slideDown();
        }        
        /* jQuery code end */        
    }]
);