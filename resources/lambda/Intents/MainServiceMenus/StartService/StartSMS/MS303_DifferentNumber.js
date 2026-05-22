const logger = require("../../../../Helpers/Utilities/logger");
const sessionHelper = require("../../../../Helpers/Common/sessionHelper");
const util = require("../../../../Helpers/Utilities/getLexResponse");
const lex_Slots = require("../../../../Helpers/Common/slotHelper");
const catchHelper = require("../../../../Helpers/Common/catchHelper");
const ssmlMessage = require("../../../../Helpers/Common/ssmlHelper");
const callPath = require("../../../../Helpers/Common/callPathHelper");


const DifferentNumber = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let getMobileNumber = lex_Slots.GetSlots("getMobileNumber", intentRequest);



    let activeContexts = [];

    let promptOut = " ";
    appSession.startTime = util.getStartTime(new Date());
    try {
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        cxiSession.cxiSessionObj.cxiSlotDetails = [];
        //-----------------------------------------------------
        if (appSession.appSessionObj.turnOffStopService == "true" && appSession.nextStateName == "DD_processNumber") {
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Previous);
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PhoneNumber);
            cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_SentSMSViadifferentSmartPhoneNumber);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210145);
            let CellPhoneNumberSlot = process.const.Slot_phoneNumber;
            appSession.nextIntent = process.const.MS404;
            // appSession.appSessionObj[CellPhoneNumberSlot + "Retry"] = appSession.appSessionObj[CellPhoneNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[CellPhoneNumberSlot + "Retry"];
            appSession.appSessionObj[CellPhoneNumberSlot + "Retry"] = process.const.STR_True;
            promptOut = process.promptSession.scg_ccc_collect_2201_main_08_PhNum;
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
                    CellPhoneNumberSlot
                )
            );
            return;

        }
        if (appSession.nextStateName == process.const.NS_Move_PhNumConfirmMenu) {
            if (appSession.appSessionObj.moveDiffNumLoop == process.const.STR_True) {

            } else {
                cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_SentSMSViadifferentSmartPhoneNumber);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_220145);
            }

            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Previous);
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PhoneNumber);
            let CellPhoneNumberSlot = process.const.Slot_phoneNumber;
            appSession.nextIntent = process.const.MS404;
            appSession.appSessionObj[CellPhoneNumberSlot + "Retry"] = appSession.appSessionObj[CellPhoneNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[CellPhoneNumberSlot + "Retry"];

            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_220102);

            promptOut = process.promptSession.scg_ccc_collect_2201_main_08_PhNum;
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
                    CellPhoneNumberSlot
                )
            );
            return;

        }
        else if (appSession.nextStateName == process.const.NS_DiffNumberMenu) {
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Previous);
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PhoneNumber);
            cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_SentSMSViadifferentSmartPhoneNumber);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210145);
            let CellPhoneNumberSlot = process.const.Slot_phoneNumber;
            appSession.nextIntent = process.const.MS404;
            appSession.appSessionObj[CellPhoneNumberSlot + "Retry"] = appSession.appSessionObj[CellPhoneNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[CellPhoneNumberSlot + "Retry"];

            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210103);

            promptOut = process.promptSession.scg_ccc_menu_2101_main_12_PhNum;
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
                    CellPhoneNumberSlot
                )
            );
            return;

        }
        else if (appSession.nextStateName == process.const.NS_SendSMSDiffSamePhNo) {
            let CellPhoneNumberSlot = process.const.Slot_phoneNumber;
            appSession.nextIntent = process.const.MS404;
            //activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PhoneNumber);
            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_SendSmsDifferentNumber);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233615);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233601);
            appSession.appSessionObj[CellPhoneNumberSlot + "Retry"] = appSession.appSessionObj[CellPhoneNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[CellPhoneNumberSlot + "Retry"];
            promptOut = process.promptSession.scg_ccc_collect_2336_main_04_DiffPhNum;
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
                    CellPhoneNumberSlot
                )
            );
            return;


        }
        else {
            appSession.nextStateName = process.const.NS_DifferentNumberCollect;
            appSession.nextIntent = process.const.MS100;
            promptOut = process.promptSession.MS101_PhCollectInput;
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
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};

module.exports = {
    DifferentNumber
};
