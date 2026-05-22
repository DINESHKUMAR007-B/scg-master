const util = require("../../Helpers/Utilities/getLexResponse");
const logger = require("../../Helpers/Utilities/logger");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const catchHelper = require("../../Helpers/Common/catchHelper");
const ssmlMessage = require("../../Helpers/Common/ssmlHelper");
const callPath = require("../../Helpers/Common/callPathHelper");
const PayMyBill = async function(intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    appSession.startTime = util.getStartTime(new Date());
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + "_PayMyBill";
        cxiSession.exitPoint = appSession.stateName;
        appSession.nextIntent = "BP600_PayingMyBill";
        appSession.nextBot = "Billing_Bot";
                //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        //-----------------------------------------------------
         promptOut = process.promptSession.scg_ccc_prmt_2322_main_06_FinalBillNotCalculated;
         promptOut = ssmlMessage.ConvertSSML(promptOut);
        appSession.callerGoal = process.const.CG_pay_my_bill;
         if(appSession.nextStateName == process.const.NS_FNPMenuAMP_SW_true || appSession.nextStateName == process.const.NS_FNPMenuAMP_SW_false || appSession.nextStateName == process.const.NS_PostFNPMenu ){
            promptOut = " ";
            if(appSession.nextStateName == process.const.NS_FNPMenuAMP_SW_true || appSession.nextStateName == process.const.NS_FNPMenuAMP_SW_false){ 
            cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_needToPayMyBill); 
            }
             
         }
         appSession.appSessionObj.callingMod = "fumigationReconnect";
         //appSession.disconnect = process.const.STR_True;
         appSession.bargeIn = process.const.STR_False;
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
    PayMyBill
};
