angular
    .module('app')
    .factory('CommonInterface', ['$location', 'FormHelper', '$rootScope',
        function($location, FormHelper, $rootScope) {
            return {
                save: function(options) {
                    // Strategy pattern; hand in an object to perform local
                    // pre-save setup or post-save breakdown, if necessary
                    var preSaveHook = options.preSaveHook || options.strategy || function() {};
                    var postSaveHook = options.postSaveHook || function() {};

                    // Service object supporting thenable interface with add & save methods
                    var Model = options.Model;

                    // The local instance of this model 
                    var instance = options.instance;

                    // The routeParams id
                    var id = options.id;

                    // The form to reset to pristine after save
                    var form = options.form;

                    // The redirect URL, if doRedirect is set to true
                    var redirectUrl = options.redirectUrl;

                    // Whether or not to redirect. If false, the save method will set the form
                    // to pristine and stay on the same page. 
                    var doRedirect = options.doRedirect || false;

                    var formsValid = true;

                    if (!form) return;

                    // ******** Execute the Strategy ******** //
                    preSaveHook();
                    // ********* Validate the form ********* //
                    // ********* Save the model if ********* //
                    // ********* Valid, or display ********* //
                    // *************** errors ************** //

                    if (isArray(form)) {
                        processForms();
                    }
					if (isObj(form)) {
                        processForm();
                    }
										
                    // ********** Private Methods ************ //

                    function isArray(obj) {
                        return typeOf(obj) == '[object Array]';
                    }

                    function isObj(obj) {
                        return typeOf(obj) == '[object Object]';
                    }

                    function typeOf(obj) {
                        return Object.prototype.toString.call(obj);
                    }

                    function processForms() {
                        form.forEach(function(f) {
                            checkFormValidity(f);
                        });
                        if (formsValid) {
							successCallback();
                        }
                        if (!formsValid) {
                            form.forEach(function(f) {
                                markInvalidFields(f);
                            });
                        }
                    }

                    function checkFormValidity(form) {
                        if (form.$invalid) {
                            formsValid = false;
                        }
                    }

                    function processForm() {
                        if (form.$valid) {
									
						
                            successCallback();
                        }
                        if (form.$invalid) {
                            markInvalidFields(form);
                        }
                    }

                    function markInvalidFields(form) {
                        $rootScope.Validator.validateForm(form);
                    }

                    function successCallback() {
                        // ********* Perform Model.add ********* //
                        // ******** if not on show page ******** //
                        if (!id) {
                            Model.add(instance).then(function(response) {
                                instance = response;
                                id = instance._id;
                                postSaveLogic({
                                    resourceId: id,
                                    response: response
                                });
                            });

                            // ******* Perform Model.update ******** //
                            // ********* if on show page ********** //

                        } else {

                            Model.update(instance).then(function(response) {
                                instance = response;
                                postSaveLogic({
                                    response: response
                                });
                            });

                        }
                    }

                    function postSaveLogic(opts) {
                        resourceId = opts.resourceId || undefined;
                        response = opts.response || undefined;
                        redirectToNewResource(resourceId);
                        handleRedirectOverride();
                        setPristine();
                        postSaveHook(response);
                    }

                    function handleRedirectOverride() {
                        if (doRedirect) {
                            $location.url(redirectUrl);
                        }
                    }

                    function redirectToNewResource(resourceId) {
                        if (resourceId) {
                            $location.url(redirectUrl + '/' + id);
                        }
                    }

                    function setPristine(resourceId) {
                        if (!resourceId) {
                            FormHelper.setPristine(form);
                        }
                    }

                }
            };
        }
    ]);