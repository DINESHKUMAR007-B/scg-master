const logger = require("../../Helpers/Utilities/logger");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const util = require("../../Helpers/Utilities/getLexResponse");
const ssmlMessage = require("../../Helpers/Common/ssmlHelper");
const catchHelper = require("../../Helpers/Common/catchHelper");
const lex_Slots = require("../../Helpers/Common/slotHelper");
const retryController = require("../../Helpers/Controller/retryController");
const bargeInNotAllowed = require("../../Intents/Common/AU109_BargeInNotAllowed");
const PhoneNumber = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let promptOut = "";
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let PhoneNumberSlot = process.const.STR_PhoneNumber;
    let PhoneNumber = lex_Slots.GetSlots(PhoneNumberSlot, intentRequest);
    let promptOutR1 = "";
    let promptOutR2 = "";
    let activeContexts = [];
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + process.const.STR_Underscore + process.const.SN_PhoneNumber;
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "menu";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        cxiSession.cxiSessionObj.cxiSlotDetails = [];
        //----------------------------------------------------- 
        appSession.appSessionObj[PhoneNumberSlot + "Count"] =
            appSession.appSessionObj[PhoneNumberSlot + "Count"] ==
                undefined || appSession.appSessionObj[PhoneNumberSlot + "Count"] == "undefined" ?
                0 : appSession.appSessionObj[PhoneNumberSlot + "Count"];
        logger.debug("Nomatch Noinput Count " + appSession.appSessionObj[PhoneNumberSlot + "Count"]);
        if (appSession.appSessionObj.cellPhoneCollectionPrompt == "Y") {
            promptOut = process.promptSession.scg_ccc_collect_1016_init_01_CellPhnCollection;
            promptOutR1 = process.promptSession.scg_ccc_collect_ninm1_1016_init_02_CellPhnCollection;
            promptOutR2 = process.promptSession.scg_ccc_collect_ninm2_1016_init_03_CellPhnCollection;
        }
        else {
            promptOut = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                process.promptSession.scg_ccc_collect_7002_auth_01_PhoneNumberMS : process.promptSession.scg_ccc_collect_7002_auth_02_PhoneNumber;
            promptOutR1 = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                process.promptSession.scg_ccc_collect_ninm1_7002_auth_03_PhoneNumberMS : process.promptSession.scg_ccc_collect_ninm1_7002_auth_05_PhoneNumber;
            promptOutR2 = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                process.promptSession.scg_ccc_collect_ninm2_7002_auth_04_PhoneNumberMS : process.promptSession.scg_ccc_collect_ninm2_7002_auth_06_PhoneNumber;
        }
        //--------------CXI NoInput/NoMatch count -------------------------------
        cxiSession.cxiSessionObj["PhoneNumberNoInputCount"] = cxiSession.cxiSessionObj["PhoneNumberNoInputCount"] == undefined || null ?
            0 : cxiSession.cxiSessionObj["PhoneNumberNoInputCount"];
        cxiSession.cxiSessionObj["PhoneNumberNoMatchCount"] = cxiSession.cxiSessionObj["PhoneNumberNoMatchCount"] == undefined || null ?
            0 : cxiSession.cxiSessionObj["PhoneNumberNoMatchCount"];
        if (intentRequest.inputTranscript == "" || intentRequest.inputTranscript == null || intentRequest.inputTranscript == "null" || intentRequest.inputTranscript == undefined || intentRequest.inputTranscript == "undefined") {
            let ctr = parseInt(cxiSession.cxiSessionObj["PhoneNumberNoInputCount"], 10);
            ctr++;
            cxiSession.cxiSessionObj["PhoneNumberNoInputCount"] = ctr;
            cxiSession.cxiSessionObj.result = "Failure";
        }
        else if ((intentRequest.inputTranscript != "" && PhoneNumber == null) || (PhoneNumber != null && (PhoneNumber.length < 10 || PhoneNumber.length > 11) && PhoneNumber.length != 1)) {
            // if(!(PhoneNumber.length >= 10 && PhoneNumber.length <= 11) || (PhoneNumber.startsWith('1', 0) == false && (PhoneNumber.length == 11))){ 
            let ctr = parseInt(cxiSession.cxiSessionObj["PhoneNumberNoMatchCount"], 10);
            ctr++;
            cxiSession.cxiSessionObj["PhoneNumberNoMatchCount"] = ctr;
            cxiSession.cxiSessionObj.result = "Failure";
        }
        //----------------------------------------------------- 
        //------------PUT CXI Keys----------------------------
        let PhoneNumberObj = {};
        PhoneNumberObj.elicitationStyle = "";
        PhoneNumberObj.slotName = PhoneNumberSlot;
        PhoneNumberObj.slotType = "AMAZON.PhoneNumber";
        PhoneNumberObj.inputMode = intentRequest.inputMode;
        PhoneNumberObj.slotValue = intentRequest.inputTranscript != "" ? PhoneNumber : "";
        PhoneNumberObj.noMatchCount = cxiSession.cxiSessionObj["PhoneNumberNoMatchCount"];
        PhoneNumberObj.noInputCount = cxiSession.cxiSessionObj["PhoneNumberNoInputCount"];
        cxiSession.cxiSessionObj.cxiSlotDetails.push(PhoneNumberObj);
        cxiSession.cxiSessionObj.slotFlag = "Y";
        //----------------------------------------------------- 
        if (!PhoneNumber) {
            logger.info("Phone Number slot is null");
            if (intentRequest.inputTranscript.length == 1 && intentRequest.inputMode == "Text") {//&& appSession.appSessionObj[AccountNumberSlot + "Count"] >= 1
                if ((intentRequest.inputTranscript == "1") && 
                (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction)) {
                    appSession.nextIntent = process.const.AU105;
                    promptOut = "";
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
                } else if ((!(appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction))
                    && (intentRequest.inputTranscript == "1" || intentRequest.inputTranscript == 1)) {
                    appSession.nextIntent = process.const.AU205;
                    promptOut = "";
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
                else if (((intentRequest.inputTranscript == "2" || intentRequest.inputTranscript == 2) && 
                (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction))) {
                    appSession.nextIntent = process.const.AU205;
                    promptOut = "";
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
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                retryController.Retry(
                    PhoneNumberSlot,
                    intentRequest,
                    promptOutR1,
                    promptOutR2,
                    callback,
                    promptOut
                );
                return;
                //}
            }
            promptOut = ssmlMessage.ConvertSSML(promptOut);
            retryController.Retry(
                PhoneNumberSlot,
                intentRequest,
                promptOutR1,
                promptOutR2,
                callback,
                promptOut
            );
            return;
        }
        if (PhoneNumber) {
            if (!(PhoneNumber.length >= 10 && PhoneNumber.length <= 11) || (PhoneNumber.startsWith('1', 0) == false && (PhoneNumber.length == 11))) {
                logger.info("Phone Number slot length not match");
                
                if (((PhoneNumber == "1" || PhoneNumber == 1) || intentRequest.inputTranscript == "1") &&
                (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction)) {
                    appSession.nextIntent = process.const.AU105;
                    promptOut = "";
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
                } else if ((((PhoneNumber == "1" || PhoneNumber == 1) || intentRequest.inputTranscript == "1")) &&
                    (!(appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction))
                    ) {
                    appSession.nextIntent = process.const.AU205;
                    promptOut = "";
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
                else if (((PhoneNumber == "2" || PhoneNumber == 2) && 
                (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction))) {
                    appSession.nextIntent = process.const.AU205;
                    promptOut = "";
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
                intentRequest = lex_Slots.UpdateSlotForWaitAndContinue(PhoneNumberSlot, intentRequest);
                appSession.appSessionObj[PhoneNumberSlot + "Retry"] = process.const.STR_True;
                retryController.Retry(
                    PhoneNumberSlot,
                    intentRequest,
                    promptOutR1,
                    promptOutR2,
                    callback,
                );
                return;
            }
        }
        if (PhoneNumber) {
            logger.info("Phone Number Collected Successfully");
            appSession.nextStateName = appSession.appSessionObj.cellPhoneCollectionPrompt == "Y" ?
                process.const.NS_CellPhnColl_PhoneNumberConfirmation : process.const.NS_PhoneNumber_Confirmation;
            appSession.appSessionObj.getPhoneNumber = PhoneNumber;
            await bargeInNotAllowed.BargeInNotAllowed(appSession,intentRequest, callback);
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
    PhoneNumber
};
