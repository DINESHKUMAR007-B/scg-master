const logger = require("../../../../Helpers/Utilities/logger");
const sessionHelper = require("../../../../Helpers/Common/sessionHelper");
const util = require("../../../../Helpers/Utilities/getLexResponse");
const agentHelper = require("../../../../Helpers/Common/agentHelper");
const catchHelper = require("../../../../Helpers/Common/catchHelper");
const ssmlMessage = require("../../../../Helpers/Common/ssmlHelper");
const callPath = require("../../../../Helpers/Common/callPathHelper");
const NewCustomer = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let activeContexts = [];
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + process.const.STR_STR_Underscore + process.const.SN_NewCustomer;
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        cxiSession.cxiSlotDetails = [];
        //-----------------------------------------------------
        /*const today = new Date(appSession.appSessionObj.currentDate);
        const dayOfWeek = today.getDay();
        let dayArr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        appSession.appSessionObj.day = dayArr[dayOfWeek];
        let hours = today.getHours();
        let minutes = today.getMinutes();
        appSession.bargeIn = process.const.STR_False;
        appSession.appSessionObj.allConnectMfStart = appSession.appSessionObj.allConnectMfStart == "undefined" || appSession.appSessionObj.allConnectMfStart == undefined ?
            "" : appSession.appSessionObj.allConnectMfStart.replace("^", ":");
        appSession.appSessionObj.allConnectMfEnd = appSession.appSessionObj.allConnectMfEnd == "undefined" || appSession.appSessionObj.allConnectMfEnd == undefined ?
            "" : appSession.appSessionObj.allConnectMfEnd.replace("^", ":");
        appSession.appSessionObj.allConnectSatStart = appSession.appSessionObj.allConnectSatStart == "undefined" || appSession.appSessionObj.allConnectSatStart == undefined ?
            "" : appSession.appSessionObj.allConnectSatStart.replace("^", ":");
        appSession.appSessionObj.allConnectSatEnd = appSession.appSessionObj.allConnectSatEnd == "undefined" || appSession.appSessionObj.allConnectSatEnd == undefined ?
            "" : appSession.appSessionObj.allConnectSatEnd.replace("^", ":");
        appSession.appSessionObj.allConnectSunStart = appSession.appSessionObj.allConnectSunStart == "undefined" || appSession.appSessionObj.allConnectSunStart == undefined ?
            "" : appSession.appSessionObj.allConnectSunStart.replace("^", ":");
        appSession.appSessionObj.allConnectSunEnd = appSession.appSessionObj.allConnectSunEnd == "undefined" || appSession.appSessionObj.allConnectSunEnd == undefined ?
            "" : appSession.appSessionObj.allConnectSunEnd.replace("^", ":");
        let currentTime = hours + ":" + minutes;*/
        const today = new Date(appSession.appSessionObj.currentDate);
        const dayArr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        appSession.appSessionObj.day = dayArr[today.getDay()];
        //appSession.bargeIn = process.const?.STR_False || "false";  // fallback if const is undefined
        appSession.bargeIn = process.const.STR_False;
        const cleanTime = (val) => (val && val !== "undefined") ? val.replace("^", ":") : "";

        appSession.appSessionObj.allConnectMfStart = cleanTime(appSession.appSessionObj.allConnectMfStart);
        appSession.appSessionObj.allConnectMfEnd = cleanTime(appSession.appSessionObj.allConnectMfEnd);
        appSession.appSessionObj.allConnectSatStart = cleanTime(appSession.appSessionObj.allConnectSatStart);
        appSession.appSessionObj.allConnectSatEnd = cleanTime(appSession.appSessionObj.allConnectSatEnd);
        appSession.appSessionObj.allConnectSunStart = cleanTime(appSession.appSessionObj.allConnectSunStart);
        appSession.appSessionObj.allConnectSunEnd = cleanTime(appSession.appSessionObj.allConnectSunEnd);

        const currentTime = `${today.getHours()}:${today.getMinutes()}`;
        if (appSession.nextStateName == process.const.NS_FullAddressConfirmation || appSession.nextStateName == process.const.NS_StartServiceProcess || appSession.nextStateName == process.const.NS_StartServiceAddressMenu ||
            appSession.nextStateName == process.const.NS_DiffNumberMenu || appSession.nextStateName == process.const.NS_StartService_DifferentPhoneNumberConfirmation ||
            appSession.nextStateName == process.const.NS_startServiceMaxAttempts || appSession.nextStateName == process.const.NS_ApartmentNumberConfirmation) {
            if (appSession.appSessionObj.newCustomerMaxAttempt == process.const.STR_True) {
                logger.info("newCustomerMaxAttempt == true true in MS300");
                appSession.appSessionObj.newCustomerMaxAttempt = process.const.STR_False;
                if (appSession.appSessionObj.digitalDeflectionClosedHour == "true") {
                    logger.info("digitalDeflectionClosedHour == true true");
                    appSession.appSessionObj.digitalDeflectionClosedHour = process.const.STR_False;
                    return agentHelper.AgentTransfer(
                        intentRequest,
                        intentName,
                        promptOut,
                        callback
                    );
                }
                else if (appSession.appSessionObj.businessHours == "closed" && (appSession.callerGoal == process.const.CG_start_service || appSession.callerGoal == process.const.CG_new_customer)) 
                    {
                    logger.info("businessHours == closed && callerGoal == start_service || new_customer true in MS300");
                    if (appSession.nextStateName == process.const.NS_StartServiceProcess) {

                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_DoNotReceiveTextMessageWithWeblink);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210120);


                    }
                    if (appSession.nextStateName == process.const.NS_DiffNumberMenu) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_tryAgainLaterOrCallBack);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210165);
                    }
                    // console.log("cxiSession.exitReason in MS300 : " ,typeof cxiSession.exitReason);
                    // console.log("cxiSession.exitReason in MS300 : " , cxiSession.exitReason);
                    // console.log("cxiSession.cxiSessionObj in MS300 : " , cxiSession.cxiSessionObj);
                    
                    promptOut = process.promptSession.scg_ccc_prmt_2101_main_21_PhConfNo;
                    promptOut = ssmlMessage.ConvertSSML(promptOut);
                }
               // cxiSession.cxiSessionObj.exitReason = callPath.ExitReason(cxiSession.cxiSessionObj.exitReason, process.const.ER_businessHoursClosed);
                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );
            }
            else {
                if (appSession.appSessionObj.newCustomerAddressCollectedPrompt == process.const.STR_True) {
                    appSession.appSessionObj.newCustomerAddressCollectedPrompt = process.const.STR_False;
                    promptOut = process.promptSession.scg_ccc_prmt_2105_main_24_Address;
                }
                promptOut += process.promptSession.scg_ccc_prmt_2100_main_01_NewConst + process.promptSession.scg_ccc_prmt_2100_main_02_NewConst;

                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CreditPhrasing);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210005);

                appSession.appSessionObj.creditPhraseOffered = process.const.STR_Y;

                if (appSession.callerGoal == process.const.CG_MovingNeedMa || appSession.callerGoal == process.const.CG_moving) {
                    promptOut += process.promptSession.scg_ccc_prmt_2100_main_03_MoveClose;
                    promptOut += process.promptSession.scg_ccc_prmt_2100_main_04_BewareOf;
                    appSession.appSessionObj.safeAccessPhraseOffered = process.const.STR_Y;
                }
                else {
                    promptOut += process.promptSession.scg_ccc_prmt_2100_main_04_BewareOf;
                    appSession.appSessionObj.safeAccessPhraseOffered = process.const.STR_Y;
                }

                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_SafeAccessPhrasing);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210010);

                if (appSession.callerGoal == process.const.CG_new_customer || appSession.callerGoal == process.const.CG_start_service ||
                    appSession.callerGoal == process.const.CG_moving || appSession.callerGoal == process.const.CG_MovingNeedMa) {
                    promptOut += process.promptSession.scg_ccc_prmt_2100_main_05_Rebate;
                    appSession.appSessionObj.carePhraseOffered = process.const.STR_Y;
                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CAREPhrasing);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210015);
                }
                if ((appSession.appSessionObj.allConnectSw == process.const.STR_True) && (appSession.callerGoal == process.const.CG_new_customer || appSession.callerGoal == process.const.CG_start_service ||
                    appSession.callerGoal == process.const.CG_moving || appSession.callerGoal == process.const.CG_MovingNeedMa)) {
                    if (appSession.appSessionObj.day == "Sunday") {
                        if (currentTime >= appSession.appSessionObj.allConnectSunStart && currentTime <= appSession.appSessionObj.allConnectSunEnd) {
                            promptOut += process.promptSession.scg_ccc_prmt_2104_main_01_NoCostServXfer;
                            cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_allConnectOpen);

                        }
                        else {
                            promptOut += process.promptSession.scg_ccc_prmt_2104_main_02_NoCostServXfer;
                            cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_allConnectClosed);
                        }
                        return agentHelper.AgentTransfer(
                            intentRequest,
                            intentName,
                            promptOut,
                            callback
                        );
                    }
                    else {
                        if (appSession.appSessionObj.day == "Saturday") {
                            if (currentTime >= appSession.appSessionObj.allConnectSatStart && currentTime <= appSession.appSessionObj.allConnectSatEnd) {
                                promptOut += process.promptSession.scg_ccc_prmt_2104_main_01_NoCostServXfer;
                                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_allConnectOpen);


                            }
                            else {
                                promptOut += process.promptSession.scg_ccc_prmt_2104_main_02_NoCostServXfer;
                                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_allConnectClosed);
                            }
                            return agentHelper.AgentTransfer(
                                intentRequest,
                                intentName,
                                promptOut,
                                callback
                            );
                        }
                        else {
                            //appSession.appSessionObj.allConnectMfStart = new Date(appSession.appSessionObj.allConnectMfStart);
                            //appSession.appSessionObj.allConnectMfEnd = new Date(appSession.appSessionObj.allConnectMfEnd);

                            if (currentTime >= appSession.appSessionObj.allConnectMfStart && currentTime <= appSession.appSessionObj.allConnectMfEnd) {
                                promptOut += process.promptSession.scg_ccc_prmt_2104_main_01_NoCostServXfer;
                                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_allConnectOpen);
                            }
                            else {
                                promptOut += process.promptSession.scg_ccc_prmt_2104_main_02_NoCostServXfer;
                                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_allConnectClosed);
                            }
                            return agentHelper.AgentTransfer(
                                intentRequest,
                                intentName,
                                promptOut,
                                callback
                            );
                        }

                    }

                }
                else {
                    //appSession.exitReason = appSession.exitReason + appSession.exitReason;
                    return agentHelper.AgentTransfer(
                        intentRequest,
                        intentName,
                        promptOut,
                        callback
                    );
                }




            }
        }

        else {
            //appSession.appSessionObj.type = 1;//HC
            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_NewCustomer);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210000);
            //appSession.appSessionObj.businessHours = "open";//HC
            if (appSession.appSessionObj.type == "2" || appSession.appSessionObj.type == 2) {
                logger.info("type == 2  true in MS300");
                cxiSession.cxiSessionObj.exitReason = callPath.ExitReason(cxiSession.cxiSessionObj.exitReason, process.const.CP_OrganizationCustomer);
                appSession.transfer = true;
                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );
            }
            else {
                logger.info("type == 2  false in MS300");
                if (appSession.appSessionObj.businessHours == "open") {
                    logger.info("businessHours == open true");
                    if (appSession.callerGoal == process.const.CG_start_service || appSession.callerGoal == process.const.CG_new_customer) {

                        if (appSession.appSessionObj.startMmSw == process.const.STR_True && (appSession.appSessionObj.language.toLowerCase() == "english")) {
                            appSession.nextStateName = process.const.NS_StartServiceProcess;
                            appSession.fallBackState = process.const.STR_True;
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
                            promptOut = process.promptSession.scg_ccc_prmt_2100_main_01_NewConst + process.promptSession.scg_ccc_prmt_2100_main_02_NewConst;

                            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CreditPhrasing);
                            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210005);

                            appSession.appSessionObj.creditPhraseOffered = process.const.STR_Y;
                            if (appSession.callerGoal == process.const.CG_MovingNeedMa || appSession.appSessionObj.callerGoal1 == process.const.CG_moving) {
                                promptOut += process.promptSession.scg_ccc_prmt_2100_main_03_MoveClose;
                            }
                            promptOut += process.promptSession.scg_ccc_prmt_2100_main_04_BewareOf;
                            appSession.appSessionObj.safeAccessPhraseOffered = process.const.STR_Y;

                            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_SafeAccessPhrasing);
                            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210010);

                            if (appSession.callerGoal == process.const.CG_new_customer || appSession.callerGoal == process.const.CG_start_service ||
                                appSession.callerGoal == process.const.CG_moving || appSession.callerGoal == process.const.CG_MovingNeedMa) {
                                promptOut += process.promptSession.scg_ccc_prmt_2100_main_05_Rebate;
                                appSession.appSessionObj.carePhraseOffered = process.const.STR_Y;
                                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CAREPhrasing);
                                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210015);
                            }
                            if ((appSession.appSessionObj.allConnectSw == process.const.STR_True) && (appSession.callerGoal == process.const.CG_new_customer || appSession.callerGoal == process.const.CG_start_service ||
                                appSession.callerGoal == process.const.CG_moving || appSession.callerGoal == process.const.CG_MovingNeedMa)) {

                                if (appSession.day == "Sun") {
                                    if (currentTime >= appSession.allConnectSunStart && currentTime <= appSession.allConnectSunEnd) {
                                        promptOut += process.promptSession.scg_ccc_prmt_2104_main_01_NoCostServXfer;
                                        cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_allConnectOpen);

                                    }
                                    else {
                                        promptOut += process.promptSession.scg_ccc_prmt_2104_main_02_NoCostServXfer;
                                        cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_allConnectClosed);
                                    }
                                }
                                else {
                                    if (appSession.day == "Sat") {
                                        if (currentTime >= appSession.allConnectSatStart && currentTime <= appSession.allConnectSatEnd) {
                                            promptOut += process.promptSession.scg_ccc_prmt_2104_main_01_NoCostServXfer;
                                            cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_allConnectOpen);

                                        }
                                        else {
                                            promptOut += process.promptSession.scg_ccc_prmt_2104_main_02_NoCostServXfer;
                                            cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_allConnectClosed);
                                        }
                                    }
                                    else {
                                        if (currentTime >= appSession.allConnectMfStart && currentTime <= appSession.allConnectMfEnd) {
                                            promptOut += process.promptSession.scg_ccc_prmt_2104_main_01_NoCostServXfer;
                                            cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_allConnectOpen);
                                        }
                                        else {
                                            promptOut += process.promptSession.scg_ccc_prmt_2104_main_02_NoCostServXfer;
                                            cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_allConnectClosed);
                                        }
                                    }
                                }
                                return agentHelper.AgentTransfer(
                                    intentRequest,
                                    intentName,
                                    promptOut,
                                    callback
                                );
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
                    }
                    else if (appSession.callerGoal == process.const.CG_new_construction) {
                        promptOut = process.promptSession.scg_ccc_prmt_2100_main_01_NewConst + process.promptSession.scg_ccc_prmt_2100_main_02_NewConst;

                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CreditPhrasing);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210005);

                        appSession.appSessionObj.creditPhraseOffered = process.const.STR_Y;
                        if (appSession.callerGoal == process.const.CG_MovingNeedMa || appSession.callerGoal == process.const.CG_moving) {
                            promptOut += process.promptSession.scg_ccc_prmt_2100_main_03_MoveClose;
                            promptOut += process.promptSession.scg_ccc_prmt_2100_main_04_BewareOf;
                            appSession.appSessionObj.safeAccessPhraseOffered = process.const.STR_Y;
                        }
                        else {
                            promptOut += process.promptSession.scg_ccc_prmt_2100_main_04_BewareOf;
                            appSession.appSessionObj.safeAccessPhraseOffered = process.const.STR_Y;
                        }

                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_SafeAccessPhrasing);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210010);

                        if (appSession.callerGoal == process.const.CG_new_customer || appSession.callerGoal == process.const.CG_start_service ||
                            appSession.callerGoal == process.const.CG_moving || appSession.callerGoal == process.const.CG_MovingNeedMa) {
                            promptOut += process.promptSession.scg_ccc_prmt_2100_main_05_Rebate;
                            appSession.appSessionObj.carePhraseOffered = process.const.STR_Y;
                            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CAREPhrasing);
                            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210015);
                        }
                        if ((appSession.appSessionObj.allConnectSw == process.const.STR_True) && (appSession.callerGoal == process.const.CG_new_customer || appSession.callerGoal == process.const.CG_start_service ||
                            appSession.callerGoal == process.const.CG_moving || appSession.callerGoal == process.const.CG_MovingNeedMa)) {
                            if (appSession.appSessionObj.day == "Sunday") {
                                if (currentTime >= appSession.appSessionObj.allConnectSunStart && currentTime <= appSession.appSessionObj.allConnectSunEnd) {
                                    promptOut += process.promptSession.scg_ccc_prmt_2104_main_01_NoCostServXfer;
                                    cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_allConnectOpen);
                                }
                                else {
                                    promptOut += process.promptSession.scg_ccc_prmt_2104_main_02_NoCostServXfer;
                                    cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_allConnectClosed);
                                }
                                return agentHelper.AgentTransfer(
                                    intentRequest,
                                    intentName,
                                    promptOut,
                                    callback
                                );
                            }
                            else {
                                if (appSession.appSessionObj.day == "Saturday") {
                                    if (currentTime >= appSession.appSessionObj.allConnectSatStart && currentTime <= appSession.appSessionObj.allConnectSatEnd) {
                                        promptOut += process.promptSession.scg_ccc_prmt_2104_main_01_NoCostServXfer;
                                        cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_allConnectOpen);

                                    }
                                    else {
                                        promptOut += process.promptSession.scg_ccc_prmt_2104_main_02_NoCostServXfer;
                                        cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_allConnectClosed);
                                    }
                                    return agentHelper.AgentTransfer(
                                        intentRequest,
                                        intentName,
                                        promptOut,
                                        callback
                                    );
                                }
                                else {
                                    if (currentTime >= appSession.appSessionObj.allConnectMfStart && currentTime <= appSession.appSessionObj.allConnectMfEnd) {
                                        promptOut += process.promptSession.scg_ccc_prmt_2104_main_01_NoCostServXfer;
                                        cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_allConnectOpen);
                                    }
                                    else {
                                        promptOut += process.promptSession.scg_ccc_prmt_2104_main_02_NoCostServXfer;
                                        cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_allConnectClosed);
                                    }
                                    return agentHelper.AgentTransfer(
                                        intentRequest,
                                        intentName,
                                        promptOut,
                                        callback
                                    );
                                }
                            }
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
                        if (appSession.callerGoal == process.const.CG_MovingNeedMa || appSession.callerGoal == process.const.CG_moving) {
                            promptOut += process.promptSession.scg_ccc_prmt_2100_main_03_MoveClose;
                            promptOut += process.promptSession.scg_ccc_prmt_2100_main_04_BewareOf;
                            appSession.appSessionObj.safeAccessPhraseOffered = process.const.STR_Y;
                        }
                        else if (appSession.callerGoal == process.const.CG_new_customer || appSession.callerGoal == process.const.CG_start_service ||
                            appSession.callerGoal == "fumigation" || appSession.callerGoal == process.const.CG_new_construction ||
                            appSession.callerGoal == "close_order") {
                            promptOut += process.promptSession.scg_ccc_prmt_2100_main_04_BewareOf;
                            appSession.appSessionObj.safeAccessPhraseOffered = process.const.STR_Y;
                        }

                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_SafeAccessPhrasing);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210010);

                        if (appSession.callerGoal == process.const.CG_new_customer || appSession.callerGoal == process.const.CG_start_service ||
                            appSession.callerGoal == process.const.CG_moving || appSession.callerGoal == process.const.CG_MovingNeedMa) {
                            promptOut += process.promptSession.scg_ccc_prmt_2100_main_05_Rebate;
                            appSession.appSessionObj.carePhraseOffered = process.const.STR_Y;
                            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CAREPhrasing);
                            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210015);
                        }
                        if ((appSession.appSessionObj.allConnectSw == process.const.STR_True) && (appSession.callerGoal == process.const.CG_new_customer || appSession.callerGoal == process.const.CG_start_service ||
                            appSession.callerGoal == process.const.CG_moving || appSession.callerGoal == process.const.CG_MovingNeedMa)) {
                            if (appSession.appSessionObj.day == "Sunday") {
                                if (currentTime >= appSession.appSessionObj.allConnectSunStart && currentTime <= appSession.appSessionObj.allConnectSunEnd) {
                                    promptOut += process.promptSession.scg_ccc_prmt_2104_main_01_NoCostServXfer;
                                    cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_allConnectOpen);
                                }
                                else {
                                    promptOut += process.promptSession.scg_ccc_prmt_2104_main_02_NoCostServXfer;
                                    cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_allConnectClosed);
                                }
                                return agentHelper.AgentTransfer(
                                    intentRequest,
                                    intentName,
                                    promptOut,
                                    callback
                                );
                            }
                            else {
                                if (appSession.appSessionObj.day == "Saturday") {
                                    if (currentTime >= appSession.appSessionObj.allConnectSatStart && currentTime <= appSession.appSessionObj.allConnectSatEnd) {
                                        promptOut += process.promptSession.scg_ccc_prmt_2104_main_01_NoCostServXfer;
                                        cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_allConnectOpen);

                                    }
                                    else {
                                        promptOut += process.promptSession.scg_ccc_prmt_2104_main_02_NoCostServXfer;
                                        cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_allConnectClosed);
                                    }
                                    return agentHelper.AgentTransfer(
                                        intentRequest,
                                        intentName,
                                        promptOut,
                                        callback
                                    );
                                }
                                else {
                                    if (currentTime >= appSession.appSessionObj.allConnectMfStart && currentTime <= appSession.appSessionObj.allConnectMfEnd) {
                                        promptOut += process.promptSession.scg_ccc_prmt_2104_main_01_NoCostServXfer;
                                        cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_allConnectOpen);
                                    }
                                    else {
                                        promptOut += process.promptSession.scg_ccc_prmt_2104_main_02_NoCostServXfer;
                                        cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_allConnectClosed);
                                    }
                                    return agentHelper.AgentTransfer(
                                        intentRequest,
                                        intentName,
                                        promptOut,
                                        callback
                                    );
                                }
                            }
                        }
                        return agentHelper.AgentTransfer(
                            intentRequest,
                            intentName,
                            promptOut,
                            callback
                        );
                    }
                }
                else {
                    logger.info("businessHours == closed true");
                    if ((appSession.callerGoal == process.const.CG_start_service || appSession.callerGoal == process.const.CG_new_customer) && (appSession.appSessionObj.language.toLowerCase() == "english"))
                         {
                        logger.info("callerGoal is start_service || new_customer && language is english true");
                        logger.info("callerGoal :" + appSession.callerGoal);
                        //console.log("callerGoal : " ,appSession.callerGoal );
                        appSession.nextStateName = process.const.NS_StartServiceProcess;
                        //  appSession.nextIntent = process.const.MS200;
                        appSession.fallBackState = process.const.STR_True;
                        appSession.nextIntent = process.const.MS210;
                        //appSession.bargeIn = process.const.STR_False;
                        //promptOut = process.promptSession.scg_ccc_prmt_2100_main_06_DigitalDeflectionService;
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
                        logger.info("callerGoal is not start_service || new_customer && language is not english true");
                        cxiSession.cxiSessionObj.exitReason = callPath.ExitReason(cxiSession.cxiSessionObj.exitReason, "businessHoursClosed");
                        return agentHelper.AgentTransfer(
                            intentRequest,
                            intentName,
                            promptOut,
                            callback
                        );
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
    NewCustomer
};
