const util = require("../../../../Helpers/Utilities/getLexResponse");
const sessionHelper = require("../../../../Helpers/Common/sessionHelper");
const ssmlMessage = require("../../../../Helpers/Common/ssmlHelper");
const logger = require("../../../../Helpers/Utilities/logger");
const catchHelper = require("../../../../Helpers/Common/catchHelper");
const agentHelper = require("../../../../Helpers/Common/agentHelper");
const apiHelper = require("../../../../Helpers/Common/apiHelper");
const xmlTojson = require("../../../../Helpers/Common/soapApiReq");
const callPath = require("../../../../Helpers/Common/callPathHelper");
const StopServicePaperlessMail = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let accountNumber;
    let activeContexts = [];
    appSession.startTime = util.getStartTime(new Date());
    let WS03Details = {}; //cxi
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + process.const.SN_StopServicePaperlessMail;
        //-----CXI----------------------------------//
        cxiSession.exitPoint = appSession.stateName;
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.cxiSessionObj.cxiAPIDetails = [];
        //-----------------------------------------//
        appSession.fallBackState = process.const.STR_False;
        // 12/16 condition update
        if (appSession.appSessionObj.isOnPaperless == process.const.STR_True) {
            logger.info("isOnPaperless is true MS417");
            appSession.appSessionObj.closeAddress = process.const.STR_Email;
            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseAddressEmail);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232010);
            appSession.nextIntent = process.const.MS210;
            appSession.nextStateName = process.const.NS_BillSentMailConfirmation;
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
            logger.info("isOnPaperless is false MS417");
            appSession.nextIntent = process.const.MS418;
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
    StopServicePaperlessMail
};
