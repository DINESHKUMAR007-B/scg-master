const logger = require("../../../../Helpers/Utilities/logger");
const sessionHelper = require("../../../../Helpers/Common/sessionHelper");
const util = require("../../../../Helpers/Utilities/getLexResponse");
const catchHelper = require("../../../../Helpers/Common/catchHelper");
const ssmlMessage = require("../../../../Helpers/Common/ssmlHelper");
const apiHelper = require("../../../../Helpers/Common/apiHelper");
const xmlTojson = require("../../../../Helpers/Common/soapApiReq");
const agentHelper = require("../../../../Helpers/Common/agentHelper");
const callPath = require("../../../../Helpers/Common/callPathHelper");
const now = new Date();
let currentDate = now.toISOString;


const CustomerType = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let activeContexts = [];
    let businessPartnerGetDetails = {};
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + process.const.STR_Underscore + process.const.SN_CutomerType;
        //------------PUT CXI Keys----------------------------
        cxiSession.exitPoint = appSession.stateName;
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.cxiSessionObj.cxiAPIDetails = [];
        //-----------------------------------------------------
        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderPhoneNumber);
        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231305);
        // if (appSession.appSessionObj.authMethod == "ANI"){
        //     appSession.appSessionObj.businessPartner = appSession.appSessionObj.businessPartner;
        // }
        const businessPartner_Get = {};
        businessPartner_Get.relatedBusinessPartner = !appSession.appSessionObj.businessPartner || appSession.appSessionObj.businessPartner === "undefined"
          ? "" : appSession.appSessionObj.businessPartner;
  
        let businessPartnerGetReq = await apiHelper.getRequestObject(process.const.I_DG_02_001_Get, businessPartner_Get, intentRequest, intentName, callback);
        //logger.debug(businessPartnerGetReq);
        let businessPartnerGetResp = await apiHelper.getResponseObject(businessPartnerGetReq, intentRequest, intentName, callback);
        //logger.debug(businessPartnerGetResp);
        cxiSession.cxiSessionObj.apiFlag = "Y";//cxi
        cxiSession.cxiSessionObj.promptType = "api lookup";//cxi
        businessPartnerGetDetails.apiId = process.const.I_DG_02_001_Get;//cxi
        businessPartnerGetDetails.apiname = process.const.I_DG_02_001_Get_name;//cxi
        if (businessPartnerGetResp == null || businessPartnerGetResp == undefined || businessPartnerGetResp.status != 201 || businessPartnerGetResp.status != "201") {
            //------------PUT CXI Keys----------------------------
            businessPartnerGetDetails.statusCode = businessPartnerGetResp == null || businessPartnerGetResp == undefined ? "500" : businessPartnerGetResp.status;
            businessPartnerGetDetails.apiStateResult = "Failure";
            businessPartnerGetDetails.errorMessage = "API Failure";
            cxiSession.cxiSessionObj.cxiAPIDetails.push(businessPartnerGetDetails);
            //-----------------------------------------------------
            cxiSession.cxiSessionObj.exitReason = callPath.ExitReason(cxiSession.cxiSessionObj.exitReason, process.const.ER_ProcessFailureCustomerData);
            appSession.appSessionObj.dbFail = process.const.STR_True;
            return agentHelper.AgentTransfer(
                intentRequest,
                intentName,
                promptOut,
                callback
            );
        }
        else {
            businessPartnerResp = businessPartnerGetResp.data;
            //logger.debug(businessPartnerResp);
            let returCode = businessPartnerResp?.ZGMessage?.results[0]?.Type;
            //console.log("businessPartnerReturnCode", returCode);
            //logger.info("businessPartnerReturnCode :" + returCode);
            if (returCode == "E" || returCode == "e" || !returCode) {
                //------------PUT CXI Keys----------------------------
                businessPartnerGetDetails.statusCode = businessPartnerGetResp.statusCode;
                businessPartnerGetDetails.apiStateResult = "Success";
                businessPartnerGetDetails.errorMessage = businessPartnerResp?.ZGMessage?.results[0]?.Message;
                cxiSession.cxiSessionObj.cxiAPIDetails.push(businessPartnerGetDetails);
                //-----------------------------------------------------
                cxiSession.cxiSessionObj.exitReason = callPath.ExitReason(cxiSession.cxiSessionObj.exitReason, process.const.ER_ProcessFailureCustomerData);
                appSession.appSessionObj.dbFail = process.const.STR_True;
                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );
            }
            else {
                if (returCode == "S" || returCode == "s") {
                    //------------PUT CXI Keys----------------------------
                    businessPartnerGetDetails.statusCode = businessPartnerGetResp.statusCode;
                    businessPartnerGetDetails.apiStateResult = "Success";
                    businessPartnerGetDetails.errorMessage = businessPartnerResp?.ZGMessage?.results[0]?.Message;
                    cxiSession.cxiSessionObj.cxiAPIDetails.push(businessPartnerGetDetails);
                    //-----------------------------------------------------
                   // console.log("ReturnCode: S PhoneType");
                    appSession.appSessionObj.phncnt = 0;
                    const primaryPhones = businessPartnerResp?.ZGPhoneNumber?.results.filter(phone => phone.IsPrimaryPhone === true);
                    logger.info(primaryPhones);
                    const primaryPhonesObj = primaryPhones?.[0];                     
                    appSession.appSessionObj.addressNumber = primaryPhonesObj?.AddressNumber == undefined || primaryPhonesObj?.AddressNumber == "undefined" ? "" : primaryPhonesObj?.AddressNumber;
                    appSession.appSessionObj.sequenceNumber = primaryPhonesObj?.SequenceNumber  == undefined || primaryPhonesObj?.SequenceNumber == "undefined" ? "" : primaryPhonesObj?.SequenceNumber;
                    appSession.appSessionObj.businessPartnerPhoneNumber = primaryPhonesObj?.PhoneNumber == undefined || primaryPhonesObj?.PhoneNumber == "undefined" ? "" : primaryPhonesObj?.PhoneNumber;
                    appSession.appSessionObj.phoneNumberExtension = primaryPhonesObj?.PhoneNumberExtension == undefined || primaryPhonesObj?.PhoneNumberExtension == "undefined" ? "" : primaryPhonesObj?.PhoneNumberExtension;
                    appSession.appSessionObj.phoneType = primaryPhonesObj?.PhoneType == undefined || primaryPhonesObj?.PhoneType == "undefined" ? "M" : primaryPhonesObj?.PhoneType ;
                    appSession.appSessionObj.isPrimaryPhone = primaryPhonesObj?.IsPrimaryPhone  == undefined || primaryPhonesObj?.IsPrimaryPhone == "undefined" ? false : primaryPhonesObj?.IsPrimaryPhone;
                    appSession.appSessionObj.businessPartnerType = businessPartnerResp?.BusinessPartnerType;

                    if (appSession.appSessionObj.businessPartnerType == "2" || appSession.appSessionObj.businessPartnerType == 2) {
                        logger.info("Type == 2 true");
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_BusinessCustomer);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231310);
                        if (appSession.appSessionObj.businessWPhoneVerified == process.const.STR_True) {
                            if (appSession.callerGoal == process.const.CG_CloseOrderNeedMA) {
                                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_BusinessPhoneConfirmed);
                                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231315);
                                appSession.callerGoal = process.const.CG_CloseOrderNeedMA;
                                appSession.nextIntent = process.const.MS417;
                            }
                            else {
                                appSession.callerGoal = process.const.CG_MovingNeedMa;
                                appSession.nextIntent = process.const.MS300;
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
                        else if (appSession.appSessionObj.telePhone == "" || appSession.appSessionObj.telePhone == null || appSession.appSessionObj.telePhone == undefined) {
                            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_NoBusinessPhone);
                            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231405);
                            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
                            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_RemovePhoneNumber);
                            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PhoneNumber);
                            let CellPhoneNumberSlot = process.const.STR_PhoneNumber;
                            appSession.nextIntent = process.const.MS404;
                            appSession.appSessionObj[CellPhoneNumberSlot + "Retry"] = appSession.appSessionObj[CellPhoneNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[CellPhoneNumberSlot + "Retry"];

                            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231500);
                            promptOut = process.promptSession.scg_ccc_prmt_2314_main_06_RecordPhNotAcct + process.promptSession.scg_ccc_collect_2315_main_01_PhnumAcctInput;
                            cxiSession.cxiSessionObj.promptid = "scg_ccc_collect_2315_main_01_PhnumAcctInput";
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
                                    CellPhoneNumberSlot
                                )
                            );
                            return;
                        }
                        else {
                            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_PhoneWorkNumberPresent);
                            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231410);
                            appSession.nextIntent = process.const.MS210;
                            appSession.nextStateName = process.const.NS_BusinessCustomerCellPhone_Confirmation;
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
                        cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_ResidentialCustomer);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231320);
                        if (appSession.appSessionObj.phoneCellVerifSw == process.const.STR_Y && appSession.appSessionObj.cellPhoneVerified == process.const.STR_True) {
                            if (appSession.callerGoal == process.const.CG_CloseOrderNeedMA) {
                                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderPhoneNumberVerified);
                                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231315);
                                appSession.callerGoal = process.const.CG_CloseOrderNeedMA;
                                appSession.nextIntent = process.const.MS417;
                            }
                            else {
                                appSession.callerGoal = process.const.CG_MovingNeedMa;
                                appSession.nextIntent = process.const.MS300;
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
                        else if (appSession.appSessionObj.cellPhone == "" || appSession.appSessionObj.cellPhone == null || appSession.appSessionObj.cellPhone == undefined) {
                            cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_CellPhoneNotPresent);
                            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231710);
                            let CellPhoneNumberSlot = process.const.STR_PhoneNumber;
                            appSession.nextIntent = process.const.MS404;
                            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
                            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PhoneNumber);
                            appSession.appSessionObj[CellPhoneNumberSlot + "Retry"] = appSession.appSessionObj[CellPhoneNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[CellPhoneNumberSlot + "Retry"];

                            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231800);
                            appSession.nextStateName = process.const.NS_Initial_CellPhoneNumber; // 
                            promptOut = process.promptSession.scg_ccc_prmt_2317_main_05_NotCellNumRecords + process.promptSession.scg_ccc_collect_2318_main_01_PhNum;
                            promptOut = ssmlMessage.ConvertSSML(promptOut);
                            callback(
                                util.DialogAction(
                                    process.const.DA_SwitchToIntentSlot,
                                    intentRequest,
                                    appSession.nextIntent,
                                    util.BuildSSMLMessage(promptOut),
                                    process.const.STR_InProgress,
                                    activeContexts,
                                    CellPhoneNumberSlot
                                )
                            );
                            return;
                        }
                        else {
                            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CellPhonePresent);
                            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231705);
                            appSession.nextIntent = process.const.MS210;
                            appSession.nextStateName = process.const.NS_CustomerCellPhone_Confirmation;
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
                }
            }
        }
    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};
module.exports = {
    CustomerType
};
