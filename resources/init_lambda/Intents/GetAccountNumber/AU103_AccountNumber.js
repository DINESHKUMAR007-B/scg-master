const logger = require("../../Helpers/Utilities/logger");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const util = require("../../Helpers/Utilities/getLexResponse");
const ssmlMessage = require("../../Helpers/Common/ssmlHelper");
const catchHelper = require("../../Helpers/Common/catchHelper");
const lex_Slots = require("../../Helpers/Common/slotHelper");
const retryController = require("../../Helpers/Controller/retryController");
const bargeInNotAllowed = require("../../Intents/Common/AU109_BargeInNotAllowed");
const callSlotValidate = require("../../Helpers/Common/validateDate");
const AccountNumber = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let promptOut = "";
    let promptOutR1 = "";
    let promptOutR2 = "";
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let AccountNumberSlot = process.const.STR_AccountNumber;
    let AccountNumber = lex_Slots.GetSlots(AccountNumberSlot, intentRequest);
    let activeContexts = [];
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + process.const.STR_Underscore + process.const.SN_AccountNumber;
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "menu";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        cxiSession.cxiSessionObj.cxiSlotDetails = [];
        //----------------------------------------------------- 
        appSession.appSessionObj[AccountNumberSlot + "Count"] =
            appSession.appSessionObj[AccountNumberSlot + "Count"] ==
                undefined || null ?
                0 :
                appSession.appSessionObj[AccountNumberSlot + "Count"];
        logger.debug("Nomatch Noinput Count " + appSession.appSessionObj[AccountNumberSlot + "Count"]);
        promptOut = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
            process.promptSession.scg_ccc_collect_7006_auth_01_AccountNumberMS : process.promptSession.scg_ccc_collect_7006_auth_02_AccountNumber;
        promptOutR1 = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
            process.promptSession.scg_ccc_collect_ninm1_7006_auth_03_AccountNumberMS : process.promptSession.scg_ccc_collect_ninm1_7006_auth_05_AccountNumber;
        promptOutR2 = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
            process.promptSession.scg_ccc_collect_ninm2_7006_auth_04_AccountNumberMS : process.promptSession.scg_ccc_collect_ninm2_7006_auth_06_AccountNumber;
        //--------------CXI NoInput/NoMatch count -------------------------------
        cxiSession.cxiSessionObj["AccountNumberNoInputCount"] = cxiSession.cxiSessionObj["AccountNumberNoInputCount"] == undefined || null ?
            0 : cxiSession.cxiSessionObj["AccountNumberNoInputCount"];
        cxiSession.cxiSessionObj["AccountNumberNoMatchCount"] = cxiSession.cxiSessionObj["AccountNumberNoMatchCount"] == undefined || null ?
            0 : cxiSession.cxiSessionObj["AccountNumberNoMatchCount"];
        if (intentRequest.inputTranscript == "" || intentRequest.inputTranscript == null || intentRequest.inputTranscript == "null" || intentRequest.inputTranscript == undefined || intentRequest.inputTranscript == "undefined") {
            let ctr = parseInt(cxiSession.cxiSessionObj["AccountNumberNoInputCount"], 10);
            ctr++;
            cxiSession.cxiSessionObj["AccountNumberNoInputCount"] = ctr;
            cxiSession.cxiSessionObj.result = "Failure";
        }
        /*  if(intentRequest.inputTranscript == "" || intentRequest.inputTranscript == null || intentRequest.inputTranscript == "null" || intentRequest.inputTranscript == undefined || intentRequest.inputTranscript == "undefined"){
                 console.log("Noinput");
             } */
        else if ((intentRequest.inputTranscript != "" && AccountNumber == null) || ((AccountNumber.length < 8 || AccountNumber.length > 11) && AccountNumber.length != 1)) {
            let ctr = parseInt(cxiSession.cxiSessionObj["AccountNumberNoMatchCount"], 10);
            ctr++;
            cxiSession.cxiSessionObj["AccountNumberNoMatchCount"] = ctr;
            cxiSession.cxiSessionObj.result = "Failure";
        }
        //-----------------------------------------------------    
        //------------PUT CXI Keys----------------------------
        let AccountNumberObj = {};
        AccountNumberObj.elicitationStyle = "";
        AccountNumberObj.slotName = AccountNumberSlot;
        AccountNumberObj.slotType = "AMAZON.Number";
        AccountNumberObj.inputMode = intentRequest.inputMode;
        AccountNumberObj.slotValue = intentRequest.inputTranscript != "" ? AccountNumber : "";
        AccountNumberObj.noMatchCount = cxiSession.cxiSessionObj["AccountNumberNoMatchCount"];
        AccountNumberObj.noInputCount = cxiSession.cxiSessionObj["AccountNumberNoInputCount"];
        cxiSession.cxiSessionObj.cxiSlotDetails.push(AccountNumberObj);
        cxiSession.cxiSessionObj.slotFlag = "Y";
        //----------------------------------------------------- 
        if (!AccountNumber) {
            if (lex_Slots.IsWaitIntent(intentRequest)) {
                logger.info("Account Number Slot Wait Intent Timeout");
                appSession.disconnect = process.const.STR_True;
                cxiSession.callResult = "AppHangup";
                promptOut = ssmlMessage.ConvertSSML(process.promptSession.scg_ccc_prmt_7006_auth_09_WaitAndContinueDisconnect);
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
            logger.info("Account Number slot is null");
            retryController.Retry(
                AccountNumberSlot,
                intentRequest,
                promptOutR1,
                promptOutR2,
                callback,
                promptOut
            );
            return;
        }

        if (AccountNumber) {
            if (!(AccountNumber.length >= 8 && AccountNumber.length <= 11)) {
                logger.info("Account Number slot length not match");
                if ((AccountNumber.length == 1 &&
                    (((AccountNumber == "1" || AccountNumber == 1)))
                    || (AccountNumber == "9" || AccountNumber == 9) || (AccountNumber == "2" || AccountNumber == 2))) {
                    if (AccountNumber == "9" || AccountNumber == 9) {
                        appSession.nextIntent = process.const.AU106;
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
                    else if (((AccountNumber == "1" || AccountNumber == 1) && (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction))) {
                        appSession.nextIntent = process.const.AU105;
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
                    } else if ((AccountNumber == "2" || AccountNumber == 2 ) && (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction)) {
                        appSession.nextIntent = process.const.AU205;
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
                    }else if ((AccountNumber == "2" || AccountNumber == 2 ) && !(appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction)) {
                        appSession.nextIntent = process.const.AU205;
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
                    intentRequest = lex_Slots.UpdateSlotForWaitAndContinue(AccountNumberSlot, intentRequest);
                appSession.appSessionObj[AccountNumberSlot + "Retry"] = process.const.STR_True;
                retryController.Retry(
                    AccountNumberSlot,
                    intentRequest,
                    promptOutR1,
                    promptOutR2,
                    callback,
                );
                return;
                }
                intentRequest = lex_Slots.UpdateSlotForWaitAndContinue(AccountNumberSlot, intentRequest);
                appSession.appSessionObj[AccountNumberSlot + "Retry"] = process.const.STR_True;
                retryController.Retry(
                    AccountNumberSlot,
                    intentRequest,
                    promptOutR1,
                    promptOutR2,
                    callback,
                );
                return;
            }
        }
        if (AccountNumber) {
            logger.info("Account Number Collected Successfully");
            let accountNumberOrginalValue = lex_Slots.GetSlotsOriginalValue(AccountNumberSlot, intentRequest);
            if (accountNumberOrginalValue.includes("zero oh")) {
                let replace = accountNumberOrginalValue.replace(/\boh\b/gi, "").replace(/\s+/g, " ").trim();
                AccountNumber = callSlotValidate.UpdatedOriginalValue(accountNumberOrginalValue.replace(/oh/g, ""));
            }
            intentRequest.sessionState.intent.slots[AccountNumberSlot] = lex_Slots.UpdateSlot(AccountNumber);
            appSession.nextStateName = process.const.NS_AccountNumber_Confirmation;
            appSession.appSessionObj.tempAccountNumber = AccountNumber;
            await bargeInNotAllowed.BargeInNotAllowed(appSession, intentRequest, callback);
            return;
            /*appSession.nextIntent = process.const.AU200;
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
            return;*/
        }
    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentRequest.sessionState.intent.name, callback);
    }
};
module.exports = {
    AccountNumber
};
