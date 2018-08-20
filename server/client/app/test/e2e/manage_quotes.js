describe('Quote management', function() {

    it('It should require logging in before any quote management', function() {
        browser().navigateTo('/login');
        input('username').enter('bwalsh');
        input('password').enter('bwalsh');
        element('#login').click();
    });

    describe('Listing all quotes in the system', function() {

        // check for table and button, other form elements
        it('Should list current quotes in a table', function() {
            browser().navigateTo('/dashboard/quotes');
            expect(repeater('tbody tr').count()).toBeGreaterThan(1);
        });

        it('Should have a button for users to click to add a new quote', function() {
            expect(element('#addQuote').count()).toBe(1);
        });


    });


    describe('Filtering quotes', function() {

        it('Should have a form for users to search by description', function() {
            var listLengthBefore = repeater('tbody tr').count();
            input('searchDesc').enter('I need new rockets');
            var listLengthAfter = repeater('tbody tr').count();
            expect(listLengthBefore).toBeGreaterThanFuture(listLengthAfter);
            input('searchDesc').enter('');
        });

        it('Should have buttons to filter by status', function() {
            var listLengthBefore = repeater('tbody tr').count();
            element('#filterArchived').click();
            var listLengthAfter = repeater('tbody tr').count();
            expect(listLengthBefore).toBeGreaterThanFuture(listLengthAfter);
            expect(repeater('tbody tr').count()).toBe(2);
            element('#filterAll').click();
            expect(repeater('tbody tr').count()).toBe(4);
        });

        it('Should be able to search by vendor name', function() {
            browser().navigateTo('/dashboard/quotes');
            input('searchVend').enter('Bearcom');
            expect(repeater('tbody tr').count()).toBe(1);
            input('searchVend').enter('');
        });

    });

    describe('Adding a quote', function() {

        it('Should take user to a form when they click the add quote button', function() {
            browser().navigateTo('/dashboard/quotes');
            listLengthBefore = repeater('tbody tr').count();
            element('#addQuote').click();
            expect(browser().location().url()).toEqual('/tools/quoter');
        });
        /*

        it('Should allow user to enter quote information in a form', function() {
            expect(element('#save:disabled').count()).toBe(0);
            input('quote.description').enter('A test quote');
            input('quote.totalCost').enter(1111);
            expect(element('#save:disabled').count()).toBe(0);
        });
        
        it('Button text should read "Save"', function() {
            expect(element('#save').text()).toEqual('Save');
        });
        
        it('Clicking save quote should redirect user back to quotes table', function() {
            element('#save').click();
            expect(browser().location().url()).toEqual('/dashboard/quotes'); 
        });
        
        it('Should have one additional quote in the table', function() {
            listLengthAfter = repeater('tbody tr').count();
            expect(listLengthAfter).toBeGreaterThanFuture(listLengthBefore);
        });
*/

    });

    describe('Editing a quote', function() {

        it('Clicking edit should take user to edit quote form', function() {
            browser().navigateTo('/dashboard/quotes');
            element('.edit:first').click();
            //expect(browser().location().url()).toEqual('/dashboard/quotes/51eeb9afb350c64203000004');
        });

        it('Button text should read "Save"', function() {
            expect(element('#save').text()).toEqual('Update Quote');
        });

        it('Should have editable fields', function() {
            input('quote.description').enter('Something new to buy equipment for');
            input('quote.totalCost').enter(122);
        });

        it('Clicking update should take user back to quote list', function() {
            element('#save').click();
            expect(browser().location().url()).toEqual('/dashboard/quotes');
        });
        /*

        
        it('Quotes information should be updated', function() {
            expect(element('tr > td:last').text()).toEqual("$122");
            expect(element('tr > td:eq(1)').text()).toEqual('Something new to buy equiptment for');
        });
*/

    });

    describe('Changing a quotes status', function() {

        it('Should allow user to toggle the status between open and closed', function() {
            browser().navigateTo('/dashboard/quotes');
            element('#filterArchived').click();
            expect(repeater('tbody tr').count()).toBe(4);
            using('tbody tr:first ').element('.edit').click();
            element('.btn-group .btn:first').click();
            element('#save').click();
            element('#filterArchived').click();
            expect(repeater('tbody tr').count()).toBe(0);
        });

    });

    describe('Deleting a quote', function() {

        it('Clicking delete should remove the quote', function() {
            browser().navigateTo('/dashboard/quotes');
            var quoteCount = repeater('tbody tr').count();
            element('.delete:first').click();
            expect(repeater('tbody tr').count()).toBeOneLessThan(quoteCount);
        });

    });


});
