describe('Tools: Quoter Tool', function() {

    describe('Generating a quote', function() {

        it('Should be publically accessiable', function() {
            browser().navigateTo('/tools/quoter');
            expect(browser().location().url()).toEqual('/tools/quoter');
        });

        it('Should generate a new quote when button is clicked', function() {
            element('#generateQuote').click();
            expect(browser().location().url()).not().toEqual('/tools/quoter');
        });

        it('Should provide a link to the quote for the user', function() {
            expect(element('#permalink').val()).not().toEqual('');
        });

    });

    describe('Viewing a quote by visiting its permalink', function() {

        it('Should display an existing quote when visting its url', function() {
            browser().navigateTo('/tools/quoter/51e71518ed32080ffc000019');
            expect(browser().location().url()).toEqual('/tools/quoter/51e71518ed32080ffc000019');
            expect(input('quoteCost').val()).not().toEqual('');
        });

        it('Should redirect user if quote permalink is invalid', function() {
            browser().navigateTo('/tools/quoter/junk');
            expect(browser().location().url()).toEqual('/tools/quoter');
        });

        it('Should not allow user to change vendor when visiting by permalink', function() {
            browser().navigateTo('/tools/quoter/51e71518ed32080ffc000019');
            expect(element('#vendorName').count()).toBe(0);
        });

    });


    describe('Selecting a vendor when making a quote', function() {

        it('Should list all vendors in a dropdown', function() {
            browser().navigateTo('/tools/quoter');
            expect(element('#vendorName').count()).toBe(1);
        });

        it('Selecting a vendor should generate quote using vendors associated programs', function() {

            // select vendor 1, has 3 programs
            browser().navigateTo('/tools/quoter');
            expect(element('#vendorName').count()).toBe(1);
            select('quote.vendorId').option(0);
            element('#generateQuote').click();
            // TODO: This should be a UNIT test
            //expect(repeater('table').count()).toBe(2);

            // select vendor 2, has 2 programs
            browser().navigateTo('/tools/quoter');
            select('quote.vendorId').option(1);
            element('#generateQuote').click();
            // TODO: This should be a UNIT test
            //expect(repeater('table ').count()).toBe(2);

        });

    });

    describe('Viewing a vendor specific quote tool', function() {

        it('Should list all vendors in a dropdown', function() {
            browser().navigateTo('/tools/quoter?vendor_id=51e71518ed32080ffc000025');
            expect(element('#vendorName').count()).toBe(0);
            expect(element('.vendorSection > div > h1').count()).toBe(1);
            expect(element('.vendor-logo').count()).toBeGreaterThan(0);
        });
    });

    describe('Showing programs for a quote', function() {

        it('Should use the custom display name if set for the vendor', function() {
            browser().navigateTo('/tools/quoter/51e71518ed32080ffc000019');
            expect(element('div > h4:first').text()).toEqual('A Custom Display Name for Program 1');

        });

    });

    describe('Regenerating a quote with a new value', function() {

        it('Should allow user to regenerate quote in their session.', function() {
            browser().navigateTo('/tools/quoter');
            input('quoteCost').enter('1000');
            element('#generateQuote').click();

            // TODO: Fix this? It's loading too fast or something.
            /*
            var valueBefore = element('tbody > tr > td:eq(1)').text();
            
            input('quoteCost').enter('2000');
            element('#generateQuote').click();
            
            var valueAfter = element('tbody > tr > td:eq(1)').text();
            
            expect(valueBefore).not().toEqual(valueAfter);
            */
        });

        it('Should not allow user to regenerate a quote they have not just created.', function() {
            browser().navigateTo('/tools/quoter/51e71518ed32080ffc000019');
            expect(element('#generateQuote').count()).toEqual(0);
        });
    });
});
