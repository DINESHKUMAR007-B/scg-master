const util = require("../../Helpers/Utilities/getLexResponse");
const logger = require("../../Helpers/Utilities/logger");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const catchHelper = require("../../Helpers/Common/catchHelper");
const agentHelper = require("../../Helpers/Common/agentHelper");
const ssmlMessage = require("../../Helpers/Common/ssmlHelper");
const callPath = require("../../Helpers/Common/callPathHelper");
const DontHaveIt = async function(intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let activeContexts = [];
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + process.const.STR_Underscore + process.const.SN_DontHaveIt;
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        //-----------------------------------------------------
        if (appSession.preStateName == `${appSession.baseLine}_Identification` || appSession.preStateName == `${appSession.baseLine}_PhoneNumber` ||
            appSession.preStateName == `${appSession.baseLine}_StreetNumber` || appSession.preStateName == `${appSession.baseLine}_No` ||
            appSession.preStateName == `${appSession.baseLine}_Yes` || appSession.preStateName == `${appSession.baseLine}_AccountNumber` ||
            (appSession.preStateName == `${appSession.baseLine}_Confirmation` || (appSession.preStateName == `${appSession.baseLine}_No` && 
            appSession.nextStateName == process.const.NS_AIN_Identified))) {
            if (appSession.nextIntent == process.const.AU101 || ( appSession.nextIntent == process.const.AU205 && appSession.preStateName == `${appSession.baseLine}_PhoneNumber`)) {//intentRequest.bot.localeId == "es_US" &&
                if (appSession.nextStateName == process.const.NS_PhoneNumber && appSession.callerGoal == process.const.CG_CellNumberCollection) {
                    appSession.nextIntent = process.const.AU201;
                    appSession.nextStateName = process.const.NS_CellPhnColl_PhoneNumberConfirmation;
                    callback(
                        util.DialogAction(
                            process.const.DA_Delegate,
                            intentRequest,
                            appSession.nextIntent,
                            util.BuildSSMLMessage(""),
                            process.const.STR_Fulfilled,
                            activeContexts,
                            process.const.STR_Default,
                            intentRequest.sessionState.intent.slots,
                        )
                    );
                    return;
                }
                //activeContexts = util.SetActiveContexts(activeContexts, "HoldOn");
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MainMenu);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HoldOn);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_AccountNumber);
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AuthWithAccountNumber);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700600);
                let AccountNumberSlot = process.const.STR_AccountNumber;
                appSession.nextIntent = process.const.AU103;
                appSession.appSessionObj[AccountNumberSlot + "Retry"] = appSession.appSessionObj[AccountNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[AccountNumberSlot + "Retry"];
                promptOut = process.promptSession.scg_ccc_prmt_7000_auth_05_CommonTryDiffWay;
                promptOut += appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                    process.promptSession.scg_ccc_collect_7006_auth_01_AccountNumberMS : process.promptSession.scg_ccc_collect_7006_auth_02_AccountNumber;
                activeContexts = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                    activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_NewCustomer) : activeContexts;
                cxiSession.cxiSessionObj.promptid = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                    "scg_ccc_collect_7006_auth_01_AccountNumberMS" : "scg_ccc_collect_7006_auth_02_AccountNumber";
                cxiSession.cxiSessionObj.promptIdFlag = "Y";
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                callback(
                    util.DialogAction(
                        process.const.DA_SwitchToIntentSlot,
                        intentRequest,
                        appSession.nextIntent,
                        util.BuildSSMLMessage(promptOut),
                        process.const.STR_InProgress,
                        activeContexts,
                        AccountNumberSlot
                    )
                );
                return;
            }
            else if (appSession.nextIntent == process.const.AU103 || ( appSession.nextIntent == process.const.AU205 && appSession.nextStateName == process.const.NS_StreetNumber_DontHaveIt || 
                appSession.nextStateName == process.const.NS_AIN_Identified || appSession.preStateName == `${appSession.baseLine}_AccountNumber`)) {
                if (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_Moving || appSession.callerGoal == process.const.CG_Fumigation || appSession.callerGoal == process.const.CG_NewConstruction) {
                    appSession.appSessionObj.phoneNumberCount = "0";
                    appSession.nextIntent = process.const.MS300;
                    appSession.nextBot = process.const.MainServices_Bot;
                    callback(
                        util.DialogAction(
                            process.const.DA_Close,
                            intentRequest,
                            intentName,
                            util.BuildSSMLMessage(promptOut),
                            process.const.STR_Fulfilled
                        )
                    );
                    return;
                }
                else if (appSession.callerGoal == process.const.CG_TailorTreatmentPrediction) {
                    appSession.appSessionObj.isReturned = process.const.STR_True;
                    appSession.appSessionObj.upFrontAuthentication = "Failure";
                    appSession.appSessionObj.phoneNumberCount = 0;
                    appSession.appSessionObj.streetNumberCount = 0;
                    appSession.appSessionObj.accountNumberCount = 0;
                    callback(
                        util.DialogAction(
                            process.const.DA_Close,
                            intentRequest,
                            intentName,
                            util.BuildSSMLMessage(promptOut),
                            process.const.STR_Fulfilled
                        )
                    );
                    return;
                }
                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );
            }
            else if (appSession.nextStateName == process.const.NS_Different_PhoneNumber) {
                if (appSession.callerGoal == process.const.CG_TailorTreatmentPrediction) {
                    //appSession.appSessionObj.isReturned = process.const.STR_True;
                    /*appSession.appSessionObj.multipleAccounts = appSession.appSessionObj.errorCode == "425" || appSession.appSessionObj.errorCode == "475" ?
                        process.const.STR_False : appSession.appSessionObj.multipleAccounts;
                    appSession.appSessionObj.singleAddressReturn = appSession.appSessionObj.errorCode == "425" || appSession.appSessionObj.errorCode == "475" ?
                        process.const.STR_False : appSession.appSessionObj.singleAddressReturn;*/
                    appSession.appSessionObj.upFrontAuthentication = "Failure";
                    appSession.appSessionObj.phoneNumberCount = 0;
                    appSession.appSessionObj.streetNumberCount = 0;
                    appSession.appSessionObj.accountNumberCount = 0;
                    appSession.appSessionObj.newCustomer = process.const.STR_True;
                    appSession.nextIntent = process.const.MA100;
                    appSession.nextBot = process.const.Master_Bot;
                    callback(
                        util.DialogAction(
                            process.const.DA_Close,
                            intentRequest,
                            intentName,
                            util.BuildSSMLMessage(promptOut),
                            process.const.STR_Fulfilled
                        )
                    );
                    return;
                }
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_PhoneNumberDontKnow);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700320);
                appSession.appSessionObj.phoneNumberCount = "0";
                appSession.nextIntent = process.const.MS300;
                appSession.nextBot = process.const.MainServices_Bot;
                callback(
                    util.DialogAction(
                        process.const.DA_Close,
                        intentRequest,
                        intentName,
                        util.BuildSSMLMessage(promptOut),
                        process.const.STR_Fulfilled
                    )
                );
                return;
            }
            appSession.nextIntent = process.const.AU200;
            appSession.nextStateName = process.const.NS_StreetNumber_DontHaveIt;
            callback(
                util.DialogAction(
                    process.const.DA_Delegate,
                    intentRequest,
                    appSession.nextIntent,
                    util.BuildSSMLMessage(""),
                    process.const.STR_Fulfilled,
                    activeContexts,
                    process.const.STR_Default,
                    intentRequest.sessionState.intent.slots,
                )
            );
            return;
        }
        else if (appSession.nextStateName == process.const.NS_PhoneNumber_Confirmation || appSession.nextStateName == process.const.NS_StreetNumber_DontHaveIt) {
            appSession.nextIntent = process.const.AU200;
            appSession.nextStateName = process.const.NS_StreetNumber_DontHaveIt;
            callback(
                util.DialogAction(
                    process.const.DA_Delegate,
                    intentRequest,
                    appSession.nextIntent,
                    util.BuildSSMLMessage(""),
                    process.const.STR_Fulfilled,
                    activeContexts,
                    process.const.STR_Default,
                    intentRequest.sessionState.intent.slots,
                )
            );
            return;
        }
        else if (appSession.nextStateName == process.const.NS_PhoneNumber) {
            appSession.nextIntent = process.const.AU201;
            appSession.nextStateName = process.const.NS_CellPhnColl_PhoneNumberConfirmation;
            callback(
                util.DialogAction(
                    process.const.DA_Delegate,
                    intentRequest,
                    appSession.nextIntent,
                    util.BuildSSMLMessage(""),
                    process.const.STR_Fulfilled,
                    activeContexts,
                    process.const.STR_Default,
                    intentRequest.sessionState.intent.slots,
                )
            );
            return;
        }
        else {
            if (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_Moving || appSession.callerGoal == process.const.CG_Fumigation || appSession.callerGoal == process.const.CG_NewConstruction) {
                appSession.appSessionObj.phoneNumberCount = "0";
                appSession.nextIntent = process.const.MS300;
                appSession.nextBot = process.const.MainServices_Bot;
                callback(
                    util.DialogAction(
                        process.const.DA_Close,
                        intentRequest,
                        intentName,
                        util.BuildSSMLMessage(promptOut),
                        process.const.STR_Fulfilled
                    )
                );
                return;
            }
            else if (appSession.callerGoal == process.const.CG_TailorTreatmentPrediction) {
                appSession.appSessionObj.multipleAccounts = appSession.appSessionObj.errorCode == "425" || appSession.appSessionObj.errorCode == "475" ?
                    process.const.STR_False : appSession.appSessionObj.multipleAccounts;
                appSession.appSessionObj.singleAddressReturn = appSession.appSessionObj.errorCode == "425" || appSession.appSessionObj.errorCode == "475" ?
                    process.const.STR_False : appSession.appSessionObj.singleAddressReturn;
                appSession.appSessionObj.isReturned = process.const.STR_True;
                appSession.appSessionObj.upFrontAuthentication = "Failure";
                appSession.appSessionObj.phoneNumberCount = 0;
                appSession.appSessionObj.streetNumberCount = 0;
                appSession.appSessionObj.accountNumberCount = 0;
                callback(
                    util.DialogAction(
                        process.const.DA_Close,
                        intentRequest,
                        intentName,
                        util.BuildSSMLMessage(promptOut),
                        process.const.STR_Fulfilled
                    )
                );
                return;
            }
            return agentHelper.AgentTransfer(
                intentRequest,
                intentName,
                promptOut,
                callback
            );
        }
    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};

module.exports = {
    DontHaveIt
};
