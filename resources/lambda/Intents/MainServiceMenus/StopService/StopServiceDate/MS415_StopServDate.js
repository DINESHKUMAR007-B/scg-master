const logger = require("../../../../Helpers/Utilities/logger");
const sessionHelper = require("../../../../Helpers/Common/sessionHelper");
const util = require("../../../../Helpers/Utilities/getLexResponse");
const catchHelper = require("../../../../Helpers/Common/catchHelper");
const ssmlMessage = require("../../../../Helpers/Common/ssmlHelper");
const apiHelper = require("../../../../Helpers/Common/apiHelper");
const xmlTojson = require("../../../../Helpers/Common/soapApiReq");
const agentHelper = require("../../../../Helpers/Common/agentHelper");
const retryController = require("../../../../Helpers/Controller/retryController");
const lex_Slots = require("../../../../Helpers/Common/slotHelper");
const formatDate = require("../../../../Helpers/Common/getDate");
const stopServDate = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let promptOut = "";
    let promptOutR1 = "";
    let promptOutR2 = "";
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let DateSlot = "date";
    let activeContexts = [];
    let date = lex_Slots.GetSlots(DateSlot, intentRequest);
    appSession.appSessionObj.stopServDate = date;
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + "_StopServDate";
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "menu";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        cxiSession.cxiSessionObj.cxiSlotDetails = [];
        //-----------------------------------------------------
        appSession.appSessionObj.dateSlotInputType = "";
        appSession.appSessionObj[DateSlot + "Count"] =
            appSession.appSessionObj[DateSlot + "Count"] ==
                undefined || null ?
                0 :
                appSession.appSessionObj[DateSlot + "Count"];
        logger.debug("Nomatch Noinput Count " + appSession.appSessionObj[DateSlot + "Count"]);

        promptOutR1 = process.promptSession.scg_ccc_menu_ninm1_2306_main_07_Previous;
        promptOutR2 = process.promptSession.scg_ccc_menu_ninm2_2306_main_08_Previous;
        if (intentRequest.inputMode == "Text") {
            logger.info("Input mode is Text");
            if (intentRequest.inputTranscript == "1" || intentRequest.inputTranscript == "8" || intentRequest.inputTranscript == 1 || intentRequest.inputTranscript == 8) {
                appSession.nextIntent = (intentRequest.inputTranscript == "1" || intentRequest.inputTranscript == 1) ? process.const.MS205 : process.const.MS204;

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
            //console.log("date lenght :",intentRequest.inputTranscript.length);
            logger.info("date lenght :" + intentRequest.inputTranscript.length);
            if (intentRequest.inputTranscript.length > 2 && intentRequest.inputTranscript.length < 5) {
                
                date = formatDate.formatDate(intentRequest.inputTranscript);
            }
            else {

                date = "Invalid";
            }
        }
        else {
            logger.info("Input mode is Speech");
            if (!date) {
                logger.info("Invalid date");
                date = "Invalid";
            }
            //  date = formatDate.formatDate(date);

            date;
        }

        //----------------------------------CXI NoInput/NoMatch count -------------------------------
        cxiSession.cxiSessionObj["DateSlotnoInput" + "Count"] =
            cxiSession.cxiSessionObj["DateSlotnoInput" + "Count"] ==
                undefined || null || NaN ?
                0 :
                cxiSession.cxiSessionObj["DateSlotnoInput" + "Count"];
        cxiSession.cxiSessionObj["DateSlotnoMatch" + "Count"] =
            cxiSession.cxiSessionObj["DateSlotnoMatch" + "Count"] ==
                undefined || null || NaN ?
                0 :
                cxiSession.cxiSessionObj["DateSlotnoMatch" + "Count"];
        if (intentRequest.inputTranscript == "" || intentRequest.inputTranscript == null || intentRequest.inputTranscript == "null" || intentRequest.inputTranscript == undefined || intentRequest.inputTranscript == "undefined") {
            //console.log("Noinput");

            let ctr = parseInt(cxiSession.cxiSessionObj["DateSlotnoInput" + "Count"], 10);
            ctr++;
            cxiSession.cxiSessionObj["DateSlotnoInput" + "Count"] = ctr;
        }
        if (date == "Invalid") {
            if (intentRequest.inputTranscript == "" || intentRequest.inputTranscript == null || intentRequest.inputTranscript == "null" || intentRequest.inputTranscript == undefined || intentRequest.inputTranscript == "undefined") {
                //console.log("Noinput");
                logger.info("Noinput");
            }
            else {
                //console.log("Nomatch");
                logger.info("Nomatch");
                appSession.appSessionObj.dateSlotInputType = "noMatch";
                let ctr = parseInt(cxiSession.cxiSessionObj["DateSlotnoMatch" + "Count"], 10);
                ctr++;
                cxiSession.cxiSessionObj["DateSlotnoMatch" + "Count"] = ctr;
            }
        }

        //-----------------------------------------------------
        //------------PUT CXI Keys----------------------------
        let DateObj = {};
        DateObj.elicitationStyle = "";
        DateObj.slotName = DateSlot;
        DateObj.slotType = "AMAZON.Date";
        DateObj.inputMode = intentRequest.inputMode;
        DateObj.slotValue = date == "Invalid" ? "" : lex_Slots.GetSlots(DateSlot, intentRequest);
        DateObj.noMatchCount = cxiSession.cxiSessionObj["DateSlotnoMatch" + "Count"];
        DateObj.noInputCount = cxiSession.cxiSessionObj["DateSlotnoInput" + "Count"];
        cxiSession.cxiSessionObj.cxiSlotDetails.push(DateObj);
        cxiSession.cxiSessionObj.slotFlag = process.const.STR_Y;
        //-----------------------------------------------------
        if (date != "Invalid") {
            logger.info("Date Collected Successfully");
            //console.log("date in MS415 ", date);
            logger.info("date in MS415 :" + date);
            appSession.appSessionObj.stopServDate = date
            appSession.appSessionObj.userDate = date;
            appSession.nextIntent = process.const.MS210;
            appSession.nextStateName = process.const.NS_StopServDateConfirmation;
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
            intentRequest.sessionState.intent.slots[DateSlot]=null;
            cxiSession.cxiSessionObj.result = "Failure";
            logger.info("Date slot is null");
            retryController.Retry(
                DateSlot,
                intentRequest,
                promptOutR1,
                promptOutR2,
                callback,
                promptOut
            );
            return;

        }
    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentRequest.sessionState.intent.name, callback);
    }
};
module.exports = {
    stopServDate
};