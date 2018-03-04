var numeral = require('numeral');



/**
 * Converts a string or number to cents.
 *
 */
module.exports.toCents = function(mixed, cb) {

    // convert cost to string and save as variable for processing
    var totalCost = mixed.toString();

    // split to make sure there are max 2 parts, such as 000.00
    var splitNumber = totalCost.split('.');

    // check for proper decimal places and only 1 decimal place if any
    if (splitNumber.length > 2 || splitNumber[1] && splitNumber[1].length > 2) {
        cb("Invalid totalCost. Must be in for format 1000.00 or 1000. Sending one decimal place, such as 1000.1 is OK too and will be processed ad 1000.10.");
    }

    // strip non-number junk from our value
    // this also strips trailing 0's, so we'll add them back on in the next step
    totalCost = numeral().unformat(totalCost);
    //console.log('numeral().unformat(totalCost) = ', totalCost);

    // formats number with 2 decimal places, so 100.1 becomes 100.10
    totalCost = numeral(totalCost).format('0.00').toString();
    //console.log('numeral(totalCost).format() = ', totalCost);

    // replace the decimal, making the number in cents
    // we do this instead of number * 100 because this can cause rounding issues
    totalCost = totalCost.replace('.', '');
    //console.log('Final totalCoast in cents ', totalCost);

    // convert back into number. There shouldn't be an issue with decimal places
    // at this point because we'll have an integer and not a float
    totalCost = parseInt(totalCost, 10);

    cb(null, totalCost);

};
