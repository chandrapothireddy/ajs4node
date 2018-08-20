describe('User management', function() {

    it('Should require user to login before doing any management', function() {
        browser().navigateTo('/login');
        input('username').enter('bwalsh');
        input('password').enter('bwalsh');
        element('#login').click();
        expect(browser().location().url()).toEqual('/dashboard/quotes');
    });

    describe('Listing all users in the system', function() {

        // check for table and button, other form elements
        it('Should list current users in a table', function() {
            browser().navigateTo('/login');
            input('username').enter('bwalsh');
            input('password').enter('bwalsh');


            browser().navigateTo('/dashboard/users');
            expect(repeater('tbody tr').count()).toBeGreaterThan(1);
        });

        it('Should have a button for users to click to add a new user', function() {
            expect(element('#addUser').count()).toBe(1);
        });

        it('Should have a form for users to search users', function() {
            expect(repeater('tbody tr').count()).toBe(9);
            input('searchTerm').enter('Brian Walsh');
            expect(repeater('tbody tr').count()).toBe(1);
            input('searchTerm').enter('');
        });

    });

    describe('Adding a user', function() {

        it('Should take user to a form when they click the add user button', function() {
            browser().navigateTo('/dashboard/users');
            listLengthBefore = repeater('tbody tr').count();
            element('#addUser').click();
            expect(browser().location().url()).toEqual('/dashboard/users/new');
        });

        it('Should allow user to enter user information in a form', function() {
            expect(element('#save:disabled').count()).toBe(0);
            input('user.email').enter('mattmiller@facultycreative.com');
            expect(element('#save:disabled').count()).toBe(0);
        });

        /*
it('Button text should read "Save"', function() {
            expect(element('#save').text()).toEqual('Save');
        });
        
*/
        it('Clicking save user should redirect user back to users table', function() {
            element('#save').click();
            expect(browser().location().url()).toEqual('/dashboard/users');
        });

        /*
it('Should have one additional user in the table', function() {
            listLengthAfter = repeater('tbody tr').count();
            expect(listLengthAfter).toBeGreaterThanFuture(listLengthBefore);
        });
*/

    });

    describe('Editing a user', function() {

        it('Clicking edit should take user to edit user form', function() {
            element('.edit:first').click();
            //expect(browser().location().url()).toEqual('/dashboard/users/51e71518ed32080ffc000010');
        });

        /*
it('Button text should read "Save"', function() {
            expect(element('#save').text()).toEqual('Save');
        });
*/

        it('Should have editable fields', function() {
            input('user.email').enter('mattmiller@facultycreative.com');
        });

        it('Clicking update should take user back to user list', function() {
            element('#save').click();
            expect(browser().location().url()).toEqual('/dashboard/users');
        });

        it('Users information should be updated', function() {
            element('.edit:last').click();
            expect(input('user.email').val()).toEqual('mattmiller@facultycreative.com');
        });

        // @todo these will work once we re-write the specific service functions
        it('Should provide a button to remove a vendor from the user', function() {
            browser().navigateTo('/dashboard/users');
            element('.edit:eq(1)').click();
            element('.nav li:eq(1)').click();
            expect(repeater('ul.currentVendors li').count()).toBe(1);
            element('.icon-trash:first').click();
            expect(repeater('ul.currentVendors li').count()).toBe(0);
        });

        it('Should be able to add a vendor to the user once the user is saved', function() {
            element('.nav li:eq(1)').click();
            element('ul.addVendors li:first button').click();
            expect(repeater('ul.currentVendors li').count()).toBe(1);
        });

    });

    describe('Deleting a user', function() {

        it('Clicking delete should remove the user', function() {
            browser().navigateTo('/dashboard/users');
            var beforeCount = repeater('tbody tr').count();
            element('.delete:last').click();
            expect(repeater('tbody tr').count()).toBeOneLessThan(beforeCount);
        });

    });

});
