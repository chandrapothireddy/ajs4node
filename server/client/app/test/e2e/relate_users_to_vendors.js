describe('Relating Users to vendors', function() {

    it('Should require user to login before doing any management', function() {
        browser().navigateTo('/login');
        input('username').enter('bwalsh');
        input('password').enter('bwalsh');
        element('#login').click();
    });


    /*
it('Should display a count of the vendors a user is connected to on the users table', function() {
         browser().navigateTo('/dashboard/users'); 
         expect(element('tr:eq(2) > td:eq(3)').text()).toEqual('1');
    });

    it('Should display the marlin sales rep on the vendors table', function() {
         browser().navigateTo('/dashboard/vendors'); 
         expect(element('tr:eq(1) > td:eq(4) > img').count()).toBe(1); 
    });
*/

    describe('Managing relationships from the Vendor Edit page', function() {

        it('Should show the marlin rep on the vendor page', function() {
            browser().navigateTo('/dashboard/vendors/51e71518ed32080ffc000023');
            expect(element('.salesRepName').text()).toEqual('Jennifer DeLong');
        });

        it('Should provide a button to remove the current Marlin Rep', function() {
            expect(element('#removeSalesRep').count()).toBe(1);
        });

        /*
        it('Should provide a search field and button is there is no current vendor', function() {
            expect(element('.salesReps > li:first > button:first').count()).toBe(1); 
            input('salesRepId').enter('1');
            //element('#addSalesRep').click();
        });
        */

    });

    describe('Managing relationships from the User Edit page', function() {

        it('Should list vendors for the current user', function() {

        });

        it('Should provide a button to un-relate a single vendor from this user', function() {

        });

        it('Should provide an input field for searching vendors', function() {

        });

        it('Should provide a button to click and relate the searched for vendor to the user', function() {

        });

    });

});
