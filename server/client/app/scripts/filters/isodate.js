angular
    .module('app')
    .filter('isodate', function() {
        return function(datetime) {
            var n = datetime.split(' ');
            if (n.length == 1) return datetime;
            else return n.join('T') + 'Z';
        };
    });
