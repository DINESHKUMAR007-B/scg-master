const logger = require("../../../Helpers/Utilities/logger");
const sessionHelper = require("../../../Helpers/Common/sessionHelper");
const util = require("../../../Helpers/Utilities/getLexResponse");
const ssmlMessage = require("../../../Helpers/Common/ssmlHelper");
const catchHelper = require("../../../Helpers/Common/catchHelper");
const lex_Slots = require("../../../Helpers/Common/slotHelper");
const retryController = require("../../../Helpers/Controller/retryController");

const WorkPhoneExtNumber = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let promptOut = "";
    let promptOutR1 = "";
    let promptOutR2 = "";
    let activeContexts = [];
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let WorkPhoneExtNumberSlot = "getWorkPhoneExtNumber";
    let WorkPhoneExtNumber = lex_Slots.GetSlots(WorkPhoneExtNumberSlot, intentRequest);
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + process.const.STR_STR_Underscore + process.const.SN_WorkPhoneExtNumber;
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "menu";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        cxiSession.cxiSessionObj.cxiSlotDetails = [];
        //-----------------------------------------------------
        //----------------------------------CXI NoInput/NoMatch count -------------------------------
        cxiSession.cxiSessionObj["WorkPhoneExtNumbernoInput" + "Count"] =
            cxiSession.cxiSessionObj["WorkPhoneExtNumbernoInput" + "Count"] ==
                undefined || null ?
                0 :
                cxiSession.cxiSessionObj["WorkPhoneExtNumbernoInput" + "Count"];
        cxiSession.cxiSessionObj["WorkPhoneExtNumbernoMatch" + "Count"] =
            cxiSession.cxiSessionObj["WorkPhoneExtNumbernoMatch" + "Count"] ==
                undefined || null ?
                0 :
                cxiSession.cxiSessionObj["WorkPhoneExtNumbernoMatch" + "Count"];

        if (intentRequest.inputTranscript == null || intentRequest.inputTranscript == "null" || intentRequest.inputTranscript == "" || intentRequest.inputTranscript == undefined || intentRequest.inputTranscript == "undefined") {
            let ctr = parseInt(cxiSession.cxiSessionObj["WorkPhoneExtNumbernoInput" + "Count"], 10);
            ctr++;
            cxiSession.cxiSessionObj["WorkPhoneExtNumbernoInput" + "Count"] = ctr;
            cxiSession.cxiSessionObj.result = "Failure";
        }

        if ((intentRequest.inputTranscript != null && WorkPhoneExtNumber == null) || (WorkPhoneExtNumber != null &&
            (!(WorkPhoneExtNumber.length >= 4 && WorkPhoneExtNumber.length <= 5)))) {
            let ctr = parseInt(cxiSession.cxiSessionObj["WorkPhoneExtNumbernoMatch" + "Count"], 10);
            ctr++;
            cxiSession.cxiSessionObj["WorkPhoneExtNumbernoMatch" + "Count"] = ctr;
            cxiSession.cxiSessionObj.result = "Failure";
        }

        //------------PUT CXI Keys----------------------------
        let WorkPhoneExtNumberObj = {};
        WorkPhoneExtNumberObj.elicitationStyle = "";
        WorkPhoneExtNumberObj.slotName = WorkPhoneExtNumberSlot;
        WorkPhoneExtNumberObj.slotType = "AMAZON.PhoneNumber";
        WorkPhoneExtNumberObj.inputMode = intentRequest.inputMode;
        WorkPhoneExtNumberObj.slotValue = WorkPhoneExtNumber;
        WorkPhoneExtNumberObj.noMatchCount = cxiSession.cxiSessionObj["WorkPhoneExtNumbernoMatch" + "Count"];
        WorkPhoneExtNumberObj.noInputCount = cxiSession.cxiSessionObj["WorkPhoneExtNumbernoInput" + "Count"];
        cxiSession.cxiSessionObj.cxiSlotDetails.push(WorkPhoneExtNumberObj);
        cxiSession.cxiSessionObj.slotFlag = "Y";
        //-----------------------------------------------------
        appSession.appSessionObj[WorkPhoneExtNumberSlot + "Count"] =
            appSession.appSessionObj[WorkPhoneExtNumberSlot + "Count"] ==
                undefined || null ?
                0 :
                appSession.appSessionObj[WorkPhoneExtNumberSlot + "Count"];
        logger.debug("Nomatch Noinput Count " + appSession.appSessionObj[WorkPhoneExtNumberSlot + "Count"]);
        promptOut = process.promptSession.scg_ccc_collect_2316_main_01_ExtensionNum;
        promptOutR1 = process.promptSession.scg_ccc_collect_ninm1_2316_main_02_ExtensionNum;
        promptOutR2 = process.promptSession.scg_ccc_collect_ninm2_2316_main_03_ExtensionNum;

        if (!WorkPhoneExtNumber) {
            logger.info("Work Phone Extention Number slot is null");
            if (intentRequest.bot.localeId == "es_US") {
                if ((intentRequest.inputMode == "Text" && (intentRequest.inputTranscript == "1" || intentRequest.inputTranscript == 1))) { // && !(appSession.nextStateName == "SendSMS_DiffSamePhNo")
                    appSession.nextIntent = process.const.MS209;
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
            retryController.Retry(
                WorkPhoneExtNumberSlot,
                intentRequest,
                promptOutR1,
                promptOutR2,
                callback,
                promptOut
            );
            return;
        }
        if (WorkPhoneExtNumber) {
            if (!(WorkPhoneExtNumber.length >= 4 && WorkPhoneExtNumber.length <= 5)) {
                logger.info("Work Phone Extention Number slot length not match");
                if (WorkPhoneExtNumber.length == 1) {
                    if (WorkPhoneExtNumber == "1" || WorkPhoneExtNumber == 1) {
                        appSession.nextIntent = process.const.MS209;
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
                appSession.appSessionObj[WorkPhoneExtNumberSlot + "Retry"] = process.const.STR_True;
                retryController.Retry(
                    WorkPhoneExtNumberSlot,
                    intentRequest,
                    promptOutR1,
                    promptOutR2,
                    callback,
                );
                return;
            }
        }
        if (WorkPhoneExtNumber) {
            logger.info("Work Phone Extention Number Collected Successfully");
            appSession.nextStateName = process.const.NS_BusinessExtensionNo_Confirmation;
            appSession.appSessionObj.businessExtensionNumberMS = WorkPhoneExtNumber;
            appSession.nextIntent = process.const.MS210;
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
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentRequest.sessionState.intent.name, callback);
    }
};
module.exports = {
    WorkPhoneExtNumber
};
