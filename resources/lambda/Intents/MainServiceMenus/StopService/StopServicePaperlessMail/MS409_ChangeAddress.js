const util = require("../../../../Helpers/Utilities/getLexResponse");
const sessionHelper = require("../../../../Helpers/Common/sessionHelper");
const ssmlMessage = require("../../../../Helpers/Common/ssmlHelper");
const logger = require("../../../../Helpers/Utilities/logger");
const catchHelper = require("../../../../Helpers/Common/catchHelper");
const callPath = require("../../../../Helpers/Common/callPathHelper");
const ChangeAddress = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let activeContexts = [];
    appSession.startTime = util.getStartTime(new Date());
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + process.const.SN_ChangeAddress;
        //-----CXI----------------------------------//
        cxiSession.exitPoint = appSession.stateName;
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        //-----------------------------------------//
        appSession.callerGoal = process.const.CG_CloseOrderNeedMA;

        if (intentRequest.bot.localeId == "es_US") {

            appSession.nextIntent = process.const.MS210;
            appSession.nextStateName = process.const.NS_StopServiceChangeAddressSpanish;
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
            if (appSession.appSessionObj.smsTurnOnSw == process.const.STR_True) {
                appSession.nextIntent = process.const.MS200;
                appSession.nextStateName = process.const.NS_SmartPhoneConfirmation;
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_SMSTurnOn);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232308);

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
                cxiSession.cxiSessionObj.promptType = "menu";//cxi
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_SMSTurnOnFalse);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232307);
                appSession.nextStateName = process.const.NS_FullAddressStopService;
                let activeContexts = [];
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_CollectFullAddress);

                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232500);
                promptOut = process.promptSession.scg_ccc_collect_2325_main_01_FullAddr;
                cxiSession.cxiSessionObj.promptIdFlag = "Y";
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                callback(
                    util.DialogAction(
                        process.const.DA_ElicitIntentActiveContext,
                        intentRequest,
                        intentName,
                        util.BuildSSMLMessage(promptOut),
                        process.const.STR_Fulfilled,
                        activeContexts,

                    )
                );
                return;
            }

        }
    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};
module.exports = {
    ChangeAddress
};
