const sessionHelper = require("./sessionHelper");
const logger = require("../Utilities/logger");
const appSession = sessionHelper.AppSession;
let cxiSession = sessionHelper.CxiSession;
const ExitReason = function (previous, next) {
    if (!previous || previous === "undefined") {
        previous = "CustHangup";
    }
    let result = previous == "CustHangup" ? next : previous + "->" + next;
    return result;
};
const CallPath = function (previous, next) {
    cxiSession.cxiSessionObj.finalCallPath = next;
    if (!previous || previous === "undefined") {
        previous = "CustHangup";
    }
    let result = previous == "CustHangup" ? next : previous + "->" + next;
    return result;
};
const PegPath = function (previous, next) {
    //console.log("previous pegpath",previous);
    logger.info("previous pegpath" + previous + "");

    cxiSession.cxiSessionObj.finalPegPath = next;
    if (!previous || previous === "undefined") {
        previous = "";
    }
    let result = previous == "" ? next : previous + "," + next;
    return result;
};
const getPromptSession = function (value) {
    const session = process.promptSession;

    return Object.keys(session).find(k => session[k] === value) || null;
};
const AgentDesktopData = function (appSession, cxiSession) {
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
    return JSON.stringify(data);
};
const SelfServiceDescription = function (next, appSession) {
    appSession.appSessionObj.ivrDescriptionCount = appSession.appSessionObj.ivrDescriptionCount == undefined ?
        0 : appSession.appSessionObj.ivrDescriptionCount;
    let ctr = parseInt(appSession.appSessionObj.ivrDescriptionCount, 10);
    ctr++;
    appSession.appSessionObj.ivrDescriptionCount = ctr;
    appSession.appSessionObj["ivrDispositionDesc" + appSession.appSessionObj.ivrDescriptionCount] = next;
    appSession.appSessionObj.attr_SelfServicedIntent = appSession.appSessionObj.attr_SelfServicedIntent == undefined ? "" : appSession.appSessionObj.attr_SelfServicedIntent;
    appSession.appSessionObj.attr_SelfServicedIntent = appSession.appSessionObj.attr_SelfServicedIntent + appSession.callerGoal + '-Y,';
    appSession.selfService = process.const.STR_Y;

    appSession.appSessionObj.attr_finalSelfServiceDisposition = next;
    appSession.appSessionObj.attr_selfServicePath = appSession.appSessionObj.attr_selfServicePath == undefined ? "" : appSession.appSessionObj.attr_selfServicePath;
    appSession.appSessionObj.attr_selfServicePath = appSession.appSessionObj.attr_selfServicePath + next + '~';
};
const apiReqTemplate = function (apiName, requestObj, reqObj) {
    let apiReqTemplate;
    if (apiName == "sendOnDemandText") {
        apiReqTemplate = {
            apiName: apiName,
            apiMethod: requestObj?.method || "",
            apiUrl: requestObj?.url || "",
            apiRequestBody: reqObj || ""
        };
    } else if (apiName == "I_DG_00_000 Generate token") {
        apiReqTemplate = {
            apiName: apiName,
            apiMethod: requestObj?.method || "",
            apiUrl: requestObj?.path || "",
            accessTokenExpirationTimestamp: process.env.accessTokenExpirationTimestamp,
            accessTokenGeneratedTimestamp: process.env.accessTokenGeneratedTimestamp
        };
    }
    else {
        apiReqTemplate = {
            apiName: apiName,
            apiMethod: requestObj?.config?.method || "",
            apiUrl: requestObj?.config?.url || "",
            apiRequestBody: requestObj?.body || "",
            timeout: requestObj?.config?.timeout || "",
            apiTrackingId : process.env.apiTrackingId,
            accessTokenExpirationTimestamp: process.env.accessTokenExpirationTimestamp,
            accessTokenGeneratedTimestamp: process.env.accessTokenGeneratedTimestamp
        };
    }
    logger.info(apiReqTemplate);
};
const apiResTemplate = function (responseObj, appSession, responseBody) {
    let apiResTemplate;
    if (appSession.appSessionObj.apiName == "sendOnDemandText") {
        apiResTemplate = {
            ApiName: appSession.appSessionObj.apiName,
            apiResponseCode: responseObj.statusCode,
            apiResponseBody: responseBody,
            ApiDuration: appSession.appSessionObj.apiDuration,
            apiStartTime: appSession.appSessionObj.apiRequestStartTime,
            apiEndTime: appSession.appSessionObj.apiResponseEndTimeInAPIHelper,
            _aws: {
                Timestamp: Date.now(),
                CloudWatchMetrics: [{
                    Namespace: process.env.DashboardNamespace,
                    Dimensions: [[process.const.STR_ApiName]],
                    Metrics: [{ Name: process.const.STR_ApiDuration, Unit: process.const.STR_Milliseconds }]
                }]
            }
        };
    } else if (appSession.appSessionObj.apiName == "I_DG_00_000 Generate token") {
        apiResTemplate = {
            ApiName: appSession.appSessionObj.apiName,
            ApiDuration: appSession.appSessionObj.apiDuration,
            apiStartTime: appSession.appSessionObj.apiRequestStartTime,
            apiEndTime: appSession.appSessionObj.apiResponseEndTimeInAPIHelper,
            apiResponseBody: responseObj,
            _aws: {
                Timestamp: Date.now(),
                CloudWatchMetrics: [{
                    Namespace: process.env.DashboardNamespace,
                    Dimensions: [[process.const.STR_ApiName]],
                    Metrics: [{ Name: process.const.STR_ApiDuration, Unit: process.const.STR_Milliseconds }]
                }]
            }
        };
    }
    else {
        apiResTemplate = {
            ApiName: appSession.appSessionObj.apiName,
            apiStatusCode: responseObj.status,
            apiResponseBody: responseObj.data,
            ApiDuration: appSession.appSessionObj.apiDuration,
            apiStartTime: appSession.appSessionObj.apiRequestStartTime,
            apiEndTime: appSession.appSessionObj.apiResponseEndTimeInAPIHelper,
            error: responseObj.error || "",
            _aws: {
                Timestamp: Date.now(),
                CloudWatchMetrics: [{
                    Namespace: process.env.DashboardNamespace,
                    Dimensions: [[process.const.STR_ApiName]],
                    Metrics: [{ Name: process.const.STR_ApiDuration, Unit: process.const.STR_Milliseconds }]
                }]
            }
        };
    }
    logger.info(apiResTemplate);

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
    data.callPath = cxiSession.callPath || "";
    data.callerGoal = appSession.callerGoal || "";
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
    data.pegPath = cxiSession.pegPath == undefined || cxiSession.pegPath == "undefined" ? "" : cxiSession.pegPath;
    data.attr_finalPegPath = cxiSession.cxiSessionObj.finalPegPath || "";
    data.attr_finalcallpath = cxiSession.cxiSessionObj.finalCallPath || "";
    //Attributes For Mainservice Bot
    data.isReturned = appSession.appSessionObj.isReturned == undefined ? process.const.STR_False : appSession.appSessionObj.isReturned;
    data.multiModelHoldCounter = process.const.MM_HoldCounter;
    data.multiModelType = appSession.appSessionObj.multiModelMainService == undefined ? " " : appSession.appSessionObj.multiModelMainService;
    data.exitReason = cxiSession.exitReason || "";
    data.screenPopCellPhoneVerified = appSession.appSessionObj.cellPhoneVerified == undefined ? appSession.appSessionObj.screenPopCellPhoneVerified :
        appSession.appSessionObj.cellPhoneVerified == process.const.STR_True ? "T" : appSession.appSessionObj.screenPopCellPhoneVerified;
    return JSON.stringify(data);
};
module.exports = {
    CallPath, OutputData, apiResTemplate, apiReqTemplate,
    ExitReason, AgentDesktopData, SelfServiceDescription, PegPath, getPromptSession
};