const util = require("../../Helpers/Utilities/getLexResponse");
const logger = require("../../Helpers/Utilities/logger");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const catchHelper = require("../../Helpers/Common/catchHelper");
const ssmlMessage = require("../../Helpers/Common/ssmlHelper");
const apiHelper = require("../../Helpers/Common/apiHelper");
const xmlTojson = require("../../Helpers/Common/soapApiReq");
const agentHelper = require("../../Helpers/Common/agentHelper");
const callPath = require("../../Helpers/Common/callPathHelper");

const No = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let activeContexts = [];
    let WS01Details = {};
    try {
        appSession.fallBackCounter = appSession.fallBackCounter > 0 || appSession.fallBackCounter > "0" ? "0" : appSession.fallBackCounter;
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + process.const.STR_Underscore + process.const.SN_No;
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        cxiSession.cxiSessionObj.cxiAPIDetails = [];
        //-----------------------------------------------------
        if (appSession.nextStateName == process.const.NS_CellPhoneCollection) {
            appSession.appSessionObj.cellPhoneCollectionPrompt = "N";
            promptOut = process.promptSession.scg_ccc_prmt_1014_init_05_AddrNotFound;
            promptOut = ssmlMessage.ConvertSSML(promptOut);
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
        else if (appSession.nextStateName == process.const.NS_EmergencyConfirmation) {
            appSession.nextIntent = process.const.AU200;
            appSession.nextStateName = process.const.NS_AIN_Identified;
            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_NotCallingAboutEmergency);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_100455);
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
        else if (appSession.nextStateName == process.const.NS_CellPhoneCollection_AddrFound || appSession.nextStateName == process.const.NS_HomePh_Authenticated) {
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
            WS01Details.apiId = "AU_WS01";
            WS01Details.apiname = "GetBillAcctInfo";
            if (I_DG_02_001_ResObj == null || I_DG_02_001_ResObj == undefined || I_DG_02_001_ResObj.status != 201 || I_DG_02_001_ResObj.status != "201") {
                //---------PUT CXI Keys-------------------------------------------
                WS01Details.statusCode = I_DG_02_001_ResObj == null || I_DG_02_001_ResObj == undefined ? "500" : I_DG_02_001_ResObj.status;
                WS01Details.apiStateResult = "Failure";
                WS01Details.errorMessage = "API Failure";
                cxiSession.cxiSessionObj.cxiAPIDetails.push(WS01Details);
                //------------------------------------------------------------
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ProcessFailureCustomerData);
                if (appSession.callerGoal == process.const.CG_CellNumberCollection) {
                    appSession.appSessionObj.isReturned = process.const.STR_True;
                    appSession.appSessionObj.cellPhoneCollectionPrompt = "N";
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
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ProcessFailureCustomerData);
                if (appSession.callerGoal == process.const.CG_CellNumberCollection) {
                    appSession.appSessionObj.cellPhoneCollectionPrompt = "N";
                    appSession.appSessionObj.isReturned = process.const.STR_True;
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

            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PhoneNumber);
            appSession.nextStateName = process.const.NS_PhoneNumber;
            let PhoneNumberSlot = process.const.STR_PhoneNumber;
            appSession.nextIntent = process.const.AU101;
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_101600);
            appSession.appSessionObj[PhoneNumberSlot + "Retry"] = appSession.appSessionObj[PhoneNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[PhoneNumberSlot + "Retry"];
            promptOut = process.promptSession.scg_ccc_collect_1016_init_01_CellPhnCollection;
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
        else if (appSession.nextStateName == process.const.NS_CellPhnColl_PhoneNumberConfirmation) {
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PhoneNumber);
            let PhoneNumberSlot = process.const.STR_PhoneNumber;
            appSession.nextIntent = process.const.AU101;
            let ctr = parseInt(appSession.appSessionObj.cellPhoneConfirmationCount, 10);
            ctr++;
            appSession.appSessionObj.cellPhoneConfirmationCount = ctr;
            if (appSession.appSessionObj.cellPhoneConfirmationCount > "1") {
                appSession.appSessionObj.UpdContactInfoOperation = "REM";
                appSession.appSessionObj.getPhoneNumber = "0000000000";
                appSession.nextIntent = process.const.AU201;
                appSession.nextStateName = process.const.NS_CellPhnColl_PhoneNumberConfirmation;
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
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_101600);
            appSession.appSessionObj[PhoneNumberSlot + "Count"] = 0;
            appSession.appSessionObj[PhoneNumberSlot + "Retry"] = appSession.appSessionObj[PhoneNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[PhoneNumberSlot + "Retry"];
            promptOut = process.promptSession.scg_ccc_collect_1016_init_01_CellPhnCollection;
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
        else if (appSession.nextStateName == process.const.NS_AIN_Identified) {
            appSession.appSessionObj.aniIdentified = process.const.STR_False;
            appSession.appSessionObj.authenticated = process.const.STR_False;
            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_PhoneNumberDifferentFromANIMatch);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700105);
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PhoneNumber);
            let PhoneNumberSlot = process.const.STR_PhoneNumber;
            appSession.nextIntent = process.const.AU101;
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
        else if (appSession.nextStateName == process.const.NS_StreetNumber_Confirmation || appSession.nextStateName == process.const.NS_StreetNumber_DontHaveIt) {
            let StreetNumberSlot = process.const.STR_StreetNumber;
            appSession.appSessionObj.streetNumberCtr = appSession.appSessionObj.streetNumberCtr == undefined || appSession.appSessionObj.streetNumberCtr == "undefined" ?
                0 : appSession.appSessionObj.streetNumberCtr;
            let ctr = parseInt(appSession.appSessionObj.streetNumberCtr, 10);
            ctr++;
            appSession.appSessionObj.streetNumberCtr = ctr;
            if (appSession.appSessionObj.streetNumberCtr > "2") {
                appSession.appSessionObj.streetNumberCtr = 0;
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_AuthenticationTooManyTries);
                appSession.appSessionObj.couldNotIdentify = process.const.STR_True;
                appSession.appSessionObj.authenticated = process.const.STR_False;
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
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AuthWithStreetNumber);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700400);
                appSession.appSessionObj[StreetNumberSlot + "Count"] = 0;
                promptOut = process.promptSession.scg_ccc_collect_7004_auth_01_StreetNumber;
                cxiSession.cxiSessionObj.promptIdFlag = "Y";
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                //appSession.appSessionObj.multipleAccounts = process.const.STR_True;
                appSession.nextIntent = process.const.AU102;
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_StreetNumber);
                //appSession.appSessionObj[StreetNumberSlot + "Count"] = appSession.appSessionObj[StreetNumberSlot + "Count"] ==
                //    undefined || null ? 0 : appSession.appSessionObj[StreetNumberSlot + "Count"];
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
        }

        else if (appSession.nextStateName == process.const.NS_PhoneNumber_Confirmation) {
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PhoneNumber);
            appSession.appSessionObj.phoneNumberCtr = appSession.appSessionObj.phoneNumberCtr == undefined || appSession.appSessionObj.phoneNumberCtr == "undefined" ?
                0 : appSession.appSessionObj.phoneNumberCtr;
            let ctr = parseInt(appSession.appSessionObj.phoneNumberCtr, 10);
            ctr++;
            appSession.appSessionObj.phoneNumberCtr = ctr;
            if (appSession.appSessionObj.phoneNumberCtr > "2") {
                appSession.appSessionObj.phoneNumberCtr = 0;
                if (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_Fumigation || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_Moving) {
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
                    return agentHelper.AgentTransfer(
                        intentRequest,
                        intentName,
                        promptOut,
                        callback
                    );
                }
            }
            else {
                let PhoneNumberSlot = process.const.STR_PhoneNumber;
                appSession.nextIntent = process.const.AU101;
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AuthWithPhoneNumber);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700200);
                appSession.appSessionObj[PhoneNumberSlot + "Count"] = 0;
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
        }
        else if (appSession.nextStateName == process.const.NS_AccountNumber_Confirmation) {
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MainMenu);
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HoldOn);
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_AccountNumber);
            let AccountNumberSlot = process.const.STR_AccountNumber;
            appSession.nextIntent = process.const.AU103;
            appSession.appSessionObj.accountNumberCtr = appSession.appSessionObj.accountNumberCtr == undefined || appSession.appSessionObj.accountNumberCtr == "undefined" ?
                0 : appSession.appSessionObj.accountNumberCtr;
            let ctr = parseInt(appSession.appSessionObj.accountNumberCtr, 10);
            ctr++;
            appSession.appSessionObj.accountNumberCtr = ctr;
            if (appSession.appSessionObj.accountNumberCtr > "2") {
                appSession.appSessionObj.accountNumberCtr = "0";
                if (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_Fumigation || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_Moving) {
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
                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );
            }
            else {
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AuthWithAccountNumber);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700600);
                appSession.appSessionObj[AccountNumberSlot + "Count"] = 0;
                appSession.appSessionObj[AccountNumberSlot + "Retry"] = appSession.appSessionObj[AccountNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[AccountNumberSlot + "Retry"];
                promptOut = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                    process.promptSession.scg_ccc_collect_7006_auth_01_AccountNumberMS : process.promptSession.scg_ccc_collect_7006_auth_02_AccountNumber;
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
                        AccountNumberSlot
                    )
                );
                return;
            }
        }
    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};

module.exports = {
    No
};
