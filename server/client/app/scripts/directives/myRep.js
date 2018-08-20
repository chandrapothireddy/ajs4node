angular
    .module('app')
    .directive("myRep", ['$location', 'authService', 'vendorService', '$document',
        function($location, authService, vendorService, $document) {
            return {
                replace: true,
                templateUrl: 'app/templates/directives/myRep.html',
                link: function(scope, element, attrs, ctrl) {

                    // get current user
                    var user = authService.getCurrentUser();

                    // only show this to vendorReps
                    if (!user || user.role !== 'vendorRep') return;

                    // user might not have a vendor
                    if (!user.vendorId) return;

                    // gets the vendor
                    vendorService.getSalesRep(user.vendorId).then(function(response) {

                        // save to local scope
                        scope.salesRep = response;

                        if (!scope.salesRep._id) return;

                        // set class on body
                        angular.element($document[0].body).addClass('has-rep-tray');

                    });

                }
            };
        }
    ]);
