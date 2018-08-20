describe('App', function() {

    // utility functions
    angular.scenario.matcher('toBeGreaterThanFuture', function(future) {
        return +this.actual > +future.value;
    });
    angular.scenario.matcher('toBeLessThanFuture', function(future) {
        return +this.actual < +future.value;
    });

    angular.scenario.matcher('toBeOneLessThan', function(future) {
        return +this.actual < +future.value;
    });

    angular.scenario.matcher('toBeOneMoreThan', function(future) {
        return +this.actual > +future.value;
    });

});
