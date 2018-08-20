angular
    .module('app')
    .filter('capitalize', function() {

        return function(text) {
            if (!text) return;
            return text.charAt(0).toUpperCase() + text.substring(1).toLowerCase();
        };
    });
