const logger = require("../../../Helpers/Utilities/logger");
const sessionHelper = require("../../../Helpers/Common/sessionHelper");
const util = require("../../../Helpers/Utilities/getLexResponse");
const ssmlMessage = require("../../../Helpers/Common/ssmlHelper");
const catchHelper = require("../../../Helpers/Common/catchHelper");
const lex_Slots = require("../../../Helpers/Common/slotHelper");
const retryController = require("../../../Helpers/Controller/retryController");

const CellPhoneNumber = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let promptOut = "";
    let promptOutR1 = "";
    let promptOutR2 = "";
    let activeContexts = [];
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let CellPhoneNumberSlot = "phoneNumber";
    let CellPhoneNumber = lex_Slots.GetSlots(CellPhoneNumberSlot, intentRequest);
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + process.const.STR_Underscore + process.const.SN_CellPhoneNumber;
        appSession.appSessionObj[CellPhoneNumberSlot + "Count"] =
            appSession.appSessionObj[CellPhoneNumberSlot + "Count"] ==
                undefined || appSession.appSessionObj[CellPhoneNumberSlot + "Count"] == "undefined" ?
                0 :
                appSession.appSessionObj[CellPhoneNumberSlot + "Count"];
        logger.debug("Nomatch Noinput Count " + appSession.appSessionObj[CellPhoneNumberSlot + "Count"]);
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "menu";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        cxiSession.cxiSessionObj.cxiSlotDetails = [];
        //----------------------------------CXI NoInput/NoMatch count -------------------------------
        cxiSession.cxiSessionObj["CellPhoneNumbernoInput" + "Count"] =
            cxiSession.cxiSessionObj["CellPhoneNumbernoInput" + "Count"] ==
                undefined || null ?
                0 :
                cxiSession.cxiSessionObj["CellPhoneNumbernoInput" + "Count"];
        cxiSession.cxiSessionObj["CellPhoneNumbernoMatch" + "Count"] =
            cxiSession.cxiSessionObj["CellPhoneNumbernoMatch" + "Count"] ==
                undefined || null ?
                0 :
                cxiSession.cxiSessionObj["CellPhoneNumbernoMatch" + "Count"];

        if (intentRequest.inputTranscript == null || intentRequest.inputTranscript == "null" || intentRequest.inputTranscript == "" || intentRequest.inputTranscript == undefined || intentRequest.inputTranscript == "undefined") {
            let ctr = parseInt(cxiSession.cxiSessionObj["CellPhoneNumbernoInput" + "Count"], 10);
            ctr++;
            cxiSession.cxiSessionObj["CellPhoneNumbernoInput" + "Count"] = ctr;
            cxiSession.cxiSessionObj.result = "Failure";
        }
        else if ((intentRequest.inputTranscript != null && CellPhoneNumber == null) || (CellPhoneNumber != null && (!(CellPhoneNumber.length >= 10 && CellPhoneNumber.length <= 11) ||
            (CellPhoneNumber.startsWith('1', 0) == false && (CellPhoneNumber.length == 11))))) {
            let ctr = parseInt(cxiSession.cxiSessionObj["CellPhoneNumbernoMatch" + "Count"], 10);
            ctr++;
            cxiSession.cxiSessionObj["CellPhoneNumbernoMatch" + "Count"] = ctr;
            cxiSession.cxiSessionObj.result = "Failure";
        }
        //-----------------------------------------------------
        //------------PUT CXI Keys----------------------------
        let PhoneNumberObj = {};
        PhoneNumberObj.elicitationStyle = "";
        PhoneNumberObj.slotName = CellPhoneNumberSlot;
        PhoneNumberObj.slotType = "AMAZON.PhoneNumber";
        PhoneNumberObj.inputMode = intentRequest.inputMode;
        PhoneNumberObj.slotValue = CellPhoneNumber;
        PhoneNumberObj.noMatchCount = cxiSession.cxiSessionObj["CellPhoneNumbernoMatch" + "Count"];
        PhoneNumberObj.noInputCount = cxiSession.cxiSessionObj["CellPhoneNumbernoInput" + "Count"];
        cxiSession.cxiSessionObj.cxiSlotDetails.push(PhoneNumberObj);
        cxiSession.cxiSessionObj.slotFlag = "Y";
        //-----------------------------------------------------

        if (appSession.nextStateName == "DD_processNumber") {
            promptOut = process.promptSession.scg_ccc_collect_2201_main_08_PhNum;
            promptOutR1 = process.promptSession.scg_ccc_collect_ninm1_2201_main_09_PhNum;
            promptOutR2 = process.promptSession.scg_ccc_collect_ninm2_2201_main_10_PhNum;

        }
        else

            if (appSession.nextStateName == process.const.NS_SmartPhoneWebLinkConfimation) {
                promptOut = process.promptSession.scg_ccc_collect_2326_main_12_PhNum;
                promptOutR1 = process.promptSession.scg_ccc_collect_ninm1_2326_main_13_PhNum;
                promptOutR2 = process.promptSession.scg_ccc_collect_ninm2_2326_main_14_PhNum;

            }
            else if (appSession.nextStateName == process.const.NS_Initial_BusinessPhoneNumber) {
                promptOut = process.promptSession.scg_ccc_collect_2315_main_01_PhnumAcctInput;
                promptOutR1 = process.promptSession.scg_ccc_collect_ninm1_2315_main_02_PhNum;
                promptOutR2 = process.promptSession.scg_ccc_collect_ninm2_2315_main_03_PhNum;
            }
            else if (appSession.nextStateName == process.const.NS_DiffNumberMenu) {

                promptOut = process.promptSession.scg_ccc_menu_2101_main_12_PhNum;
                promptOutR1 = process.promptSession.scg_ccc_menu_ninm1_2101_main_13_PhNum;
                promptOutR2 = process.promptSession.scg_ccc_menu_ninm2_2101_main_14_PhNum;

            }
            else if (appSession.nextStateName == process.const.NS_Move_PhNumConfirmMenu) {
                promptOut = process.promptSession.scg_ccc_collect_2201_main_08_PhNum;
                promptOutR1 = process.promptSession.scg_ccc_collect_ninm1_2201_main_09_PhNum;
                promptOutR2 = process.promptSession.scg_ccc_collect_ninm2_2201_main_10_PhNum;

            }
            else if (appSession.nextStateName == process.const.NS_SendSMSDiffSamePhNo || appSession.nextStateName == process.const.NS_SendSMS_DifferentPhoneNumberConfirmation) {
                promptOut = process.promptSession.scg_ccc_collect_2336_main_04_DiffPhNum;
                promptOutR1 = process.promptSession.scg_ccc_collect_ninm1_2336_main_05_DiffPhNum;
                promptOutR2 = process.promptSession.scg_ccc_collect_ninm2_2336_main_06_DiffPhNum;

            }
            else {
                promptOut = process.promptSession.scg_ccc_collect_2318_main_01_PhNum;
                promptOutR1 = process.promptSession.scg_ccc_collect_ninm1_2318_main_02_PhNum;
                promptOutR2 = process.promptSession.scg_ccc_collect_ninm2_2318_main_03_PhNum;
            }
        if (!CellPhoneNumber) {
            logger.info("Cell Phone Number slot is null");
            if (intentRequest.bot.localeId == "es_US") {



                if ((intentRequest.inputMode == "Text" && appSession.nextStateName != process.const.NS_Move_PhNumConfirmMenu && appSession.nextStateName != process.const.NS_DiffNumberMenu && (intentRequest.inputTranscript == "1" || intentRequest.inputTranscript == 1))) { // && !(appSession.nextStateName == "SendSMS_DiffSamePhNo")
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
                if (appSession.nextStateName == process.const.NS_DiffNumberMenu) {
                    if ((intentRequest.inputMode == "Text" && (intentRequest.inputTranscript == "8" || intentRequest.inputTranscript == 8))) { // && !(appSession.nextStateName == "SendSMS_DiffSamePhNo")
                        appSession.nextIntent = process.const.MS204;
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
                if (appSession.nextStateName == process.const.NS_Move_PhNumConfirmMenu) {
                    if ((intentRequest.inputMode == "Text" && (intentRequest.inputTranscript == "8" || intentRequest.inputTranscript == 8))) { // && !(appSession.nextStateName == "SendSMS_DiffSamePhNo")
                        appSession.nextIntent = process.const.MS204;
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
            }
            //-------added-----
            appSession.appSessionObj[CellPhoneNumberSlot + "Retry"] = process.const.STR_True;
            retryController.Retry(
                CellPhoneNumberSlot,
                intentRequest,
                promptOutR1,
                promptOutR2,
                callback,
                promptOut
            );
            return;
        }

        if (CellPhoneNumber) {
            if (!(CellPhoneNumber.length >= 10 && CellPhoneNumber.length <= 11) || (CellPhoneNumber.startsWith('1', 0) == false && (CellPhoneNumber.length == 11))) {
                logger.info("Cell Phone Number slot length not match");
                appSession.appSessionObj[CellPhoneNumberSlot + "Retry"] = process.const.STR_True;
                retryController.Retry(
                    CellPhoneNumberSlot,
                    intentRequest,
                    promptOutR1,
                    promptOutR2,
                    callback,
                );
                return;
            }
        }
        if (CellPhoneNumber) {
            logger.info("Cell Phone Number Collected Successfully");
            if (appSession.nextStateName == "DD_processNumber") {
                appSession.nextStateName = "DD_processNumberDifferent";
                appSession.appSessionObj.DDDifferentPhoneNumber = CellPhoneNumber;
            }
            else
                if (appSession.nextStateName == process.const.NS_SmartPhoneWebLinkConfimation) {
                    appSession.nextStateName = process.const.NS_CollectPhoneNumberConfirmation;
                    appSession.appSessionObj.stopServiceDifferentPhoneNumber = CellPhoneNumber;
                }
                else if (appSession.nextStateName == process.const.NS_Initial_BusinessPhoneNumber) {

                    appSession.nextStateName = process.const.NS_BusinessPhoneNumber_Confirmation;
                    appSession.appSessionObj.businessPhoneNumberMS = CellPhoneNumber;
                }
                else if (appSession.nextStateName == process.const.NS_SendSMSDiffSamePhNo || appSession.nextStateName == process.const.NS_SendSMS_DifferentPhoneNumberConfirmation) {
                    appSession.nextStateName = process.const.NS_SendSMS_DifferentPhoneNumberConfirmation;
                    appSession.appSessionObj.smsDifferentPhoneNumber = CellPhoneNumber;
                }
                else if (appSession.nextStateName == process.const.NS_Move_PhNumConfirmMenu) {
                    appSession.nextStateName = process.const.NS_Move_DifferentPhoneNumberConfirmation;
                    appSession.appSessionObj.MovesmsDifferentPhoneNumber = CellPhoneNumber;
                }
                else if (appSession.nextStateName == process.const.NS_DiffNumberMenu) {
                    appSession.nextStateName = process.const.NS_StartService_DifferentPhoneNumberConfirmation;
                    appSession.appSessionObj.startServiceDifferentPhoneNumber = CellPhoneNumber;
                }
                else {
                    appSession.nextStateName = process.const.NS_CellPhoneNumber_Confirmation;
                    appSession.appSessionObj.cellPhoneNumberMS = CellPhoneNumber;
                }
            appSession.nextIntent = appSession.nextStateName == process.const.NS_CollectPhoneNumberConfirmation || appSession.nextStateName == process.const.NS_CellPhoneNumber_Confirmation ||
                (appSession.appSessionObj.type == "2" && (appSession.nextStateName != process.const.NS_Business_ExtensionNo)) ?
                process.const.MS210 : appSession.nextStateName == process.const.NS_StartService_DifferentPhoneNumberConfirmation || appSession.nextStateName == process.const.NS_SendSMS_DifferentPhoneNumberConfirmation || appSession.nextStateName == process.const.NS_Move_DifferentPhoneNumberConfirmation || appSession.nextStateName == "DD_processNumberDifferent" ?
                    process.const.MS210 : process.const.MS200;
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
    CellPhoneNumber
};
