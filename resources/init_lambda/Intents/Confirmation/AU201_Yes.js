const util = require("../../Helpers/Utilities/getLexResponse");
const logger = require("../../Helpers/Utilities/logger");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const catchHelper = require("../../Helpers/Common/catchHelper");
const ssmlMessage = require("../../Helpers/Common/ssmlHelper");
const apiHelper = require("../../Helpers/Common/apiHelper");
const xmlTojson = require("../../Helpers/Common/soapApiReq");
const agentHelper = require("../../Helpers/Common/agentHelper");
const ivaHelper = require("../../Helpers/IVA/ivaHelper");
const callPath = require("../../Helpers/Common/callPathHelper");
const luhn = require("luhn");
const Yes = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let activeContexts = [];
    let WS02Details = {};
    let WS03Details = {};
    let WS04Details = {};
    let checkDigit;
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + process.const.STR_Underscore + process.const.SN_Yes;
        appSession.fallBackCounter = appSession.fallBackCounter > 0 || appSession.fallBackCounter > "0" ? "0" : appSession.fallBackCounter;
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        cxiSession.cxiSessionObj.cxiAPIDetails = [];
        //-----------------------------------------------------
        if (appSession.nextStateName == process.const.NS_CellPhoneCollection) {
            appSession.appSessionObj.authenticated = process.const.STR_True;
            appSession.appSessionObj.authMethod = process.const.STR_ANI;
            appSession.appSessionObj.aniIdentified = process.const.STR_True;
            if (appSession.appSessionObj.ANI == appSession.appSessionObj.cellPhone) {
                appSession.nextIntent = process.const.AU200;
            }
            else if (appSession.appSessionObj.cellPhone == "" || appSession.appSessionObj.cellPhone == undefined || appSession.appSessionObj.cellPhone == null) {
                appSession.nextStateName = process.const.NS_HomePh_Authenticated;
                appSession.nextIntent = process.const.AU202;
            }
            else {
                appSession.nextIntent = process.const.AU200;
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
        else if (appSession.nextStateName == process.const.NS_EmergencyConfirmation) {
            appSession.callerGoal = process.const.CG_Emergency;
            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_Emergency);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_100440);
            return agentHelper.AgentTransfer(
                intentRequest,
                intentName,
                promptOut,
                callback
            );
        }
        else if (appSession.nextStateName == process.const.NS_AIN_Identified) {
            appSession.appSessionObj.contractAccount = appSession.appSessionObj.addressContractAccount;
            appSession.appSessionObj.zgMailingAddress = appSession.appSessionObj.mailMailingAddress;
            appSession.appSessionObj.zgServiceAddress = appSession.appSessionObj.serviceAddress;
            appSession.appSessionObj.fromAuthenticatedBot = process.const.STR_N;
            appSession.appSessionObj.authenticated = process.const.STR_True;
            appSession.appSessionObj.authMethod = process.const.STR_ANI;
            appSession.appSessionObj.aniIdentified = process.const.STR_True;
            if (appSession.appSessionObj.premiseType == process.const.STR_NR) {
                appSession.appSessionObj.bizrez = process.const.STR_commercial;
                appSession.appSessionObj.type = process.const.STR_2;
                appSession.appSessionObj.bizRez = appSession.appSessionObj.bizrez;
                appSession.appSessionObj.customerTypeCode = process.const.STR_BC;
                appSession.nextIntent = process.const.AU104;
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
                appSession.appSessionObj.type = process.const.STR_1;
                appSession.appSessionObj.bizrez = process.const.STR_Residential;
                appSession.appSessionObj.bizRez = appSession.appSessionObj.bizrez;
                appSession.appSessionObj.customerTypeCode = process.const.STR_IC;
                if (appSession.appSessionObj.sapVerificationSw == process.const.STR_True) {
                    if (appSession.appSessionObj.ANI == appSession.appSessionObj.cellPhone) {
                        appSession.appSessionObj.callingMode = "ANI_AddressConfirmation";
                        await ivaHelper.AuthVerficationToSAP(appSession.appSessionObj.contractAccount, intentRequest, callback);
                        return;
                    }
                    appSession.nextIntent = process.const.AU104;
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
                appSession.nextIntent = process.const.AU104;
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
        else if (appSession.nextStateName == process.const.NS_CellPhoneCollection_AddrFound) {
            await ivaHelper.AuthVerficationToSAP(appSession.appSessionObj.contractAccount, intentRequest, callback);
            return;
        }
        else if (appSession.nextStateName == process.const.NS_CellPhnColl_PhoneNumberConfirmation) {
            appSession.appSessionObj.cellPhoneCollectionPrompt = process.const.STR_N;
            if (appSession.preStateName == `${appSession.baseLine}_DontHaveIt` || (appSession.appSessionObj.cellPhoneConfirmationCount > "1" && appSession.preStateName == `${appSession.baseLine}_No`)) {
                appSession.appSessionObj.UpdContactInfoOperation = "REM";
                appSession.appSessionObj.getPhoneNumber = "0000000000";
            } else if((appSession.appSessionObj.cellPhone != null || appSession.appSessionObj.cellPhone != undefined || appSession.appSessionObj.cellPhone != "undefined") 
                && appSession.preStateName == `${appSession.baseLine}_DontHaveIt`){
                    appSession.appSessionObj.UpdContactInfoOperation = "REM";
                    appSession.appSessionObj.getPhoneNumber = appSession.appSessionObj.phoneNumber;
            }
            else {
                appSession.appSessionObj.getPhoneNumber = appSession.appSessionObj.getPhoneNumber.length == 11 ?
                    appSession.appSessionObj.getPhoneNumber.slice(1, 10 + 1) : appSession.appSessionObj.getPhoneNumber;
                appSession.appSessionObj.UpdContactInfoOperation = "ADD";
            }
            
                appSession.appSessionObj.phoneCellVerifSw = 'Y';
                const updateBusinessPartnerObj = {};
                updateBusinessPartnerObj.action = process.const.WS_updateBusinessPartnerObjAction;
                updateBusinessPartnerObj.requestedBy = appSession.appSessionObj.ANI;
                updateBusinessPartnerObj.relatedBusinessPartner = appSession.appSessionObj.businessPartner == undefined || appSession.appSessionObj.businessPartner == "undefined" ? req : appSession.appSessionObj.businessPartner;
                updateBusinessPartnerObj.zGUpdContactInfoContactType = "PHONE";
                updateBusinessPartnerObj.zGUpdContactInfoOperation = appSession.appSessionObj.UpdContactInfoOperation;
                updateBusinessPartnerObj.zGUpdContactInfoPhoneNumberExtension = appSession.appSessionObj.phoneNumberExtension;
                //updateBusinessPartnerObj.isMyAccountEmail = appSession.appSessionObj.isMyAccountEmail;
                updateBusinessPartnerObj.zGUpdContactInfoContact = appSession.appSessionObj.getPhoneNumber == undefined || appSession.appSessionObj.getPhoneNumber == "undefined" ? " " : appSession.appSessionObj.getPhoneNumber;
                updateBusinessPartnerObj.zGUpdContactInfoPhoneType = appSession.appSessionObj.phoneType == undefined || appSession.appSessionObj.phoneType == "undefined" ? " " : appSession.appSessionObj.phoneType;
                updateBusinessPartnerObj.zGUpdContactInfoIsPrimaryPhone = appSession.appSessionObj.isPrimaryPhone == undefined || appSession.appSessionObj.isPrimaryPhone == "undefined" ? false : appSession.appSessionObj.isPrimaryPhone;
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
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ProcessFailurePhoneNumberUpdate);
                if (appSession.callerGoal == process.const.CG_CellNumberCollection) {
                    appSession.appSessionObj.isReturned = process.const.STR_True;
                    appSession.appSessionObj.cellPhoneCollectionPrompt = "N";
                    promptOut = process.promptSession.scg_ccc_prmt_1016_init_09_CellNumberNotUpdated;
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
            if (appSession.appSessionObj.updateBusinessPartnerReturnType == "E") {
                //---------PUT CXI Keys-------------------------------------------
                WS02Details.statusCode = I_DG_02_001_Update_ResObj.status;
                WS02Details.apiStateResult = "Success";
                WS02Details.errorMessage = "";
                cxiSession.cxiSessionObj.cxiAPIDetails.push(WS02Details);
                //-----------------------------------------------------
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ProcessFailurePhoneNumberUpdate);
                if (appSession.callerGoal == process.const.CG_CellNumberCollection) {
                    appSession.appSessionObj.isReturned = process.const.STR_True;
                    appSession.appSessionObj.cellPhoneCollectionPrompt = "N";
                    promptOut = process.promptSession.scg_ccc_prmt_1016_init_09_CellNumberNotUpdated;
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
                    appSession.appSessionObj.dbFail = process.const.STR_True;
                    return agentHelper.AgentTransfer(
                        intentRequest,
                        intentName,
                        promptOut,
                        callback
                    );
                }
            }
            else {
                if (appSession.appSessionObj.updateBusinessPartnerReturnType == "S") {
                    //---------PUT CXI Keys-------------------------------------------
                    WS02Details.statusCode = I_DG_02_001_Update_ResObj.status;
                    WS02Details.apiStateResult = "Success";
                    WS02Details.errorMessage = "";
                    cxiSession.cxiSessionObj.cxiAPIDetails.push(WS02Details);
                    //cxiSession.cxiSessionObj.promptType = "prompt";
                    //-----------------------------------------------------
                    appSession.appSessionObj.cellPhoneVerified = process.const.STR_True;
                    appSession.appSessionObj.isReturned = process.const.STR_True;
                    appSession.appSessionObj.authenticated = process.const.STR_True;
                    appSession.appSessionObj.authMethod = process.const.STR_ANI;
                    appSession.appSessionObj.cellPhoneCollectionPrompt = "N";
                    appSession.appSessionObj.aniIdentified = process.const.STR_True;
                    promptOut = appSession.appSessionObj.phoneCellArea == "" && appSession.appSessionObj.phoneCellNo == "" ?
                        process.promptSession.scg_ccc_prmt_1016_init_10_CellNumberNotUpdated : process.promptSession.scg_ccc_prmt_1016_init_08_CellNumberUpdated;
                    cxiSession.callPath = appSession.appSessionObj.phoneCellArea == "" && appSession.appSessionObj.phoneCellNo == "" ?
                        callPath.CallPath(cxiSession.callPath, process.const.CP_CellPhoneNumberNotUpdated) :
                        callPath.CallPath(cxiSession.callPath, process.const.CP_CellPhoneNumberUpdated);
                    cxiSession.pegPath = appSession.appSessionObj.phoneCellArea == "" && appSession.appSessionObj.phoneCellNo == "" ?
                        callPath.PegPath(cxiSession.pegPath, process.const.PP_101625) :
                        callPath.PegPath(cxiSession.pegPath, process.const.PP_101620);
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
            }
        }
        else if (appSession.nextStateName == process.const.NS_PhoneNumber_Confirmation) {
            appSession.appSessionObj.getPhoneNumber = appSession.appSessionObj.getPhoneNumber.length == 11 ?
                appSession.appSessionObj.getPhoneNumber.slice(1, 10 + 1) : appSession.appSessionObj.getPhoneNumber;
            const customerDetailsObj = {};
            customerDetailsObj.action = process.const.WS_customerDetailsObjAction;
            customerDetailsObj.phoneNumber = appSession.appSessionObj.getPhoneNumber;
            //customerDetailsObj.contractAccount = "";
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
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_AuthenticationProcessFailure);
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
                    appSession.appSessionObj.accountCloseDate = customerDetails?.AccountCloseDate;
                    appSession.appSessionObj.accountNickname = customerDetails?.AccountNickname;
                    appSession.appSessionObj.accountStartDate = customerDetails?.AccountStartDate;
                    appSession.appSessionObj.base = customerDetails?.Base;
                    appSession.appSessionObj.cellPhone = customerDetails?.CellPhone;
                    appSession.appSessionObj.currentAmtDue = customerDetails?.CurrentAmtDue;
                    appSession.appSessionObj.currentDueDate = customerDetails?.CurrentDueDate;
                    appSession.appSessionObj.customerName = customerDetails?.CustomerName;
                    appSession.appSessionObj.isAccountOnMya = customerDetails?.IsAccountOnMya;
                    appSession.appSessionObj.isAccountOnCare = customerDetails?.IsAcountOnCare;
                    appSession.appSessionObj.isMedBaselineSw = customerDetails?.IsMedBaselineSw;
                    appSession.appSessionObj.isOnAutopay = customerDetails?.IsOnAutopay;
                    appSession.appSessionObj.isOnPaperless = customerDetails?.IsOnPaperless;
                    appSession.appSessionObj.isOnPayByPhone = customerDetails?.IsOnPayByPhone;
                    appSession.appSessionObj.isGTOneYear = customerDetails?.IsGTOneYear;
                    appSession.appSessionObj.isLHPEligible = customerDetails?.IsLHPEligible;
                    appSession.appSessionObj.isMovedOutGT6M = customerDetails?.IsMovedOutGT6M;
                    appSession.appSessionObj.noOfAccount = customerDetails?.NoOfAccount;
                    appSession.appSessionObj.pastDueAmount = customerDetails?.PastDueAmount;
                    appSession.appSessionObj.pastDueDate = customerDetails?.PastDueDate;
                    appSession.appSessionObj.pendingCsoCount = customerDetails?.PendingCsoCount;
                    appSession.appSessionObj.phoneNoLastVerifiedDate = customerDetails?.PhoneNoLastVerifiedDate;
                    appSession.appSessionObj.screenPopCellPhoneVerified = ivaHelper.CellPhoneTimeStampVerification(appSession.appSessionObj.phoneNoLastVerifiedDate,appSession);
                    appSession.appSessionObj.premiseType = customerDetails?.PremiseType;
                    appSession.appSessionObj.recentPaymentDate = customerDetails?.RecentPaymentDate;
                    appSession.appSessionObj.spouseName = customerDetails?.SpouseName;
                    appSession.appSessionObj.totalAmountDue = customerDetails?.TotalAmountDue;
                    appSession.appSessionObj.totalBalance = customerDetails?.TotalBalance;
                    appSession.appSessionObj.disconnectionInd = customerDetails?.DisconnectionInd;
                    appSession.appSessionObj.type = customerDetails?.Type;
                    /*appSession.appSessionObj.houseNumber = customerDetails?.ZGGetAccInfoAddr?.results?.[0]?.HouseNumber;
                    appSession.appSessionObj.contractAccount =
                        appSession.appSessionObj.noOfAccount.trim() === "1"
                            ? customerDetails?.ContractAccount
                            : customerDetails?.ZGGetAccInfoAddr?.results?.[0]?.ContractAccount;*/
                    appSession.appSessionObj.houseNumber = appSession.appSessionObj.noOfAccount.trim() === "1" ?
                        customerDetails?.ZGGetAccInfoAddr?.results?.[0]?.HouseNumber : appSession.appSessionObj.houseNumber;
                    appSession.appSessionObj.contractAccount =
                        appSession.appSessionObj.noOfAccount.trim() === "1"
                            ? customerDetails?.ContractAccount : appSession.appSessionObj.contractAccount;
                    appSession.appSessionObj.accountStatus = appSession.appSessionObj.noOfAccount.trim() === "1" ? customerDetails?.AccountStatus : appSession.appSessionObj.accountStatus;
                    appSession.appSessionObj.businessPartner = appSession.appSessionObj.noOfAccount.trim() === "1" ? customerDetails?.BusinessPartner : appSession.appSessionObj.businessPartner;
                    if (appSession.appSessionObj.noOfAccount.trim() > "1") {
                        //appSession.appSessionObj.streetNumberReturned = await ivaHelper.FoundStreetAccNumber(customerDetails, appSession);
                    }
                    appSession.appSessionObj.telePhone = customerDetails?.TelePhone;
                    appSession.appSessionObj.zipCode = customerDetails?.ZipCode;
                    appSession.appSessionObj.zgMailingAddress = customerDetails?.ZGGetAccInfoMail?.MailingAddress;
                    appSession.appSessionObj.zgAddressType = customerDetails?.ZGGetAccInfoMail?.AddressType;
                    appSession.appSessionObj.zgCareOf = customerDetails?.ZGGetAccInfoMail?.CareOf;
                    appSession.appSessionObj.zgPOBox = customerDetails?.ZGGetAccInfoMail?.POBox;
                    appSession.appSessionObj.zgHouseNumber = customerDetails?.ZGGetAccInfoMail?.HouseNumber;
                    appSession.appSessionObj.zgStreetPrefix = customerDetails?.ZGGetAccInfoMail?.StreetPrefix;
                    appSession.appSessionObj.zgStreet = customerDetails?.ZGGetAccInfoMail?.Street;
                    appSession.appSessionObj.zgStreetType = customerDetails?.ZGGetAccInfoMail?.StreetType;
                    appSession.appSessionObj.zgStreetPostfix = customerDetails?.ZGGetAccInfoMail?.StreetPostfix;
                    appSession.appSessionObj.zgSupplement = customerDetails?.ZGGetAccInfoMail?.Supplement;
                    appSession.appSessionObj.zgZipCode = customerDetails?.ZGGetAccInfoMail?.ZipCode;
                    appSession.appSessionObj.zgCity = customerDetails?.ZGGetAccInfoMail?.City;
                    appSession.appSessionObj.zgState = customerDetails?.ZGGetAccInfoMail?.State;
                    appSession.appSessionObj.zgCountry = customerDetails?.ZGGetAccInfoMail?.Country;

                    appSession.appSessionObj.zgServiceAddress = customerDetails?.ZGGetAccInfoServ?.ServiceAddress;
                    appSession.appSessionObj.zgServiceHouseNumber = customerDetails?.ZGGetAccInfoServ?.HouseNumber;
                    appSession.appSessionObj.zgServiceStreetPrefix = customerDetails?.ZGGetAccInfoServ?.StreetPrefix;
                    appSession.appSessionObj.zgServiceStreet = customerDetails?.ZGGetAccInfoServ?.Street;
                    appSession.appSessionObj.zgServiceSupplement = customerDetails?.ZGGetAccInfoServ?.Supplement;
                    appSession.appSessionObj.zgServiceStreetType = customerDetails?.ZGGetAccInfoServ?.StreetType;
                    appSession.appSessionObj.zgServiceStreetPostfix = customerDetails?.ZGGetAccInfoServ?.StreetPostfix;
                    appSession.appSessionObj.zgServiceCity = customerDetails?.ZGGetAccInfoServ?.City;
                    appSession.appSessionObj.zgServiceState = customerDetails?.ZGGetAccInfoServ?.State;
                    appSession.appSessionObj.zGServiceZipCode = customerDetails?.ZGGetAccInfoServ?.ZipCode;

                    if (appSession.appSessionObj.noOfAccount > "1") {
                        //appSession.appSessionObj.streetNumberReturned = await ivaHelper.FoundStreetAccNumber(customerDetails, appSession);
                        appSession.appSessionObj.multipleAccounts = process.const.STR_True;
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MultipleAccounts);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700305);
                        appSession.appSessionObj.callingModePhoneNo = process.const.STR_True;
                        promptOut = process.promptSession.scg_ccc_collect_7004_auth_01_StreetNumber;
                        cxiSession.cxiSessionObj.promptIdFlag = "Y";
                        promptOut = ssmlMessage.ConvertSSML(promptOut);
                        appSession.appSessionObj.multipleAccounts = process.const.STR_True;
                        appSession.nextIntent = process.const.AU102;
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AuthWithStreetNumber);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700400);
                        activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
                        activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_StreetNumber);
                        let StreetNumberSlot = process.const.STR_StreetNumber;
                        appSession.appSessionObj[StreetNumberSlot + "Retry"] = appSession.appSessionObj[StreetNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[StreetNumberSlot + "Retry"];
                        callback(
                            util.DialogAction(
                                process.const.DA_SwitchToIntentSlot,
                                intentRequest,
                                appSession.nextIntent,
                                util.BuildSSMLMessage(promptOut),
                                process.const.STR_InProgress,
                                activeContexts,
                                StreetNumberSlot
                            )
                        );
                        return;


                    }
                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AuthWithStreetNumber);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700400);
                    promptOut = process.promptSession.scg_ccc_collect_7004_auth_01_StreetNumber;
                    promptOut = ssmlMessage.ConvertSSML(promptOut);
                    appSession.nextIntent = process.const.AU102;
                    activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
                    activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_StreetNumber);
                    let StreetNumberSlot = process.const.STR_StreetNumber;
                    appSession.appSessionObj[StreetNumberSlot + "Retry"] = appSession.appSessionObj[StreetNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[StreetNumberSlot + "Retry"];
                    callback(
                        util.DialogAction(
                            process.const.DA_SwitchToIntentSlot,
                            intentRequest,
                            appSession.nextIntent,
                            util.BuildSSMLMessage(promptOut),
                            process.const.STR_InProgress,
                            activeContexts,
                            StreetNumberSlot
                        )
                    );
                    return;

                }
                else {
                    if (!appSession.appSessionObj.returnType || appSession.appSessionObj.returnType == "E" || (appSession.appSessionObj.customerDetailsReturnId != "10")) {
                        //---------PUT CXI Keys-------------------------------------------
                        WS03Details.statusCode = I_DG_06_006_ResObj.status;
                        WS03Details.apiStateResult = "Success";
                        WS03Details.errorMessage = "";
                        cxiSession.cxiSessionObj.cxiAPIDetails.push(WS03Details);
                        //-----------------------------------------------------

                        appSession.appSessionObj.diffPhoneNumberCtr = appSession.appSessionObj.diffPhoneNumberCtr == undefined || appSession.appSessionObj.diffPhoneNumberCtr == "undefined" ?
                            0 : appSession.appSessionObj.diffPhoneNumberCtr;
                        let ctr = parseInt(appSession.appSessionObj.diffPhoneNumberCtr, 10);
                        ctr++;
                        appSession.appSessionObj.diffPhoneNumberCtr = ctr;
                        if (appSession.appSessionObj.diffPhoneNumberCtr > "2") {
                            appSession.appSessionObj.diffPhoneNumberCtr = 0;
                            if (appSession.callerGoal == process.const.CG_TailorTreatmentPrediction) {
                                appSession.appSessionObj.upFrontAuthentication = "Failure";
                                appSession.appSessionObj.phoneNumberCount = 0;
                                appSession.appSessionObj.streetNumberCount = 0;
                                appSession.appSessionObj.accountNumberCount = 0;
                                appSession.appSessionObj.newCustomer = process.const.STR_True;
                                appSession.nextIntent = process.const.MA100;
                                appSession.nextBot = process.const.Master_Bot;
                                promptOut = process.promptSession.scg_ccc_prmt_7003_auth_01_PhoneNumberNotMatch;
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
                            appSession.appSessionObj.phoneNumberCount = "0";
                            appSession.nextIntent = process.const.MS300;
                            appSession.nextBot = process.const.MainServices_Bot;
                            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_PhoneNumberTooManyAttempts);
                            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700310);
                            promptOut = process.promptSession.scg_ccc_prmt_7003_auth_01_PhoneNumberNotMatch;
                        }
                        else {
                            appSession.nextIntent = process.const.AU200;
                            appSession.nextBot = process.const.Authentication_Bot;
                            appSession.nextStateName = process.const.NS_Different_PhoneNumber;
                            promptOut = process.promptSession.scg_ccc_prmt_7003_auth_01_PhoneNumberNotMatch;
                        }
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
                        /*  */
                    }
                }
            }
        }
        else if (appSession.nextStateName == process.const.NS_Different_PhoneNumber) {
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PhoneNumber);
            let PhoneNumberSlot = process.const.STR_PhoneNumber;
            appSession.nextIntent = process.const.AU101;
            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_PhoneNumberTryAgain);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700315);
            appSession.appSessionObj[PhoneNumberSlot + "Count"] = 0;
            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AuthWithPhoneNumber);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700200);
            appSession.appSessionObj[PhoneNumberSlot + "Retry"] = appSession.appSessionObj[PhoneNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[PhoneNumberSlot + "Retry"];
            promptOut = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                process.promptSession.scg_ccc_collect_7002_auth_01_PhoneNumberMS : process.promptSession.scg_ccc_collect_7002_auth_02_PhoneNumber;
            activeContexts = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_NewCustomer) : activeContexts;
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
                    PhoneNumberSlot
                )
            );
            return;
        }
        else if (appSession.nextStateName == process.const.NS_StreetNumber_Confirmation) {
            if (appSession.appSessionObj.multipleAccounts == process.const.STR_True) {
                //let streetNumberValidate = await ivaHelper.ValidateStreetNumber(appSession);
                let streetNumberValidate = await ivaHelper.ValidateStreetNumber(intentRequest,intentName, callback);
                appSession.appSessionObj.streetNumberMatched = streetNumberValidate[0];
                appSession.appSessionObj.accountNumberFoundForStreet = streetNumberValidate[1];
                appSession.appSessionObj.duplicateAddress = streetNumberValidate[2];
                appSession.appSessionObj.accountStatus = streetNumberValidate[3];
                appSession.appSessionObj.businessPartner = streetNumberValidate[4];
                if (appSession.appSessionObj.streetNumberMatched == true || appSession.appSessionObj.streetNumberMatched == process.const.STR_True || appSession.appSessionObj.houseNumber == appSession.appSessionObj.getStreetNumber) {
                    if (appSession.appSessionObj.duplicateAddress == true || appSession.appSessionObj.duplicateAddress == process.const.STR_True) {
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
                        const customerDetailsObj = {};
                        customerDetailsObj.action = process.const.WS_customerDetailsObjAction;
                        customerDetailsObj.contractAccount = appSession.appSessionObj.accountNumberFoundForStreet;// || appSession.appSessionObj.houseNumber
                        customerDetailsObj.phoneNumber = "";
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
                            appSession.appSessionObj.dbFail = process.const.STR_True;
                            cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_AuthenticationProcessFailure);
                            return agentHelper.AgentTransfer(
                                intentRequest,
                                intentName,
                                promptOut,
                                callback
                            );

                        }
                        let customerDetails = I_DG_06_006_ResObj.data;
                        //logger.debug(customerDetails);
                        appSession.appSessionObj.returnType = customerDetails?.ZGMessage?.results?.[0]?.Type;
                        let customerDetailsReturnId = customerDetails?.ZGMessage?.results?.[0]?.Id;
                        appSession.appSessionObj.customerDetailsReturnId = customerDetailsReturnId == undefined ? customerDetailsReturnId : customerDetailsReturnId.trim();
                        if (appSession.appSessionObj.returnType == "S" && (appSession.appSessionObj.customerDetailsReturnId == "10" || appSession.appSessionObj.customerDetailsReturnId == "010")) {//|| appSession.appSessionObj.customerDetailsReturnId != "010"
                            //appSession.appSessionObj.putScreenPopData = process.const.STR_True;
                            //---------PUT CXI Keys-------------------------------------------
                            WS03Details.statusCode = I_DG_06_006_ResObj.status;
                            WS03Details.apiStateResult = "Success";
                            WS03Details.errorMessage = "";
                            cxiSession.cxiSessionObj.cxiAPIDetails.push(WS03Details);
                            //cxiSession.cxiSessionObj.promptType = "prompt";
                            //-----------------------------------------------------
                            appSession.appSessionObj.accountStatus = customerDetails?.AccountStatus;
                            appSession.appSessionObj.accountCloseDate = customerDetails?.AccountCloseDate;
                            appSession.appSessionObj.accountNickname = customerDetails?.AccountNickname;
                            appSession.appSessionObj.accountStartDate = customerDetails?.AccountStartDate;
                            appSession.appSessionObj.base = customerDetails?.Base;
                            appSession.appSessionObj.cellPhone = customerDetails?.CellPhone;
                            appSession.appSessionObj.currentAmtDue = customerDetails?.CurrentAmtDue;
                            appSession.appSessionObj.currentDueDate = customerDetails?.CurrentDueDate;
                            appSession.appSessionObj.customerName = customerDetails?.CustomerName;
                            appSession.appSessionObj.isAccountOnMya = customerDetails?.IsAccountOnMya;
                            appSession.appSessionObj.isAccountOnCare = customerDetails?.IsAcountOnCare;
                            appSession.appSessionObj.isMedBaselineSw = customerDetails?.IsMedBaselineSw;
                            appSession.appSessionObj.isOnAutopay = customerDetails?.IsOnAutopay;
                            appSession.appSessionObj.isOnPaperless = customerDetails?.IsOnPaperless;
                            appSession.appSessionObj.isOnPayByPhone = customerDetails?.IsOnPayByPhone;
                            appSession.appSessionObj.isGTOneYear = customerDetails?.IsGTOneYear;
                            appSession.appSessionObj.isLHPEligible = customerDetails?.IsLHPEligible;
                            appSession.appSessionObj.isMovedOutGT6M = customerDetails?.IsMovedOutGT6M;
                            appSession.appSessionObj.noOfAccount = customerDetails?.NoOfAccount;
                            appSession.appSessionObj.pastDueAmount = customerDetails?.PastDueAmount;
                            appSession.appSessionObj.pastDueDate = customerDetails?.PastDueDate;
                            appSession.appSessionObj.pendingCsoCount = customerDetails?.PendingCsoCount;
                            appSession.appSessionObj.phoneNoLastVerifiedDate = customerDetails?.PhoneNoLastVerifiedDate;
                            appSession.appSessionObj.screenPopCellPhoneVerified = ivaHelper.CellPhoneTimeStampVerification(appSession.appSessionObj.phoneNoLastVerifiedDate,appSession);
                            appSession.appSessionObj.premiseType = customerDetails?.PremiseType;
                            appSession.appSessionObj.recentPaymentDate = customerDetails?.RecentPaymentDate;
                            appSession.appSessionObj.spouseName = customerDetails?.SpouseName;
                            appSession.appSessionObj.totalAmountDue = customerDetails?.TotalAmountDue;
                            appSession.appSessionObj.totalBalance = customerDetails?.TotalBalance;
                            appSession.appSessionObj.disconnectionInd = customerDetails?.DisconnectionInd;
                            appSession.appSessionObj.type = customerDetails?.Type;
                            appSession.appSessionObj.houseNumber = customerDetails?.ZGGetAccInfoAddr?.results?.[0]?.HouseNumber;
                            appSession.appSessionObj.contractAccount =
                                appSession.appSessionObj.noOfAccount.trim() === "1"
                                    ? customerDetails?.ContractAccount
                                    : customerDetails?.ZGGetAccInfoAddr?.results?.[0]?.ContractAccount;
                            appSession.appSessionObj.businessPartner = customerDetails?.BusinessPartner;
                            appSession.appSessionObj.telePhone = customerDetails?.TelePhone;
                            appSession.appSessionObj.zipCode = customerDetails?.ZipCode;
                            appSession.appSessionObj.zgMailingAddress = customerDetails?.ZGGetAccInfoMail?.MailingAddress;
                            appSession.appSessionObj.zgAddressType = customerDetails?.ZGGetAccInfoMail?.AddressType;
                            appSession.appSessionObj.zgCareOf = customerDetails?.ZGGetAccInfoMail?.CareOf;
                            appSession.appSessionObj.zgPOBox = customerDetails?.ZGGetAccInfoMail?.POBox;
                            appSession.appSessionObj.zgHouseNumber = customerDetails?.ZGGetAccInfoMail?.HouseNumber;
                            appSession.appSessionObj.zgStreetPrefix = customerDetails?.ZGGetAccInfoMail?.StreetPrefix;
                            appSession.appSessionObj.zgStreet = customerDetails?.ZGGetAccInfoMail?.Street;
                            appSession.appSessionObj.zgStreetType = customerDetails?.ZGGetAccInfoMail?.StreetType;
                            appSession.appSessionObj.zgStreetPostfix = customerDetails?.ZGGetAccInfoMail?.StreetPostfix;
                            appSession.appSessionObj.zgSupplement = customerDetails?.ZGGetAccInfoMail?.Supplement;
                            appSession.appSessionObj.zgZipCode = customerDetails?.ZGGetAccInfoMail?.ZipCode;
                            appSession.appSessionObj.zgCity = customerDetails?.ZGGetAccInfoMail?.City;
                            appSession.appSessionObj.zgState = customerDetails?.ZGGetAccInfoMail?.State;
                            appSession.appSessionObj.zgCountry = customerDetails?.ZGGetAccInfoMail?.Country;

                            appSession.appSessionObj.zgServiceAddress = customerDetails?.ZGGetAccInfoServ?.ServiceAddress;
                            appSession.appSessionObj.zgServiceHouseNumber = customerDetails?.ZGGetAccInfoServ?.HouseNumber;
                            appSession.appSessionObj.zgServiceStreetPrefix = customerDetails?.ZGGetAccInfoServ?.StreetPrefix;
                            appSession.appSessionObj.zgServiceStreet = customerDetails?.ZGGetAccInfoServ?.Street;
                            appSession.appSessionObj.zgServiceSupplement = customerDetails?.ZGGetAccInfoServ?.Supplement;
                            appSession.appSessionObj.zgServiceStreetType = customerDetails?.ZGGetAccInfoServ?.StreetType;
                            appSession.appSessionObj.zgServiceStreetPostfix = customerDetails?.ZGGetAccInfoServ?.StreetPostfix;
                            appSession.appSessionObj.zgServiceCity = customerDetails?.ZGGetAccInfoServ?.City;
                            appSession.appSessionObj.zgServiceState = customerDetails?.ZGGetAccInfoServ?.State;
                            appSession.appSessionObj.zGServiceZipCode = customerDetails?.ZGGetAccInfoServ?.ZipCode;

                            if (appSession.appSessionObj.multipleAccounts == process.const.STR_True) {
                                if (appSession.appSessionObj.callingModePhoneNo == process.const.STR_True) {
                                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AuthMethodANIAddress);
                                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700710);
                                    appSession.appSessionObj.authMethod = process.const.STR_Addr;
                                } else {
                                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AuthMethodANIMatch);
                                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700705);
                                    appSession.appSessionObj.authMethod = process.const.STR_ANI;
                                    appSession.appSessionObj.aniIdentified = process.const.STR_True;
                                }
                            }
                            else {
                                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AuthMethodAccountNum);
                                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700715);
                                appSession.appSessionObj.authMethod = process.const.STR_Acct;
                            }
                            appSession.appSessionObj.authenticated = process.const.STR_True;
                            appSession.appSessionObj.multipleAccounts = process.const.STR_False;
                            appSession.appSessionObj.couldNotIdentify = process.const.STR_False;
                            appSession.appSessionObj.idByAcct = process.const.STR_True;
                            if (appSession.appSessionObj.premiseType == process.const.STR_NR) {
                                appSession.appSessionObj.bizrez = process.const.STR_Commercial;
                                appSession.appSessionObj.type = process.const.STR_2;
                                appSession.appSessionObj.bizRez = appSession.appSessionObj.bizrez;
                                appSession.appSessionObj.customerTypeCode = process.const.STR_BC;
                                appSession.nextIntent = process.const.AU104;
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
                                appSession.appSessionObj.type = process.const.STR_1;
                                appSession.appSessionObj.bizrez = process.const.STR_Residential;
                                appSession.appSessionObj.bizRez = appSession.appSessionObj.bizrez;
                                appSession.appSessionObj.customerTypeCode = process.const.STR_IC;
                                if (appSession.appSessionObj.sapVerificationSw == process.const.STR_True) {
                                    if ((appSession.appSessionObj.ANI == appSession.appSessionObj.cellPhone &&
                                        appSession.appSessionObj.authMethod == process.const.STR_ANI) || appSession.appSessionObj.getPhoneNumber == appSession.appSessionObj.cellPhone) {                                            
                                            appSession.appSessionObj.callingMode = "AccountNumber";
                                        await ivaHelper.AuthVerficationToSAP(appSession.appSessionObj.accountNumberFoundForStreet, intentRequest, callback);
                                        return;
                                    }
                                    appSession.nextIntent = process.const.AU104;
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
                                    appSession.nextIntent = process.const.AU104;
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
                        else {
                            //---------PUT CXI Keys-------------------------------------------
                            WS03Details.statusCode = I_DG_06_006_ResObj.status;
                            WS03Details.apiStateResult = "Success";
                            WS03Details.errorMessage = "";
                            cxiSession.cxiSessionObj.cxiAPIDetails.push(WS03Details);
                            //-----------------------------------------------------
                            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
                            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MainMenu);
                            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HoldOn);
                            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_AccountNumber);
                            let AccountNumberSlot = process.const.STR_AccountNumber;
                            appSession.nextIntent = process.const.AU103;
                            appSession.appSessionObj.multipleAccounts = process.const.STR_False;
                            appSession.appSessionObj.couldNotIdentify = process.const.STR_True;
                            appSession.appSessionObj.authenticated = process.const.STR_False;
                            appSession.appSessionObj[AccountNumberSlot + "Retry"] = appSession.appSessionObj[AccountNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[AccountNumberSlot + "Retry"];
                            promptOut = process.promptSession.scg_ccc_prmt_7006_auth_14_AccountNumberNotMatch;
                            promptOut += appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                                process.promptSession.scg_ccc_collect_7006_auth_01_AccountNumberMS : process.promptSession.scg_ccc_collect_7006_auth_02_AccountNumber;
                            activeContexts = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_NewCustomer) : activeContexts;
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

                    }
                }
                else {
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
            }
            else if (appSession.appSessionObj.getStreetNumber == appSession.appSessionObj.houseNumber) {

                appSession.appSessionObj.authenticated = process.const.STR_True;
                appSession.appSessionObj.authMethod = process.const.STR_Addr;
                appSession.appSessionObj.idByAcct = process.const.STR_False;
                if (appSession.appSessionObj.premiseType == process.const.STR_NR) {
                    appSession.appSessionObj.bizrez = process.const.STR_Commercial;
                    appSession.appSessionObj.type = process.const.STR_2;
                    appSession.appSessionObj.bizRez = appSession.appSessionObj.bizrez;
                    appSession.appSessionObj.customerTypeCode = process.const.STR_BC;
                    appSession.nextIntent = process.const.AU104;
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
                    appSession.appSessionObj.type = process.const.STR_1;
                    appSession.appSessionObj.bizrez = process.const.STR_Residential;
                    appSession.appSessionObj.bizRez = appSession.appSessionObj.bizrez;
                    appSession.appSessionObj.customerTypeCode = process.const.STR_IC;
                    if (appSession.appSessionObj.sapVerificationSw == process.const.STR_True) {
                        if (((appSession.appSessionObj.ANI == appSession.appSessionObj.cellPhone &&
                                appSession.appSessionObj.authMethod == process.const.STR_ANI) || appSession.appSessionObj.getPhoneNumber == appSession.appSessionObj.cellPhone)) {
                                appSession.appSessionObj.callingMode = "StreetNumber";
                                await ivaHelper.AuthVerficationToSAP(appSession.appSessionObj.contractAccount, intentRequest, callback);
                                return;
                            }
                        appSession.nextIntent = process.const.AU104;
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
                        appSession.nextIntent = process.const.AU104;
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
            else {
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_AuthenticationStreetDidntMatchSAP);
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
        else if (appSession.nextStateName == process.const.NS_StreetNumber_DontHaveIt) {
            cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_AuthenticationNoPhoneStreetProvided);
            appSession.appSessionObj.couldNotIdentify = process.const.STR_True;
            appSession.appSessionObj.authenticated = process.const.STR_False;
            if (appSession.appSessionObj.multipleAccounts == process.const.STR_True) {
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MainMenu);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HoldOn);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_AccountNumber);
                let AccountNumberSlot = process.const.STR_AccountNumber;
                appSession.nextIntent = process.const.AU103;
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AuthWithAccountNumber);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700600);
                appSession.appSessionObj.callingMode = "StreetNumber";
                appSession.appSessionObj[AccountNumberSlot + "Retry"] = appSession.appSessionObj[AccountNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[AccountNumberSlot + "Retry"];
                promptOut = process.promptSession.scg_ccc_prmt_7000_auth_05_CommonTryDiffWay;
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
        else if (appSession.nextStateName == process.const.NS_AccountNumber_Confirmation) {
            //logger.debug("Luhn's ", luhn.validate(appSession.appSessionObj.accountNumber));
            if (appSession.appSessionObj.getAccountNumber.length == 11) {
                /*if (luhn.validate(appSession.appSessionObj.getAccountNumber) == false) {
                    //console.log("not valid account number");
                    activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
                    activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MainMenu);
                    activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HoldOn);
                    activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_AccountNumber);
                    appSession.appSessionObj.luhnAlgoCheckFail = process.const.STR_True;
                    let AccountNumberSlot = process.const.STR_AccountNumber;
                    appSession.nextIntent = process.const.AU103;
                    appSession.appSessionObj.accountNumberCtr = appSession.appSessionObj.accountNumberCtr == undefined || appSession.appSessionObj.accountNumberCtr == "undefined" ?
                        0 : appSession.appSessionObj.accountNumberCtr;
                    let ctr = parseInt(appSession.appSessionObj.accountNumberCtr, 10);
                    ctr++;
                    appSession.appSessionObj.accountNumberCtr = ctr;
                    if (appSession.appSessionObj.accountNumberCtr > 2 || appSession.appSessionObj.accountNumberCtr > "2") {
                        appSession.appSessionObj.accountNumberCtr = 0;
                        //console.log("account number max attempt reached");
                        if (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_Moving || appSession.callerGoal == process.const.CG_Fumigation || appSession.callerGoal == process.const.CG_NewConstruction) {
                            //console.log("transfer to main service caller goal is ", callerGoal);
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
                            //console.log("Agent transfer");
                            return agentHelper.AgentTransfer(
                                intentRequest,
                                intentName,
                                promptOut,
                                callback
                            );
                        }
                    }
                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AccountNumberNoMatch);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700615);
                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AuthWithAccountNumber);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700600);
                    appSession.appSessionObj[AccountNumberSlot + "Count"] = 0;
                    appSession.appSessionObj[AccountNumberSlot + "Retry"] = appSession.appSessionObj[AccountNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[AccountNumberSlot + "Retry"];
                    promptOut = process.promptSession.scg_ccc_prmt_7006_auth_14_AccountNumberNotMatch;
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
                else {*/
                    appSession.appSessionObj.multipleAccounts = process.const.STR_False;
                    
                       let accountNumberReq = appSession.appSessionObj.getAccountNumber.slice(0, 10);
                       let checkDigit = appSession.appSessionObj.getAccountNumber.slice(10, 11);
                        appSession.appSessionObj.getAccountNumber = accountNumberReq;
                    
                    const customerDetailsObj = {};
                    customerDetailsObj.action = process.const.WS_customerDetailsObjAction;
                    customerDetailsObj.contractAccount = appSession.appSessionObj.getAccountNumber;
                    customerDetailsObj.phoneNumber = "";
                    customerDetailsObj.checkDigit = checkDigit;
                    let I_DG_06_006_ReqObj = await apiHelper.getRequestObject("I_DG_06_006", customerDetailsObj, intentRequest, intentName, callback);
                    //logger.debug(I_DG_06_006_ReqObj);
                    let I_DG_06_006_ResObj = await apiHelper.getResponseObject(I_DG_06_006_ReqObj, intentRequest, intentName, callback);
                    //logger.debug(I_DG_06_006_ResObj);
                    cxiSession.cxiSessionObj.apiFlag = "Y";
                    cxiSession.cxiSessionObj.promptType = "api lookup";
                    WS03Details.apiId = "I_DG_06_006";
                    WS03Details.apiname = "Get Account Info";
                    if (I_DG_06_006_ResObj == null || I_DG_06_006_ResObj == undefined || I_DG_06_006_ResObj.status != 201 || I_DG_06_006_ResObj.status != "201") {
                        //console.log("status != 201 true");
                        //---------PUT CXI Keys-------------------------------------------
                        WS03Details.statusCode = I_DG_06_006_ResObj == null || I_DG_06_006_ResObj == undefined ? "500" : I_DG_06_006_ResObj.status;
                        WS03Details.apiStateResult = "Failure";
                        WS03Details.errorMessage = "API Failure";
                        cxiSession.cxiSessionObj.cxiAPIDetails.push(WS03Details);
                        //------------------------------------------------------------
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
                        cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_AuthenticationProcessFailure);
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
                    else {

                        let customerDetails = I_DG_06_006_ResObj.data;
                        //logger.debug(customerDetails);
                        appSession.appSessionObj.returnType = customerDetails?.ZGMessage?.results?.[0]?.Type;
                        let customerDetailsReturnId = customerDetails?.ZGMessage?.results?.[0]?.Id;
                        appSession.appSessionObj.customerDetailsReturnId = customerDetailsReturnId == undefined ? customerDetailsReturnId : customerDetailsReturnId.trim();
                        if (appSession.appSessionObj.returnType == "S" && (appSession.appSessionObj.customerDetailsReturnId == "10" || appSession.appSessionObj.customerDetailsReturnId == "010")) {//|| appSession.appSessionObj.customerDetailsReturnId != "010"
                            //console.log("returnType == S true");
                            //appSession.appSessionObj.putScreenPopData = process.const.STR_True;
                            //---------PUT CXI Keys-------------------------------------------
                            WS03Details.statusCode = I_DG_06_006_ResObj.status;
                            WS03Details.apiStateResult = "Success";
                            WS03Details.errorMessage = "";
                            cxiSession.cxiSessionObj.cxiAPIDetails.push(WS03Details);
                            //cxiSession.cxiSessionObj.promptType = "prompt";
                            //-----------------------------------------------------
                            appSession.appSessionObj.accountStatus = customerDetails?.AccountStatus;
                            appSession.appSessionObj.accountCloseDate = customerDetails?.AccountCloseDate;
                            appSession.appSessionObj.accountNickname = customerDetails?.AccountNickname;
                            appSession.appSessionObj.accountStartDate = customerDetails?.AccountStartDate;
                            appSession.appSessionObj.base = customerDetails?.Base;
                            appSession.appSessionObj.cellPhone = customerDetails?.CellPhone;
                            appSession.appSessionObj.currentAmtDue = customerDetails?.CurrentAmtDue;
                            appSession.appSessionObj.currentDueDate = customerDetails?.CurrentDueDate;
                            appSession.appSessionObj.customerName = customerDetails?.CustomerName;
                            appSession.appSessionObj.isAccountOnMya = customerDetails?.IsAccountOnMya;
                            appSession.appSessionObj.isAccountOnCare = customerDetails?.IsAcountOnCare;
                            appSession.appSessionObj.isMedBaselineSw = customerDetails?.IsMedBaselineSw;
                            appSession.appSessionObj.isOnAutopay = customerDetails?.IsOnAutopay;
                            appSession.appSessionObj.isOnPaperless = customerDetails?.IsOnPaperless;
                            appSession.appSessionObj.isOnPayByPhone = customerDetails?.IsOnPayByPhone;
                            appSession.appSessionObj.isGTOneYear = customerDetails?.IsGTOneYear;
                            appSession.appSessionObj.isLHPEligible = customerDetails?.IsLHPEligible;
                            appSession.appSessionObj.isMovedOutGT6M = customerDetails?.IsMovedOutGT6M;
                            appSession.appSessionObj.noOfAccount = customerDetails?.NoOfAccount;
                            appSession.appSessionObj.pastDueAmount = customerDetails?.PastDueAmount;
                            appSession.appSessionObj.pastDueDate = customerDetails?.PastDueDate;
                            appSession.appSessionObj.pendingCsoCount = customerDetails?.PendingCsoCount;
                            appSession.appSessionObj.phoneNoLastVerifiedDate = customerDetails?.PhoneNoLastVerifiedDate;
                            appSession.appSessionObj.screenPopCellPhoneVerified = ivaHelper.CellPhoneTimeStampVerification(appSession.appSessionObj.phoneNoLastVerifiedDate,appSession);
                            appSession.appSessionObj.premiseType = customerDetails?.PremiseType;
                            appSession.appSessionObj.recentPaymentDate = customerDetails?.RecentPaymentDate;
                            appSession.appSessionObj.spouseName = customerDetails?.SpouseName;
                            appSession.appSessionObj.totalAmountDue = customerDetails?.TotalAmountDue;
                            appSession.appSessionObj.totalBalance = customerDetails?.TotalBalance;
                            appSession.appSessionObj.disconnectionInd = customerDetails?.DisconnectionInd;
                            appSession.appSessionObj.type = customerDetails?.Type;
                            appSession.appSessionObj.houseNumber = customerDetails?.ZGGetAccInfoAddr?.results?.[0]?.HouseNumber;
                            appSession.appSessionObj.contractAccount =
                                appSession.appSessionObj.noOfAccount.trim() === "1"
                                    ? customerDetails?.ContractAccount
                                    : customerDetails?.ZGGetAccInfoAddr?.results?.[0]?.ContractAccount;
                            appSession.appSessionObj.businessPartner = customerDetails?.BusinessPartner;
                            appSession.appSessionObj.telePhone = customerDetails?.TelePhone;
                            appSession.appSessionObj.zipCode = customerDetails?.ZipCode;
                            appSession.appSessionObj.zgMailingAddress = customerDetails?.ZGGetAccInfoMail?.MailingAddress;
                            appSession.appSessionObj.zgAddressType = customerDetails?.ZGGetAccInfoMail?.AddressType;
                            appSession.appSessionObj.zgCareOf = customerDetails?.ZGGetAccInfoMail?.CareOf;
                            appSession.appSessionObj.zgPOBox = customerDetails?.ZGGetAccInfoMail?.POBox;
                            appSession.appSessionObj.zgHouseNumber = customerDetails?.ZGGetAccInfoMail?.HouseNumber;
                            appSession.appSessionObj.zgStreetPrefix = customerDetails?.ZGGetAccInfoMail?.StreetPrefix;
                            appSession.appSessionObj.zgStreet = customerDetails?.ZGGetAccInfoMail?.Street;
                            appSession.appSessionObj.zgStreetType = customerDetails?.ZGGetAccInfoMail?.StreetType;
                            appSession.appSessionObj.zgStreetPostfix = customerDetails?.ZGGetAccInfoMail?.StreetPostfix;
                            appSession.appSessionObj.zgSupplement = customerDetails?.ZGGetAccInfoMail?.Supplement;
                            appSession.appSessionObj.zgZipCode = customerDetails?.ZGGetAccInfoMail?.ZipCode;
                            appSession.appSessionObj.zgCity = customerDetails?.ZGGetAccInfoMail?.City;
                            appSession.appSessionObj.zgState = customerDetails?.ZGGetAccInfoMail?.State;
                            appSession.appSessionObj.zgCountry = customerDetails?.ZGGetAccInfoMail?.Country;

                            appSession.appSessionObj.zgServiceAddress = customerDetails?.ZGGetAccInfoServ?.ServiceAddress;
                            appSession.appSessionObj.zgServiceHouseNumber = customerDetails?.ZGGetAccInfoServ?.HouseNumber;
                            appSession.appSessionObj.zgServiceStreetPrefix = customerDetails?.ZGGetAccInfoServ?.StreetPrefix;
                            appSession.appSessionObj.zgServiceStreet = customerDetails?.ZGGetAccInfoServ?.Street;
                            appSession.appSessionObj.zgServiceSupplement = customerDetails?.ZGGetAccInfoServ?.Supplement;
                            appSession.appSessionObj.zgServiceStreetType = customerDetails?.ZGGetAccInfoServ?.StreetType;
                            appSession.appSessionObj.zgServiceStreetPostfix = customerDetails?.ZGGetAccInfoServ?.StreetPostfix;
                            appSession.appSessionObj.zgServiceCity = customerDetails?.ZGGetAccInfoServ?.City;
                            appSession.appSessionObj.zgServiceState = customerDetails?.ZGGetAccInfoServ?.State;
                            appSession.appSessionObj.zGServiceZipCode = customerDetails?.ZGGetAccInfoServ?.ZipCode;

                            if (appSession.appSessionObj.multipleAccounts == process.const.STR_True) {
                                if (appSession.appSessionObj.callingModePhoneNo == process.const.STR_True) {
                                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AuthMethodANIAddress);
                                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700710);
                                    appSession.appSessionObj.authMethod = process.const.STR_Addr;
                                }
                                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AuthMethodANIMatch);
                                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700705);
                                appSession.appSessionObj.authMethod = process.const.STR_ANI;
                                appSession.appSessionObj.aniIdentified = process.const.STR_True;
                            }
                            else {
                                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AuthMethodAccountNum);
                                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700715);
                                appSession.appSessionObj.authMethod = process.const.STR_Acct;
                            }

                            appSession.appSessionObj.authenticated = process.const.STR_True;
                            appSession.appSessionObj.multipleAccounts = process.const.STR_False;
                            appSession.appSessionObj.couldNotIdentify = process.const.STR_False;
                            appSession.appSessionObj.idByAcct = process.const.STR_True;
                            if (appSession.appSessionObj.premiseType == process.const.STR_NR) {
                                appSession.appSessionObj.bizrez = process.const.STR_Commercial;
                                appSession.appSessionObj.type = process.const.STR_2;
                                appSession.appSessionObj.bizRez = appSession.appSessionObj.bizrez;
                                appSession.appSessionObj.customerTypeCode = process.const.STR_BC;
                                appSession.nextIntent = process.const.AU104;
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
                                appSession.appSessionObj.type = process.const.STR_1;
                                appSession.appSessionObj.bizrez = process.const.STR_Residential;
                                appSession.appSessionObj.bizRez = appSession.appSessionObj.bizrez;
                                appSession.appSessionObj.customerTypeCode = process.const.STR_IC;
                                if (appSession.appSessionObj.sapVerificationSw == process.const.STR_True) {
                                    if ((appSession.appSessionObj.ANI == appSession.appSessionObj.cellPhone &&
                                        appSession.appSessionObj.authMethod == process.const.STR_ANI || appSession.appSessionObj.getPhoneNumber == appSession.appSessionObj.cellPhone)) {
                                        appSession.appSessionObj.callingMode = "AccountNumber";
                                        await ivaHelper.AuthVerficationToSAP(appSession.appSessionObj.getAccountNumber, intentRequest, callback);
                                        return;
                                    }
                                    appSession.nextIntent = process.const.AU104;
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
                                    appSession.nextIntent = process.const.AU104;
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
                        else {
                            //---------PUT CXI Keys-------------------------------------------
                            WS03Details.statusCode = I_DG_06_006_ResObj.status;
                            WS03Details.apiStateResult = "Success";
                            WS03Details.errorMessage = "";
                            cxiSession.cxiSessionObj.cxiAPIDetails.push(WS03Details);
                            //-----------------------------------------------------
                            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
                            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MainMenu);
                            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HoldOn);
                            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_AccountNumber);
                            let AccountNumberSlot = process.const.STR_AccountNumber;
                            appSession.nextIntent = process.const.AU103;
                            appSession.appSessionObj.multipleAccounts = process.const.STR_False;
                            appSession.appSessionObj.couldNotIdentify = process.const.STR_True;
                            appSession.appSessionObj.authenticated = process.const.STR_False;
                            appSession.appSessionObj.accountNumberCtr = appSession.appSessionObj.accountNumberCtr == undefined || appSession.appSessionObj.accountNumberCtr == "undefined" ?
                                0 : appSession.appSessionObj.accountNumberCtr;
                            let ctr = parseInt(appSession.appSessionObj.accountNumberCtr, 10);
                            ctr++;
                            appSession.appSessionObj.accountNumberCtr = ctr;
                            if (appSession.appSessionObj.accountNumberCtr > 2 || appSession.appSessionObj.accountNumberCtr > "2") {
                                if (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_Moving || appSession.callerGoal == process.const.CG_Fumigation || appSession.callerGoal == process.const.CG_NewConstruction) {
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
                                } else if (appSession.callerGoal == process.const.CG_TailorTreatmentPrediction) {
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
                            appSession.appSessionObj[AccountNumberSlot + "Count"] = 0;
                            appSession.appSessionObj[AccountNumberSlot + "Retry"] = appSession.appSessionObj[AccountNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[AccountNumberSlot + "Retry"];
                            promptOut = process.promptSession.scg_ccc_prmt_7006_auth_14_AccountNumberNotMatch;
                            promptOut += appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                                process.promptSession.scg_ccc_collect_7006_auth_01_AccountNumberMS : process.promptSession.scg_ccc_collect_7006_auth_02_AccountNumber;
                            activeContexts = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_NewCustomer) : activeContexts;
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
                    }
                //}
            }
            else {
                appSession.appSessionObj.multipleAccounts = process.const.STR_False;
                const customerDetailsObj = {};
                customerDetailsObj.action = process.const.WS_customerDetailsObjAction;
                customerDetailsObj.contractAccount = appSession.appSessionObj.getAccountNumber;
                customerDetailsObj.phoneNumber = "";
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
                    cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_AuthenticationProcessFailure);
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
                else {
                    let customerDetails = I_DG_06_006_ResObj.data;
                    //logger.debug(customerDetails);
                    appSession.appSessionObj.returnType = customerDetails?.ZGMessage?.results?.[0]?.Type;
                    let customerDetailsReturnId = customerDetails?.ZGMessage?.results?.[0]?.Id;
                    appSession.appSessionObj.customerDetailsReturnId = customerDetailsReturnId == undefined ? customerDetailsReturnId : customerDetailsReturnId.trim();
                    if (appSession.appSessionObj.returnType == "S" && (appSession.appSessionObj.customerDetailsReturnId == "10" || appSession.appSessionObj.customerDetailsReturnId == "010")) {//|| appSession.appSessionObj.customerDetailsReturnId != "010"
                        //---------PUT CXI Keys-------------------------------------------
                        WS03Details.statusCode = I_DG_06_006_ResObj.status;
                        WS03Details.apiStateResult = "Success";
                        WS03Details.errorMessage = "";
                        cxiSession.cxiSessionObj.cxiAPIDetails.push(WS03Details);
                        //cxiSession.cxiSessionObj.promptType = "prompt";
                        //-----------------------------------------------------
                        /*let date = new Date();
                        let currentYear = date.getFullYear();
                        let phoneCellVerifiedDt = screenPopRes.screen_pop_data.phoneCellVerifTs;
                        phoneCellVerifiedDt = phoneCellVerifiedDt.slice(0, phoneCellVerifiedDt.indexOf("-"));*/
                        appSession.appSessionObj.accountStatus = customerDetails?.AccountStatus;
                        appSession.appSessionObj.accountCloseDate = customerDetails?.AccountCloseDate;
                        appSession.appSessionObj.accountNickname = customerDetails?.AccountNickname;
                        appSession.appSessionObj.accountStartDate = customerDetails?.AccountStartDate;
                        appSession.appSessionObj.base = customerDetails?.Base;
                        appSession.appSessionObj.cellPhone = customerDetails?.CellPhone;
                        appSession.appSessionObj.currentAmtDue = customerDetails?.CurrentAmtDue;
                        appSession.appSessionObj.currentDueDate = customerDetails?.CurrentDueDate;
                        appSession.appSessionObj.customerName = customerDetails?.CustomerName;
                        appSession.appSessionObj.isAccountOnMya = customerDetails?.IsAccountOnMya;
                        appSession.appSessionObj.isAccountOnCare = customerDetails?.IsAcountOnCare;
                        appSession.appSessionObj.isMedBaselineSw = customerDetails?.IsMedBaselineSw;
                        appSession.appSessionObj.isOnAutopay = customerDetails?.IsOnAutopay;
                        appSession.appSessionObj.isOnPaperless = customerDetails?.IsOnPaperless;
                        appSession.appSessionObj.isOnPayByPhone = customerDetails?.IsOnPayByPhone;
                        appSession.appSessionObj.isGTOneYear = customerDetails?.IsGTOneYear;
                        appSession.appSessionObj.isLHPEligible = customerDetails?.IsLHPEligible;
                        appSession.appSessionObj.isMovedOutGT6M = customerDetails?.IsMovedOutGT6M;
                        appSession.appSessionObj.noOfAccount = customerDetails?.NoOfAccount;
                        appSession.appSessionObj.pastDueAmount = customerDetails?.PastDueAmount;
                        appSession.appSessionObj.pastDueDate = customerDetails?.PastDueDate;
                        appSession.appSessionObj.pendingCsoCount = customerDetails?.PendingCsoCount;
                        appSession.appSessionObj.phoneNoLastVerifiedDate = customerDetails?.PhoneNoLastVerifiedDate;
                        appSession.appSessionObj.screenPopCellPhoneVerified = ivaHelper.CellPhoneTimeStampVerification(appSession.appSessionObj.phoneNoLastVerifiedDate,appSession);
                        appSession.appSessionObj.premiseType = customerDetails?.PremiseType;
                        appSession.appSessionObj.recentPaymentDate = customerDetails?.RecentPaymentDate;
                        appSession.appSessionObj.spouseName = customerDetails?.SpouseName;
                        appSession.appSessionObj.totalAmountDue = customerDetails?.TotalAmountDue;
                        appSession.appSessionObj.totalBalance = customerDetails?.TotalBalance;
                        appSession.appSessionObj.disconnectionInd = customerDetails?.DisconnectionInd;
                        appSession.appSessionObj.type = customerDetails?.Type;
                        appSession.appSessionObj.houseNumber = customerDetails?.ZGGetAccInfoAddr?.results?.[0]?.HouseNumber; //TODO: need to get all the house numbers from this array, not just the first one, if NoOfAccount > 1
                        appSession.appSessionObj.streetName = customerDetails?.ZGGetAccInfoAddr?.results?.[0]?.StreetName;
                        appSession.appSessionObj.contractAccount =
                            appSession.appSessionObj.noOfAccount.trim() === "1"
                                ? customerDetails?.ContractAccount
                                : customerDetails?.ZGGetAccInfoAddr?.results?.[0]?.ContractAccount; //TODO: need to get all the contract accounts from this array, not just the first one, if NoOfAccount > 1
                        appSession.appSessionObj.businessPartner = customerDetails?.BusinessPartner;
                        appSession.appSessionObj.telePhone = customerDetails?.TelePhone;
                        appSession.appSessionObj.zipCode = customerDetails?.ZipCode;
                        appSession.appSessionObj.zgMailingAddress = customerDetails?.ZGGetAccInfoMail?.MailingAddress;
                        appSession.appSessionObj.zgAddressType = customerDetails?.ZGGetAccInfoMail?.AddressType;
                        appSession.appSessionObj.zgCareOf = customerDetails?.ZGGetAccInfoMail?.CareOf;
                        appSession.appSessionObj.zgPOBox = customerDetails?.ZGGetAccInfoMail?.POBox;
                        appSession.appSessionObj.zgHouseNumber = customerDetails?.ZGGetAccInfoMail?.HouseNumber;
                        appSession.appSessionObj.zgStreetPrefix = customerDetails?.ZGGetAccInfoMail?.StreetPrefix;
                        appSession.appSessionObj.zgStreet = customerDetails?.ZGGetAccInfoMail?.Street;
                        appSession.appSessionObj.zgStreetType = customerDetails?.ZGGetAccInfoMail?.StreetType;
                        appSession.appSessionObj.zgStreetPostfix = customerDetails?.ZGGetAccInfoMail?.StreetPostfix;
                        appSession.appSessionObj.zgSupplement = customerDetails?.ZGGetAccInfoMail?.Supplement;
                        appSession.appSessionObj.zgZipCode = customerDetails?.ZGGetAccInfoMail?.ZipCode;
                        appSession.appSessionObj.zgCity = customerDetails?.ZGGetAccInfoMail?.City;
                        appSession.appSessionObj.zgState = customerDetails?.ZGGetAccInfoMail?.State;
                        appSession.appSessionObj.zgCountry = customerDetails?.ZGGetAccInfoMail?.Country;

                        appSession.appSessionObj.zgServiceAddress = customerDetails?.ZGGetAccInfoServ?.ServiceAddress;
                        appSession.appSessionObj.zgServiceHouseNumber = customerDetails?.ZGGetAccInfoServ?.HouseNumber;
                        appSession.appSessionObj.zgServiceStreetPrefix = customerDetails?.ZGGetAccInfoServ?.StreetPrefix;
                        appSession.appSessionObj.zgServiceStreet = customerDetails?.ZGGetAccInfoServ?.Street;
                        appSession.appSessionObj.zgServiceSupplement = customerDetails?.ZGGetAccInfoServ?.Supplement;
                        appSession.appSessionObj.zgServiceStreetType = customerDetails?.ZGGetAccInfoServ?.StreetType;
                        appSession.appSessionObj.zgServiceStreetPostfix = customerDetails?.ZGGetAccInfoServ?.StreetPostfix;
                        appSession.appSessionObj.zgServiceCity = customerDetails?.ZGGetAccInfoServ?.City;
                        appSession.appSessionObj.zgServiceState = customerDetails?.ZGGetAccInfoServ?.State;
                        appSession.appSessionObj.zGServiceZipCode = customerDetails?.ZGGetAccInfoServ?.ZipCode;
                        if (appSession.appSessionObj.multipleAccounts == process.const.STR_True) {
                            if (appSession.appSessionObj.callingModePhoneNo == process.const.STR_True) {
                                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AuthMethodANIAddress);
                                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700710);
                                appSession.appSessionObj.authMethod = process.const.STR_Addr;
                            }
                            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AuthMethodANIMatch);
                            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700705);

                            appSession.appSessionObj.authMethod = process.const.STR_ANI;
                            appSession.appSessionObj.aniIdentified = process.const.STR_True;
                        }
                        else {
                            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AuthMethodAccountNum);
                            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700715);

                            appSession.appSessionObj.authMethod = process.const.STR_Acct;
                        }
                        appSession.appSessionObj.authenticated = process.const.STR_True;
                        appSession.appSessionObj.multipleAccounts = process.const.STR_False;
                        appSession.appSessionObj.couldNotIdentify = process.const.STR_False;
                        appSession.appSessionObj.idByAcct = process.const.STR_True;
                        if (appSession.appSessionObj.premiseType == process.const.STR_NR) {
                            appSession.appSessionObj.bizrez = process.const.STR_Commercial;
                            appSession.appSessionObj.type = process.const.STR_2;
                            appSession.appSessionObj.bizRez = appSession.appSessionObj.bizrez;
                            appSession.appSessionObj.customerTypeCode = process.const.STR_BC;
                            appSession.nextIntent = process.const.AU104;
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
                            appSession.appSessionObj.type = process.const.STR_1;
                            appSession.appSessionObj.bizrez = process.const.STR_Residential;
                            appSession.appSessionObj.bizRez = appSession.appSessionObj.bizrez;
                            appSession.appSessionObj.customerTypeCode = process.const.STR_IC;
                            if (appSession.appSessionObj.sapVerificationSw == process.const.STR_True) {
                                if ((appSession.appSessionObj.ANI == appSession.appSessionObj.cellPhone &&
                                    appSession.appSessionObj.authMethod == process.const.STR_ANI) || appSession.appSessionObj.getPhoneNumber == appSession.appSessionObj.cellPhone) {
                                    appSession.appSessionObj.callingMode = "AccountNumber";
                                    await ivaHelper.AuthVerficationToSAP(appSession.appSessionObj.getAccountNumber, intentRequest, callback);
                                    return;
                                }
                                appSession.nextIntent = process.const.AU104;
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
                                appSession.nextIntent = process.const.AU104;
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
                    else {
                        //---------PUT CXI Keys-------------------------------------------
                        WS03Details.statusCode = I_DG_06_006_ResObj.status;
                        WS03Details.apiStateResult = "Failure";
                        WS03Details.errorMessage = "";
                        cxiSession.cxiSessionObj.cxiAPIDetails.push(WS03Details);
                        //-----------------------------------------------------
                        activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
                        activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MainMenu);
                        activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HoldOn);
                        activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_AccountNumber);
                        let AccountNumberSlot = process.const.STR_AccountNumber;
                        appSession.nextIntent = process.const.AU103;
                        appSession.appSessionObj.multipleAccounts = process.const.STR_False;
                        appSession.appSessionObj.couldNotIdentify = process.const.STR_True;
                        appSession.appSessionObj.authenticated = process.const.STR_False;
                        appSession.appSessionObj.accountNumberCtr = appSession.appSessionObj.accountNumberCtr == undefined || appSession.appSessionObj.accountNumberCtr == "undefined" ?
                            0 : appSession.appSessionObj.accountNumberCtr;
                        let ctr = parseInt(appSession.appSessionObj.accountNumberCtr, 10);
                        ctr++;
                        appSession.appSessionObj.accountNumberCtr = ctr;
                        if (appSession.appSessionObj.accountNumberCtr > 2 || appSession.appSessionObj.accountNumberCtr > "2") {
                            appSession.appSessionObj.accountNumberCtr = 0;
                            if (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_Moving || appSession.callerGoal == process.const.CG_Fumigation || appSession.callerGoal == process.const.CG_NewConstruction) {
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
                            } else if (appSession.callerGoal == process.const.CG_TailorTreatmentPrediction) {
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
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AccountNumberNoMatch);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700615);
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AuthWithAccountNumber);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700600);
                        appSession.appSessionObj[AccountNumberSlot + "Count"] = 0;
                        appSession.appSessionObj[AccountNumberSlot + "Retry"] = appSession.appSessionObj[AccountNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[AccountNumberSlot + "Retry"];
                        promptOut = process.promptSession.scg_ccc_prmt_7006_auth_14_AccountNumberNotMatch;
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
                        //}
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
    Yes
};
