const logger = require("../../../../Helpers/Utilities/logger");
const sessionHelper = require("../../../../Helpers/Common/sessionHelper");
const util = require("../../../../Helpers/Utilities/getLexResponse");
const catchHelper = require("../../../../Helpers/Common/catchHelper");
const ssmlMessage = require("../../../../Helpers/Common/ssmlHelper");
const apiHelper = require("../../../../Helpers/Common/apiHelper");
const agentHelper = require("../../../../Helpers/Common/agentHelper");
const xmlTojson = require("../../../../Helpers/Common/soapApiReq");
const GetDate = require("../../../../Helpers/Common/getDate");
const callPath = require("../../../../Helpers/Common/callPathHelper");
const stopServicePg3 = require("../../../../Intents/MainServiceMenus/StopService/StopServiceRoute/MS426_StopServEvalDate_Pg3");
const stopServPropOwner = require("../StopServicePropOwner/MS416_StopServPropOwner");

const StopServicePg2 = async function (intentRequest, callback) {
   const intentName = intentRequest.sessionState.intent.name;
   logger.info(" Entered MS425_StopService_Pg2");
   let appSession = sessionHelper.AppSession;
   let cxiSession = sessionHelper.CxiSession;
   let promptOut = " ";
   let activeContexts = [];
   appSession.startTime = util.getStartTime(new Date());
   try {
      appSession.preStateName = appSession.stateName;
      appSession.stateName = appSession.baseLine + "_" + process.const.SN_StopServiceRoute;
      let currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });

      //------------PUT CXI Keys----------------------------
      cxiSession.cxiSessionObj.result = "Success";
      cxiSession.cxiSessionObj.promptType = "prompt";
      cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
      cxiSession.exitPoint = appSession.stateName;
      cxiSession.cxiSessionObj.cxiAPIDetails = [];

      if (appSession.nextStateName == process.const.NS_StopService_Pg2) {

         // if (appSession.appSessionObj.GetPremiseHasPendingOrder == "true" &&
         //    appSession.appSessionObj.GetPremiseContractStartDate <= appSession.appSessionObj.nextDate
         // ) {
         //    appSession.appSessionObj.closeDate = appSession.appSessionObj.GetPremiseContractStartDate;
         //    appSession.appSessionObj.dateChg = "Y";
         // }
         // else
          if (appSession.appSessionObj.GetPremiseContractStartDate > appSession.appSessionObj.nextDate && appSession.appSessionObj.firstAvailCloseDate == "") 
            {
            logger.info(" GetPremiseContractStartDate > nextDate && firstAvailCloseDate is empty true");
            cxiSession.cxiSessionObj.exitReason = callPath.ExitReason(cxiSession.cxiSessionObj.exitReason, "Close Order – No calender date is available, has pending order.");
            return agentHelper.AgentTransfer(
               intentRequest,
               intentName,
               promptOut,
               callback
            );
         }
         else {
            logger.info(" GetPremiseContractStartDate > nextDate && firstAvailCloseDate is empty false");
            appSession.nextIntent = appSession.appSessionObj.authMethod == "acct" ? process.const.MS210 : process.const.MS200;
            appSession.appSessionObj.nextStateName = appSession.appSessionObj.authMethod == "acct" ? process.const.NS_StopService_Pg2 : process.const.NS_StopServFumStop;
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
         // appSession.nextIntent = process.const.MS414;
         appSession.nextStateName = process.const.NS_StopServEvalDate_Pg3;

         cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseDateUpdatetoDate);
         appSession.appSessionObj.from2302_StopService_Pg2 = process.const.STR_Y;
         appSession.appSessionObj.fromStopServEvalDatePg3 = "Y";
         return stopServicePg3.StopServicePg3(intentRequest, callback);

      }

   }
   catch (error) {
      catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
   }
};

module.exports = {
   StopServicePg2
};