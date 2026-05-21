const util = require("../Utilities/getLexResponse");
const getFallbackMsg = require("./getFallbackMessage"); 
const logger = require("../Utilities/logger");
const sessionHelper = require("../Common/sessionHelper");
const ssmlMessage = require("../Common/ssmlHelper");
const agentHelper = require("../../Helpers/Common/agentHelper");
const catchHelper = require("../Common/catchHelper");
const callPath = require("../Common/callPathHelper");
const Fallback = async function(intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    const outputSessionAttributes = intentRequest.sessionState.sessionAttributes || {};
    let promptOut = " ";
    let activeContexts = [];
    try {
        let appSession = sessionHelper.AppSession;
        let cxiSession = sessionHelper.CxiSession;
        let ctiData = sessionHelper.CtiData;
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        if (appSession.appSessionObj.fallBackState == process.const.STR_True) {
            logger.info("Enter Fallback State");
            appSession.appSessionObj.fallBackState = process.const.STR_False;
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
        if (appSession.fallBack == process.const.STR_True) {
            let ctr = parseInt(appSession.fallBackCounter, 10);
            ctr++;
            appSession.fallBackCounter = ctr;
            for (let i = ctr; i <= process.const.Dynamic_FallbackCounter; i++) {

                if (i == process.const.Dynamic_FallbackCounter) {
                    //cxiSession.exitReason = process.const.Cxi_Max_Attempts;
                    if (appSession.nextStateName == process.const.NS_CellPhoneCollection || appSession.nextStateName == process.const.NS_CellPhoneCollection_AddrFound) {
                        appSession.appSessionObj.isReturned = process.const.STR_True;
                        appSession.appSessionObj.cellPhoneCollectionPrompt = "N"; 
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
                    else if (appSession.nextStateName == process.const.NS_PhoneNumber_Confirmation || appSession.nextStateName == process.const.NS_StreetNumber_Confirmation) {
                        let activeContexts = [];
                        if (appSession.nextStateName == process.const.NS_PhoneNumber_Confirmation) {
                            if (appSession.appSessionObj.phoneNumberRecogSw == process.const.STR_True) {
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
                                let activeContexts = [];
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
                        }
                        else if (appSession.nextStateName == process.const.NS_StreetNumber_Confirmation) {
                            if (appSession.nextStateName == process.const.NS_StreetNumber_DontHaveIt) {
                                cxiSession.exitReason = callPath.CallPath(cxiSession.exitReason, process.const.ER_AuthenticationTooManyTries);
                            }
                            if (appSession.appSessionObj.multipleAccounts == process.const.STR_True) {
                                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
                                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MainMenu);
                                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HoldOn);
                                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_AccountNumber);
                                let AccountNumberSlot = process.const.STR_AccountNumber;
                                appSession.nextIntent = process.const.AU103;
                                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AuthWithAccountNumber);
                                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700600);
                                appSession.appSessionObj.callingMode = "StreetNumber";
                                appSession.appSessionObj[AccountNumberSlot + "Retry"] = appSession.appSessionObj[AccountNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[AccountNumberSlot + "Retry"];
                                promptOut = process.promptSession.scg_ccc_prmt_7000_auth_05_CommonTryDiffWay;
                                promptOut += appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                                    process.promptSession.scg_ccc_collect_7006_auth_01_AccountNumberMS : process.promptSession.scg_ccc_collect_7006_auth_02_AccountNumber;
                                activeContexts = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                                    activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_NewCustomer) : activeContexts;
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
                                    appSession.appSessionObj.multipleAccounts = appSession.appSessionObj.errorCode == "425" || appSession.appSessionObj.errorCode == "475" ?
                                        process.const.STR_False : appSession.appSessionObj.multipleAccounts;
                                    appSession.appSessionObj.singleAddressReturn = appSession.appSessionObj.errorCode == "425" || appSession.appSessionObj.errorCode == "475" ?
                                        process.const.STR_False : appSession.appSessionObj.singleAddressReturn;
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
                    else if (appSession.nextStateName == process.const.NS_AIN_Identified) {
                        if (appSession.appSessionObj.confirmAddrRecogSw == process.const.STR_True) {
                            appSession.appSessionObj.aniIdentified = process.const.STR_False;
                            appSession.appSessionObj.authenticated = process.const.STR_False;
                            let activeContexts = [];
                            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
                            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PhoneNumber);
                            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AuthWithPhoneNumber);
                            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700200);
                            let PhoneNumberSlot = process.const.STR_PhoneNumber;
                            appSession.nextIntent = process.const.AU101;
                            appSession.appSessionObj[PhoneNumberSlot + "Retry"] = appSession.appSessionObj[PhoneNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[PhoneNumberSlot + "Retry"];
                            promptOut = process.promptSession.scg_ccc_prmt_7000_auth_05_CommonTryDiffWay;
                            promptOut += appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                                process.promptSession.scg_ccc_collect_7002_auth_01_PhoneNumberMS : process.promptSession.scg_ccc_collect_7002_auth_02_PhoneNumber;
                            activeContexts = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_NewCustomer) : activeContexts;
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
                                    PhoneNumberSlot
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
                                appSession.appSessionObj.phoneNumberCount = 0;
                                appSession.appSessionObj.streetNumberCount = 0;
                                appSession.appSessionObj.accountNumberCount = 0;
                                appSession.appSessionObj.isReturned = process.const.STR_True;
                                appSession.appSessionObj.upFrontAuthentication = "Failure";
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
                    else {
                        if ((appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_Moving ||
                                appSession.callerGoal == process.const.CG_Fumigation || appSession.callerGoal == process.const.CG_NewConstruction) && appSession.nextStateName != process.const.NS_AccountNumber_Confirmation) {
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
                        if(appSession.nextStateName == process.const.NS_CellPhnColl_PhoneNumberConfirmation){
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
                    if (ctr == "2" || ctr == 2) {
                        if (appSession.nextStateName == process.const.NS_EmergencyConfirmation) {
                            appSession.nextIntent = process.const.AU200;
                            appSession.nextStateName = process.const.NS_AIN_Identified;
                            let niNmCallPath = (intentRequest.inputTranscript.length == 0) ?
                                process.const.CP_NI : process.const.CP_NM;
                            let niNmPegPath = (intentRequest.inputTranscript.length == 0) ?
                                process.const.PP_100450 : process.const.PP_100445;
                            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, niNmCallPath);
                            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, niNmPegPath);
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
                    }
                    promptOut = getFallbackMsg.FallbackMessage(appSession, ctr, outputSessionAttributes, intentRequest, callback);
                    //-----------promptid--------------
                    cxiSession.cxiSessionObj.promptIdFlag = "Y";
                    //-----------------------------------
                    promptOut = appSession.nextStateName == process.const.NS_AccountNumber_Confirmation || appSession.nextStateName == process.const.NS_PhoneNumber_Confirmation ||
                        appSession.nextStateName == process.const.NS_StreetNumber_Confirmation || appSession.nextStateName == process.const.NS_AIN_Identified ||
                            appSession.nextStateName == process.const.NS_CellPhoneCollection ?
                                ssmlMessage.ConvertSSML(promptOut,90) : ssmlMessage.ConvertSSML(promptOut);
                    callback(
                        util.DialogAction(
                            process.const.DA_ElicitIntent,
                            intentRequest,
                            intentRequest.sessionState.intent.name,
                            util.BuildSSMLMessage(promptOut)
                        )
                    );
                    return;
                }
            }
        }
    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};
module.exports = {
    Fallback
};
