/**
 * A validation helper for angular apps
 * ---------------------
 *
 * This service extends the angular validation methods to provide a simple and consistant
 * way to handle validation. It:
 *
 * - Provides extra validation methods, such as cash and zip code
 *   these can be used by setting `simple-validate` or `ui-validate` if using angular ui
 *
 *   @example <input ui-validate="{zip: 'Validator.validateZip($value)'}" />
 *   @example <input simple-validate="{numericality: {exp: 'Validator.validateCash($value, QuoterToolForm.cost)', message: 'Must be a number'}}" />
 *
 * @todo how are multiple valiations handled?
 *
 * - Provides a method for setting default validation messages
 *   Currently angular requires that you create an html element and message for each input
 *   This can get taxing if you are using the same validations over and over, thus
 *   repeating the same error message at multiple places in the DOM. Changing one requires a
 *   complex find and replace.
 *
 * - Provides a consistant formName.$setPristine() method.
 *   Anular 1.2 provides this method, but apparently there are still issues with it
 *   @todo add @see link to a discussion for ref.
 *
 * - Provides method to validatie an entire form (and change class based on validitiy)
 *
 * - Provides mehtod to validate form field.
 *
 * @note did we basically create our own version of ui-validate with simple-validate?
 * @note how does ui-validate-watch get supported?
 *
 * @todo what other fields are missing?
 *
 */

angular
    .module('app')
    .factory('Validator', ['$location', '$anchorScroll',
        function($location, $anchorScroll) {

            var isEmpty = function(x) {
                for (var y in x) {
                    return false;
                }
                return true;
            };

            var nullValues = function(x) {
                var returner = true;
                for (var y in x) {
                    if (x[y] !== null) {
                        returner = false;
                    }
                }
                return returner;
            };

            var Validator = {

                validationMessages: {
                    numericality: "Must be a number.",
					customFieldRequired :"Required Field",
                    required: "This field is required.",
                    zip: "A five or nine digit zip code is required.",
                    email: "Please enter a valid email address.",
                    mask: "Please enter a valid number",
                    social: "Please enter a valid social",
                    agree: "Please agree to the terms and conditions.",
                    phone: "Please enter a valid phone number.",
                    isUser: "Email not found. Please register or try again.",
                    url: "Please enter a valid url."
                },

                addValidationMessage: function(key, value) {
                    this.validationMessages[key] = value;
                },

                setDirty: function(form) {
                    form.$setDirty();
                },

                setPristine: function(form) {
                    form.$setPristine();
                },

                setDirtyField: function(input) {
                    if (input.$pristine) {
                        input.$pristine = false;
                        input.$dirty = true;
                    }
                },

                // @note this will be useful on the server too for the quoting
                validateCash: function(number, field) {
                    if (typeof number === 'string') {
                        if (!isNaN(Number(number)) && number.length > 0) {
                            return true;
                        } else {
                            number = number.replace(/[,$]/g, "");
                            if (!isNaN(Number(number)) && number.length > 0) {
                                field.$modelValue = number;
                                return true;
                            }
                        }
                    }
                    return false;
                },

                validateZip: function(zip) {

                    // in some cases zip may be blank, and if its not required this is OK,
                    // we need to be careful we are not setting fields error if they dont pass but are not required
                    if (!zip) return true;
                    if (/(^\d{5}$)|(^\d{5}-{0,1}\d{4}$)/.test(zip)) return true;
                    return false;
                },

                validatePhone: function(phone) {
                    if (!phone) return true;

                    if (/(^\d{10}$)/.test(phone)) return true;
                    return false;
                },

                validateSocial: function(social) {
                    if (!social) return true;

                    if (/(^\d{9}$)/.test(social)) return true;
                    return false;
                },
				
				validateEmail: function(email) {
                    if (!email) return true;

                    if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return true;
                    return false;
                },

                // works almost like required, except allows us to easily set custom message
                // optionally we could set a date agreeded, or something else
                validateAgree: function(checked) {
                    if (checked) return true;
                    return false;
                },


                validateState: function(state) {
                    if (/^(A[LKSZRAEP]|C[AOT]|D[EC]|F[LM]|G[AU]|HI|I[ADLN]|K[SY]|LA|M[ADEHINOPST]|N[CDEHJMVY]|O[HKR]|P[ARW]|RI|S[CD]|T[NX]|UT|V[AIT]|W[AIVY])$/.test(state)) return true;
                    return false;
                },

                setErrors: function(field, errors) {
                    if (field && typeof field.$error === 'object') {
                        for (var key in field.$error) {
                            if (field.$error[key] === true) {
                                if (this.validationMessages[key]) {
                                    errors[field.$name] = this.validationMessages[key];
                                } else {
                                    errors[field.$name] = key.toString();
                                }
                                break;
                            } else if (field.$error[key] === false) {
                                errors[field.$name] = null;
                            }
                        }
                    }
                },

                removeInvalidation: function(field, form) {
                    var errors = {};
                    this.setErrors(field, errors);
                    if (!form.FacultyErrors) {
                        form.FacultyErrors = {};
                    }
                    if (nullValues(errors)) {
                        form.FacultyErrors[field.$name] = null;
                    }
                    if (form.FacultyErrors[field.$name]) {
                        form.FacultyErrors[field.$name] = errors[field.$name];
                    }
                },

                validateField: function(field, form) {
                    var errors = form.FacultyErrors = form.FacultyErrors || {};
                    // @note checking for $pristine will prevent errors from being displayed if user
                    // has NOT entered any content in the field
                    //if(field.$pristine) return;

                    this.setErrors(field, errors);
                    if (!nullValues(errors)) {
                        form.FacultyErrors = errors;
                    }
                },

                validateForm: function(form) {
                    var errors = form.FacultyErrors = {};
                    for (var f in form) {
                        var field = form[f];
                        this.setErrors(field, errors);
                    }
                    if (!nullValues(errors)) {
                        form.FacultyErrors = errors;
                        // Errors will display when the form fields are
                        // dirty and invalid. If a user has missed a field,
                        // the input will be invalid, but pristine. If we
                        // automatically set the whole field to dirty,
                        // the missed fields will be revealed.
                        // $location.hash(Object.keys(errors)[0]);
                        $anchorScroll();
                        this.setDirty(form);
                        return false;
                    }
                    return true;
                },

                removeErrors: function(field, errors) {
                    for (var key in field.$error) {
                        if (field.$error[key] === true) {
                            return;
                        }
                    }
                    errors[field.$name] = null;
                },

                alertFieldSuccess: function(form) {
                    var errors = form.FacultyErrors = form.FacultyErrors || {};
                    for (var f in form) {
                        var field = form[f];
                        this.removeErrors(field, errors);
                    }
                }
            };
            return Validator;
        }
    ])
    .directive('formGroup', function() {
        return {
            restrict: 'EA',
            transclude: true,
            template: "<div ng-transclude ng-class='{formGroupFinished: checkValidity()}'></div>",
            scope: {},
            controller: ['$scope',
                function($scope) {
                    $scope.fields = [];
                    this.addField = function(field) {
                        $scope.fields.push(field);
                    };
                }
            ],

            link: function(scope, element, attrs) {
                var form = scope.$parent[attrs.form];
                scope.form = form;

                scope.fields.forEach(function(f) {
                    f.bind('keyup', function(event) {
                        scope.$parent.Validator.alertFieldSuccess(form);
                        scope.$apply();
                        scope.checkValidity();
                    });
                });

                scope.checkValidity = function() {
                    var validity = true;
                    scope.fields.forEach(function(field) {
                        if (form[field[0].name] && form[field[0].name].$invalid) {
                            validity = false;
                        }
                    });
                    return validity;
                };
                scope.checkValidity();
            }
        };
    })

