const util = require("../../Helpers/Utilities/getLexResponse");
const logger = require("../../Helpers/Utilities/logger");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const catchHelper = require("../../Helpers/Common/catchHelper");
const agentHelper = require("../../Helpers/Common/agentHelper");

const NewCustomer = async function(intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + process.const.STR_Underscore + process.const.SN_NewCustomer;
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        //-----------------------------------------------------
        if(appSession.callerGoal == process.const.CG_TailorTreatmentPrediction){
            appSession.appSessionObj.upFrontAuthentication = "Failure"; 
        appSession.appSessionObj.newCustomer = process.const.STR_True;    
        appSession.appSessionObj.phoneNumberCount = "0";
        appSession.appSessionObj.accountNumberCount = "0";
        appSession.appSessionObj.diffPhoneNumberCtr = 0;
        appSession.appSessionObj.phoneNumberCtr = 0;
        appSession.appSessionObj.streetNumberCtr = 0;
        appSession.nextIntent = process.const.MA100;
        appSession.nextBot = process.const.Master_Bot;
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
        appSession.callerGoal = process.const.CG_NewCustomer;
        appSession.appSessionObj.couldNotIdentify = process.const.STR_False;
        appSession.appSessionObj.authenticated = process.const.STR_False;
        appSession.appSessionObj.phoneNumberCount = "0";
        appSession.appSessionObj.accountNumberCount = "0";
        appSession.nextIntent = process.const.MS300;
        appSession.nextBot = process.const.MainServices_Bot;
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
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};

module.exports = {
    NewCustomer
};
