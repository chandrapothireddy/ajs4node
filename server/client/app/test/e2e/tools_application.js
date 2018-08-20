describe('Tools: Application Tool', function() {

    describe('Generating applications', function() {

        it('Should not be accessiable unless user generated a quote first.', function() {
            browser().navigateTo('/tools/application');
            expect(browser().location().url()).toEqual('/tools/quoter');
            browser().navigateTo('/tools/application/1');
            expect(browser().location().url()).toEqual('/tools/quoter');
        });

        it('After generating a quote, a user should be able to start an application', function() {

            // got to quoter
            browser().navigateTo('/tools/quoter');

            // enter information
            input('quoteCost').enter('1000');
            input('quote.company.fullLegalBusinessName').enter('Your business!');

            sleep(1);

            // generate quote
            element('#generateQuote').click();
            expect(browser().location().url()).not(0).toEqual('/tools/quoter');



            // start an application
            element('.btn-select-term:first').click();

            // go to appication
            expect(browser().location().url()).not().toEqual('/tools/application');

        });

        it('Should carry over infomation from the quote to pre-fill forms', function() {

            expect(input('application.leasee.fullLegalBusinessName').val()).toEqual('Your business!');
            input('application.leasee.contactPerson.name').enter('Matt');

        });


        it('Should be vendor branded', function() {

            sleep(1);

            expect(element('.vendorSection > div > h1').count()).toBe(1);
            expect(element('.vendor-logo').count()).toBeGreaterThan(0);
        });

        it('Should display legal terms to end user', function() {
            expect(element('#legalTerms').text()).toBe('These are legal terms for vendor 1');
        });


        it('Should prompt for a Guarantor if end user is sole proprietor ', function() {

        });

        it('Should prompt for a Guarantor if business is less than 2 years old.', function() {

        });

        it('Should display a message if user has to provide Guarantor', function() {

        });


        it('Should validate legal terms as required before submitting application', function() {
            expect(element('#saveApplication:[disabled]').count()).toBe(1);
            input('application.agreeToTerms').check();
            // @note that we must use [disabled] here, instead of :disabled.
            // this is because :disabled checks for the on/off state of the button
            // while [disabled] checks for the disabled property.
            // because of how angular sets the disabled state, :disabled will be incorrect when
            // using ng-validate
            expect(element('#saveApplication:[disabled]').count()).toBe(0);
        });

        it('Should prompt end user to enter their prefered contact method', function() {
            element('.contact-method:first').click();
        });

        it('Should provide a save button', function() {
            expect(element('#saveApplication').count()).toBe(1);
            element('#saveApplication').click();
        });





    });

    describe('Securing applications from public view', function() {

        it('Should not be accessiable by url', function() {
            browser().navigateTo('/tools/application/51e71518ed32080ffc000021');
            expect(browser().location().url()).toEqual('/tools/quoter');
        });

    });

});
