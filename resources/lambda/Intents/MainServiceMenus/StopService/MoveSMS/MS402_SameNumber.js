const logger = require("../../../../Helpers/Utilities/logger");
const sessionHelper = require("../../../../Helpers/Common/sessionHelper");
const util = require("../../../../Helpers/Utilities/getLexResponse");
const lex_Slots = require("../../../../Helpers/Common/slotHelper");
const catchHelper = require("../../../../Helpers/Common/catchHelper");
const ssmlMessage = require("../../../../Helpers/Common/ssmlHelper");
const agentHelper = require("../../../../Helpers/Common/agentHelper");
const apiHelper = require("../../../../Helpers/Common/apiHelper");
const xmlTojson = require("../../../../Helpers/Common/soapApiReq");
const callPath = require("../../../../Helpers/Common/callPathHelper");
const getDateFormat = require("../../../../Helpers/Common/getDate");

const SameNumber = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let activeContexts = [];
    appSession.startTime = util.getStartTime(new Date());
    try {
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "API Look Up";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.cxiSessionObj.exitPoint = appSession.stateName;
        cxiSession.cxiSessionObj.cxiAPIDetails = [];

        if (appSession.nextStateName == process.const.NS_Move_PhNumConfirmMenu || appSession.nextStateName == process.const.NS_Move_DifferentPhoneNumberConfirmation) {
            logger.info("move service DD offerring place in MS402");
            let MoveANI = appSession.nextStateName == process.const.NS_Move_DifferentPhoneNumberConfirmation ?
                appSession.appSessionObj.MovesmsDifferentPhoneNumber : appSession.appSessionObj.ANI;

            if (appSession.appSessionObj.smsProgressmove == undefined) {
                appSession.appSessionObj.smsProgressmove = process.const.STR_True;
                appSession.bargeIn = process.const.STR_False;
                if (appSession.nextStateName == process.const.NS_Move_PhNumConfirmMenu) {
                    cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_SentSMSViaSameSmartPhoneNumber);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_220140);
                }
                promptOut = process.promptSession.scg_ccc_prmt_2201_main_16_WeblinkPhNm + '<say-as interpret-as="telephone">' + MoveANI + '</say-as>';
                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                appSession.nextIntent = process.const.MS402;
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
            let accountNumber = appSession.appSessionObj.contractAccount;

            logger.info("move service DD Api call started");
            const sendSmsObj = [{
                phoneNumber: MoveANI, //appSession.appSessionObj.ANI,
                templateId: process.const.WS_SCG_MovingSMS, //"053", //process.const.WS_SCG_CustomerContactServiceSMS_templateId,
                needTracking: process.const.WS_SCG_CustomerContactServiceSMS_needTracking,
                billAccountNumber: appSession.appSessionObj.contractAccount
            },
            { propertyKey: "AWS_URL_TokenId", propertyValue: "https://pubsvc.socalgas.com/service/transferService.html" },
            { propertyKey: "SOURCE_SYSTEM", propertyValue: "IVR" },
            ];
            let MS_WS07_ReqObj = await apiHelper.getSOAPRequestObject("MS_WS07", sendSmsObj, intentRequest, intentName, callback);
            //logger.debug(MS_WS07_ReqObj);
            //logger.info("move service DD ReqObj Created");
            let MS_WS07_ResObj = await apiHelper.getSOAPResponseObject(MS_WS07_ReqObj, intentRequest, intentName, callback);
            //logger.info("move service DD RespObj came");

            //-------------CXI_apidetails-----------------------------------//
            let WS07Details = {};
            WS07Details.apiId = "MS_WS07";
            WS07Details.apiname = "sendOnDemandText";
            //  WS07Details.requestId = " "; //

            //apdetails-------------------------------------//
            if (MS_WS07_ResObj == null || MS_WS07_ResObj == undefined || MS_WS07_ResObj.statusCode != 200) {
                logger.info("move DD statusCode != 200 true");
                WS07Details.statusCode = MS_WS07_ResObj == null || MS_WS07_ResObj == undefined ? "500" : MS_WS07_ResObj.statusCode; //cxi
                WS07Details.apiStateResult = "Failure";
                WS07Details.errorMessage = "API Failure";
                cxiSession.cxiSessionObj.cxiAPIDetails.push(WS07Details);
                cxiSession.cxiSessionObj.apiFlag = "Y";
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_SocalgascomWebLinkProcessFailed);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_220210);
                promptOut = process.promptSession.scg_ccc_prmt_2202_main_02_Issue;
                if ((appSession.nextStateName == process.const.NS_Move_PhNumConfirmMenu || appSession.nextStateName == process.const.NS_Move_DifferentPhoneNumberConfirmation) && appSession.appSessionObj.businessHours == "open") {
                    promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                    logger.info("NO SMS");
                    appSession.nextStateName = process.const.NS_StopServiceMoveSms;
                    appSession.nextIntent = process.const.MS414;
                    //  cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, "Socalgas.com WebLink Process Failed");
                    appSession.appSessionObj.movingSMSSw = process.const.STR_False;
                    appSession.fallBackState = process.const.STR_True;
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
                //callPath.dbFail("true",appSession);
                appSession.appSessionObj.dbFail = process.const.STR_True;
                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );
            }
            logger.info("move DD statusCode != 200 false");
            WS07Details.statusCode = MS_WS07_ResObj.statusCode; //cxi
            WS07Details.apiStateResult = "Success";
            WS07Details.errorMessage = " ";
            cxiSession.cxiSessionObj.cxiAPIDetails.push(WS07Details);
            cxiSession.cxiSessionObj.apiFlag = "Y";

            let sendSMSInfoRes = (MS_WS07_ResObj.body);

            let APIResult = sendSMSInfoRes.Envelope.Body.getCustomerContactTextResponse.CustomerContactTextResponseMessage.MessagePayload.Event.result;
            if (APIResult.toUpperCase() != "SUCCESS") {
                logger.info("move service DD API failure");
                // cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, "Process failure – Could not send Close Order confirmation number via SMS.");
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, "Socalgas.com WebLink Process Failed");
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_220210);
                promptOut = process.promptSession.scg_ccc_prmt_2202_main_02_Issue;
                if ((appSession.nextStateName == process.const.NS_Move_PhNumConfirmMenu || appSession.nextStateName == process.const.NS_Move_DifferentPhoneNumberConfirmation) && appSession.appSessionObj.businessHours == "open") {
                    promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                    logger.info("NO SMS");
                    appSession.nextStateName = process.const.NS_StopServiceMoveSms;
                    appSession.nextIntent = process.const.MS414;
                    appSession.appSessionObj.movingSMSSw = process.const.STR_False;
                    appSession.fallBackState = process.const.STR_True;
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
                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );
            }
            //logger.info("move service DD API Success");
            sendSMSInfoRes = sendSMSInfoRes["Envelope"]["Body"]["getCustomerContactTextResponse"]["CustomerContactTextResponseMessage"]["MessagePayload"];
            //logger.debug(sendSMSInfoRes);
            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MoveServiceDDWeblinkSent);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_220205);
            appSession.selfService = process.const.STR_Y;
            appSession.nextIntent = process.const.MS200;
            callPath.SelfServiceDescription(process.const.CP_MoveServiceDDWeblinkSent, appSession);
            promptOut = process.promptSession.scg_ccc_prmt_2202_main_01_WebLinkConfirm;
            appSession.nextStateName = process.const.NS_AnythingElse;
            appSession.fallBackState = process.const.STR_True;
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


        else if (appSession.nextStateName == process.const.NS_SendSMSDiffSamePhNo) {
            logger.info("stop service DD offerring place in MS402");
            appSession.appSessionObj.confirmDate = appSession.appSessionObj.stopServiceConfirmation == process.const.STR_True ? appSession.appSessionObj.closeDate : appSession.appSessionObj.stopDate;
            let dateFormatted = getDateFormat.formattedDate(appSession.appSessionObj.confirmDate);
            appSession.appSessionObj.confirmNum = appSession.appSessionObj.stopServiceConfirmation == process.const.STR_True ? appSession.appSessionObj.confirmationNumber : appSession.appSessionObj.cancelMoveConfNumber;
            appSession.appSessionObj.propertyVal = appSession.appSessionObj.stopServiceConfirmation == process.const.STR_True ? process.const.WS_StopServiceDate_PropertyValue : process.const.WS_StopServiceCancelDate_PropertyValue;
            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_SendSmsSameNumber);

            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233690);
            let accountNumber = appSession.appSessionObj.contractAccount;

            let confMessage;

            if (appSession.appSessionObj.stopServiceConfirmation == process.const.STR_True) {

            // Stop Service → Include date
             confMessage = process.const.WS_StopServiceDate_PropertyValue + " " + dateFormatted + " " + process.const.WS_ConfirmationNumber_PropertyValue + " " + appSession.appSessionObj.confirmNum;
            } else {

            // Cancel Service → Remove date
             confMessage = process.const.WS_StopServiceCancelDate_PropertyValue + " " + process.const.WS_ConfirmationNumber_PropertyValue + " " + appSession.appSessionObj.confirmNum;
            }

            const sendSmsObj = [{
                phoneNumber: appSession.appSessionObj.ANI,
                templateId: process.const.WS_SCG_CustomerContactServiceSMSConfNum_templateId, //058
                needTracking: process.const.WS_SCG_CustomerContactServiceSMS_needTracking,  //false
                billAccountNumber: accountNumber
            },
            { propertyKey: "ConfNum_Info", propertyValue: confMessage },
            { propertyKey: "SOURCE_SYSTEM", propertyValue: "IVR" },
            ];
            let MS_WS07_ReqObj = await apiHelper.getSOAPRequestObject("MS_WS07", sendSmsObj, intentRequest, intentName, callback);
            //logger.debug(MS_WS07_ReqObj);
            let MS_WS07_ResObj = await apiHelper.getSOAPResponseObject(MS_WS07_ReqObj, intentRequest, intentName, callback);


            //-------------CXI_apidetails-----------------------------------//
            let WS07Details = {}; //cxi
            cxiSession.cxiSessionObj.apiFlag = "Y"; //cxi
            cxiSession.cxiSessionObj.promptType = "api lookup"; //cxi
            WS07Details.apiId = "MS_WS07"; //cxi
            WS07Details.apiname = "sendOnDemandText"; //cxi


            if ((MS_WS07_ResObj == null || MS_WS07_ResObj == undefined || MS_WS07_ResObj.statusCode != 200)) {


                //---------CXI--------------------------------------------//
                WS07Details.statusCode = MS_WS07_ResObj == null || MS_WS07_ResObj == undefined ? "500" : MS_WS07_ResObj.statusCode; //cxi
                WS07Details.apiStateResult = "Failure";
                WS07Details.errorMessage = "API Failure";
                cxiSession.cxiSessionObj.cxiAPIDetails.push(WS07Details);
                //------------------------------------------------------------//
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, "Process failure – Could not send Close Order confirmation number via SMS.");
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_SmsConfirmationNumberFail);
                promptOut = process.promptSession.scg_ccc_prmt_2336_main_12_TextIssue;
                appSession.appSessionObj.dbFail = process.const.STR_True;
                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );
            }
            WS07Details.statusCode = MS_WS07_ResObj.statusCode; //cxi
            //logger.log("MS_WS07_ResObj ", JSON.stringify(MS_WS07_ResObj.body));
            let sendSMSInfoRes = (MS_WS07_ResObj.body);
            //logger.debug(sendSMSInfoRes);
            sendSMSInfoRes = sendSMSInfoRes["Envelope"]["Body"]["getCustomerContactTextResponse"]["CustomerContactTextResponseMessage"]["MessagePayload"];
            cxiSession.cxiSessionObj.promptType = "prompt"; //cxi
            if ((sendSMSInfoRes["Event"]["result"] != "SUCCESS")) {
                //---------CXI--------------------------------------------//
                WS07Details.apiStateResult = "SUCCESS";

                WS07Details.errorMessage = " ";
                cxiSession.cxiSessionObj.cxiAPIDetails.push(WS07Details);
                //------------------------------------------------------------//
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, "Process failure – Could not send Close Order confirmation number via SMS.");
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_SmsConfirmationNumberFail);
                promptOut = process.promptSession.scg_ccc_prmt_2336_main_12_TextIssue;
                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );

            }
            //sendSMSInfoRes = sendSMSInfoRes["Envelope"]["Body"]["getCustomerContactTextResponse"]["CustomerContactTextResponseMessage"]["MessagePayload"];
            //---------CXI--------------------------------------------//
            WS07Details.apiStateResult = "Success";
            WS07Details.errorMessage = " ";
            cxiSession.cxiSessionObj.cxiAPIDetails.push(WS07Details);
            //------------------------------------------------------------//
            //logger.log("converting xml to json", JSON.stringify(sendSMSInfoRes, null, 2));
            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_SmsConfirmationNumberSent);
            appSession.nextIntent = process.const.MS210;
            appSession.nextStateName = process.const.NS_AnythingElse;
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
    SameNumber
};
