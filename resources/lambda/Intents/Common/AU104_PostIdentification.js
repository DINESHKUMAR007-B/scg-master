const util = require("../../Helpers/Utilities/getLexResponse");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const ssmlMessage = require("../../Helpers/Common/ssmlHelper");
const logger = require("../../Helpers/Utilities/logger");
const catchHelper = require("../../Helpers/Common/catchHelper");
const agentHelper = require("../../Helpers/Common/agentHelper");
const callPath = require("../../Helpers/Common/callPathHelper");
const apiHelper = require("../../Helpers/Common/apiHelper");
const xmlTojson = require("../../Helpers/Common/soapApiReq");
const PostIdentification = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let WS05Details = {};
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + process.const.STR_Underscore + process.const.SN_PostIdentification;
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        cxiSession.cxiSessionObj.cxiAPIDetails = [];
        //-----------------------------------------------------
        appSession.fallBackCounter = appSession.fallBackCounter >= 1 ? 0 : appSession.fallBackCounter;
        appSession.appSessionObj.fallBackState = process.const.STR_True;
        appSession.appSessionObj.phoneNumberCount = "0";
        if (appSession.appSessionObj.paperlessEnroll == process.const.STR_True) {
            appSession.nextIntent = process.const.MI105;
            appSession.nextBot = process.const.Miscellaneous_Bot;
        } else if (appSession.callerGoal == process.const.CG_NewCustomer || appSession.callerGoal == process.const.CG_StartService ||
            appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_Fumigation) {
            appSession.nextIntent = appSession.callerGoal == process.const.CG_StartService ? process.const.MS101 :
                appSession.callerGoal == process.const.CG_NewConstruction ? process.const.MS104 : appSession.callerGoal == process.const.CG_Fumigation ? process.const.MS500 : process.const.MS300;
            appSession.nextBot = process.const.MainServices_Bot;
        } else if (appSession.callerGoal == process.const.CG_ServiceCheck || appSession.callerGoal == process.const.CG_SeasonalPilotLight || appSession.callerGoal == process.const.CG_ObCallAhead) {
            if (appSession.appSessionObj.turnOffCSO == process.const.STR_True) {
                appSession.bargeIn = process.const.STR_False;
                promptOut = process.promptSession.scg_ccc_prmt_7000_auth_04_CommonHoldOn;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );
            } else {
                appSession.nextIntent = appSession.callerGoal == process.const.CG_ServiceCheck ? process.const.AS102 : process.const.AS511;
                appSession.nextBot = process.const.Appliance_Bot;
            }
        } else if (appSession.callerGoal == process.const.CG_CloseOrder || appSession.callerGoal == process.const.CG_Moving ||
            appSession.callerGoal == process.const.CG_CloseCheck) {
            //For Day-1 Activities-----------------
            if (appSession.appSessionObj.turnOffStopService == process.const.STR_True) {
                appSession.bargeIn = process.const.STR_False;
                promptOut = process.promptSession.scg_ccc_prmt_7000_auth_04_CommonHoldOn;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );
            }
            //----------------------
            else {
                appSession.nextIntent = appSession.callerGoal == process.const.CG_CloseOrder ? process.const.MS400 : appSession.callerGoal == process.const.CG_Moving ?
                    process.const.MS401 : process.const.MS105;
                appSession.nextBot = process.const.MainServices_Bot;
            }
        } else if (appSession.callerGoal == process.const.CG_48hrCallback) {
            appSession.nextIntent = process.const.MI400;
            appSession.nextBot = process.const.Miscellaneous_Bot;
        } else if (appSession.callerGoal == process.const.CG_DirectDebitApplication) {
            //cxiSession.callPath = callPath.CallPath(cxiSession.callPath,process.const.CP_AccountIsEnrolledInDirectDebit);
            appSession.nextIntent = process.const.BP703;
            appSession.nextBot = process.const.Billing_Bot;
        } else if (appSession.callerGoal == process.const.CG_MBL || appSession.callerGoal == process.const.CG_CareCheckEnroll) {
            appSession.nextIntent = process.const.AP301;
            appSession.nextBot = process.const.Programs_Bot;
        } else if (appSession.callerGoal == process.const.CG_GafFindAgency) {
            appSession.nextIntent = process.const.AP408;
            appSession.nextBot = process.const.Programs_Bot;
        } else if (appSession.callerGoal == process.const.CG_CareOther || appSession.callerGoal == process.const.CG_RebateOther || appSession.callerGoal == process.const.CG_MblOther ||
            appSession.callerGoal == process.const.CG_LiheapOther || appSession.callerGoal == process.const.CG_GafOther || appSession.callerGoal == process.const.CG_ProgramsOther) {
            appSession.nextIntent = process.const.AP106;
            appSession.nextBot = process.const.Programs_Bot;
        } else if (appSession.callerGoal == process.const.CG_ArrearageMgmtPrgm) {
            appSession.nextIntent = process.const.BP201;
            appSession.nextBot = process.const.Billing_Bot;
        } else if (appSession.callerGoal == process.const.CG_MblApplication) {
            appSession.nextIntent = process.const.AP300;
            appSession.nextBot = process.const.Programs_Bot;
        } else if (appSession.callerGoal == process.const.CG_TailorTreatmentPrediction) {
            appSession.nextBot = process.const.Authentication_Bot;
            appSession.appSessionObj.isReturned = process.const.STR_True;
        } else if (appSession.callerGoal == process.const.CG_FnpTotAmtDue) {
            appSession.nextIntent = process.const.MS505;
            appSession.nextBot = process.const.MainServices_Bot;
        }/*else if (appSession.callerGoal == process.const.CG_Billing) {

        }*/else if (appSession.callerGoal == process.const.CG_CSO) {
            //For Day-1 Activities-----------------
            if (appSession.appSessionObj.turnOffCSO == process.const.STR_True) {
                appSession.bargeIn = process.const.STR_False;
                promptOut = process.promptSession.scg_ccc_prmt_7000_auth_04_CommonHoldOn;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );
            }
            //-------------------
            else {
                if (appSession.appSessionObj.customerTypeCode == process.const.STR_BC) {
                    return agentHelper.AgentTransfer(
                        intentRequest,
                        intentName,
                        promptOut,
                        callback
                    );
                }
                appSession.nextIntent = process.const.AS101;
                appSession.nextBot = process.const.Appliance_Bot;
            }
        } else if (appSession.callerGoal == process.const.CG_CsoAppl) {
            appSession.nextIntent = process.const.AS111;
            appSession.nextBot = process.const.Appliance_Bot;
        } else if (appSession.callerGoal == process.const.CG_CARE) {

        } else if (appSession.callerGoal == process.const.CG_CAREApplication) {
                appSession.nextIntent = process.const.AP300;
                appSession.nextBot = process.const.Programs_Bot;
                appSession.bargeIn = process.const.STR_False;
                promptOut = process.promptSession.scg_ccc_prmt_7000_auth_04_CommonHoldOn;
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
                
        } else if (appSession.callerGoal == process.const.CG_PaymentArrangement) {
            //For Day-1 Activities-------------------------
            if (appSession.appSessionObj.turnOffPaymentExtension == process.const.STR_True) {
                appSession.bargeIn = process.const.STR_False;
                promptOut = process.promptSession.scg_ccc_prmt_7000_auth_04_CommonHoldOn;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );
            }
            //---------------------
            appSession.nextIntent = process.const.BP103;
            appSession.nextBot = process.const.Billing_Bot;
        } else if (appSession.callerGoal == process.const.CG_AssistancePrograms) {

        } else if (appSession.callerGoal == process.const.CG_VerifyAutoPay) {
            appSession.nextIntent = process.const.BP704;
            appSession.nextBot = process.const.Billing_Bot;
        } else if (appSession.callerGoal == process.const.CG_PayLocation) {
            appSession.appSessionObj.dontKnowZip = process.const.STR_True;
            appSession.appSessionObj.zipCode = appSession.appSessionObj.screenPopZipCode;
            appSession.nextIntent = process.const.BP726;
            appSession.nextBot = process.const.Billing_Bot;
        } else if (appSession.callerGoal == process.const.CG_PayByPhone || appSession.callerGoal == process.const.CG_Balance) {
            appSession.nextIntent = appSession.callerGoal == process.const.CG_Balance ? process.const.BP101 : process.const.BP101;
            appSession.nextBot = process.const.Billing_Bot;
        } else if (appSession.callerGoal == process.const.CG_ChgBankInfo || appSession.callerGoal == process.const.CG_PBPApplication ||
            appSession.callerGoal == process.const.CG_LetterOfCredit || appSession.callerGoal == process.const.CG_ServiceVerification ||
            appSession.callerGoal == process.const.CG_ChgbankInfo) {
            appSession.nextIntent = process.const.BP120;
            appSession.nextBot = process.const.Billing_Bot;
        } else if (appSession.callerGoal == process.const.CG_AMMailer) {
            appSession.nextIntent = process.const.MI110;
            appSession.nextBot = process.const.Miscellaneous_Bot;
        } else if (appSession.callerGoal == process.const.CG_Paperless) {

        } else if (appSession.callerGoal == process.const.CG_SomethingElse) {
            appSession.nextIntent = process.const.MI103;
            appSession.nextBot = process.const.Miscellaneous_Bot;
        } else if (appSession.callerGoal == process.const.CG_InternetQuestions) {
            if (appSession.appSessionObj.appName == process.const.STR_Marketing) {
                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );
            }
            appSession.nextIntent = process.const.MI106;
            appSession.nextBot = process.const.Miscellaneous_Bot;
        } else if (appSession.callerGoal == process.const.CG_PasswordReset) {
            appSession.nextIntent = process.const.MI104;
            appSession.nextBot = process.const.Miscellaneous_Bot;
        } else if (appSession.callerGoal == process.const.CG_PayByPhoneFailure) {
            appSession.nextStateName = process.const.NS_UnableToProcessPayment;
            appSession.nextIntent = process.const.BP908;
            appSession.nextBot = process.const.Billing_Bot;
        }
        else if (appSession.callerGoal == process.const.CG_WebOther || appSession.callerGoal == process.const.CG_MeterOther || appSession.callerGoal == process.const.CG_AmOther) {
            appSession.nextIntent = process.const.MI112;
            appSession.nextBot = process.const.Miscellaneous_Bot;
        } else if (appSession.callerGoal == process.const.CG_AmOptout) {
            appSession.nextIntent = process.const.MI108;
            appSession.nextBot = process.const.Miscellaneous_Bot;
        } else if (appSession.callerGoal == process.const.CG_AmMailerOther || appSession.callerGoal == process.const.CG_AmInfoMailedOther) {
            appSession.nextIntent = process.const.MI111;
            appSession.nextBot = process.const.Miscellaneous_Bot;
        } else if (appSession.callerGoal == process.const.CG_AdvancedMeter) {
            appSession.nextIntent = process.const.MI102;
            appSession.nextBot = process.const.Miscellaneous_Bot;
        } else if (appSession.callerGoal == process.const.CG_AccountNumber) {
            appSession.nextIntent = process.const.BP602;
            appSession.nextBot = process.const.Billing_Bot;
        } else if (appSession.callerGoal == process.const.CG_LargePrint) {
            appSession.nextIntent = process.const.BP502;
            appSession.nextBot = process.const.Billing_Bot;
        } else if (appSession.callerGoal == process.const.CG_Braille) {
            appSession.nextIntent = process.const.BP503;
            appSession.nextBot = process.const.Billing_Bot;
        } else if (appSession.callerGoal == process.const.CG_AdaCompliant) {
            appSession.nextIntent = process.const.BP501;
            appSession.nextBot = process.const.Billing_Bot;
        } else if (appSession.callerGoal == process.const.CG_BillCopy) {
            appSession.nextIntent = process.const.BP402;
            appSession.nextBot = process.const.Billing_Bot;
        } else if (appSession.callerGoal == process.const.CG_AccountSummary) {
            appSession.nextIntent = process.const.BP403;
            appSession.nextBot = process.const.Billing_Bot;
        } else if (appSession.callerGoal == process.const.CG_BillExplanation) {
            appSession.nextIntent = process.const.BP105;
            appSession.nextBot = process.const.Billing_Bot;
        }
        else if (appSession.callerGoal == process.const.CG_AutoPay) {
            appSession.nextIntent = process.const.BP329;
            appSession.nextBot = process.const.Billing_Bot;
        }
        else if (appSession.callerGoal == process.const.CG_LppSignup) {
            appSession.nextIntent = process.const.BP413;
            appSession.nextBot = process.const.Billing_Bot;
        }
        else if (appSession.callerGoal == process.const.CG_LppApplication || appSession.callerGoal == process.const.CG_WinterBill) {
            appSession.nextIntent = process.const.BP414;
            appSession.nextBot = process.const.Billing_Bot;
        } else if (appSession.callerGoal == process.const.CG_WinterBill || appSession.callerGoal == process.const.CG_PbpOther || appSession.callerGoal == process.const.CG_BillCopyOther ||
            appSession.callerGoal == process.const.CG_PayBillOther || appSession.callerGoal == process.const.CG_ManageBillOther || appSession.callerGoal == process.const.CG_ServiceVerificationOther ||
            appSession.callerGoal == process.const.CG_AcctSummaryOther || appSession.callerGoal == process.const.CG_BillingOther || appSession.callerGoal == process.const.CG_WaysToPayOther ||
            appSession.callerGoal == process.const.CG_PayAddressOther || appSession.callerGoal == process.const.CG_BillPrintOther || appSession.callerGoal == process.const.CG_MailAddress || appSession.callerGoal == process.const.CG_Correspondence_address) {
            appSession.nextIntent = process.const.BP106;
            appSession.nextBot = process.const.Billing_Bot;
        } else if (appSession.callerGoal == process.const.CG_Marketing || appSession.callerGoal == process.const.CG_CARERecert) {

        } else if (appSession.callerGoal == process.const.CG_FNPRestore) {
            if (appSession.appSessionObj.fnpMaxAttempt == process.const.STR_True) {
                appSession.appSessionObj.fnpMaxAttempt = process.const.STR_False;
                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );
            }
            appSession.nextIntent = process.const.MS504;
            appSession.nextBot = process.const.MainServices_Bot;
        } else if (appSession.callerGoal == process.const.CG_ArrearageMgmtPrgmFnp) {
            appSession.nextIntent = process.const.MS502;
            appSession.nextBot = process.const.MainServices_Bot;
        } else if (appSession.callerGoal == "null" || appSession.callerGoal == "") {
            return agentHelper.AgentTransfer(
                intentRequest,
                intentName,
                promptOut,
                callback
            );
        } else if (appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_MoveOther || appSession.callerGoal == process.const.CG_ReconnectOther) {
            appSession.nextIntent = process.const.MS106;
            appSession.nextBot = process.const.MainServices_Bot;
        }
        else if (appSession.callerGoal == process.const.CG_PayByPhoneFailure) {
            appSession.nextStateName = process.const.NS_UnableToProcessPayment;
            appSession.nextIntent = process.const.BP908;
            appSession.nextBot = process.const.Billing_Bot;
        }
        else {
            return agentHelper.AgentTransfer(
                intentRequest,
                intentName,
                promptOut,
                callback
            );
        }
        appSession.bargeIn = process.const.STR_False;
        promptOut = process.promptSession.scg_ccc_prmt_7000_auth_04_CommonHoldOn;
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
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};
module.exports = {
    PostIdentification
};
