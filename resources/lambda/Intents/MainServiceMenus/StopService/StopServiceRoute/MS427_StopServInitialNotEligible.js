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

const StopServInitialNotEligible = async function (intentRequest, callback) {
  const intentName = intentRequest.sessionState.intent.name;
  logger.info("Entered " + intentName + " Intent Flow");
  let appSession = sessionHelper.AppSession;
  let cxiSession = sessionHelper.CxiSession;
  let promptOut = " ";
  let activeContexts = [];
  appSession.startTime = util.getStartTime(new Date());
  try {
    appSession.preStateName = appSession.stateName;
    appSession.stateName = appSession.baseLine + "_" + process.const.SN_StopServInitialNotEligible;
    //let currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });

    let currentTime = new Date().toLocaleTimeString('en-US', {
      timeZone: 'America/Los_Angeles',
      hour12: false
    });

    //------------PUT CXI Keys----------------------------
    cxiSession.cxiSessionObj.result = "Success";
    cxiSession.cxiSessionObj.promptType = "prompt";
    cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
    cxiSession.exitPoint = appSession.stateName;
    cxiSession.cxiSessionObj.cxiAPIDetails = [];

    //-----------------------------------------------------

        logger.info("GetPremiseIsEligible == true false in MS427");
        //Stop Service not eligible Scenario's
        if (appSession.callerGoal == process.const.CG_moving) {
          cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_MovingOther);
          return agentHelper.AgentTransfer(
            intentRequest,
            intentName,
            promptOut,
            callback
          );
        }
        else {
          logger.info("existingClose : " + appSession.appSessionObj.existingClose);
          if (appSession.appSessionObj.existingClose == "1020") {
             logger.info("existingClose : 1020  true");
            //View Cancel So API Request Object
            let accountNumber = appSession.appSessionObj.contractAccount;;

            const viewCancelSoObj = {};
            //viewCancelSoObj.action = process.const.ServiceOrder_GetActionCode,
              viewCancelSoObj.contractAccount = accountNumber;


            //RequestObj Method
            let MS_WS02_ReqObj = await apiHelper.getRequestObject(process.const.I_DG_02_012_GET, viewCancelSoObj, intentRequest, intentName, callback);
            //logger.debug(MS_WS02_ReqObj);
            //ResponseObj Method
            let MS_WS02_ResObj = await apiHelper.getResponseObject(MS_WS02_ReqObj, intentRequest, intentName, callback);
            //logger.debug(MS_WS02_ResObj);


            if (MS_WS02_ResObj == null || MS_WS02_ResObj == undefined || MS_WS02_ResObj.status != 201 || MS_WS02_ResObj.status != "201") {
              logger.info("Service order Api failed in MS427");
              //-------------CXI_apidetails-----------------------------------//
              let WS02Details = {};
              WS02Details.apiId = process.const.I_DG_02_012_GET;
              WS02Details.apiname = process.const.I_DG_02_012_GET_APIName;
              WS02Details.statusCode = MS_WS02_ResObj == null || MS_WS02_ResObj == undefined ? "500" : MS_WS02_ResObj.status;
              WS02Details.apiStateResult = process.const.STR_Failure;
              WS02Details.errorMessage = process.const.STR_APIFail;
              cxiSession.cxiSessionObj.cxiAPIDetails.push(WS02Details);
              cxiSession.cxiSessionObj.apiFlag = process.const.STR_Y;
              appSession.appSessionObj.dbFail = process.const.STR_true;
              //-------------CXI_apidetails-----------------------------------//

              cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ProcessFailureExistingOrder);
              appSession.nextIntent = process.const.MS424;
              appSession.appSessionObj.dbFail = process.const.STR_True;
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
            appSession.appSessionObj.GetServiceOrderMessageType =  MS_WS02_ResObj?.data?.ZGMessage?.results?.[0]?.Type || "";
            appSession.appSessionObj.GetServiceOrderTypeMessage =  MS_WS02_ResObj?.data?.ZGMessage?.results?.[0]?.Message || "";

            if (!appSession.appSessionObj.GetServiceOrderMessageType || appSession.appSessionObj.GetServiceOrderMessageType == "E") {
              logger.info("ServiceOrderMessageType == E true in MS427");
              //------------PUT CXI Keys----------------------------//
              let WS02Details = {};
              WS02Details.apiId = process.const.I_DG_02_012_GET;
              WS02Details.apiname = process.const.I_DG_02_012_GET_APIName;
              WS02Details.statusCode = MS_WS02_ResObj.status;
              WS02Details.apiStateResult = process.const.STR_Failure;
              WS02Details.errorMessage = appSession.appSessionObj.GetServiceOrderTypeMessage;
              cxiSession.cxiSessionObj.cxiAPIDetails.push(WS02Details);
              cxiSession.cxiSessionObj.apiFlag = process.const.STR_Y;
              appSession.appSessionObj.dbFail = process.const.STR_true;
              //-----------------------------------------------------//
              cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ProcessFailureExistingOrder);
              appSession.nextIntent = process.const.MS424;
              appSession.appSessionObj.dbFail = process.const.STR_True;
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

            logger.info("ServiceOrderMessageType == S true in MS427");
            //-------------------CXI_apidetails----------------------------------//
            let WS02Details = {};
            WS02Details.apiId = process.const.I_DG_02_012_GET;
            WS02Details.apiname = process.const.I_DG_02_012_GET_APIName;
            WS02Details.statusCode = MS_WS02_ResObj.status;
            WS02Details.apiStateResult = process.const.STR_Success;
            WS02Details.errorMessage = appSession.appSessionObj.GetServiceOrderTypeMessage;
            cxiSession.cxiSessionObj.cxiAPIDetails.push(WS02Details);
            cxiSession.cxiSessionObj.apiFlag = process.const.STR_Y;
            //-----------------------------------------------------------------//

            // appSession.appSessionObj.GetPremiseHouseNumber = MS_WS02_ResObj.data.ZGSrvOrdDtls.HouseNumber;

            //View cancel so API Success
            appSession.appSessionObj.GetServiceOrderContractAccount = MS_WS02_ResObj?.data?.ContractAccount || "";
            appSession.appSessionObj.GetServiceOrderCustomerName = MS_WS02_ResObj?.data?.CustomerName || "";
            appSession.appSessionObj.GetServiceOrderConfNumber = MS_WS02_ResObj?.data?.ZGSrvOrdDtls?.results?.[0]?.ConfNumber || "";
            appSession.appSessionObj.GetServiceOrderType = MS_WS02_ResObj?.data?.ZGSrvOrdDtls?.results?.[0]?.Type || "";
            appSession.appSessionObj.GetServiceContract = MS_WS02_ResObj?.data?.ZGSrvOrdDtls?.results?.[0]?.ZGSrvOrdContr?.results?.[0]?.Contract || "";
            appSession.appSessionObj.GetServiceOrderMoveOutDate = MS_WS02_ResObj?.data?.ZGSrvOrdDtls?.results?.[0]?.ZGSrvOrdContr?.results?.[0]?.MoveOutDate || null;
            appSession.appSessionObj.GetServiceOrderOrderCount = MS_WS02_ResObj?.data?.ZGSrvOrdDtls?.results?.[0]?.ZGSrvOrdContr?.results?.length || 0;
            
            logger.info("GetServiceOrderType "+ appSession.appSessionObj.GetServiceOrderType);
            logger.info("GetServiceOrderMoveOutDate " + appSession.appSessionObj.GetServiceOrderMoveOutDate);
            logger.info("GetServiceOrderOrderCount "+ appSession.appSessionObj.GetServiceOrderOrderCount);
            logger.info("CurrentDate "+ appSession.appSessionObj.currentDate);

            if (appSession.appSessionObj.GetServiceOrderType == process.const.I_DG_02_012_GET_APIName_GetServiceOrderType && appSession.appSessionObj.GetServiceOrderMoveOutDate) {
              logger.info("ServiceOrderType == MO && ServiceOrderMoveOutDate!=null true");
              const moveOut = new Date(appSession.appSessionObj.GetServiceOrderMoveOutDate);
              const current = new Date(appSession.appSessionObj.currentDate);
              if (moveOut > current) {
                logger.info("moveOut > current true");
                appSession.appSessionObj.stopDate = appSession.appSessionObj.GetServiceOrderMoveOutDate;
              } else {
                logger.info("moveOut > current false");
                appSession.appSessionObj.stopDate = null;
              }
              logger.info("NewCurrentDate"+ current);
              logger.info("stopDate : "+ appSession.appSessionObj.stopDate);
              logger.info("GetServiceOrderOrderCount : "+ appSession.appSessionObj.GetServiceOrderOrderCount);
              logger.info("GetServiceOrderConfNumber : "+ appSession.appSessionObj.GetServiceOrderConfNumber);
              if (appSession.appSessionObj.stopDate == null || appSession.appSessionObj.GetServiceOrderOrderCount > 1 || !appSession.appSessionObj.GetServiceOrderConfNumber) {
                logger.info("stopDate == null || GetServiceOrderOrderCount > 1 || !GetServiceOrderConfNumber true");
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ExistingOrder);
                appSession.nextIntent = process.const.MS424;
              }
              else {
                logger.info("stopDate == null || GetServiceOrderOrderCount > 1 || !GetServiceOrderConfNumber false");
                //console.log("Entered to MS427 Else");
                appSession.nextStateName = process.const.NS_StopServiceExistingCloseMenu;
                appSession.nextIntent = process.const.MS210;
              }
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
              logger.info("ServiceOrderType == MO && ServiceOrderMoveOutDate!=null false");
              cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ExistingOrder);
              appSession.nextIntent = process.const.MS424;
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
          else {
            logger.info("existingClose : 1020  false in MS427");
            appSession.callerGoal = process.const.CG_close_order;
            cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_CloseOrderNotEligible);
            appSession.appSessionObj.baID = appSession.appSessionObj.baID;
            appSession.appSessionObj.phoneNumber = appSession.appSessionObj.phoneNumber;


            appSession.nextIntent = process.const.MS424;
            return stopServiceNotEligible.StopServiceNotEligiblepg1(intentRequest, callback);
          }
        }

      } 

    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
      }
    };
      
      module.exports = {
    StopServInitialNotEligible
  };