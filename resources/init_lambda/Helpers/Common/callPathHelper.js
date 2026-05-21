const sessionHelper = require("./sessionHelper");
const logger = require("../Utilities/logger");
const appSession = sessionHelper.AppSession;
let cxiSession = sessionHelper.CxiSession;
const ExitReason = function (previous, next) {
    if (previous == undefined) {
        previous = "CustHangup";
    }
    let result = previous == "CustHangup" ? next : previous + "->" + next;
    return result;
};
const CallPath = function (previous, next) {
    cxiSession.cxiSessionObj.finalCallPath = next;
    if (previous == undefined) {
        previous = "CustHangup";
    }
    let result = previous == "CustHangup" ? next : previous + "->" + next;
    return result;
};
const PegPath = function (previous, next) {
    cxiSession.cxiSessionObj.finalPegPath = next;
    if (previous == undefined) {
        previous = "";
    }
    let result = previous == "" ? next : previous + "," + next;
    return result;
};
const getPromptSession = function (value) {
    const session = process.promptSession;

    return Object.keys(session).find(k => session[k] === value) || null;
};
const apiReqTemplate = function (apiName, requestObj, reqObj) {
    let apiReqTemplate;
    if (apiName == "I_DG_00_000 Generate token") {
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
const apiResTemplate = function (responseObj, appSession) {
    let apiResTemplate;
    if (appSession.appSessionObj.apiName == "I_DG_00_000 Generate token") {
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
    } else {
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
module.exports = {
    CallPath, apiResTemplate, apiReqTemplate,
    ExitReason, PegPath, getPromptSession
};