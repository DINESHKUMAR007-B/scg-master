const util = require("../../Helpers/Utilities/getLexResponse");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const catchHelper = require("../Common/catchHelper");
const logger = require("../Utilities/logger");
const ssmlMessage = require("../../Helpers/Common/ssmlHelper");
const agentHelper = require("../../Helpers/Common/agentHelper");
const callPath = require("../../Helpers/Common/callPathHelper");
exports.Retry = async function(
    slotKey,
    intentRequest,
    firstRetry,
    secondRetry,
    callback,
    mainPrompt = null
) {
    logger.info("Enter Rety Helper ");
    const intentName = intentRequest.sessionState.intent.name;
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let activeContexts = [];
    try {
        let promptOut = " ";
        if (appSession.appSessionObj[slotKey + "Retry"] == process.const.STR_True) {
            let ctr = parseInt(appSession.appSessionObj[slotKey + "Count"], 10);
            ctr++;
            appSession.appSessionObj[slotKey + "Count"] = ctr;
            for (let i = ctr; i <= process.const.Dynamic_RetryCounter; i++) {
                if (i == process.const.Dynamic_RetryCounter) {
                    if (!(appSession.appSessionObj.cellPhoneCollectionPrompt == "Y") && (appSession.stateName == `${appSession.baseLine}_StreetNumber` || appSession.stateName == `${appSession.baseLine}_PhoneNumber`)) {
                        if (appSession.stateName == `${appSession.baseLine}_PhoneNumber`) {
                            appSession.appSessionObj.couldNotIdentify = process.const.STR_True;
                            appSession.appSessionObj.authenticated = process.const.STR_False;
                            appSession.appSessionObj.prevAuthType = "PhoneNumber";
                            if (appSession.appSessionObj.multipleAccounts == process.const.STR_True) {
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
                                else if(appSession.callerGoal == process.const.CG_TailorTreatmentPrediction) {
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
                                return agentHelper.AgentTransfer(
                                    intentRequest,
                                    intentName,
                                    promptOut,
                                    callback
                                );
                            }
                            else {
                                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
                                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MainMenu);
                                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HoldOn);
                                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_AccountNumber);
                                let AccountNumberSlot = process.const.STR_AccountNumber;
                                appSession.nextIntent = process.const.AU103;
                                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AuthWithAccountNumber);
                                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700600);
                                appSession.appSessionObj[AccountNumberSlot + "Retry"] = appSession.appSessionObj[AccountNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[AccountNumberSlot + "Retry"];
                                promptOut = process.promptSession.scg_ccc_prmt_7000_auth_05_CommonTryDiffWay;
                                promptOut += appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                                    process.promptSession.scg_ccc_collect_7006_auth_01_AccountNumberMS : process.promptSession.scg_ccc_collect_7006_auth_02_AccountNumber;
                                activeContexts = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                                    activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_NewCustomer) : activeContexts;
                                
                                cxiSession.cxiSessionObj.promptid = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?"scg_ccc_collect_7006_auth_01_AccountNumberMS" : "scg_ccc_collect_7006_auth_02_AccountNumber";
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
                        }
                        else if (appSession.stateName == `${appSession.baseLine}_StreetNumber`) {
                            cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_AuthenticationTooManyTries);
                            appSession.appSessionObj.couldNotIdentify = process.const.STR_True;
                            appSession.appSessionObj.authenticated = process.const.STR_False;
                            if (appSession.appSessionObj.multipleAccounts == process.const.STR_True) {
                                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
                                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MainMenu);
                                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HoldOn);
                                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_AccountNumber);
                                let AccountNumberSlot = process.const.STR_AccountNumber;
                                appSession.nextIntent = process.const.AU103;
                                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AuthWithAccountNumber);
                                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700600);
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
                            else {
                                 if(appSession.callerGoal == process.const.CG_TailorTreatmentPrediction) {
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
                        }

                    }
                    else {
                        if (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_Moving ||
                            appSession.callerGoal == process.const.CG_Fumigation || appSession.callerGoal == process.const.CG_NewConstruction) {
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
                        if(appSession.nextStateName == process.const.NS_CellPhoneCollection_AddrFound || appSession.nextStateName == process.const.NS_HomePh_Authenticated){
                            cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_MaxAttempts);
                        }
                        appSession.appSessionObj.recogFail = process.const.STR_True;
                        //appSession.appSessionObj.couldNotIdentify = process.const.STR_True;
                        return agentHelper.AgentTransfer(
                            intentRequest,
                            intentName,
                            promptOut,
                            callback
                        );
                    }

                }
                else {
                    if (ctr == "1") {
                        promptOut = process.promptSession.scg_ccc_prmt_7000_auth_02_CommonRetry1 + firstRetry;
                    }
                    else if (ctr == "2") {
                        promptOut = process.promptSession.scg_ccc_prmt_7000_auth_03_CommonRetry2 + secondRetry;
                    }
                    else {
                        promptOut = mainPrompt;
                    }
                    cxiSession.cxiSessionObj.promptIdFlag = "Y";
                    promptOut = ssmlMessage.ConvertSSML(promptOut);
                    callback(
                        util.DialogAction(
                            process.const.DA_ElicitSlot,
                            intentRequest,
                            intentName,
                            util.BuildSSMLMessage(promptOut),
                            process.const.STR_InProgress,
                            activeContexts,
                            slotKey,
                            intentRequest.sessionState.intent.slots
                        )
                    );
                    return;
                }
            }
        }
        else {
            appSession.appSessionObj[slotKey + "Count"] = "0";
        }
        appSession.appSessionObj[slotKey + "Retry"] = process.const.STR_True;
        promptOut = mainPrompt;
        cxiSession.cxiSessionObj.promptIdFlag = "Y";
        promptOut = ssmlMessage.ConvertSSML(promptOut);
        callback(
            util.DialogAction(
                process.const.DA_ElicitSlot,
                intentRequest,
                intentName,
                util.BuildSSMLMessage(promptOut),
                process.const.STR_InProgress,
                activeContexts,
                slotKey,
                intentRequest.sessionState.intent.slots
            )
        );
        return;
    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};
