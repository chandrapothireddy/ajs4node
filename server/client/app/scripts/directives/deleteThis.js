angular
    .module('app')
    .directive("deleteThis", ['$location',
        function($location) {
            return {
                replace: true,
                template: '<button class="pull-right btn btn-link link-danger" ng-click="deleteItem();">Delete This {{type}}</button>',
                scope: {
                    id: '&',
                    model: '&',
                    type: '@',
                    message: '@',
                    redirect: '@'
                },
                link: function(scope, element, attrs, ctrl) {


                    // check for required attrs
                    if (!scope.id) throw ('You need to provide an id for deleteThis directive');
                    if (!scope.model) throw ('You need to provide a model name for deleteThis directive');

                    // message and redirect are optional, so check for them
                    // and set defaults if missing    
                    var message = attrs.message ? attrs.message : 'Are you sure you want to delete this item?';
                    var redirect = attrs.redirect ? attrs.redirect : '/dashboard';

                    scope.deleteItem = function() {

                        if (confirm(message)) {
                            scope.model().remove(scope.id());
                            $location.url(redirect);
                        }
                    };

                }
            };
        }
    ]);
