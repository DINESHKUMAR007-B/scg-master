const util = require("../../Helpers/Utilities/getLexResponse");
const logger = require("../../Helpers/Utilities/logger");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const catchHelper = require("../../Helpers/Common/catchHelper");
const agentHelper = require("../../Helpers/Common/agentHelper");
const apiHelper = require("../../Helpers/Common/apiHelper");
const xmlTojson = require("../../Helpers/Common/soapApiReq");
const ssmlMessage = require("../../Helpers/Common/ssmlHelper");
const callPath = require("../../Helpers/Common/callPathHelper");

const AuthVerficationToSAP = async function (req, intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered  AuthVerficationToSAP Helper");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    cxiSession.cxiSessionObj.cxiAPIDetails = [];
    let promptOut = " ";
    let WS01Details = {};
    let WS02Details = {};
    let activeContexts = [];
    try {
        const getBusinessPartnerObj = {};
        getBusinessPartnerObj.action = process.const.WS_getBusinessPartnerObjAction;
        getBusinessPartnerObj.requestedBy = appSession.appSessionObj.ANI;
        getBusinessPartnerObj.requestedTimeStamp = appSession.appSessionObj.currentDate;
        getBusinessPartnerObj.relatedBusinessPartner = appSession.appSessionObj.businessPartner;
        let I_DG_02_001_ReqObj = await apiHelper.getRequestObject("I_DG_02_001", getBusinessPartnerObj, intentRequest, intentName, callback);
        //logger.debug(I_DG_02_001_ReqObj);
        let I_DG_02_001_ResObj = await apiHelper.getResponseObject(I_DG_02_001_ReqObj, intentRequest, intentName, callback);
        //logger.debug(I_DG_02_001_ResObj);
        cxiSession.cxiSessionObj.apiFlag = "Y";
        cxiSession.cxiSessionObj.promptType = "api lookup";
        WS01Details.apiId = "I_DG_02_001";
        WS01Details.apiname = "Contract Account Get";
        if (I_DG_02_001_ResObj == null || I_DG_02_001_ResObj == undefined || I_DG_02_001_ResObj.status != 201 || I_DG_02_001_ResObj.status != "201") {
            //---------PUT CXI Keys-------------------------------------------
            WS01Details.statusCode = I_DG_02_001_ResObj == null || I_DG_02_001_ResObj == undefined ? "500" : I_DG_02_001_ResObj.status;
            WS01Details.apiStateResult = "Failure";
            WS01Details.errorMessage = "API Failure";
            cxiSession.cxiSessionObj.cxiAPIDetails.push(WS01Details);
            //------------------------------------------------------------
            if (appSession.callerGoal == process.const.CG_CellNumberCollection) {
                appSession.appSessionObj.isReturned = process.const.STR_True;
                promptOut = process.promptSession.scg_ccc_prmt_1015_init_01_AuthVerToSAPCellPhnNotUpdate;
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
            else if (appSession.callerGoal == process.const.CG_TailorTreatmentPrediction) {
                appSession.appSessionObj.upFrontAuthentication = "Failure";
                appSession.appSessionObj.phoneNumberCount = 0;
                appSession.appSessionObj.streetNumberCount = 0;
                appSession.appSessionObj.accountNumberCount = 0;
                appSession.appSessionObj.newCustomer = process.const.STR_True;
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
            else {
                appSession.appSessionObj.dbFail = process.const.STR_True;
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ProcessFailureCustomerData);
                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );
            }

        } else {
            let businessPartnerInfo = I_DG_02_001_ResObj.data;
            //logger.debug(businessPartnerInfo);
            appSession.appSessionObj.businessPartnerInfoReturnType = businessPartnerInfo?.ZGMessage?.results?.[0]?.Type;
            if (!appSession.appSessionObj.businessPartnerInfoReturnType || appSession.appSessionObj.businessPartnerInfoReturnType == "E") {
                //---------PUT CXI Keys-------------------------------------------
                WS01Details.statusCode = I_DG_02_001_ResObj.status;
                WS01Details.apiStateResult = "Success";
                WS01Details.errorMessage = "";
                cxiSession.cxiSessionObj.cxiAPIDetails.push(WS01Details);
                //-----------------------------------------------------
                if (appSession.callerGoal == process.const.CG_CellNumberCollection) {
                    appSession.appSessionObj.isReturned = process.const.STR_True;
                    promptOut = process.promptSession.scg_ccc_prmt_1015_init_01_AuthVerToSAPCellPhnNotUpdate;
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
                else if (appSession.callerGoal == process.const.CG_TailorTreatmentPrediction) {
                    appSession.appSessionObj.upFrontAuthentication = "Failure";
                    appSession.appSessionObj.phoneNumberCount = 0;
                    appSession.appSessionObj.streetNumberCount = 0;
                    appSession.appSessionObj.accountNumberCount = 0;
                    appSession.appSessionObj.newCustomer = process.const.STR_True;
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
                else {
                    appSession.appSessionObj.dbFail = process.const.STR_True;
                    cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ProcessFailureCustomerData);
                    return agentHelper.AgentTransfer(
                        intentRequest,
                        intentName,
                        promptOut,
                        callback
                    );
                }

            }
            if (appSession.appSessionObj.businessPartnerInfoReturnType == "S") {
                //---------PUT CXI Keys-------------------------------------------
                WS01Details.statusCode = I_DG_02_001_ResObj.status;
                WS01Details.apiStateResult = "Success";
                WS01Details.errorMessage = "";
                cxiSession.cxiSessionObj.cxiAPIDetails.push(WS01Details);
                //cxiSession.cxiSessionObj.promptType = "prompt";
                //-----------------------------------------------------
                const primaryPhones = businessPartnerInfo?.ZGPhoneNumber?.results.filter(
                    phone => phone.IsPrimaryPhone === true
                  );
                logger.info(primaryPhones);
                const primaryPhonesObj = primaryPhones?.[0];
                appSession.appSessionObj.addressNumber = primaryPhonesObj?.AddressNumber == undefined || primaryPhonesObj?.AddressNumber == "undefined" ? "" : primaryPhonesObj?.AddressNumber;
                appSession.appSessionObj.sequenceNumber = primaryPhonesObj?.SequenceNumber  == undefined || primaryPhonesObj?.SequenceNumber == "undefined" ? "" : primaryPhonesObj?.SequenceNumber;
                appSession.appSessionObj.phoneNumber = primaryPhonesObj?.PhoneNumber == undefined || primaryPhonesObj?.PhoneNumber == "undefined" ? "" : primaryPhonesObj?.PhoneNumber;
                appSession.appSessionObj.phoneType = primaryPhonesObj?.PhoneType == undefined || primaryPhonesObj?.PhoneType == "undefined" ? "M" : primaryPhonesObj?.PhoneType ;
                appSession.appSessionObj.phoneNumberExtension = primaryPhonesObj?.PhoneNumberExtension == undefined || primaryPhonesObj?.PhoneNumberExtension == "undefined" ? "" : primaryPhonesObj?.PhoneNumberExtension;
                appSession.appSessionObj.isPrimaryPhone = primaryPhonesObj?.IsPrimaryPhone  == undefined || primaryPhonesObj?.IsPrimaryPhone == "undefined" ? false : primaryPhonesObj?.IsPrimaryPhone;
               // appSession.appSessionObj.isMyAccountEmail = primaryPhonesObj?.IsMyAccountEmail  == undefined || primaryPhonesObj?.IsMyAccountEmail == "undefined" ? false : primaryPhonesObj?.IsMyAccountEmail;
                //appSession.appSessionObj.isPrimaryEmail = primaryPhonesObj?.IsPrimaryEmail  == undefined || primaryPhonesObj?.IsPrimaryEmail == "undefined" ? false : primaryPhonesObj?.IsPrimaryEmail;
                //ppSession.appSessionObj.businessPartner = businessPartnerInfo?.BusinessPartner;

                appSession.appSessionObj.phoneCellVerifSw = 'Y';
            const updateBusinessPartnerObj = {};
            updateBusinessPartnerObj.action = process.const.WS_updateBusinessPartnerObjAction;
            updateBusinessPartnerObj.requestedBy = appSession.appSessionObj.ANI;
            updateBusinessPartnerObj.relatedBusinessPartner = appSession.appSessionObj.businessPartner == undefined || appSession.appSessionObj.businessPartner == "undefined" ? req : appSession.appSessionObj.businessPartner;
            updateBusinessPartnerObj.zGUpdContactInfoContactType = "PHONE";
            updateBusinessPartnerObj.zGUpdContactInfoOperation = "ADD";//appSession.appSessionObj.UpdContactInfoOperation;
            updateBusinessPartnerObj.zGUpdContactInfoPhoneNumberExtension = appSession.appSessionObj.phoneNumberExtension;
            //updateBusinessPartnerObj.isMyAccountEmail = appSession.appSessionObj.isMyAccountEmail;
            updateBusinessPartnerObj.zGUpdContactInfoContact = appSession.appSessionObj.phoneNumber == undefined || appSession.appSessionObj.phoneNumber == "undefined" ? " " : appSession.appSessionObj.phoneNumber;
            updateBusinessPartnerObj.zGUpdContactInfoPhoneType = appSession.appSessionObj.phoneType == undefined || appSession.appSessionObj.phoneType == "undefined" ? " " : appSession.appSessionObj.phoneType;
            updateBusinessPartnerObj.zGUpdContactInfoIsPrimaryPhone = appSession.appSessionObj.isPrimaryPhone == undefined || appSession.appSessionObj.isPrimaryPhone == "undefined" ? false : primaryPhonesObj?.IsPrimaryPhone;
            updateBusinessPartnerObj.zGUpdContactInfoAddressNumber = appSession.appSessionObj.addressNumber == undefined || appSession.appSessionObj.addressNumber == "undefined" ? "" :appSession.appSessionObj.addressNumber;
            updateBusinessPartnerObj.zGUpdContactInfoSequenceNumber = appSession.appSessionObj.sequenceNumber == undefined || appSession.appSessionObj.sequenceNumber == "undefined" ? "" : appSession.appSessionObj.sequenceNumber ;

                let I_DG_02_001_Update_ReqObj = await apiHelper.getRequestObject("I_DG_02_001_Update", updateBusinessPartnerObj, intentRequest, intentName, callback);
                //logger.debug(I_DG_02_001_Update_ReqObj);
                let I_DG_02_001_Update_ResObj = await apiHelper.getResponseObject(I_DG_02_001_Update_ReqObj, intentRequest, intentName, callback);
                //logger.debug(I_DG_02_001_Update_ResObj);
                cxiSession.cxiSessionObj.apiFlag = "Y";
                cxiSession.cxiSessionObj.promptType = "api lookup";
                WS02Details.apiId = "I_DG_02_001_Update";
                WS02Details.apiname = "Contract Account Update";
                if (I_DG_02_001_Update_ResObj == null || I_DG_02_001_Update_ResObj == undefined || I_DG_02_001_Update_ResObj.status != 201 || I_DG_02_001_Update_ResObj.status != "201") {
                    //---------PUT CXI Keys-------------------------------------------
                    WS02Details.statusCode = I_DG_02_001_Update_ResObj == null || I_DG_02_001_Update_ResObj == undefined ? "500" : I_DG_02_001_Update_ResObj.status;
                    WS02Details.apiStateResult = "Failure";
                    WS02Details.errorMessage = "API Failure";
                    cxiSession.cxiSessionObj.cxiAPIDetails.push(WS02Details);
                    //------------------------------------------------------------
                    cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ProcessFailureCellPhoneVerificationToSAP);
                    if (appSession.callerGoal == process.const.CG_CellNumberCollection) {
                        appSession.appSessionObj.isReturned = process.const.STR_True;
                        promptOut = process.promptSession.scg_ccc_prmt_1015_init_01_AuthVerToSAPCellPhnNotUpdate;
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
                    else if (appSession.callerGoal == process.const.CG_TailorTreatmentPrediction) {
                        appSession.appSessionObj.upFrontAuthentication = "Failure";
                        appSession.appSessionObj.phoneNumberCount = 0;
                        appSession.appSessionObj.streetNumberCount = 0;
                        appSession.appSessionObj.accountNumberCount = 0;
                        appSession.appSessionObj.newCustomer = process.const.STR_True;
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
                    else {
                        appSession.appSessionObj.dbFail = process.const.STR_True;
                        return agentHelper.AgentTransfer(
                            intentRequest,
                            intentName,
                            promptOut,
                            callback
                        );
                    }

                }
                let updateBusinessPartner = I_DG_02_001_Update_ResObj.data;
                //logger.debug(updateBusinessPartner);
                appSession.appSessionObj.updateBusinessPartnerReturnType = updateBusinessPartner?.ZGMessage?.results?.[0]?.Type;
                if (!appSession.appSessionObj.updateBusinessPartnerReturnType || appSession.appSessionObj.updateBusinessPartnerReturnType == "E") {
                    //---------PUT CXI Keys-------------------------------------------
                    WS02Details.statusCode = I_DG_02_001_Update_ResObj.status;
                    WS02Details.apiStateResult = "Success";
                    WS02Details.errorMessage = "";
                    cxiSession.cxiSessionObj.cxiAPIDetails.push(WS02Details);
                    //-----------------------------------------------------
                    cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ProcessFailureCellPhoneVerificationToSAP);
                    if (appSession.callerGoal == process.const.CG_CellNumberCollection) {
                        appSession.appSessionObj.isReturned = process.const.STR_True;
                        promptOut = process.promptSession.scg_ccc_prmt_1015_init_01_AuthVerToSAPCellPhnNotUpdate;
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
                    else if (appSession.callerGoal == process.const.CG_TailorTreatmentPrediction) {
                        appSession.appSessionObj.upFrontAuthentication = "Failure";
                        appSession.appSessionObj.phoneNumberCount = 0;
                        appSession.appSessionObj.streetNumberCount = 0;
                        appSession.appSessionObj.accountNumberCount = 0;
                        appSession.appSessionObj.newCustomer = process.const.STR_True;
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
                    else {
                        appSession.appSessionObj.dbFail = process.const.STR_True;
                        return agentHelper.AgentTransfer(
                            intentRequest,
                            intentName,
                            promptOut,
                            callback
                        );
                    }

                }
                if (appSession.appSessionObj.updateBusinessPartnerReturnType == "S") {
                    //---------PUT CXI Keys-------------------------------------------
                    WS02Details.statusCode = I_DG_02_001_Update_ResObj.status;
                    WS02Details.apiStateResult = "Success";
                    WS02Details.errorMessage = "";
                    cxiSession.cxiSessionObj.cxiAPIDetails.push(WS02Details);
                    //cxiSession.cxiSessionObj.promptType = "prompt";
                    //-----------------------------------------------------
                    appSession.appSessionObj.cellPhoneVerified = process.const.STR_True;
                    appSession.appSessionObj.screenPopCellPhoneVerified = process.const.STR_T;
                    if (appSession.callerGoal == process.const.CG_CellNumberCollection) {
                        appSession.appSessionObj.isReturned = process.const.STR_True;
                        appSession.appSessionObj.authenticated = process.const.STR_True;
                        appSession.appSessionObj.authMethod = process.const.STR_ANI;
                        appSession.appSessionObj.aniIdentified = process.const.STR_True;
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_ConfirmCellPhoneVerification);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_101505);
                        promptOut = process.promptSession.scg_ccc_prmt_1015_init_02_AuthVerToSAPPhoneConfirmation;
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
                    else {
                        if (appSession.appSessionObj.callingMode == "ANI_AddressConfirmation") {
                            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CallingModeANI_AddressConfirmation);
                            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_101510);
                            appSession.nextIntent = process.const.AU104;
                        }
                        else if (appSession.appSessionObj.callingMode == "AccountNumber") {
                            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CallingModeAccountNumber);
                            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_101515);
                            appSession.nextIntent = process.const.AU104;
                        }
                        else if (appSession.appSessionObj.callingMode == "StreetNumber") {
                            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CallingModeStreetNumber);
                            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_101520);
                            appSession.nextIntent = process.const.AU104;
                        }
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
            }
        }
    } catch (error) {
        //console.error("error in single address "+ error);
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};

