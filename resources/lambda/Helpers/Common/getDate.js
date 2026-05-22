const logger = require("../Utilities/logger");

// function getWorkingDaysDifference(startDate, currentDate) {
//     // This variable stores the total number of working days
//     let days = 0;
//     const date = new Date(currentDate);
//     while (date < startDate) {
//         date.setDate(date.getDate() + 1);
//         const day = date.getDay();
//         if (day !== 0 && day !== 6) {
//             days++;
//         }
//     }
//     // Return total number of working days
//     return days;
// }
function getWorkingDaysDifference(startDate, currentDate, workingDateSet) {

    let days = 0;
    const date = new Date(currentDate);
    const workingDates = [];

    while (date < startDate) {

        date.setDate(date.getDate() + 1);

        const formattedDate = date.toISOString().split("T")[0];

        if (workingDateSet.has(formattedDate)) {
            days++;
            workingDates.push(formattedDate);
        }
    }

    return {
        days: days,
        workingDates: workingDates
    };
}



function getTodayDate() {

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(today.getDate()).padStart(2, '0'); // Days are 1-based

    return `${year}-${month}-${day}`;
}

function formatDateToMMDDYY(inputDate) {
    const [year, month, day] = inputDate.split("-");
    return `${month}/${day}/${year}`;
}

function getNextDate(currentDate) {
    const today = new Date(currentDate);
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + 1); // Add one day  

    const year = nextDate.getFullYear();
    const month = String(nextDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(nextDate.getDate()).padStart(2, '0'); // Days are 1-based

    return `${year}-${month}-${day}`;
}



function getDate(dateFormat) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var date = new Date(dateFormat);
    const dayOfWeek = daysOfWeek[date.getDay()];
    //console.log("Split 1");
    logger.debug("Split 1");
    date = dateFormat.split("-");
    var getDate = '';
    for (let i = 0; i < date.length; i++) {
        if (date[i].length != 4) {
            getDate += '-' + date[i];
        }
    }
    getDate = getDate.replace(/-/i, '');
    //console.log('getDate', getDate);
    //console.log('dayOfWeek', dayOfWeek);
    return [getDate, dayOfWeek];

}

//-------------------------------getdatename both english and spanish --------------------------
function getDateName(dateFormat, intentRequest) {
    const daysOfWeek = intentRequest.bot.localeId == "es_US" ?
        ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] :
        ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var date = new Date(dateFormat);
    const dayOfWeek = daysOfWeek[date.getDay()];
    //console.log("Split 2");
    logger.debug("Split 2");
    date = dateFormat.split("-");
    var getDate = '';
    for (let i = 0; i < date.length; i++) {
        if (date[i].length != 4) {
            getDate += '-' + date[i];
        }
    }
    getDate = getDate.replace(/-/i, '');
    //console.log('getDate', getDate);
    //console.log('dayOfWeek', dayOfWeek);
    return [getDate, dayOfWeek];

}



function formatDate(input) {
    // Pad the input to ensure it's at least 4 characters long
    const paddedInput = input.padStart(4, '0');

    // Extract month and day
    const month = parseInt(paddedInput.slice(0, 2), 10);
    const day = parseInt(paddedInput.slice(2, 4), 10);

    // Get today's date and current year
    const now = new Date();
    const currentYear = now.getFullYear();

    // Build candidate date for this year
    let candidate = new Date(currentYear, month - 1, day);

    // Normalize "today" to midnight (start of day)
    const today = new Date(currentYear, now.getMonth(), now.getDate());

    // Validate the date (catch invalid MMDD like 0231 or 1332)
    const isValidDate =
        candidate.getMonth() === month - 1 &&
        candidate.getDate() === day;

    if (!isValidDate) {
        return "Invalid";
    }

    // If date is today or in the past → move to next year
    if (candidate < today) {
        candidate.setFullYear(currentYear + 1);
    }

    // Final year to return
    const year = candidate.getFullYear();

    // Return formatted YYYY-MM-DD
    return `${year}-${('0' + month).slice(-2)}-${('0' + day).slice(-2)}`;
}

function convertDateFormat(dateString) {
    // Split the date string by '-'
    //console.log("Split 3");
    logger.debug("Split 3");
    const [year, month, day] = dateString.split('-');
    // Rearrange to mm-dd-yyyy format
    return `${month}-${day}-${year}`;
}

function formattedDate(dateString) {
    // Split the input date string by '-'
    //console.log("Split 4");
    logger.debug("Split 4");
    const [year, month, day] = dateString.split('-');

    // Rearrange the parts to MM-DD-YYYY format
    return `${month}-${day}-${year}`;
}
function convertUsDate(usDate) {
    let [year, month, day] = usDate.split("-");
    return `${month}/${day}/${year}`;
    //console.log(usFormat); //
    logger.debug(usFormat);
}

module.exports = {
    getTodayDate,
    getNextDate,
    getDate,
    formatDate,
    formattedDate,
    convertDateFormat,
    getDateName,
    formatDateToMMDDYY,
    convertUsDate,
    getWorkingDaysDifference
};