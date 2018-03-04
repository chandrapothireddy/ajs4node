module.exports = {
    defaults: {

        // Subject of the message
        subject: 'A quote was generated',

        // variables 
        variables: {
            link: '',
            salesRepName: '',
            vendorName: '',
            dateTime: '',
            quoteCompany: '',
            quoteMethod: '',
            quoteContact: '',
            quotePhone: '',
            quoteEmail: '',
            quoteAmount: '',
            quoteDesc: ''
        }
    }
};

/*
To: 
Marlin Rep

From: 
(Vendor Company Name)

Subject:
A quote was generated

Message: 
Hello (Marlin Rep Name), a quote was just generated for (Vendor Name).

The quote was generated Friday at 12:30am

Company	(End User Company)
Phone		(End User Phone)
Contact	(End User Name)
E-mail Address	(End User Email)
Amount	(Equipment Cost)
Equipment Description	(Equipment Description)

Click below to view the quote in your dashboard. http://127.0.0.1:3000/tools/quoter/523c8051bc4d130000000005
*/