const FoundStreetAccNumber = function (response, appSession) {
    logger.info("Enter Found StreetAccNumber Helper");
    let streetNumbersWithAccounts = [];
    let length = response.ZGGetAccInfoAddr.results.length;
    //console.log("Address Found ",length);
    
    let valid;
    if (length === 0) {
        logger.info("No Address Found");
        return valid;
    }
    else {
        /*for (var i = 0; i < length; i++) {
            if (response.ZGGetAccInfoAddr.results[i].hasOwnProperty("HouseNumber")) {
                streetNumbersWithAccounts.push(response.ZGGetAccInfoAddr.results[i]["HouseNumber"] + "&" + response.ZGGetAccInfoAddr.results[i]["ContractAccount"]);
            }
        }*/
        for (var i = 0; i < length; i++) {
            if (response.ZGGetAccInfoAddr.results[i].hasOwnProperty("HouseNumber")) {

                let houseNumber = response.ZGGetAccInfoAddr.results[i]["HouseNumber"];
                if (!houseNumber || houseNumber.trim() === "") {
                    houseNumber = "0000";
                }
                streetNumbersWithAccounts.push(
                    houseNumber + "&" + response.ZGGetAccInfoAddr.results[i]["ContractAccount"] + "&" + response.ZGGetAccInfoAddr.results[i]["AccountStatus"] + "&" +response.ZGGetAccInfoAddr.results[i]["BusinessPartner"]
                );
            }
        }

    }
    console.log(JSON.stringify(streetNumbersWithAccounts));
    return streetNumbersWithAccounts;
};
const ValidateStreetNumber = async function (intentRequest,intentName, callback) {
    logger.info("Enter Validate Street Number Helper");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let streetNumberArr = [];
    let activeContexts = [];
    let valid = false;
    let accountNumberFound;
    let accountStatusFound;
    let businessPartnerFound;
    let streetAccountObj = {};
    let seen = false;
    let isDuplicate = false;
    const customerDetailsObj = {};
    let WS03Details = {};
    try{
            customerDetailsObj.action = process.const.WS_customerDetailsObjAction;
            customerDetailsObj.phoneNumber = appSession.appSessionObj.getPhoneNumber;
            customerDetailsObj.checkDigit = "";
            let I_DG_06_006_ReqObj = await apiHelper.getRequestObject("I_DG_06_006", customerDetailsObj, intentRequest, intentName, callback);
            //logger.debug(I_DG_06_006_ReqObj);
            let I_DG_06_006_ResObj = await apiHelper.getResponseObject(I_DG_06_006_ReqObj, intentRequest, intentName, callback);
            //logger.debug(I_DG_06_006_ResObj);
            cxiSession.cxiSessionObj.apiFlag = "Y";
            cxiSession.cxiSessionObj.promptType = "api lookup";
            WS03Details.apiId = "I_DG_06_006";
            WS03Details.apiname = "Get Account Info";
            if (I_DG_06_006_ResObj == null || I_DG_06_006_ResObj == undefined || I_DG_06_006_ResObj.status != 201 || I_DG_06_006_ResObj.status != "201") {
                //---------PUT CXI Keys-------------------------------------------
                WS03Details.statusCode = I_DG_06_006_ResObj == null || I_DG_06_006_ResObj == undefined ? "500" : I_DG_06_006_ResObj.status;
                WS03Details.apiStateResult = "Failure";
                WS03Details.errorMessage = "API Failure";
                cxiSession.cxiSessionObj.cxiAPIDetails.push(WS03Details);
                //------------------------------------------------------------
                
                        appSession.appSessionObj.couldNotIdentify = process.const.STR_True;
                        appSession.appSessionObj.authenticated = process.const.STR_False;
                        promptOut = process.promptSession.scg_ccc_prmt_7005_auth_05_StreetNumberNotMatch;
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_StreetNumberNoMatch);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700505);
                        if (appSession.appSessionObj.multipleAccounts == process.const.STR_True) {
                            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
                            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MainMenu);
                            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HoldOn);
                            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_AccountNumber);
                            let AccountNumberSlot = process.const.STR_AccountNumber;
                            appSession.appSessionObj.callingMode = "StreetNumber";
                            appSession.nextIntent = process.const.AU103;
                            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AuthWithAccountNumber);
                            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700600);
                            appSession.appSessionObj[AccountNumberSlot + "Retry"] = appSession.appSessionObj[AccountNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[AccountNumberSlot + "Retry"];
                            promptOut += process.promptSession.scg_ccc_prmt_7000_auth_05_CommonTryDiffWay;
                            promptOut += appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                                process.promptSession.scg_ccc_collect_7006_auth_01_AccountNumberMS : process.promptSession.scg_ccc_collect_7006_auth_02_AccountNumber;
                            activeContexts = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_NewCustomer) : activeContexts;
                            cxiSession.cxiSessionObj.promptid = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                                "scg_ccc_collect_7006_auth_01_AccountNumberMS" : "scg_ccc_collect_7006_auth_02_AccountNumber";
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
                        }
                        else {
                            if (appSession.callerGoal == process.const.CG_TailorTreatmentPrediction) {
                                appSession.appSessionObj.upFrontAuthentication = "Failure";
                                appSession.appSessionObj.phoneNumberCount = 0;
                                appSession.appSessionObj.streetNumberCount = 0;
                                appSession.appSessionObj.accountNumberCount = 0;
                                appSession.appSessionObj.newCustomer = process.const.STR_True;
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
                            appSession.appSessionObj.phoneNumberCount = "0";
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
            }
            else {
                let customerDetails = I_DG_06_006_ResObj.data;
                //logger.debug((customerDetails));
                appSession.appSessionObj.returnType = customerDetails?.ZGMessage?.results?.[0]?.Type;
                let customerDetailsReturnId = customerDetails?.ZGMessage?.results?.[0]?.Id;
                appSession.appSessionObj.customerDetailsReturnId = customerDetailsReturnId == undefined ? customerDetailsReturnId : customerDetailsReturnId.trim();
                if (appSession.appSessionObj.returnType == "S" && ((appSession.appSessionObj.customerDetailsReturnId == "10") || (appSession.appSessionObj.customerDetailsReturnId == "010"))) { //|| appSession.appSessionObj.customerDetailsReturnId != "010"
                    //---------PUT CXI Keys-------------------------------------------
                    WS03Details.statusCode = I_DG_06_006_ResObj.status;
                    WS03Details.apiStateResult = "Success";
                    WS03Details.errorMessage = " ";
                    cxiSession.cxiSessionObj.cxiAPIDetails.push(WS03Details);
                    //cxiSession.cxiSessionObj.promptType = "prompt";
                    //-----------------------------------------------------
                    let streetAccountSplit = await FoundStreetAccNumber(customerDetails,appSession);
                    //console.log("streetAccountSplit ",streetAccountSplit);
                    
                    streetAccountSplit = streetAccountSplit.toString();
                    streetAccountSplit = streetAccountSplit.split(",");
                    Object.keys(streetAccountSplit).forEach(function (kvp) {
                        let kvpArr = streetAccountSplit[kvp].split("&");
                        streetAccountObj[kvpArr[0]] = `${kvpArr[1]}&${kvpArr[2]}&${kvpArr[3]}`;
                        streetNumberArr.push(kvpArr[0]);
                    });
                    let removeZero = streetNumberArr.filter(element => element != 0);
                    for (let num of removeZero) {
                        if (num === appSession.appSessionObj.streetNumber) {
                            if (seen) {
                                logger.info("Entered Street Number is Duplicate, Within the List Of Addr");
                                isDuplicate = true;
                                break;
                            }
                            seen = true;
                        }
                    }
                    //console.log(streetAccountObj);
                    
                    valid = streetNumberArr.includes(appSession.appSessionObj.getStreetNumber) == true ? process.const.STR_True : process.const.STR_False;
                    let finalAddrObj = streetAccountObj[appSession.appSessionObj.getStreetNumber];
                    //console.log("finalAddrObj ",finalAddrObj);
                    finalAddrObj = finalAddrObj == undefined ? finalAddrObj : finalAddrObj.split("&");
                    accountNumberFound = finalAddrObj == undefined ? accountNumberFound : finalAddrObj[0];
                    accountStatusFound = finalAddrObj == undefined ? accountStatusFound :finalAddrObj[1];
                    businessPartnerFound = finalAddrObj == undefined ? businessPartnerFound :finalAddrObj[2];
                    return [valid, accountNumberFound, isDuplicate, accountStatusFound, businessPartnerFound];
                }
                appSession.appSessionObj.couldNotIdentify = process.const.STR_True;
                appSession.appSessionObj.authenticated = process.const.STR_False;
                promptOut = process.promptSession.scg_ccc_prmt_7005_auth_05_StreetNumberNotMatch;
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_StreetNumberNoMatch);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700505);
                if (appSession.appSessionObj.multipleAccounts == process.const.STR_True) {
                    activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
                    activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MainMenu);
                    activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HoldOn);
                    activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_AccountNumber);
                    let AccountNumberSlot = process.const.STR_AccountNumber;
                    appSession.appSessionObj.callingMode = "StreetNumber";
                    appSession.nextIntent = process.const.AU103;
                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AuthWithAccountNumber);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700600);
                    appSession.appSessionObj[AccountNumberSlot + "Retry"] = appSession.appSessionObj[AccountNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[AccountNumberSlot + "Retry"];
                    promptOut += process.promptSession.scg_ccc_prmt_7000_auth_05_CommonTryDiffWay;
                    promptOut += appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                        process.promptSession.scg_ccc_collect_7006_auth_01_AccountNumberMS : process.promptSession.scg_ccc_collect_7006_auth_02_AccountNumber;
                    activeContexts = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                        activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_NewCustomer) : activeContexts;
                    cxiSession.cxiSessionObj.promptid = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                        "scg_ccc_collect_7006_auth_01_AccountNumberMS" : "scg_ccc_collect_7006_auth_02_AccountNumber";
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
                }
                else {
                    if (appSession.callerGoal == process.const.CG_TailorTreatmentPrediction) {
                        appSession.appSessionObj.upFrontAuthentication = "Failure";
                        appSession.appSessionObj.phoneNumberCount = 0;
                        appSession.appSessionObj.streetNumberCount = 0;
                        appSession.appSessionObj.accountNumberCount = 0;
                        appSession.appSessionObj.newCustomer = process.const.STR_True;
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
                    appSession.appSessionObj.phoneNumberCount = "0";
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
                }}
    
    
} catch (error) {
    //console.error("error in single address "+ error);
    catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
}  
};
const CellPhoneTimeStampVerification = function (spTimeStamp, appSession) {
    //console.log(appSession.appSessionObj.cellPhone);
    //console.log(spTimeStamp);
    let valid;
    // Convert spTimeStamp → Date (ignore time)
    const [year, month, day] = spTimeStamp.split('-').slice(0, 3);
    const spDate = new Date(year, month - 1, day);

    // Get current date (ignore time)
    const now = new Date();
    const currentDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    // Calculate difference in days
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const diffDays = Math.abs(spDate - currentDate) / MS_PER_DAY;

    // Condition check
    if (diffDays < 365 && appSession.appSessionObj.cellPhone != "") {
        //console.log("Difference is less than 365 days");
        valid = "T";
    } else {
        //console.log("Difference is 365 days or more");
        valid = "F";
    }
    return valid;
}
const OutputData = function (appSession, cxiSession) {
    let data = {};
    data.carePhraseOffered = appSession.appSessionObj.carePhraseOffered == undefined ? process.const.STR_N : appSession.appSessionObj.carePhraseOffered;
    data.safeAccessPhraseOffered = appSession.appSessionObj.safeAccessPhraseOffered == undefined ? process.const.STR_N : appSession.appSessionObj.safeAccessPhraseOffered;
    data.softCloseProvided = appSession.appSessionObj.softCloseProvided == undefined ? process.const.STR_N : appSession.appSessionObj.softCloseProvided;
    data.creditPhraseOffered = appSession.appSessionObj.creditPhraseOffered == undefined ? process.const.STR_N : appSession.appSessionObj.creditPhraseOffered;
    data.ivrDispositionDesc1 = appSession.appSessionObj.ivrDispositionDesc1 == undefined ? "" : appSession.appSessionObj.ivrDispositionDesc1;
    data.ivrDispositionDesc2 = appSession.appSessionObj.ivrDispositionDesc2 == undefined ? "" : appSession.appSessionObj.ivrDispositionDesc2;
    data.ivrDispositionDesc3 = appSession.appSessionObj.ivrDispositionDesc3 == undefined ? "" : appSession.appSessionObj.ivrDispositionDesc3;
    data.recogFail = appSession.appSessionObj.recogFail == undefined ? process.const.STR_False : appSession.appSessionObj.recogFail;
    data.dbFail = appSession.appSessionObj.dbFail == undefined ? process.const.STR_False : appSession.appSessionObj.dbFail;
    data.nextIntent = appSession.nextIntent == undefined ? "" : appSession.nextIntent;
    data.nextBot = appSession.nextBot == undefined ? "" : appSession.nextBot;
    data.transfer = appSession.transfer == undefined ? process.const.STR_False : appSession.transfer;
    data.disconnect = appSession.disconnect == undefined ? process.const.STR_False : appSession.disconnect;
    data.callPath = appSession.transfer == process.const.STR_True || appSession.disconnect == process.const.STR_True ?
        cxiSession.callPath == "CustHangup" ? "" : cxiSession.callPath : cxiSession.callPath;
    data.exitReason = appSession.transfer == process.const.STR_True || appSession.disconnect == process.const.STR_True ?
        cxiSession.exitReason == "CustHangup" ? "" : cxiSession.exitReason : cxiSession.exitReason;
    data.callerGoal = appSession.callerGoal == undefined ? "" : appSession.callerGoal;
    data.externalTransfer = appSession.appSessionObj.externalTransfer == undefined ? process.const.STR_N : appSession.appSessionObj.externalTransfer;
    data.language = appSession.appSessionObj.language == undefined ? "english" : appSession.appSessionObj.language;
    data.moduleSpecialMessageDetails = appSession.appSessionObj.moduleSpecialMessageDetails == undefined ? "" : appSession.appSessionObj.moduleSpecialMessageDetails;
    data.attr_ExitPoint = appSession.stateName == undefined ? "" : appSession.stateName;
    data.attr_SelfServicedIntent = appSession.appSessionObj.attr_SelfServicedIntent == undefined ? "" : appSession.appSessionObj.attr_SelfServicedIntent;
    data.attr_selfServicePath = appSession.appSessionObj.attr_selfServicePath == undefined ? "" : appSession.appSessionObj.attr_selfServicePath;
    data.attr_DigitalDeflection = appSession.appSessionObj.digitalDeflection == undefined ? "N" : appSession.appSessionObj.digitalDeflection;
    data.attr_IVAFlowExitReason = appSession.appSessionObj.attr_IVAFlowExitReason;
    data.attr_SelfService = appSession.selfService == undefined ? "N" : appSession.selfService;
    data.attr_finalSelfServiceDisposition = appSession.appSessionObj.attr_finalSelfServiceDisposition == undefined ? "" : appSession.appSessionObj.attr_finalSelfServiceDisposition;
    data.ivrDescriptionCount = appSession.appSessionObj.ivrDescriptionCount == undefined ? "" : appSession.appSessionObj.ivrDescriptionCount;
    data.pegPath = cxiSession.pegPath == undefined ? "" : cxiSession.pegPath;
    data.attr_finalPegPath = cxiSession.cxiSessionObj.finalPegPath == undefined ? "" : cxiSession.cxiSessionObj.finalPegPath;
    data.attr_finalcallpath = cxiSession.cxiSessionObj.finalCallPath == undefined ? "" : cxiSession.cxiSessionObj.finalCallPath;
    //Attributes For Authentication Bot
    data.isReturned = appSession.appSessionObj.isReturned == undefined ? process.const.STR_False : appSession.appSessionObj.isReturned;
    data.needMoreTime = appSession.appSessionObj.needMoreTime == undefined ? process.const.STR_False : appSession.appSessionObj.needMoreTime;

    //Cond for appSession.appSessionObj.couldNotIdentify set false
    appSession.appSessionObj.couldNotIdentify =
    (appSession.callerGoal == process.const.CG_TailorTreatmentPrediction && appSession.nextIntent == process.const.MA100 &&
        appSession.appSessionObj.dialogActionType == "Close")
        ? process.const.STR_False : appSession.appSessionObj.couldNotIdentify;
    data.cellPhone = appSession.appSessionObj.cellPhone == undefined ? "" : appSession.appSessionObj.cellPhone;
    data.custAddress = appSession.appSessionObj.zgServiceAddress + " " + appSession.appSessionObj.zgServiceCity + " " + appSession.appSessionObj.zgServiceState;
    data.spouseName = appSession.appSessionObj.spouseName == undefined ? "" : appSession.appSessionObj.spouseName;
    data.customerName = appSession.appSessionObj.customerName == undefined ? "" : appSession.appSessionObj.customerName;
    data.screenPopCellPhoneVerified = appSession.appSessionObj.screenPopCellPhoneVerified == undefined ?
            process.const.STR_F : appSession.appSessionObj.screenPopCellPhoneVerified;
    data.authenticated = appSession.appSessionObj.authenticated == undefined ? "" : appSession.appSessionObj.authenticated;
    data.contractAccount = appSession.appSessionObj.contractAccount;
    data.authMethod = appSession.appSessionObj.authMethod == undefined ? "" : appSession.appSessionObj.authMethod;
    data.isAccountOnCare = appSession.appSessionObj.isAccountOnCare == undefined ? "" : appSession.appSessionObj.isAccountOnCare;
    data.medBaselineSw = appSession.appSessionObj.isMedBaselineSw == undefined ? "" : appSession.appSessionObj.isMedBaselineSw;
    data.type = appSession.appSessionObj.type;
    data.couldNotIdentify = appSession.appSessionObj.couldNotIdentify == undefined ? process.const.STR_True : appSession.appSessionObj.couldNotIdentify;
    data.recogFail = appSession.appSessionObj.recogFail == undefined ? process.const.STR_False : appSession.appSessionObj.recogFail;
    data.dbFail = appSession.appSessionObj.dbFail == undefined ? process.const.STR_False : appSession.appSessionObj.dbFail;
    data.identified = appSession.appSessionObj.authenticated == process.const.STR_True ? process.const.STR_Y : process.const.STR_N;
    data.multipleAccounts = appSession.appSessionObj.multipleAccounts == undefined ? process.const.STR_False : appSession.appSessionObj.multipleAccounts;
    data.respApplErrocode = appSession.appSessionObj.respApplErrocode == undefined ? "" : appSession.appSessionObj.respApplErrocode;
    data.cfId = appSession.appSessionObj.cfId == undefined ? "" : appSession.appSessionObj.cfId;
    data.custId = appSession.appSessionObj.custId == undefined ? "" : appSession.appSessionObj.custId;
    data.base = appSession.appSessionObj.base == undefined ? "" : appSession.appSessionObj.base;
    //data.resultCode = appSession.appSessionObj.resultCode == undefined ? "" : appSession.appSessionObj.resultCode;
    return JSON.stringify(data);
};
module.exports = {
    AuthVerficationToSAP,
    FoundStreetAccNumber, OutputData,CellPhoneTimeStampVerification,
    ValidateStreetNumber
};
