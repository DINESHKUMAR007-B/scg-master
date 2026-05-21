const logger = require("../Utilities/logger");
const catchHelper = require("../Common/catchHelper");

const GetSlots = function (slotName, intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    const outputSessionAttributes = intentRequest.sessionState.sessionAttributes || {};
    try {
        let slots = intentRequest["sessionState"]["intent"]["slots"];
        if (slots != null && slotName in slots && slots[slotName] != null) {
            logger.debug(slots);
            return slots[slotName]["value"]["interpretedValue"];
        }
        else {
            return null;
        }
    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};
const GetSlotsOriginalValue = function (slotName, intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    const outputSessionAttributes = intentRequest.sessionState.sessionAttributes || {};
    try {
        let slots = intentRequest["sessionState"]["intent"]["slots"];
        if (slots != null && slotName in slots && slots[slotName] != null) {
            logger.debug(slots);
            return slots[slotName]["value"]["originalValue"];
        }
        else {
            return null;
        }
    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};
function IsWaitIntent(intentRequest) {
    let intentName = "";
    let transcriptions = intentRequest["transcriptions"];
    if (transcriptions) {
        if (transcriptions.length > 0) {
            intentName = intentRequest["transcriptions"][0]["resolvedContext"]["intent"];
            return intentName == 'AMAZON.WaitIntent' ? true : false;
        }
    }
    return false;
}

function UpdateSlotForWaitAndContinue(slotName,intentRequest,slotValue = null) {
    intentRequest["sessionState"]["intent"]["slots"][slotName] = slotValue;
    return intentRequest;
}

function UpdateSlot(slotValue) {
    let updatedSlot = {
        shape: "Scalar",
        value: {
            originalValue: slotValue,
            resolvedValues: [slotValue],
            interpretedValue: slotValue,
        },
    };
    return updatedSlot;
}

module.exports = {
    GetSlots,
    GetSlotsOriginalValue,
    UpdateSlot,
    IsWaitIntent,UpdateSlotForWaitAndContinue
};
