describe('Authentication', function() {

    describe('Password protect dashboard', function() {

        it('Should protect /dashboard/programs', function() {

            browser().navigateTo('/logout');

            browser().navigateTo('/dashboard/programs');
            expect(browser().location().url()).toEqual('/login');
            browser().navigateTo('/dashboard/programs/new');
            expect(browser().location().url()).toEqual('/login');
            browser().navigateTo('/dashboard/programs/1');
            expect(browser().location().url()).toEqual('/login');
        });

        it('Should protect /dashboard/vendors', function() {

            browser().navigateTo('/logout');

            browser().navigateTo('/dashboard/vendors');
            expect(browser().location().url()).toEqual('/login');
            browser().navigateTo('/dashboard/vendors/new');
            expect(browser().location().url()).toEqual('/login');
            browser().navigateTo('/dashboard/vendors/51e71518ed32080ffc000023');
            expect(browser().location().url()).toEqual('/login');
        });

        it('Should protect /dashboard/quotes', function() {

            browser().navigateTo('/logout');

            browser().navigateTo('/dashboard/quotes');
            expect(browser().location().url()).toEqual('/login');
            browser().navigateTo('/dashboard/quotes/new');
            expect(browser().location().url()).toEqual('/login');
            browser().navigateTo('/dashboard/quotes/1');
            expect(browser().location().url()).toEqual('/login');
        });

        it('Should protect /dashboard/applications', function() {

            browser().navigateTo('/logout');

            browser().navigateTo('/dashboard/applications');
            expect(browser().location().url()).toEqual('/login');
            browser().navigateTo('/dashboard/applications/new');
            expect(browser().location().url()).toEqual('/login');
            browser().navigateTo('/dashboard/applications/1');
            expect(browser().location().url()).toEqual('/login');
        });

        it('Should protect /dashboard/users', function() {

            browser().navigateTo('/logout');

            browser().navigateTo('/dashboard/users');
            expect(browser().location().url()).toEqual('/login');
            browser().navigateTo('/dashboard/users/new');
            expect(browser().location().url()).toEqual('/login');
            browser().navigateTo('/dashboard/users/1');
            expect(browser().location().url()).toEqual('/login');
        });

    });


    describe('Allow public access to quoter and viewing quotes', function() {

        it('Should allow public access to quoter tool', function() {

            browser().navigateTo('/logout');

            browser().navigateTo('/tools/quoter');
            expect(browser().location().url()).toEqual('/tools/quoter');

            browser().navigateTo('/tools/quoter/51e71518ed32080ffc000018');
            expect(browser().location().url()).toEqual('/tools/quoter/51e71518ed32080ffc000018');
        });

    });

    describe('Logging into the dashboard', function() {

        it('Should provide a login form', function() {
            browser().navigateTo('/logout');
            browser().navigateTo('/login');
            input('username').enter('bwalsh');
        });

        it('Should deny users logging in when they enter the wrong password', function() {
            browser().navigateTo('/login');
            input('username').enter('bwalsh');
            input('password').enter('xxxxxxx');
            element('#login').click();
            expect(browser().location().url()).toEqual('/login');
        });

        it('Should deny users logging in when they enter the wrong email', function() {
            browser().navigateTo('/login');
            input('username').enter('admin@facultycreative.comssss');
            input('password').enter('admin');
            element('#login').click();
            expect(browser().location().url()).toEqual('/login');
        });

        it('Should allow user to login with correct credentials', function() {
            browser().navigateTo('/login');
            input('username').enter('bwalsh');
            input('password').enter('bwalsh');
            element('#login').click();
            expect(browser().location().url()).toEqual('/dashboard/quotes');
        });

        it('Should allow users to logout', function() {
            browser().navigateTo('/login');
            input('username').enter('bwalsh');
            input('password').enter('bwalsh');
            element('#login').click();
            element('#logout').click();
            expect(browser().location().url()).toEqual('/login');
        });


    });


});
