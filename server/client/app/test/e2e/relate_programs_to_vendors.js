describe('Relating programs to vendors', function() {

    it('Should require user to login before doing any relating', function() {
        browser().navigateTo('/login');
        input('username').enter('bwalsh');
        input('password').enter('bwalsh');
        element('#login').click();
    });

    /*
it('Should list the programs that are currently related to a vendor', function() {
        browser().navigateTo('/dashboard/vendors/51e71518ed32080ffc000023');
        expect(repeater('#vendorPrograms li').count()).toBe(3);
    });
*/

    /*
  it('Should allow user to add a program to a vendor', function() {
        var vendorBefore = repeater('#vendorPrograms li').count();
        var allBefore = repeater('#allPrograms li').count();
        element('#allPrograms button:first').click();
        expect(repeater('#vendorPrograms li').count()).toBeOneMoreThan(vendorBefore);
        expect(repeater('#allPrograms li').count()).toBeOneLessThan(allBefore);
    });

    it('Should allow user to remove a program from a vendor', function() {
        browser().reload();
        expect(repeater('#vendorPrograms li').count()).toBe(3);
        element('#vendorPrograms button:first').click();
        expect(repeater('#vendorPrograms li').count()).toBe(2);
    });
*/

    it('Should allow user customize the displayName for the program per vendor', function() {

    });

    describe('Give a program a custom displayName on a per vendor basis', function() {

        it('Should provide input form for user to enter custom display name', function() {
            browser().navigateTo('/dashboard/vendors/51e71518ed32080ffc000023');
            expect(repeater('#vendorPrograms li:first > input').count()).toBeGreaterThan(0);
        });

        it('Should save the displayName with the vendor', function() {
            using('#vendorPrograms li:first').input('item.displayName').enter('Custom Display Name');
            element('#save').click();
            browser().navigateTo('/dashboard/vendors/51e71518ed32080ffc000023');
            expect(using('#vendorPrograms li:first').input('item.displayName').val()).toEqual('Custom Display Name');

        });

        it('Adding a program, entering a custom name, and removing it before saving the vendor should clear the custom name', function() {

        });

        it('Custom names should appear when returning to edit screen', function() {

        });

        it('Custom program names should not appear when assigning program to another vendor', function() {

        });

    });

});
