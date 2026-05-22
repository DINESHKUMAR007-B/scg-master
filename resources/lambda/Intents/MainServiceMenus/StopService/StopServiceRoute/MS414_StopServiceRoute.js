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
const stopServicePg2 = require("../../../../Intents/MainServiceMenus/StopService/StopServiceRoute/MS425_StopService_Pg2");
const stopServicePg3 = require("../../../../Intents/MainServiceMenus/StopService/StopServiceRoute/MS426_StopServEvalDate_Pg3");
const stopServiceNotEligible = require("../../../../Intents/MainServiceMenus/StopService/StopServiceRoute/MS424_StopServiceNotEligiblepg1");
const stopServInitialNotEligible = require("./MS427_StopServInitialNotEligible.js");

const StopService = async function (intentRequest, callback) {
  const intentName = intentRequest.sessionState.intent.name;
  logger.info("Entered " + intentName + " Intent Flow");
  let appSession = sessionHelper.AppSession;
  let cxiSession = sessionHelper.CxiSession;
  let promptOut = " ";
  let activeContexts = [];
  appSession.startTime = util.getStartTime(new Date());
  try {
    appSession.preStateName = appSession.stateName;
    appSession.stateName = appSession.baseLine + "_" + process.const.SN_StopServiceRoute;

    //------------PUT CXI Keys----------------------------
    cxiSession.cxiSessionObj.result = "Success";
    cxiSession.cxiSessionObj.promptType = "prompt";
    cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
    cxiSession.exitPoint = appSession.stateName;
    cxiSession.cxiSessionObj.cxiAPIDetails = [];

    //-----------------------------------------------------
    if (appSession.nextStateName == process.const.NS_AccountValidation_OP1) {
      let accountNumber = appSession.appSessionObj.contractAccount;

      const accountValidationObj = {}
      accountValidationObj.contractAccount = accountNumber;

      //RequestObj Method
      let MS_I_DG_02_004_GetElig_ReqObj = await apiHelper.getRequestObject(process.const.I_DG_02_004_GET, accountValidationObj, intentRequest, intentName, callback);
      let MS_I_DG_02_004_GetElig_ResObj = await apiHelper.getResponseObject(MS_I_DG_02_004_GetElig_ReqObj, intentRequest, intentName, callback);

      //-------------------------------------//
      //Checking api StatusCode
      if (MS_I_DG_02_004_GetElig_ResObj == null || MS_I_DG_02_004_GetElig_ResObj == undefined || MS_I_DG_02_004_GetElig_ResObj.status != 201 || MS_I_DG_02_004_GetElig_ResObj.status != "201") {

        //-------------CXI_apidetails-----------------------------------//
        let WS01Details = {};
        WS01Details.apiId = process.const.I_DG_02_004_GET;
        WS01Details.apiname = process.const.I_DG_02_004_GET_APIName;
        WS01Details.statusCode = MS_I_DG_02_004_GetElig_ResObj == null || MS_I_DG_02_004_GetElig_ResObj == undefined ? "500" : MS_I_DG_02_004_GetElig_ResObj.status;
        WS01Details.apiStateResult = process.const.STR_Failure;
        WS01Details.errorMessage = process.const.STR_APIFail;
        cxiSession.cxiSessionObj.cxiAPIDetails.push(WS01Details);
        cxiSession.cxiSessionObj.apiFlag = process.const.STR_Y;
        appSession.appSessionObj.dbFail = process.const.STR_true;
        //-------------CXI_apidetails-----------------------------------//

        cxiSession.exitReason = callPath.ExitReason(
          cxiSession.exitReason,
          appSession.callerGoal == process.const.CG_moving ?
            process.const.ER_MovingProcessFailureAcctValidation :
            process.const.ER_CloseOrderProcessFailureAcctValidation
        );
        appSession.appSessionObj.dbFail = process.const.STR_True;
        return agentHelper.AgentTransfer(
          intentRequest,
          intentName,
          promptOut,
          callback
        );
      }

      //logger.debug(MS_I_DG_02_004_GetElig_ResObj.data);
      // appSession.appSessionObj.GetPremiseMessageType = MS_I_DG_02_004_GetElig_ResObj?.data?.ZGMessage?.results?.[0]?.Type || "";
      appSession.appSessionObj.GetPremiseMessageType = MS_I_DG_02_004_GetElig_ResObj?.data?.ZGMessage?.results?.[0]?.Type;
      appSession.appSessionObj.GetPremiseTypeMessage = MS_I_DG_02_004_GetElig_ResObj?.data?.ZGMessage?.results?.[0]?.Message;
      appSession.appSessionObj.existingClose = MS_I_DG_02_004_GetElig_ResObj?.data?.ZGMessage?.results?.[0]?.ResultCode;

      if (!appSession.appSessionObj.GetPremiseMessageType || appSession.appSessionObj.GetPremiseMessageType == "E") {

        console.log("existingClose :", appSession.appSessionObj.existingClose);
        //------------PUT CXI Keys----------------------------//
        if (appSession.appSessionObj.existingClose) {

          console.log("existingClose is available in Type E");
          appSession.appSessionObj.FromTypeE = process.const.STR_True;

          return stopServInitialNotEligible.StopServInitialNotEligible(intentRequest, callback);
        }
        let WS01Details = {};
        WS01Details.apiId = process.const.I_DG_02_004_GET;
        WS01Details.apiname = process.const.I_DG_02_004_GET_APIName;
        WS01Details.statusCode = MS_I_DG_02_004_GetElig_ResObj.status;
        WS01Details.apiStateResult = process.const.STR_Failure;
        WS01Details.errorMessage = appSession.appSessionObj.GetPremiseTypeMessage;
        cxiSession.cxiSessionObj.cxiAPIDetails.push(WS01Details);
        cxiSession.cxiSessionObj.apiFlag = process.const.STR_Y;
        appSession.appSessionObj.dbFail = process.const.STR_true;
        //-----------------------------------------------------//

        cxiSession.exitReason = callPath.ExitReason(
          cxiSession.exitReason,
          appSession.callerGoal == process.const.CG_moving ?
            process.const.ER_MovingProcessFailureAcctValidation :
            process.const.ER_CloseOrderProcessFailureAcctValidation
        );
        appSession.appSessionObj.dbFail = process.const.STR_True;
        return agentHelper.AgentTransfer(
          intentRequest,
          intentName,
          promptOut,
          callback
        );

      }

      //-------------------CXI_apidetails----------------------------------//
      let WS01Details = {};
      WS01Details.apiId = process.const.I_DG_02_004_GET;
      WS01Details.apiname = process.const.I_DG_02_004_GET_APIName;
      WS01Details.statusCode = MS_I_DG_02_004_GetElig_ResObj.status;
      WS01Details.apiStateResult = process.const.STR_Success;
      WS01Details.errorMessage = appSession.appSessionObj.GetPremiseTypeMessage;
      cxiSession.cxiSessionObj.cxiAPIDetails.push(WS01Details);
      cxiSession.cxiSessionObj.apiFlag = process.const.STR_Y;
      //-----------------------------------------------------------------//

      appSession.appSessionObj.GetPremiseIsEligible = MS_I_DG_02_004_GetElig_ResObj?.data?.IsEligible;
      appSession.appSessionObj.GetPremiseHouseNumber = MS_I_DG_02_004_GetElig_ResObj?.data?.ZGPremSrvAddr?.HouseNumber || "";
      appSession.appSessionObj.GetPremiseIsOwner = MS_I_DG_02_004_GetElig_ResObj?.data?.IsOwner;
      appSession.appSessionObj.GetPremiseHasPendingOrder = MS_I_DG_02_004_GetElig_ResObj?.data?.HasPendingOrder;
      appSession.appSessionObj.GetPremiseContractStartDate = MS_I_DG_02_004_GetElig_ResObj?.data?.ContractStartDate;
      appSession.appSessionObj.GetPremiseCalender = Array.isArray(MS_I_DG_02_004_GetElig_ResObj?.data?.ZGCalendar?.results)
        ? MS_I_DG_02_004_GetElig_ResObj.data.ZGCalendar.results : [];
      appSession.appSessionObj.existingClose = MS_I_DG_02_004_GetElig_ResObj?.data?.ZGMessage?.results?.[0]?.ResultCode;

      appSession.appSessionObj.offCalendarDtfiltered = (appSession.appSessionObj.GetPremiseCalender || [])
        .filter(item => item.Flag === "Y")
        .map(item => item.Date);


      if (appSession.appSessionObj.offCalendarDtfiltered.length === 0) {
        appSession.appSessionObj.firstAvailCloseDate = "";
        logger.info("firstAvailCloseDate: is empty");
      }
      else {
        // Get off calendar first  available date
        appSession.appSessionObj.firstAvailCloseDate = appSession.appSessionObj.offCalendarDtfiltered[0];
        logger.info("firstAvailCloseDate: is not empty");
      }
      // console.log("firstAvailCloseDate:", appSession.appSessionObj.firstAvailCloseDate);
      // console.log("offCalendarDtfiltered:", appSession.appSessionObj.offCalendarDtfiltered);

      //Get Cuurent Date& Next day Date
      appSession.appSessionObj.nextDate = GetDate.getNextDate(appSession.appSessionObj.currentDate);

      if (appSession.appSessionObj.GetPremiseIsEligible == true) {
        logger.info("GetPremiseIsEligible == true true");

        if (appSession.appSessionObj.callerGoal == process.const.CG_moving) {
          logger.info("After eligible MS414 callerGoal == moving true");
          if ((appSession.appSessionObj.movingSMSSw == "true") && (appSession.appSessionObj.language.toLowerCase() == "english") && appSession.appSessionObj.Type != "2") {
            appSession.nextStateName = process.const.NS_Moving_SMS;
            appSession.nextIntent = process.const.MS210;

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
            //movingSMS - N Scenario's
            appSession.nextIntent = process.const.MS414;
            appSession.nextStateName = process.const.NS_FirstDate;
            appSession.nextBot = "MainServices_Bot";
            appSession.bargeIn = process.const.STR_False;
            appSession.fallBackState = process.const.STR_True;
            promptOut = process.promptSession.scg_ccc_prmt_2300_main_02_CompleteOrder;
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
          }
        }
        else {
          logger.info("After eligible MS414 callerGoal == moving false");
          //Calling Mode MAIN_2000_ChangeServiceMenu Scenarios
          if (appSession.appSessionObj.callingMod == process.const.CM_MAIN_2000) {
            logger.info("After eligible MS414 callingMod ==MAIN_2000 true");
            appSession.nextStateName = process.const.NS_StopCancel;
            appSession.nextIntent = process.const.MS200;
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
            logger.info("After eligible MS414 callingMod ==MAIN_2000 false");
            appSession.callerGoal = process.const.CG_close_order;
            appSession.nextStateName = process.const.NS_FirstDate;
            appSession.nextIntent = process.const.MS414;
            console.log("calling same function StopService");
            return StopService(intentRequest, callback);
          }

        }
      }
      else {


        // console.log("Page went MS427_StopServInitialNotEligible:");
        logger.info("Page went MS427_StopServInitialNotEligible");
        return stopServInitialNotEligible.StopServInitialNotEligible(intentRequest, callback);
      }


    }
    else if (appSession.nextStateName == process.const.NS_FirstDate) {

      // MAIN_2300_StopService -Check first date logic
      //if (appSession.appSessionObj.firstAvailCloseDate == "" && (appSession.appSessionObj.GetPremiseHasPendingOrder == false || appSession.appSessionObj.GetPremiseHasPendingOrder == "false")) {
      if (appSession.appSessionObj.firstAvailCloseDate == "" && !appSession.appSessionObj.GetPremiseContractStartDate) {// handles: undefined, null, "", 0, false
        logger.info("firstAvailCloseDate is empty and GetPremiseHasPendingOrder is false");
        let exitReason = appSession.callerGoal == process.const.CG_moving ? process.const.ER_MovingOtherConditions : process.const.ER_CloseOrderOtherConditions;
        cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, exitReason);
        return agentHelper.AgentTransfer(
          intentRequest,
          intentName,
          promptOut,
          callback
        );
      }
      else {
        appSession.nextStateName = process.const.NS_StopService_Pg2;
        // appSession.nextIntent = process.const.MS414;
        logger.info(" calling MS425_StopService_Pg2 from ");
        return stopServicePg2.StopServicePg2(intentRequest, callback);

      }
    } else if (appSession.nextStateName == process.const.NS_StopServiceMoveSms) {
      //movingSMS - N Scenario's
      appSession.nextIntent = process.const.MS414;
      appSession.nextStateName = process.const.NS_FirstDate;
      appSession.nextBot = "MainServices_Bot";
      appSession.bargeIn = process.const.STR_False;
      appSession.fallBackState = process.const.STR_True;
      promptOut = process.promptSession.scg_ccc_prmt_2300_main_02_CompleteOrder;
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
    } else {
      logger.info("nextStateName is empty in MS414");
      //Agent to IVA scenario
      cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_StopServiceMenu);
      cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_230000);
      if (appSession.appSessionObj.appName == "closeProcess" || appSession.appSessionObj.appName == "closeProcessSpn") {
        logger.info("MS414 appName ==closeProcess  || appName == closeProcessSpn true");
        appSession.nextIntent = process.const.MS414;
        appSession.nextBot = "MainServices_Bot";
        appSession.nextStateName = process.const.NS_AccountValidation_OP1;
        appSession.appSessionObj.authMethod = "acct";
        appSession.bargeIn = process.const.STR_False;
        appSession.fallBackState = process.const.STR_True;
        promptOut = process.promptSession.scg_ccc_prmt_2300_main_01_CloseAccount;
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
      } else {
        logger.info("MS414 appName ==closeProcess  || appName == closeProcessSpn false");
        appSession.nextIntent = process.const.MS414;
        appSession.nextStateName = process.const.NS_AccountValidation_OP1;
        return StopService(intentRequest, callback);
      }
    }

  }
  catch (error) {
    catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
  }
};

module.exports = {
  StopService
};