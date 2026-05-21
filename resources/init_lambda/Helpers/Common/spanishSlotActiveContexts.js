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
    //console.log(availableIntents);
    switch (appSession.nextIntent) {
        case "AU103_AccountNumber":
            //appSession.stateName = appSession.baseLine + process.const.STR_Underscore + process.const.SN_AccountNumber;
            let nameMap1 = {
                DontHaveIt: 'AU205_DontHaveIt',
                MainMenu: 'AU106_MainMenu',
                HoldOn:'AU107_HoldOn',
                AccountNumber: 'AU103_AccountNumber',
                NewCustomer: 'AU105_NewCustomer'
            };
            let nameMap2 = {
                DontHaveIt: 'AU205_DontHaveIt',
                MainMenu: 'AU106_MainMenu',
                HoldOn:'AU107_HoldOn',
                AccountNumber: 'AU103_AccountNumber',
            };
            nameMap = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther ||
                appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                nameMap1 : nameMap2;
            slotkey = process.const.STR_AccountNumber;
            break;
        case "AU101_PhoneNumber":
            if (appSession.appSessionObj.cellPhoneCollectionPrompt == "Y") {
                nameMap = {
                    DontHaveIt: 'AU205_DontHaveIt',
                    PhoneNumber: 'AU101_PhoneNumber',
                };
            }
            else {
                let nameMap1 = {
                    DontHaveIt: 'AU205_DontHaveIt',
                    PhoneNumber: 'AU101_PhoneNumber',
                    NewCustomer: 'AU105_NewCustomer'
                };
                let nameMap2 = {
                    DontHaveIt: 'AU205_DontHaveIt',
                    PhoneNumber: 'AU101_PhoneNumber',
                };
                nameMap = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther ||
                    appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                    nameMap1 : nameMap2;
            }
            slotkey = process.const.STR_PhoneNumber;
            break;
        case "AU102_StreetNumber":
            nameMap = {
                DontHaveIt: 'AU205_DontHaveIt',
                StreetNumber: 'AU102_StreetNumber',
            };
            slotkey = process.const.STR_StreetNumber;
            break;
        default:
            availableIntents;
            break;
    }
    availableIntents = availableIntents.map(name => nameMap[name] || name);
    //console.log(availableIntents);
    if (availableIntents.includes(intentName) == false) {
        appSession.appSessionObj[slotkey + "Count"] = appSession.appSessionObj[slotkey + "Count"] == undefined || null ?
            0 : appSession.appSessionObj[slotkey + "Count"];
        appSession.appSessionObj[slotkey + "Retry"] = process.const.STR_True;
        intentRequest.sessionState.intent.slots[slotkey] = null;
        intentRequest.sessionState.intent.name = appSession.nextIntent;
        return appSession.nextIntent;
    }else{
    return intentName;
    }
};