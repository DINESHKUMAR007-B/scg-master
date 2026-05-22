const util = require("../../Helpers/Utilities/getLexResponse");
const logger = require("../../Helpers/Utilities/logger");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const catchHelper = require("../../Helpers/Common/catchHelper");
const agentHelper = require("../../Helpers/Common/agentHelper");
const callPath = require("../../Helpers/Common/callPathHelper");

const Operator = async function(intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    appSession.startTime = util.getStartTime(new Date());
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + "_Operator";
        cxiSession.exitPoint = appSession.stateName;
                //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;

        appSession.appSessionObj.cxiAgentReq = "true";
        //-----------------------------------------------------
        if (appSession.nextStateName =="AnythingElse"&&appSession.appSessionObj.turnOffStopService=="true")
        {

            if(appSession.appSessionObj.isNotDay1Service == "true")
                {
                 cxiSession.callPath = callPath.CallPath(cxiSession.callPath,process.const.CP_AnyThingElseOperator);
                 cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232205);
                 appSession.appSessionObj.isNotDay1Service == "false";
                     return agentHelper.AgentTransfer(
                         intentRequest,
                         intentName,
                         promptOut,
                         callback
                     );
                 }
            cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, "Service Request Digital Deflection sent, agent requested");
            if (appSession.authenticated == process.const.STR_False || appSession.authenticated == undefined ||
                appSession.authenticated == null || appSession.authenticated.length <= 0) {
                appSession.nextIntent = "AU100_InitialIdentification";
                appSession.nextBot = "Authentication_Bot";
                appSession.appSessionObj.fallBackState = process.const.STR_True;
                promptOut = "";
               
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
            }else{  
                return agentHelper.AgentTransfer(
                intentRequest,
                intentName,
                promptOut,
                callback
            );
    }  
        }
        else if(appSession.nextStateName ==process.const.NS_StopServBilledBalanceMenu){
         cxiSession.callPath = callPath.CallPath(cxiSession.callPath,"MAIN_2334 – Agent requested.");
         cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233405);
        }
        else if(appSession.nextStateName ==process.const.NS_AnythingElseBill){
         cxiSession.callPath = callPath.CallPath(cxiSession.callPath,process.const.CP_AnyThingElseOperator);
         cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232205);
        }else if (appSession.nextStateName == process.const.NS_AnythingElse || 
                  appSession.nextStateName == process.const.NS_StopAnyThingElse || 
                  appSession.nextStateName == process.const.NS_CheckChangeCancelAnythingElse || 
                  appSession.nextStateName == process.const.NS_StopnotEligibleAnythingElse||
                  appSession.nextStateName == process.const.NS_StopServNotAnythingElse)
                  {
         cxiSession.callPath = callPath.CallPath(cxiSession.callPath,process.const.CP_AnyThingElseOperator);
         cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233505);
         }
        else {
        cxiSession.callPath = callPath.CallPath(cxiSession.callPath,process.const.CP_AnyThingElseOperator);
        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232205);
        }
        //cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, "Talk to an agent from anythingElse");
        return agentHelper.AgentTransfer(
            intentRequest,
            intentName,
            promptOut,
            callback
        );



    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};

module.exports = {
    Operator
};
