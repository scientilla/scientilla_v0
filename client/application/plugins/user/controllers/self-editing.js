/*
 * Scientilla v1.0 Beta (http://www.scientilla.net)
 * Copyright 2014-2015 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("user").controller(
    "userSelfEditingController", 
    ["$scope", "$routeParams", "usersService", "systemStatusService", "$window", "$location", 
    function($scope, $routeParams, usersService, systemStatusService, $window, $location) {
        var getUserAliases = function(user) {
            var firstLetter = function(string) {return string.charAt(0).toUpperCase();};
            var capitalize = function (str){
                return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
            };
            var aliases = [];
            if (user.type == 2) {
                var businessName = capitalize(user.business_name);
                aliases.push(businessName);
            }
            else {
                var first_name = capitalize(user.first_name);
                var last_name = capitalize(user.last_name);
                var initial_first_name = firstLetter(first_name);

                aliases.push(first_name + " " + last_name);
                aliases.push(last_name + " " + first_name);
                aliases.push(last_name + " " + initial_first_name + ".");
                aliases.push(initial_first_name + ". " + last_name + "");
            }
            aliases = _.uniq(aliases);
            return aliases;
        };
        
        $scope.resetUserAliases = function() {
            $scope.oUser.aliases = getUserAliases($scope.oUser);
            $scope.compressAliases();
        };
            
        $scope.oUser = {
            type: "",
            rights: 1,
            scientilla_nominative: "",
            first_name: "",
            middle_name: "",
            last_name: "",
            business_name: "",
            birth_date: "",
            birth_city: "",
            birth_state: "",
            birth_country: "",
            sex: "",
            email: "",
            username: "",
            password: "",
            password_repetition: "",
            status: "",
            description: ""
        };
        
        $scope.extractAliases = function() {
            if (_.isEmpty($scope.oUser.aliasesStr)) {
                $scope.oUser.aliases = [];
            } else {
                $scope.oUser.aliases = _.uniq($scope.oUser.aliasesStr.split(/;\s*/));
            }
        };
        $scope.compressAliases = function() {
            $scope.oUser.aliasesStr = $scope.oUser.aliases.join('; ');
        };
        
        $scope.retrieveUser = function() {
            usersService.getLoggedUser( 
                $window.sessionStorage.userToken
            ).success(function(data, status, headers, config) {
                for (var key in data) {
                    if (key !== "password" && key !== "password_repetition") {
                        $scope.oUser[key] = data[key];
                    }
                }
                $scope.compressAliases();
            }).error(function(data, status, headers, config) {
                systemStatusService.react(status);
            });
        };
        
        $scope.updateLoggedUser = function() {
            usersService.updateLoggedUser({
                type: $scope.oUser.type,
                rights: $scope.oUser.rights,
                scientilla_nominative: $scope.oUser.scientilla_nominative,
                first_name: $scope.oUser.first_name,
                middle_name: $scope.oUser.middle_name,
                last_name: $scope.oUser.last_name,
                business_name: $scope.oUser.business_name,
                birth_date: $scope.oUser.birth_date,
                birth_city: $scope.oUser.birth_city,
                birth_state: $scope.oUser.birth_state,
                birth_country: $scope.oUser.birth_country,
                sex: $scope.oUser.sex,
                email: $scope.oUser.email,
                username: $scope.oUser.username,
                password: $scope.oUser.password,
                password_repetition: $scope.oUser.password_repetition,
                status: $scope.oUser.status,
                aliases: $scope.oUser.aliases,
                description: $scope.oUser.description
            }, $window.sessionStorage.userToken).success(function(data, status, headers, config) {
                usersService.updateExchangedInformation(data, function() {
                    $scope.$emit("exchanged-information-modification");
                    $location.path("browse-references");
                });
            }).error(function(data, status, headers, config) {
                systemStatusService.react(status);
            });
        };       
        
        $scope.init = function() {
            $scope.retrieveUser();
        };
    }]
);