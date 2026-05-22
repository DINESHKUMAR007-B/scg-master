const logger = require("../Utilities/logger");
const getSessionAttributes = require("../Utilities/getSessionAttributes");
const logData = require("../Utilities/loggingData");
const loggingDatafunc = require("../Utilities/loggingData");

exports.DialogAction = function(
    type,
    intentRequest,
    name,
    messages,
    state,
    activeContexts = [],
    slotToElicit,
    slots
) {
    let sessionAttributes = intentRequest.sessionState.sessionAttributes;
    sessionAttributes = getSessionAttributes.getSessionAttributes(sessionAttributes, intentRequest, type, messages);


    switch (type) {
        case "ElicitSlot":
            return {
                sessionState: {
                        dialogAction: {
                            type: "ElicitSlot",
                            slotToElicit,
                        },
                        intent: {
                            state,
                            name,
                            slots,
                        },
                        sessionAttributes,
                    },
                    messages,
            };

        case "ElicitIntentActiveContext":
            return {
                sessionState: {
                        dialogAction: {
                            type: "ElicitIntent"
                        },
                        intent: {
                            state,
                            name,
                            slots: {},
                            confirmationState: "None"
                        },
                        activeContexts,
                        sessionAttributes,
                    },
                    messages,
            };

        case "StartIntent":
            return {
                sessionState: {
                        dialogAction: {
                            type: "StartIntent",
                        },
                        intent: {
                            name,
                        },
                        sessionAttributes,
                    },
                    messages,
            };
        case "SwitchToIntentSlot":
            let session_data = {
                dialogAction: {
                    type: "ElicitSlot",
                    slotToElicit,
                },
                intent: {
                    state,
                    name,
                    slots: {},
                    confirmationState: "None"
                },
                activeContexts,
                sessionAttributes,
            };
            session_data.intent.slots[slotToElicit] = null;
            return {
                sessionState: session_data,
                    messages,

            };
        case "Close":
            return {
                sessionState: {
                        dialogAction: {
                            type: "Close",
                        },
                        intent: {
                            state,
                            name,
                        },
                        sessionAttributes,
                    },
                    messages,
            };
        case "ElicitIntent":
            return {
                sessionState: {
                        dialogAction: {
                            type: "ElicitIntent",
                        },
                        sessionAttributes,
                    },
                    messages,
            };
            case "Delegate":
                let key = Object.keys(slots);
                //For phone number slot DTMF option
                if ([key[0]] == "phoneNumber" || 
                    key[0] == "getStreetNumber" || 
                    key[0] == "getStreetName" ||
                    key[0] == "getApartmentNumber" || 
                    key[0] == "getCity" ||
                    key[0] == "getState" || 
                    key[0] == "getZipCode" ||
                    key[0] == "date" 
                 ) {
                    logger.info("Delegate condition true in getLexResponse");
                    slots[key[0]] = {
                        value: {
                            interpretedValue: "1"
                        }
                    };
                } else {
                    logger.info("Delegate condition false in getLexResponse");
                    let value = Object.values(slots);
                    //For slots
                    value = key[0] == undefined || key[0] == "undefined" ? value : value[0]["value"]["interpretedValue"];
                    slots[key[0]] = {
                        value: {
                            interpretedValue: value[0]
                        }
                    };
                    slots = key[0] == undefined || key[0] == "undefined" ? {} : slots;
                }
                return {
                    sessionState: {
                        dialogAction: {
                            type: "Delegate"
                        },
                        intent: {
                            state,
                            name,
                            slots
                        },
                        sessionAttributes,
                    }
                };
    }
};

exports.SetActiveContexts = function(activeContexts, name, timeToLiveInSeconds = 1500, turnsToLive = 15) {
    //logger.info("Set active context for " + name);
    let contextObj = {
        contextAttributes: {},
        name,
        timeToLive: {
            timeToLiveInSeconds,
            turnsToLive
        }
    };
    activeContexts.push(contextObj);
    return activeContexts;
};

exports.DeleteSessionValues = function(sessionList, deleteList) {
    logger.info("Delete List session values  " + sessionList);
    deleteList.forEach(element => {
        delete sessionList[element];
        //console.log("after remove keys", sessionList);
    });

};

exports.BuildMessage = function(messageContent) {
    return [{
        contentType: "PlainText",
        content: messageContent,
    }, ];
};

exports.BuildValidationResult = function(
    isValid,
    violatedSlot,
    messageContent
) {
    return [{
        isValid,
        violatedSlot,
        message: { contentType: "PlainText", content: messageContent },
    }, ];
};

exports.BuildSSMLMessage = function(messageContent) {
    return [{
        contentType: "SSML",
        content: "<speak>" + messageContent + "</speak>",
    }, ];
};

exports.getStartTime = function(dateTime) {
    //logger.info("Enter time duration calculation");
    let date = dateTime;
 /*   let current_date = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    let current_time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    let date_time = current_date + " " + current_time;
    return date_time; */
    return date;
};