/**
 * Used of form inputs, selects, etc. to register with a `form-group` area
 * formGroup will validate all child `form-field` inputs to check validity.
 *
 * @note that inputs where model props are not objects, for example:
 *   ng-model='variable' instead of ng-model='object.variable'
 *   will have trouble with scope. To avoid this specify ng-model='$parent.variable' or
 *   use as an object.
 *
 * @see https://github.com/FacultyCreative/MRL001/commit/9ff4f7b48f6eb1ffa5724921c1f2525b0193e938
 *
 */
.directive('formField', function() {
    return {
        restrict: 'EA',
        scope: false,
        require: '^formGroup',
        link: function(scope, element, attrs, formGroupCtrl) {
            formGroupCtrl.addField(element);
        }
    };
})
    .directive('simpleValidate', function() {

        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {
                var validateFn, watch, validators = {},
                    validateExpr = scope.$eval(attrs.simpleValidate);

                Object.keys(validateExpr).forEach(function(key) {
                    if (!validateExpr[key]) {
                        return;
                    }

                    if (typeof scope.Validator === 'object') {
                        scope.Validator.addValidationMessage(key, validateExpr[key].message);
                    }

                    if (angular.isString(validateExpr[key].exp)) {
                        validateExpr[key] = validateExpr[key].exp;
                    }
                });

                angular.forEach(validateExpr, function(exprssn, key) {
                    validateFn = function(valueToValidate) {
                        var expression = scope.$eval(exprssn, {
                            '$value': valueToValidate
                        });
                        if (angular.isFunction(expression.then)) {
                            // expression is a promise
                            expression.then(function() {
                                ctrl.$setValidity(key, true);
                            }, function() {
                                ctrl.$setValidity(key, false);
                            });
                            return valueToValidate;
                        } else if (expression) {
                            // expression is true
                            ctrl.$setValidity(key, true);
                            return valueToValidate;
                        } else {
                            // expression is false
                            ctrl.$setValidity(key, false);
                            return undefined;
                        }
                    };
                    validators[key] = validateFn;
                    ctrl.$formatters.push(validateFn);
                    ctrl.$parsers.push(validateFn);
                });

                // Support for ui-validate-watch
                if (attrs.uiValidateWatch) {
                    watch = scope.$eval(attrs.uiValidateWatch);
                    if (angular.isString(watch)) {
                        scope.$watch(watch, function() {
                            angular.forEach(validators, function(validatorFn, key) {
                                validatorFn(ctrl.$modelValue);
                            });
                        });
                    } else {
                        angular.forEach(watch, function(expression, key) {
                            scope.$watch(expression, function() {
                                validators[key](ctrl.$modelValue);
                            });
                        });
                    }
                }
            }
        };
    });
