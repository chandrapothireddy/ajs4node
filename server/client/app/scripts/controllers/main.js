angular
    .module('app')
    .controller('MainController', [
        '$rootScope',
        'Validator',
        function($rootScope, Validator) {
            $rootScope.Validator = Validator;
        }
    ]);
