describe('Tools: Location Tool', function() {

    describe('Public facing locator tool', function() {

        it('Should be publically accessiable.', function() {
            browser().navigateTo('/tools/locator');
            expect(browser().location().url()).toEqual('/tools/locator');
        });

        it('Should display a map', function() {
            browser().navigateTo('/tools/locator');
            expect(element('.angular-google-map').count()).toBe(1);
        });

        it('Should display a map with clickable markers', function() {
            expect(element('.marker').count()).toBeGreaterThan(1);
        });


        it('Should display a list of vendors', function() {
            expect(element('#markerList > li').count()).toBeGreaterThan(1);
        });

        it('Should provide methods for searching location', function() {

            it('Should provide a "geo location" button if the browser supports it', function() {});

            it('Should provide an input to enter a location', function() {});

            it('Should enable button when location is inputted', function() {});

            it('Should display a button to "search this area" if user drags map', function() {});

        });

        it('Should provide method for searching by tag', function() {});

        it('Should enable button when searching by industry', function() {});

    });


    describe('Admin dashboard', function() {

        it('Should require user to login before doing any management', function() {
            browser().navigateTo('/login');
            input('username').enter('bwalsh');
            input('password').enter('bwalsh');
            element('#login').click();
        });

        it('Should provide a customization tab if tool is on', function() {});

        it('Should allow admin to move the marker on behalf of vendor to change their "geo location"', function() {});

    });


    describe('Vendor dashboard', function() {

        it('Should require user to login before doing any management', function() {
            browser().navigateTo('/login');
            input('username').enter('bwalsh');
            input('password').enter('bwalsh');
            element('#login').click();
        });

        it('Should show vendors current "geo location" on a map.', function() {});

        it('Should allow vendor to move the marker to change their "geo location"', function() {});

    });


    describe('Turning tool on / off per vendor', function() {

        it('Should require user to login before doing any management', function() {
            browser().navigateTo('/login');
            input('username').enter('bwalsh');
            input('password').enter('bwalsh');
            element('#login').click();
        });

        it('Should provide option for admin to turn on / off the tool per vendor', function() {});

        it('Should get geo location from business address when tool is turned on for vendor', function() {});

        it('Should not include vendor in results if tool is off for that vendor', function() {});

        it('Should not allow vendor to toggle on / off state', function() {});

    });



});
