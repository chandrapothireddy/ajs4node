describe('Vendor management', function() {

    it('Should require user to login before doing any management', function() {
        browser().navigateTo('/login');
        input('username').enter('bwalsh');
        input('password').enter('bwalsh');
        element('#login').click();
    });

    describe('Listing all vendors in the system', function() {

        // check for table and button, other form elements
        it('Should list current vendors in a table', function() {
            browser().navigateTo('/dashboard/vendors');
            expect(repeater('tbody tr').count()).toBeGreaterThan(1);
        });

        it('Should have a button for users to click to add a new vendor', function() {
            expect(element('#addVendor').count()).toBe(1);
        });

        it('Should have a form for users to search vendors', function() {
            input('searchTerm').enter('BearCom');
            expect(repeater('tbody tr').count()).toBe(1);
            input('searchTerm').enter('');
        });

        it('Should provide a link to view the vendors caluclator', function() {
            browser().navigateTo('/dashboard/vendors');
            element('.viewCalculator:eq(1)').click();
            expect(browser().location().url()).toEqual('/tools/quoter?vendor_id=51e71518ed32080ffc000024');
        });

    });

    describe('Adding a vendor', function() {

        it('Should take user to a form when they click the add vendor button', function() {
            browser().navigateTo('/dashboard/vendors');
            listLengthBefore = repeater('tbody tr').count();
            element('#addVendor').click();
            expect(browser().location().url()).toEqual('/dashboard/vendors/new');
        });

        it('Should allow user to enter vendor information in a form', function() {
            expect(element('#save:disabled').count()).toBe(0);
            input('vendor.name').enter('A Test Vendor!!!!!!');
            expect(element('#save:disabled').count()).toBe(0);
        });
        /*

        it('Button text should read "Add Vendor"', function() {
            expect(element('#save').text()).toEqual('Add Vendor');
        });
*/

        it('Clicking save vendor should redirect user back to vendors table', function() {
            element('#save').click();
            expect(browser().location().url()).toEqual('/dashboard/vendors');
        });

        /*
        it('Should have one additional vendor in the table', function() {
            listLengthAfter = repeater('tbody tr').count();
            expect(listLengthAfter).toBeGreaterThanFuture(listLengthBefore);
        });
*/

    });

    describe('Editing a vendor', function() {

        it('Clicking edit should take user to edit vendor form', function() {
            element('.edit:first').click();
            expect(browser().location().url()).toEqual('/dashboard/vendors/51e71518ed32080ffc000023');
        });

        /*
        it('Button text should read "Update Vendor"', function() {
            expect(element('#save').text()).toEqual('Update Vendor');
        });
        */

        it('Should have editable fields', function() {
            input('vendor.name').enter('Changed the vendor Name');
            input('vendor.businessAddress.address1').enter('An address');
        });

        it('Clicking update should take user back to vendor list', function() {
            element('#save').click();
            expect(browser().location().url()).toEqual('/dashboard/vendors');
        });

        it('Vendors information should be updated', function() {
            expect(element('tr:last > td:eq(1)').text()).toEqual('Changed the vendor Name');
        });

        it('Should provide a cancel button that takes user back to vendor dashboard', function() {
            element('.edit:last').click();
            expect(browser().location().url()).toEqual('/dashboard/vendors/51e71518ed32080ffc000023');
            element('#cancel').click();
            expect(browser().location().url()).toEqual('/dashboard/vendors');
        });

        it('Should be able to add Sales Rep To Vendor', function() {
            element('.edit:eq(1)').click();
            expect(browser().location().url()).toEqual('/dashboard/vendors/51e71518ed32080ffc000025');
            element('.nav li:eq(1)').click();
            input('salesRepId').enter('Jennifer DeLong');
            expect(repeater('ul.salesReps li').count()).toBe(1);
            element('ul.salesReps li:first button').click();
            expect(element('h5.salesRepName').text()).toEqual('Jennifer DeLong');
            input('salesRepId').enter('');
        });

        it('Should be able to remove Sales Rep', function() {
            element('#removeSalesRep').click();
            expect(repeater('ul.salesReps li').count()).toBe(9);
            element('#cancel').click();
        });


    });

    describe('Deleting a vendor', function() {

        it('Clicking delete should remove the vendor', function() {
            browser().navigateTo('/dashboard/vendors');
            var vendorCount = repeater('tbody tr').count();
            element('.delete:first').click();
            expect(repeater('tbody tr').count()).toBeOneLessThan(vendorCount);
        });

    });

});
