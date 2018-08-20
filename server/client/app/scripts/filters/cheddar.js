/**
* Formats number with commas and prefixed $
* Optionally you can disable prefix by using cheddar:''
*
* examples:

    111111111 | cheddar = $111,111,111
    111111 | cheddar:'' = 111,111
* 
*
*/
angular
    .module('app')
    .filter('cheddar', function() {

        return function(money, prefix) {

            // support preface, or more useful hide preface
            preface = typeof prefix === 'string' ? prefix : '$';

            if (!money) return money;
            // Reverse string, and for every three digits,
            // add a comma, then return the string to normal
            var cheddar = money
                .toString()
                .split("")
                .reverse()
                .join("")
                .replace(/\d{3}/, function(digits) {
                    return digits + ",";
                })
                .split("")
                .reverse()
                .join("");

            return preface + cheddar;
        };
    });
