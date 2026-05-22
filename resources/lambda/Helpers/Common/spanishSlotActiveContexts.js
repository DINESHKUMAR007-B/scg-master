const logger = require("../Utilities/logger");
const retryController = require("../../Helpers/Controller/retryController");
exports.SpanishSlotActiveContexts = function (intentName, appSession, intentRequest, callback) {
    logger.info("Enter Spanish Slot Active Context Helper");
    let availableIntents = [];
    let slotkey;
    let nameMap;
    let promptOut;
    let promptOutR1;
    let promptOutR2;
    let activeContexts = intentRequest.sessionState.activeContexts;
    availableIntents = activeContexts.map(context => context.name);
    switch (appSession.nextIntent) {
        case "MS404_GetPhoneNumber":
            if (appSession.nextStateName == process.const.NS_SendSMSDiffSamePhNo || appSession.nextStateName == process.const.NS_SendSMS_DifferentPhoneNumberConfirmation||
                appSession.nextStateName == process.const.NS_SmartPhoneWebLinkConfimation) {
                nameMap = {
                    PhoneNumber: 'MS404_GetPhoneNumber',
                };
            }
            else if (appSession.appSessionObj.type == "2" && appSession.nextStateName != process.const.NS_Business_ExtensionNo) {
                nameMap = {
                    DontHaveIt: 'MS209_DontHaveIt',
                    PhoneNumber: 'MS404_GetPhoneNumber',
                    RemovePhoneNumber:'MS411_RemovePhoneNumber,'
                };  
            }
            else{
                nameMap = {
                    DontHaveIt: 'MS209_DontHaveIt',
                    PhoneNumber: 'MS404_GetPhoneNumber',
                }; 
            }
            slotkey = "phoneNumber";
            break;
        case "MS423_GetWorkPhoneExtNumber":
            nameMap = {
                DontHaveIt: 'MS209_DontHaveIt',
                PhoneExtNumber: 'MS423_GetWorkPhoneExtNumber',
            };
            slotkey = "getWorkPhoneExtNumber";
            break;
        default:
            availableIntents;
            break;
    }
    availableIntents = availableIntents.map(name => nameMap[name] || name);
    if (availableIntents.includes(intentName) == false) {
        appSession.appSessionObj[slotkey + "Count"] = appSession.appSessionObj[slotkey + "Count"] == undefined || null ?
            0 : appSession.appSessionObj[slotkey + "Count"];
        appSession.appSessionObj[slotkey + "Retry"] = process.const.STR_True;
        intentRequest.sessionState.intent.slots = {};
        intentRequest.sessionState.intent.slots[slotkey] = null;
        intentRequest.sessionState.intent.name = appSession.nextIntent;
        return appSession.nextIntent;
    }else{
    return intentName;
    }
};