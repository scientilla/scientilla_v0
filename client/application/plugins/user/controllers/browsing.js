/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

angular.module("user").controller(
    "usersBrowsingController", 
    ["$scope", "usersService", "systemStatusService", "$window", "$location", "notificationService", 
    function($scope, usersService, systemStatusService, $window, $location, notificationService) {
        $scope.aUsers = [];
        
        $scope.deleteUser = function(userId) {
            usersService.deleteUser(userId, $window.sessionStorage.userToken)
                .success(function(data, status, headers, config) {
                    _.remove($scope.aUsers, {_id: userId} );
                    notificationService.info("User deleted");
                })
                .error(function(data, status, headers, config) {
                    switch(status) {
                        case 400:
                            systemStatusService.react(status);
                            notificationService.warning('User cannot be delete.');
                            break;
                        case 500:
                            systemStatusService.react(status);
                            notificationService.error('An error happened');
                            break;
                        default:
                            systemStatusService.react(status);
                            notificationService.error('An error happened');
                    }
                });
        };
        
        $scope.retrieveUsers = function() {
            $scope.empty = false;
            $scope.ready = false;
            $scope.error = false;
            usersService.getUsers($window.sessionStorage.userToken).success(function(data, status, headers, config) {
                $scope.aUsers = data;
                if ($scope.aUsers.length === 0) {
                    $scope.empty = true;
                }            
                $scope.ready = true;
            }).error(function(data, status, headers, config) {
                $scope.error = true;
                systemStatusService.react(status);
            });
        };
        
        
        
        $scope.selectAll = function() {
            var allSelected = _.every($scope.aUsers, 'selected');
            _.each($scope.aUsers, function(u){u.selected = !allSelected;});
        };
        
        $scope.deleteSelectedReferences = function(){
            var selectedUsers = _.filter($scope.aUsers, {selected: true});
            
            var deleteUsers = 
                _.map(selectedUsers, function(user) {
                   return function(callback) {
                       usersService.deleteUserAsync(
                            user._id,
                            $window.sessionStorage.userToken,
                            function(result) {
                               callback(null, result);
                            }
                       );
                   };
                });
                
            var notifyResults = function(err, allResults){
                if (err) {
                    notificationService.info('Some error happened');
                    return;
                }
                var deletedUsers = 0;
                var notDeletedUsers = 0;
                var errors = 0;
                allResults.forEach(function(result) {
                    switch(result.status) {
                        case 200: 
                            _.remove($scope.aUsers, {_id: result.userId} );
                            deletedUsers++;
                            break;
                        case 400:
                            notDeletedUsers++;
                            break;
                        case 404:
                        case 500:
                            systemStatusService.react(result.status);
                            errors++;
                            break;
                        default:
                            systemStatusService.react(result.status);
                            errors++;
                    }
                });
                var msg = "";
                if (allResults.length === 0) {
                    msg = 'No Users Selected';
                } else {
                    if (deletedUsers > 0) {
                        if (deletedUsers === 1) {
                            msg += deletedUsers + ' User Deleted.\n';
                        } else {
                            msg += deletedUsers + ' Users Not Deleted.\n';
                        }
                    }
                    if (notDeletedUsers > 0 ) {
                        if (notDeletedUsers === 1) {
                            msg += notDeletedUsers + ' User could not be deleted.\n';
                        } else {
                            msg += notDeletedUsers + ' Users could not be deleted.\n';
                        }
                    }
                    if (errors > 0 ) {
                        msg += 'Some error happened.\n';
                    }
                }
                notificationService.info(msg);
            };
            async.parallel(deleteUsers, notifyResults);
        };  
        
        
        $scope.init = function() {
            $scope.retrieveUsers();
        };
    }]
);