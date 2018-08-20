describe('Program management', function() {

    it('Should require user to login before doing any management', function() {
        browser().navigateTo('/login');
        input('username').enter('bwalsh');
        input('password').enter('bwalsh');
        element('#login').click();
    });

    describe('Listing all programs in the system', function() {

        // check for table and button, other form elements
        it('Should list current programs in a table', function() {
            browser().navigateTo('/dashboard/programs');
            expect(repeater('tbody tr').count()).toBeGreaterThan(0);
        });

        it('Should have a button for users to click to add a new program', function() {
            expect(element('#addProgram').count()).toBe(1);
        });

        it('Should have a form for users to search programs', function() {
            expect(repeater('tbody tr').count()).toBeGreaterThan(0);
            input('searchTerm').enter('48 monthsssssssssss');
            expect(repeater('tbody tr').count()).toBe(0);
            /*
input('searchTerm').enter('The Only Program that doesnt exist');
            expect(repeater('tbody tr').count()).toBe(0);
*/
            input('searchTerm').enter('');
        });

    });

    describe('Adding a Program', function() {

        it('Should take user to a form when they click the add program button', function() {
            browser().navigateTo('/dashboard/programs');
            listLengthBefore = repeater('tbody tr').count();
            element('#addProgram').click();
            expect(browser().location().url()).toEqual('/dashboard/programs/new');
        });

        it('Should provide a term length dropdown', function() {

        });

        it('Should allow user to enter program information in a form', function() {
            expect(element('#save:disabled').count()).toBe(0);
            input('program.name').enter('A Test Program!!!!!!');
            expect(element('#save:disabled').count()).toBe(0);
        });

        it('Button text should read "Add Program"', function() {
            expect(element('#save').text()).toEqual('Save');
        });

        it('Clicking save program should redirect user back to programs table', function() {
            element('#save').click();
            expect(browser().location().url()).toEqual('/dashboard/programs');
        });

        it('Should have one additional program in the table', function() {
            listLengthAfter = repeater('tbody tr').count();
            expect(listLengthAfter).toBeGreaterThanFuture(listLengthBefore);
        });

    });

    describe('Editing a program', function() {

        it('Clicking edit should take user to edit program form', function() {
            element('.edit:first').click();
            expect(browser().location().url()).toEqual('/dashboard/programs/51e71518ed32080ffc000006');
        });

        it('Button text should read "Save"', function() {
            expect(element('#save').text()).toEqual('Save');
        });

        it('Should have editable fields', function() {
            input('program.name').enter('Changed the program Name');
        });

        it('Clicking update should take user back to program list', function() {
            element('#save').click();
            expect(browser().location().url()).toEqual('/dashboard/programs');
        });

        it('Programs information should be updated', function() {
            expect(element('tr > td:first').text()).toEqual('Changed the program Name');
        });

    });

    /**
     * Points are added on a per vendor basis. Points are used to calculate the quote
     * Points means the vendor gets a percentage bonus on top of the sale.
     *
     * To calculate:
     *
     * Base Rate Factor x (1 + Percentage) = Points rate factor
     * example: Base Rate Factor x 1.01
     *
     */
    describe('Adding points to a program per vendor', function() {

        it('Should provide option to add points to a program on vendor edit page', function() {});

        it('Should limit points to whole numbers, from 0 to 5', function() {});

        it('Should not allow anyone but super admin to add points', function() {});

        it('Should factor points when generating quote with quoter tool', function() {});

    });

    describe('Deleting a program', function() {

        it('Clicking delete should remove the program', function() {
            browser().navigateTo('/dashboard/programs');
            var beforeCount = repeater('tbody tr').count();
            element('.delete:first').click();
            expect(repeater('tbody tr').count()).toBeOneLessThan(beforeCount);
        });

    });

});
