const logger = require("../Utilities/logger");

function ValidateDate(givenDate) {
    logger.info("Enter Validate Date function");
    let valid;
    let recordDate = new Date(givenDate);
    let currentDate = new Date();
    let differenceInTime = currentDate.getTime() - recordDate.getTime();
    let differenceInDays = Math.round(differenceInTime / (1000 * 3600 * 24));
    if (differenceInDays > 15) {
        valid = "false";
    }
    else if (differenceInDays < 15) {
        valid = "true";
    }
    return valid;
}
function correctInterpretedValue(originalValue) {
    const wordToDigit = {
        "zero": "0", "one": "1", "two": "2", "three": "3",
        "four": "4", "five": "5", "six": "6", "seven": "7",
        "eight": "8", "nine": "9"
    };

    const zeroVariants = ["oh", "o", "oo", "ou"];
    const allowedLetters = /^[a-zA-Z]$/;

    // If input is already digits + optional trailing letter
    const onlyDigits = originalValue.trim().replace(/\s+/g, '');
    if (/^\d+[a-zA-Z]?$/.test(onlyDigits)) {
        return {
            streetNumberPhrase: onlyDigits.split('').join(' '),
            correctedValue: onlyDigits
        };
    }

    const words = originalValue.toLowerCase().trim().split(/\s+/);
    const numberWords = [];
    const digitArray = [];

    let i = 0;
    while (i < words.length) {
        let word = words[i].replace(/[^\w]/g, '');  // remove punctuation
        const nextWord = (words[i + 1] || "").replace(/[^\w]/g, '');

        if (word === "zero" && zeroVariants.includes(nextWord)) {
            digitArray.push("0");
            numberWords.push("zero");
            i += 2;
        } else if (wordToDigit[word]) {
            digitArray.push(wordToDigit[word]);
            numberWords.push(word);
            i += 1;
        } else if (zeroVariants.includes(word)) {
            // Skip lone "oh", "o", etc.
            i += 1;
        } else if (allowedLetters.test(word)) {
            digitArray.push(word);
            numberWords.push(word);
            i += 1;
        } else {
            i += 1;
        }
    }

    return {
        streetNumberPhrase: numberWords.join(" "),
        correctedValue: digitArray.join("")
    };
}
function UpdatedOriginalValue(spoken) {
    const wordToDigit = {
        "zero": "0",
        // "oh" is intentionally excluded
        "one": "1",
        "two": "2",
        "three": "3",
        "four": "4",
        "five": "5",
        "six": "6",
        "seven": "7",
        "eight": "8",
        "nine": "9"
      };
      
      const numberStr = spoken
        .toLowerCase()
        .split(" ")
        .map(word => wordToDigit[word])      // map to digit or undefined
        .filter(Boolean)                     // remove undefined (like "oh")
        .join("");
      
      const number = parseInt(numberStr, 10);
      
      //console.info(number);
      return number;
}
module.exports = {
    ValidateDate,
    correctInterpretedValue,UpdatedOriginalValue
};
