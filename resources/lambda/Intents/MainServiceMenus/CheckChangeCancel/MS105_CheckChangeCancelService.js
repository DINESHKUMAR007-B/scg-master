const logger = require("../../../Helpers/Utilities/logger");
const sessionHelper = require("../../../Helpers/Common/sessionHelper");
const util = require("../../../Helpers/Utilities/getLexResponse");
const lex_Slots = require("../../../Helpers/Common/slotHelper");
const catchHelper = require("../../../Helpers/Common/catchHelper");
const ssmlMessage = require("../../../Helpers/Common/ssmlHelper");
//const configEmail = require("../../../Helpers/Common/configEmail");
const agentHelper = require("../../../Helpers/Common/agentHelper");

const CheckChangeCancel = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let activeContexts = [];
    appSession.startTime = util.getStartTime(new Date());
    try {
        //--------------hardcode------------------
        // appSession.authenticated = process.const.STR_True;
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + "_CheckChangeCancel";
        // appSession.callerGoal = appSession.appSessionObj.configEmailCancel == process.const.STR_True ? appSession.appSessionObj.callerGoal : process.const.CG_close_check;
        // appSession.appSessionObj.callingMod = appSession.appSessionObj.configEmailCancel == process.const.STR_True ? appSession.appSessionObj.callingMod : process.const.CM_MAIN_2000;
        appSession.callerGoal =  process.const.CG_close_check;
        appSession.appSessionObj.callingMod =  process.const.CM_MAIN_2000;
       
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.cxiSessionObj.exitPoint = appSession.stateName;
        //-----------------------------------------------------
        // if (appSession.appSessionObj.configEmailCancel == process.const.STR_True) {
        //     appSession.appSessionObj.configEmailCancel = process.const.STR_False;
        //     await configEmail.ConfigEmail(intentRequest, callback);
        //     return;
        // }
        // else
         if (appSession.authenticated == process.const.STR_False || appSession.authenticated == undefined ||
            appSession.authenticated == null || appSession.authenticated.length <= 0) {
            appSession.nextIntent = "AU100_InitialIdentification";
            appSession.nextBot = "Authentication_Bot";
            appSession.fallBackState = process.const.STR_True;
            promptOut = process.promptSession.scg_ccc_prmt_2000_main_11_CloseCheckConf;
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

        if (appSession.authenticated == process.const.STR_True) {
            appSession.nextIntent = process.const.MS414;
            if (appSession.appSessionObj.nextStateName == "MainServices_Menu" || appSession.appSessionObj.nextStateName == process.const.NS_MoreOptions) 
                {
                promptOut = process.promptSession.scg_ccc_prmt_2000_main_11_CloseCheckConf;
                // appSession.nextStateName = process.const.NS_AccountValidation_OP1;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                //appSession.fallBackState = process.const.STR_True;
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
            // appSession.nextStateName = process.const.NS_AccountValidation_OP1;
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
    CheckChangeCancel
};
