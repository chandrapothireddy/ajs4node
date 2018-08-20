angular
    .module('app')
    .directive('decimalPlaces', function() {
        return {
            link: function(scope, ele, attrs) {
                ele.bind('keypress', function(e) {
                    var newVal = ele.val() + (e.charCode !== 0 ? String.fromCharCode(e.charCode) : '');

                    // get the actual letter user has entered
                    var theCharacter = String.fromCharCode(e.charCode);

                    if (theCharacter.search(/\d/) === -1) {

                        // temp fix to allow '-' to indicate null value on rate sheets
                        if (theCharacter.search(/\-/) !== -1 && ele.val().split("-").length <= 1) {
                            return true;
                        }

                        if (theCharacter.search(/\./) === -1 || ele.val().split(".").length > 1) {
                            e.preventDefault();
                        }
                    }

                    if (theCharacter.indexOf('0') === 1 && theCharacter.search(/\./) === -1 && ele.val().split(".").length === 1) {
                        e.preventDefault();
                    }

                    if (ele.val().search(/\d+\.\d{3}/) === 0 && newVal.length > ele.val().length) {
                        //e.preventDefault();
                    }

                    if (ele.val().search(/\.\d{3}/) === 0 && newVal.length > ele.val().length) {
                        //e.preventDefault();
                    }


                });
            }
        };

    })
    .directive('numberOnly', function() {
        return {
            require: '?ngModel',
            link: function(scope, ele, attrs, ctrl) {
                var matcher, matchedString, input;

                if (!ctrl) return;

                // force truthy in case we are on non-input el
                attrs.numberOnly = true;

                var validator = function(value) {
                    if (notNum(value)) {
                        // not valid if not number
                        ctrl.$setValidity('numericality', false);
                    } else {
                        ctrl.$setValidity('numericality', true);
                    }
                    return value;
                };

                ctrl.$formatters.push(validator);
                ctrl.$parsers.unshift(validator);

                attrs.$observe('numberOnly', function() {
                    validator(ctrl.$viewValue);
                });

                function notNum(value) {
                    if (value || value === 0 || value === '0') {
                        // /regex/#match returns an array, the first item of which is
                        // the matched string (e.g. "0.123" in "0.123abc" if the user)
                        // input a string with letters in it, for whatever reason.
                        // The input attribute is the original input, so we check that
                        // the matched string ("0.123") matches the original input;
                        // if it doesn't, it's false. The !! operator converts to
                        // boolean, so the return statement will always return 
                        // true or false.
                        try {
                            value = value.toString().replace(/\,/g, "");
                            matcher = value.match(/\d{1,}\.{0,1}\d{0,}/);
                            matchedString = matcher[0];
                            input = matcher.input;
                            return matchedString != input;
                        } catch (e) {
                            return true;
                        }
                    } else {
                        return false;
                    }

                }
            }
        };

    })
    .directive('isUser', ['userService', 'Validator', function(userService, Validator) {
        return {
            require: '?ngModel',
            link: function(scope, ele, attrs, ctrl) {
                var matcher, matchedString, input, form;

                if (!ctrl) return;

                form = scope.$eval(ele[0].form.name);

                // force truthy in case we are on non-input el
                attrs.isUser = true;

                var validator = function(value) {

                    if (!value) return;

                    userService.find({
                        email: value || undefined
						//email : value
                    }).then(function(response, err) {
                        if (response.data && response.data[0] && response.data[0].email) {
						
						scope.loginForm.FacultyErrors.email = '';
                            ctrl.$setValidity('isUser', true);
							
                        } else {
						
                            ctrl.$setValidity('isUser', false);
                        }
                        Validator.validateField(form.email, form);
                    });
                };

                $(ele).on('blur', function() {
                    validator(ctrl.$viewValue);
                });

            }
        };

    }])
    .directive('integerOnly', function() {
        return {
            require: '?ngModel',
            link: function(scope, ele, attrs, ctrl) {
                var matcher, matchedString, input;

                if (!ctrl) return;

                // force truthy in case we are on non-input el
                attrs.numberOnly = true;

                var validator = function(value) {
                    if (notInt(value)) {
                        // not valid if not Integer
                        ctrl.$setValidity('integer', false);
                    } else {
                        ctrl.$setValidity('integer', true);
                    }
                    return value;
                };

                ctrl.$formatters.push(validator);
                ctrl.$parsers.unshift(validator);

                attrs.$observe('integerOnly', function() {
                    validator(ctrl.$viewValue);
                });

                function notInt(value) {
                    if (value || value === 0 || value === '0') {
                        try {
                            // convert to string, preventing non-integer values from
                            // throwing error and thus causing catch return true.
                            value = value.toString().replace(/\,/g, "");
                            matcher = value.toString().match(/\d{1,}\,{0,}/);
                            matchedString = matcher[0];
                            input = matcher.input;

                            return matchedString != input;
                        } catch (e) {
                            return true;
                        }
                    } else {
                        return false;
                    }

                }
            }
        };
    })
    .directive('minValue', function() {
        return {
            require: '?ngModel',
            link: function(scope, ele, attrs, ctrl) {
                var minValue, input;

                if (!ctrl) return;

                var validator = function(value) {
                    input = ctrl.$viewValue;
                    if (isGreaterThan(value)) {
                        ctrl.$setValidity('minValue', true);
                    } else {
                        ctrl.$setValidity('minValue', false);
                    }
                    return value;
                };

                ctrl.$formatters.push(validator);
                ctrl.$parsers.unshift(validator);

                attrs.$observe('minValue', function() {
                    minValue = attrs.minValue;
                    validator(ctrl.$viewValue);
                });

                function isGreaterThan(value) {
                    if (value || value === 0) {

                        try {
                            parseInput = parseInt(input, 10);
                            parseMinValue = parseInt(minValue, 10);
                            return parseInput > parseMinValue;
                        } catch (e) {
                            return true;
                        }
                    } else {
                        return false;
                    }

                }
            }
        };
    })
    .directive('maxValue', function() {
        return {
            require: '?ngModel',
            link: function(scope, ele, attrs, ctrl) {
                var maxValue, input;

                if (!ctrl) return;

                var validator = function(value) {
                    input = ctrl.$viewValue;
                    if (isLessThan(value)) {
                        ctrl.$setValidity('maxValue', true);
                    } else {
                        ctrl.$setValidity('maxValue', false);
                    }
                    return value;
                };

                ctrl.$formatters.push(validator);
                ctrl.$parsers.unshift(validator);

                attrs.$observe('maxValue', function() {
                    parseMaxValue = attrs.maxValue;
                    validator(ctrl.$viewValue);
                });

                function isLessThan(value) {
                    if (value || value === 0) {

                        try {
                            parseInput = parseInt(input, 10);
                            parseMaxValue = parseInt(parseMaxValue, 10);
                            return parseInput < parseMaxValue;
                        } catch (e) {
                            return true;
                        }
                    } else {
                        return false;
                    }

                }
            }
        };
    })
.directive('capitalizeFirst', function($parse) {
   return {
     require: 'ngModel',
     link: function(scope, element, attrs, modelCtrl) {
        var capitalize = function(inputValue) {
           if (inputValue === undefined) { inputValue = ''; }
           var capitalized = inputValue.charAt(0).toUpperCase() +
                             inputValue.substring(1);
           if(capitalized !== inputValue) {
              modelCtrl.$setViewValue(capitalized);
              modelCtrl.$render();
            }         
            return capitalized;
         };
         modelCtrl.$parsers.push(capitalize);
         capitalize($parse(attrs.ngModel)(scope)); // capitalize initial value
     }
   };
})
.directive('noSpecialChar', function() {
     return {
      require: 'ngModel',
      restrict: 'A',
      link: function(scope, element, attrs, modelCtrl) {
        modelCtrl.$parsers.push(function(inputValue) {
          if (!inputValue)
            return '';
          cleanInputValue = inputValue.replace(/[^\w\s]/gi, '');
          if (cleanInputValue != inputValue) {
            modelCtrl.$setViewValue(cleanInputValue);
            modelCtrl.$render();
          }
          return cleanInputValue;
        });
      }
    };
  });
