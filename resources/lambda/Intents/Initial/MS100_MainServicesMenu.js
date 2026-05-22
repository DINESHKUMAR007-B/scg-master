const util = require("../../Helpers/Utilities/getLexResponse");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const ssmlMessage = require("../../Helpers/Common/ssmlHelper");
const logger = require("../../Helpers/Utilities/logger");
const catchHelper = require("../../Helpers/Common/catchHelper");
const callPath = require("../../Helpers/Common/callPathHelper");

const MainServicesMenu = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    const outputSessionAttributes = intentRequest.sessionState.sessionAttributes || {};
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    appSession.startTime = util.getStartTime(new Date());

    try {
        appSession.baseLine = process.const.BL_MainServices;
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + "_Menu";
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = process.const.Success;
        cxiSession.cxiSessionObj.promptType = process.const.TypeMenu;
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.cxiSessionObj.exitPoint = appSession.stateName;
        //-----------------------------------------------------
        appSession.fallBackCounter = appSession.fallBackCounter >= 1 ? 0 : appSession.fallBackCounter;
        appSession.fallBackState = process.const.STR_False;
        //Logic For Caller History
        let callerHistoryCGArr = [process.const.CG_moving, process.const.CG_MoveOther, process.const.CG_MovingCloseComplete, process.const.CG_moving_need_owner_info, process.const.CG_moving_need_phone, process.const.CG_moving_need_date, process.const.CG_ResStartMove, process.const.CG_close_order, process.const.CG_CloseOrderNotEligible, process.const.CG_close_order_need_ph_and_ma, process.const.CG_CloseOrderNeedMA, process.const.CG_close_order_need_date, process.const.CG_CloseOrderDeclinedFinalAcceptance, process.const.CG_CloseOrderIssuedBillSentMail, process.const.CG_CloseOrderIssued, process.const.CG_close_order_need_owner_info, process.const.CG_CloseBilled, process.const.CG_CloseNotactive, process.const.CG_close_ci, process.const.CG_close_rm, process.const.CG_close_csr4];
        // let moverArr = [process.const.CG_moving, process.const.CG_MoveOther, process.const.CG_MovingCloseComplete, process.const.CG_moving_need_owner_info, process.const.CG_moving_need_phone, process.const.CG_moving_need_date, process.const.CG_ResStartMove];
        // let stopArr = [process.const.CG_close_order, process.const.CG_CloseOrderNotEligible, process.const.CG_close_order_need_ph_and_ma, process.const.CG_CloseOrderNeedMA, process.const.CG_close_order_need_date, process.const.CG_CloseOrderDeclinedFinalAcceptance, process.const.CG_CloseOrderIssuedBillSentMail, process.const.CG_CloseOrderIssued, process.const.CG_close_order_need_owner_info, process.const.CG_CloseBilled, process.const.CG_CloseNotactive, process.const.CG_close_ci, process.const.CG_close_rm, process.const.CG_close_csr4];
        // console.info(callerHistoryCGArr);
        // console.info((appSession.callerGoal));
        // console.info(callerHistoryCGArr.includes(appSession.callerGoal));
        appSession.appSessionObj.lastIntent = callerHistoryCGArr.includes(appSession.callerGoal) == true ? appSession.appSessionObj.lastIntent : intentName;
        let activeContexts = [];
        if (appSession.appSessionObj.turnOffStopService == "true" && appSession.nextStateName == "DD_stopProcess" ||
            appSession.nextStateName == "DD_moveProcess" || appSession.nextStateName == "DD_checkchangecancelProcess" || appSession.nextStateName == "DD_processNumber") {
            appSession.preStateName = appSession.nextStateName;
            appSession.nextStateName = "DD_processNumber";
            cxiSession.cxiSessionObj.promptType = "prompt";
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Different);
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_SameNumber);
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Repeat);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_220101);
            promptOut = process.promptSession.scg_ccc_menu_2201_main_05_PhNumConfirm_Day1;
            cxiSession.cxiSessionObj.promptIdFlag = "Y";
            promptOut = ssmlMessage.ConvertSSML(promptOut);
            callback(
                util.DialogAction(
                    process.const.DA_ElicitIntentActiveContext,
                    intentRequest,
                    intentName,
                    util.BuildSSMLMessage(promptOut),
                    process.const.STR_Fulfilled,
                    activeContexts,

                )
            );
            return;
        }


        switch (appSession.nextStateName) {
            case process.const.NS_MoveStopMenu:
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MoveStopMenu);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_220000);
                promptOut = process.promptSession.scg_ccc_menu_2200_main_01_MoveStop;
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_StopServiceMenu);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_OtherMatters);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Previous);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Repeat);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MainMenu);
                break;
            case process.const.NS_MoreOptions:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_200001);
                promptOut = process.promptSession.scg_ccc_menu_2000_main_07_ChangeServiceMoreOptions;
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MainServices);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Repeat);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_OtherMatters);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MainMenu);
                break;
            case process.const.NS_Move_PhNumConfirmMenu:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_220101);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_SameNumber);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Different);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Continue);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Repeat);
                promptOut = process.promptSession.scg_ccc_menu_2201_main_05_PhNumConfirm;
                break;
            case process.const.NS_FumigationReconnect_Menu:
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_FumigationRestoreMenu);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_250000);
                promptOut = process.promptSession.scg_ccc_menu_2500_main_01_FumigationReconnect;
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_fumigationMenu);//MS500_Fumigation ,MS501_Reconnect->old
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Reconnect);//MS501_Reconnect -new
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_SecondaryFumigationMenu);//MS504_Restore
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Previous);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MainMenu);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Repeat);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_OtherMatters);
                break;
            case process.const.NS_FNPMenuAMP_SW_true:
                if (appSession.preStateName != appSession.baseLine + "_Repeat") {
                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_FNP);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_250105);
                }
                promptOut = process.promptSession.scg_ccc_menu_2501_main_02_FNPMenu_ampSw;
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_250100);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Reconnect);//MS501_Reconnect -new
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_SecondaryFumigationMenu);//MS504_Restore 
                //activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PayMyBill);//MS410_PayMyBill
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Forgiveness); //MS502_Forgiveness
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Repeat);   //MS203_Repeat
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Previous);//MS204_Previous 
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MainMenu);
                //activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Details);//MS505_Details - new
                break;
            case process.const.NS_FNPMenuAMP_SW_false:
                promptOut = process.promptSession.scg_ccc_menu_2501_main_01_FNP;
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_FNPPayment);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_250105);
                callPath.SelfServiceDescription(process.const.CP_FNPPayment, appSession);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Previous);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_SecondaryFumigationMenu);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PayMyBill);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Repeat);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MainMenu);
                break;
            case process.const.NS_PostFNPMenu:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_250300);
                promptOut = process.promptSession.scg_ccc_menu_2503_main_01_PostFNP;
                //activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_SecondaryFumigationMenu);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Repeat);
                //activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PayMyBill);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_OtherMatters);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MainMenu);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HearDetails);
                //activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Details);//MS505_Details - new
                break;
            case process.const.NS_DiffNumberMenu:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210102);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Yes);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Different);
                promptOut = process.promptSession.scg_ccc_menu_2101_main_09_DiffNumb;
                break;
            case process.const.NS_StartServiceAddressMenu:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210101);
                promptOut = process.promptSession.scg_ccc_menu_2101_main_06_StartServiceAddr;
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Repeat);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_WebLink);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_NewAddress);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HearDetails);
                break;
            case process.const.NS_AnythingElseBill:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232200);
                if (appSession.appSessionObj.language == process.const.LA_English) {
                    activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_SMS);
                }
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Operator);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HearDetails);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MainMenu);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PayMyBill);
                promptOut = process.promptSession.scg_ccc_menu_2322_main_03_AnthingElseBill;
                break;
            case process.const.NS_StopServiceFinalBillAddress:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232300);
                //console.log("zgMailingAddress in Menu MS100: ", appSession.appSessionObj.zgMailingAddress);
                //promptOut = process.promptSession.scg_ccc_menu_2323_main_01_BillMailAddr;
                promptOut = (appSession.appSessionObj.zgMailingAddress !== null && appSession.appSessionObj.zgMailingAddress !== undefined &&
                    appSession.appSessionObj.zgMailingAddress !== "") ? process.promptSession.scg_ccc_menu_2323_main_01_BillMailAddr_New : process.promptSession.scg_ccc_menu_2323_main_01_BillMailAddr;
                
                if (appSession.appSessionObj.zgMailingAddress !== null && appSession.appSessionObj.zgMailingAddress !== undefined &&
                    appSession.appSessionObj.zgMailingAddress !== "") {   
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_ChangeAddress);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_CurrentAddress);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MailingAddress);
                    }
                else{
                        activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_ChangeAddress);
                        activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_CurrentAddress);
                    }
                //promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case process.const.NS_StopServiceExistingCloseMenu:
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_StopExistingServiceMenu);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Previous);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HearDetails);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MainMenu);
                promptOut = process.promptSession.scg_ccc_menu_2328_main_02_StopServExist;
                break;
            case process.const.NS_StopServBilledPendingMenu:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210102);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Previous);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Operator);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Repeat);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MainMenu);
                promptOut = process.promptSession.scg_ccc_menu_2332_main_01_StopSevrBillPending;
                break;
            case process.const.NS_StopServBilledBalanceMenu:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233400);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Previous);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Operator);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Repeat);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PayMyBill);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MainMenu);
                promptOut = process.promptSession.scg_ccc_menu_2334_main_01_StopServBill;
                break;
            case process.const.NS_SendSMSDiffSamePhNo:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233600);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Different);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_SameNumber);
                promptOut = process.promptSession.scg_ccc_menu_2336_main_01_PhNumConfirm;
                break;
            default:
                appSession.callerGoal = process.const.CG_ChangeService;
                appSession.nextStateName = appSession.stateName;
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_ChangeServiceMenu);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_200000);
                promptOut = process.promptSession.scg_ccc_menu_2000_main_01_ChangeService;
                //promptOut = ssmlMessage.ConvertSSML(promptOut);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MainServices);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_OtherMatters);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Repeat);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MoreOptions);
                break;
        }
        cxiSession.cxiSessionObj.promptIdFlag = "Y";
        promptOut = ssmlMessage.ConvertSSML(promptOut);
        callback(
            util.DialogAction(
                process.const.DA_ElicitIntentActiveContext,
                intentRequest,
                intentName,
                util.BuildSSMLMessage(promptOut),
                process.const.STR_Fulfilled,
                activeContexts,

            )
        );
        return;
    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};
module.exports = {
    MainServicesMenu
};
