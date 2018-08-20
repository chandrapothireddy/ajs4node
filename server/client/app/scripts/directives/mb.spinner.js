/**
 * Thanks to
 * @see https://github.com/lucassus/mongo_browser/blob/1ba5dc609fdf73ce2acceed7e8bcd25349daf1fe/app/assets/javascripts/app/modules/spinner.js.coffee
 *
 */


var SpinnerController, spinner,
    __bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments);
        };
    };

spinner = angular.module("mb.spinner", []);

spinner.factory("httpRequestTracker", [
    "$http",
    function($http) {
        return {
            hasPendingRequests: function() {
                return $http.pendingRequests.length > 0;
            }
        };
    }
]);

SpinnerController = (function() {

    SpinnerController2.$inject = ["$scope", "httpRequestTracker"];

    function SpinnerController2($scope, httpRequestTracker) {
        this.$scope = $scope;
        this.httpRequestTracker = httpRequestTracker;
        this.showSpinner = __bind(this.showSpinner, this);

        this.$scope.showSpinner = this.showSpinner;
        //this.$scope.showSpinner = true;
    }

    SpinnerController2.prototype.showSpinner = function() {
        return this.httpRequestTracker.hasPendingRequests();
    };

    return SpinnerController2;

})();

spinner.controller("spinner", SpinnerController);

spinner.directive("spinner", function() {
    return {
        replace: true,
        template: "<div ng-show='showSpinner()'><i class='icon icon-spinner icon-spin'></i></div>",
        controller: "spinner"
    };
});
