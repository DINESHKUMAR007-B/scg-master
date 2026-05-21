const util = require("../../Helpers/Utilities/getLexResponse");
const logger = require("../../Helpers/Utilities/logger");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const catchHelper = require("../../Helpers/Common/catchHelper");
const agentHelper = require("../../Helpers/Common/agentHelper");
const ssmlMessage = require("../../Helpers/Common/ssmlHelper");
const callPath = require("../../Helpers/Common/callPathHelper");
const HoldOn = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + process.const.STR_Underscore + process.const.SN_MainMenu;
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        //-----------------------------------------------------
        if (appSession.appSessionObj.holdOnUtilized == "true") {
            appSession.appSessionObj.holdOnUtilized = "false";
            let activeContexts = [];
            //activeContexts = util.SetActiveContexts(activeContexts, "HoldOn");
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MainMenu);
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HoldOn);
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_AccountNumber);
            //appSession.appSessionObj.fallBackState = process.const.STR_True;//HC
            let AccountNumberSlot = process.const.STR_AccountNumber;
            //appSession.appSessionObj.callingMode = "StreetNumber";
            appSession.nextIntent = process.const.AU103;
            appSession.appSessionObj[AccountNumberSlot + "Count"] = 0;
            appSession.appSessionObj[AccountNumberSlot + "Retry"] = appSession.appSessionObj[AccountNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[AccountNumberSlot + "Retry"];
            promptOut = process.promptSession.scg_ccc_prmt_7006_auth_10_WaitAndContinueSuccess;
            /*promptOut += appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                process.promptSession.scg_ccc_collect_7006_auth_01_AccountNumberMS : process.promptSession.scg_ccc_collect_7006_auth_02_AccountNumber;*/
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
        } else {
            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_HoldOn);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700605);
            appSession.appSessionObj.fallBackState = appSession.appSessionObj.holdOnUtilized == process.const.STR_False ? process.const.STR_True : process.const.STR_False;
            appSession.appSessionObj.needMoreTime = process.const.STR_True;
            promptOut = process.promptSession.scg_ccc_prmt_7006_auth_07_WaitAndContinue;
            promptOut = ssmlMessage.ConvertSSML(promptOut);
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
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};

module.exports = {
    HoldOn
};
