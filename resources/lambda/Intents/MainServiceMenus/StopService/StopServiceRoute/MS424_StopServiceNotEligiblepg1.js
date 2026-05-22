const util = require("../../../../Helpers/Utilities/getLexResponse");
const sessionHelper = require("../../../../Helpers/Common/sessionHelper");
const ssmlMessage = require("../../../../Helpers/Common/ssmlHelper");
const logger = require("../../../../Helpers/Utilities/logger");
const catchHelper = require("../../../../Helpers/Common/catchHelper");
const apiHelper = require("../../../../Helpers/Common/apiHelper");
const xmlTojson = require("../../../../Helpers/Common/soapApiReq");
const agentHelper = require("../../../../Helpers/Common/agentHelper");
const callPath = require("../../../../Helpers/Common/callPathHelper");
const getDate = require("../../../../Helpers/Common/getDate");
const stopServiceNotEligiblePage2 = require("./MS422_StopServiceNotEligible");
const bargeInNotAllowed = require("../../../Common/MS210_BargeInNotAllowed");
//const StopServEvalDatePg3 = require("./MS426_StopServEvalDate_Pg3");

const StopServiceNotEligiblepg1 = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    appSession.startTime = util.getStartTime(new Date());
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + "_StopServiceNotEligible";
        cxiSession.exitPoint = appSession.stateName;
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + "_CutomerType";
        appSession.bargeIn = process.const.STR_False;
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;

        //-----------------------------------------------------
        //console.log("existingClose in MS424: ", existingClose)
        logger.info("existingClose : " + appSession.appSessionObj.existingClose);
        switch (appSession.appSessionObj.existingClose) {
            case "1001":
                appSession.callerGoal = process.const.CG_close_order;
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ExistingClose1001);
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderNotEligible);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233005);
                appSession.transfer = process.const.STR_True;
                promptOut = process.promptSession.scg_ccc_prmt_2330_main_01_CloseOrder;
                break;
            case "1002":
                appSession.callerGoal = process.const.CG_close_order;
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ExistingClose1002);
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderNotEligible);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233005);
                appSession.transfer = process.const.STR_True;
                promptOut = process.promptSession.scg_ccc_prmt_2330_main_02_CloseOrder;
                break;
            case "1003":
                appSession.callerGoal = process.const.CG_close_order;
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderNotEligible);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233005);
                appSession.transfer = process.const.STR_True;
                promptOut = process.promptSession.scg_ccc_prmt_2330_main_03_CloseOrder;
                break;
            case "1007":
                appSession.callerGoal = process.const.CG_close_order;
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ExistingClose1007);
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderNotEligible);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233005);
                appSession.transfer = process.const.STR_True;
                promptOut = process.promptSession.scg_ccc_prmt_2330_main_04_CloseOrder;
                break;
            case "1008":
                appSession.callerGoal = process.const.CG_close_order;
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ExistingClose1008);
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderNotEligible);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233005);
                appSession.transfer = process.const.STR_True;
                promptOut = process.promptSession.scg_ccc_prmt_2330_main_05_CloseOrder;
                break;
            case "1015":
                appSession.callerGoal = process.const.CG_close_order;
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ExistingClose1015);
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderNotEligible);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233005);
                appSession.transfer = process.const.STR_True;
                promptOut = process.promptSession.scg_ccc_prmt_2330_main_06_CloseOrder;
                break;
            case "1021":
                appSession.callerGoal = process.const.CG_close_order;
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ExistingClose1021);
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderNotEligible);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233005);
                appSession.transfer = process.const.STR_True;
                promptOut = process.promptSession.scg_ccc_prmt_2330_main_07_CloseOrder;
                break;
            case "1042":
                appSession.callerGoal = process.const.CG_close_order;
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ExistingClose1042);
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderNotEligible);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233005);
                appSession.transfer = process.const.STR_True;
                promptOut = process.promptSession.scg_ccc_prmt_2330_main_11_CloseOrder;
                break;
            case "1044":
                appSession.callerGoal = process.const.CG_close_order;
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ExistingClose1044);
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderNotEligible);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233005);
                appSession.transfer = process.const.STR_True;
                promptOut = process.promptSession.scg_ccc_prmt_2330_main_12_CloseOrder;
                break;
            case "1026":
                appSession.callerGoal = process.const.CG_close_ci;
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ExistingClose1026);
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderNotEligible);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233005);
                appSession.transfer = process.const.STR_True;
                promptOut = process.promptSession.scg_ccc_prmt_2330_main_13_CloseOrder;
                break;
            case "1030":
                appSession.callerGoal = process.const.CG_close_order;
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ExistingClose1030);
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderNotEligible);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233005);
                appSession.transfer = process.const.STR_True;
                promptOut = process.promptSession.scg_ccc_prmt_2330_main_14_CloseOrder;
                break;
            case "1033":
                appSession.callerGoal = process.const.CG_close_order;
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ExistingClose1033);
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderNotEligible);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233005);
                appSession.transfer = process.const.STR_True;
                promptOut = process.promptSession.scg_ccc_prmt_2330_main_15_CloseOrder;
                break;
            case "1036":
                appSession.callerGoal = process.const.CG_close_order;
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ExistingClose1036);
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderNotEligible);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233005);
                appSession.transfer = process.const.STR_True;
                promptOut = process.promptSession.scg_ccc_prmt_2330_main_16_CloseOrder;
                break;
            case "1037":
                appSession.callerGoal = process.const.CG_close_order;
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ExistingClose1037);
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderNotEligible);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233005);
                appSession.transfer = process.const.STR_True;
                promptOut = process.promptSession.scg_ccc_prmt_2330_main_17_CloseOrder;
                break;
            case "1038":
                appSession.callerGoal = process.const.CG_close_order;
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ExistingClose1038);
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderNotEligible);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233005);
                appSession.transfer = process.const.STR_True;
                promptOut = process.promptSession.scg_ccc_prmt_2330_main_18_CloseOrder;
                break;
            case "1024":
                return stopServiceNotEligiblePage2.StopServiceNotEligible(intentRequest, callback);
                break;

            case "":
                const startDateStr = appSession?.appSessionObj?.GetPremiseContractStartDate;
                const startDate = new Date(startDateStr);
                appSession.callerGoal = process.const.CG_close_order;
                if (!startDateStr || isNaN(startDate)) {

                    logger.info("calender has NO value in MS424");
                    appSession.callerGoal = process.const.CG_close_order;

                    cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ExistingCloseEmpty);

                    appSession.transfer = process.const.STR_True;
                    promptOut = process.promptSession.scg_ccc_prmt_2330_main_20_CloseOrder;

                } else {
                    startDate.setDate(startDate.getDate() - 1);
                    appSession.appSessionObj.closeDate = startDate.toISOString().split('T')[0];
                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, "“Close date too close to contractStartDate");
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233010);
                    appSession.appSessionObj.dateChg = "Y";
                    logger.info("Previous Date of ContractStartDate: " + appSession.appSessionObj.closeDate);
                    appSession.nextStateName = process.const.NS_StopServNotEligible;
                    return bargeInNotAllowed.BargeInNotAllowed(intentRequest, callback);
                }
                break;
            default:
                appSession.callerGoal = process.const.CG_close_order;
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233005);
                promptOut = process.promptSession.scg_ccc_prmt_2330_main_19_CloseOrder;
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderNotEligible);
                appSession.transfer = process.const.STR_True;
                break;

        }
        promptOut = ssmlMessage.ConvertSSML(promptOut);
        //if (appSession.transfer == process.const.STR_True) {
        //console.log("Transfered from MS424");
        return agentHelper.AgentTransfer(
            intentRequest,
            intentName,
            promptOut,
            callback
        );
        //  }

    }

    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};


module.exports = {
    StopServiceNotEligiblepg1
};
