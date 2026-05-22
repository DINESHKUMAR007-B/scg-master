const logger = require("../Utilities/logger");
const catchHelper = require("../Common/catchHelper");
const requestExt = require("request");
const crypto = require("crypto");
const soapApiReqXml = require("./soapApiReq");
const sessionHelper = require("./sessionHelper");
const fs = require("fs");
const path = require('path');
const https = require('https');
const tls = require('tls');
const jks = require('jks-js');
const AWS = require('aws-sdk');//stub
const appSession = sessionHelper.AppSession;//stub
const axios = require("axios");
const { isTokenExpired } = require("../Common/getAccessToken");
//const { getSecretValue } = require("../Common/secretHelper");
const { DateTime } = require("luxon");
const timezone = "America/Los_Angeles"; // if need, change timezone here
const { getSecretValue, updateSecret, fetchSecret } = require("../Common/secretHelper");
const { generateToken } = require("../Common/getAccessToken");
const secretManager = require("../Common/secretHelper");
const callPath = require("../Common/callPathHelper");
const dynamoDBHelper = require("../Common/dynamoDBHelper");
const getRequestObject = async function (AU_WS_ID, param, intentRequest, intentName, callback) {
    const timeStamp = DateTime.now().setZone(timezone).toISO();
    let appSession = sessionHelper.AppSession;
    let apiKey = process.env.vApiKey;
    appSession.appSessionObj.webServiceId = AU_WS_ID;
    //logger.info(`${AU_WS_ID} - Request is being formed`);
    try {
        const status = await isTokenExpired(process.env.accessTokenGeneratedTimestamp, process.env.accessTokenExpirationTimestamp);

        if (status === "generate") {

            logger.info("Generating new token...");
            await dynamoDBHelper.accessTokenLock(intentRequest, callback);
        }
        else {
            logger.info("Token is valid. No action required.");
        }

        let reqObject = {};
        // Load shared apiTemplates.json
        const reqParams = path.join(__dirname, "../Config/template/apiReqResp.json");
        if (!fs.existsSync(reqParams)) {
            throw new Error(`Template JSON file not found: ${reqParams}`);
        }

        const allTemplates = JSON.parse(fs.readFileSync(reqParams, "utf8"));
        const template = allTemplates[AU_WS_ID];
        const httpsAgent = new https.Agent(allTemplates.httpsAgent);

        if (!template) {
            throw new Error(`No template found for SCG_WS_ID: ${AU_WS_ID}`);
        }

        // Clone and assign method & timeout
        reqObject.method = template.method || "POST";
        reqObject.body = { ...template.body };
        reqObject.timeout = template.timeout || 20000;

        // Map body fields manually based on SCG_WS_ID
        switch (AU_WS_ID) {
            case "I_DG_02_001":
                appSession.appSessionObj.webServiceId = "I_DG_02_001 Business Partner-Get";
                reqObject.body.Action = param.action;
                reqObject.body.RelatedBusinessPartner = param.relatedBusinessPartner;
                reqObject.body.RequestedBy = param.requestedBy;
                reqObject.body.RequestedTimestamp = timeStamp;
                reqObject.url = process.env[AU_WS_ID];
                break;
            case "I_DG_02_001_Update":
                appSession.appSessionObj.webServiceId = "I_DG_02_001 Business Partner-Update";
                reqObject.body.RequestedBy = appSession.appSessionObj.ANI;
                reqObject.body.RequestedTimestamp = timeStamp;
                reqObject.body.RelatedBusinessPartner = param.relatedBusinessPartner;
                reqObject.body.ZGUpdContactInfo[0].Operation = param.zGUpdContactInfoOperation;
                reqObject.body.ZGUpdContactInfo[0].Contact = param.zGUpdContactInfoContact;
                reqObject.body.ZGUpdContactInfo[0].PhoneNumberExtension = param.zGUpdContactInfoPhoneNumberExtension;
                reqObject.body.ZGUpdContactInfo[0].PhoneType = param.zGUpdContactInfoPhoneType;
                reqObject.body.ZGUpdContactInfo[0].IsPrimaryPhone = (param.zGUpdContactInfoIsPrimaryPhone === true || param.zGUpdContactInfoIsPrimaryPhone === "true");
                reqObject.body.ZGUpdContactInfo[0].AddressNumber = param.zGUpdContactInfoAddressNumber;
                reqObject.body.ZGUpdContactInfo[0].SequenceNumber = param.zGUpdContactInfoSequenceNumber;
                reqObject.url = process.env[AU_WS_ID];
                break;
            case "I_DG_06_006":
                appSession.appSessionObj.webServiceId = "I_DG_06_006 IVR-Get Account Info-Retrieve Customer Details";
                reqObject.body.Action = param.action;
                reqObject.body.PhoneNumber = param.phoneNumber;
                reqObject.body.ContractAccount = param.contractAccount;
                reqObject.body.RequestedBy = appSession.appSessionObj.ANI;
                reqObject.body.RequestedTimeStamp = timeStamp;
                reqObject.body.CheckDigit = param.checkDigit;
                reqObject.url = process.env[AU_WS_ID];
                break;
            case "I_DG_05_004":
                appSession.appSessionObj.webServiceId = "I_DG_05_004 Common Correspondence Module Interface for External Systems";
                reqObject.body.Action = param.action;
                reqObject.body.RelatedBusinessPartner = param.relatedBusinessPartner;
                reqObject.body.ContractAccount = param.contractAccount;
                reqObject.body.LetterId = param.letterId;
                reqObject.body.Channel = param.channel;
                reqObject.body.RequestedBy = appSession.appSessionObj.ANI;
                reqObject.body.RequestedTimestamp = timeStamp;
                reqObject.body.Language = param.language;
                reqObject.url = process.env[AU_WS_ID];
                break;

        }
        // Final Axios config
        process.env.apiTrackingId = crypto.randomBytes(16).toString("hex");
        let headers = {
            "Content-Type": "application/json",
            "APITrackingId":process.env.apiTrackingId +"_"+appSession.conversationID,
            Accept: "*/*"
        };


        if (appSession.appSessionObj.env == "qa" || appSession.appSessionObj.env == "tst" || appSession.appSessionObj.env == "uat" || appSession.appSessionObj.env == "preprod") {
            headers["x-api-key"] = process.env.vXAPIKey;
            headers["Authorization"] = `Bearer ${process.env.accessToken}`;
        } else {

            headers["x-api-key"] = process.env.xApiKey;
        }
        //console.log("headers : ",headers);
        reqObject.config = {
            method: reqObject.method,
            url: reqObject.url,
            headers,
            timeout: reqObject.timeout,
            httpsAgent: httpsAgent,
            data: reqObject.method === "POST" ? reqObject.body : undefined,
            params: reqObject.method === "GET" ? reqObject.body : undefined,
        };
         //API Logging
         appSession.appSessionObj.apiName = appSession.appSessionObj.webServiceId;
         let apiReqTemplate = callPath.apiReqTemplate(appSession.appSessionObj.apiName, reqObject,param);  
        return reqObject;
    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};

const getResponseObject = async function (reqObject, intentRequest, intentName, callback) {
    try {
        // ---------------------- Axios Call ---------------------- //
        try {
            appSession.appSessionObj.apiRequestStartTime = new Date();//For API Start Time
            const response = await axios(reqObject.config);
            //logger.info(appSession.appSessionObj.webServiceId + " Status : " + response.status);
            // Normalize mock vs real API response
            let responseData = response.data;

            // real API response has `d`
            if (responseData && responseData.d) {
                responseData = responseData.d;
            }
            appSession.appSessionObj.apiResponseEndTimeInAPIHelper = new Date();
            appSession.appSessionObj.apiDuration = Math.abs(appSession.appSessionObj.apiResponseEndTimeInAPIHelper - appSession.appSessionObj.apiRequestStartTime);
            //-------------api details log---------------
            let apiResTemplate = callPath.apiResTemplate(response, appSession);
            //-------------api details log---------------
            return {
                status: response.status,
                data: responseData,
            };
        } catch (error) {
            console.error("Error in API helper:", error);

            // Identify timeout-related axios errors
            const isTimeout =
                error.code === "ECONNABORTED" ||
                error.code === "ESOCKETTIMEDOUT" ||
                error.code === "ETIMEDOUT";

            if (isTimeout) {
                appSession.appSessionObj.apiTimeout = error.code;
            }

            // Use backend status if available, otherwise map timeout to 504 and other failures to 500
            const status = error.response?.status || (isTimeout ? 504 : 500);

            logger.error({
                message: "API call failed",
                status: status,
                url: error.config?.url ?? null,
                method: error.config?.method ?? null,
                errorMessage: error.message ?? null,
                errorCode: error.code ?? null,
                stack: error.stack ?? null
            });
            appSession.appSessionObj.apiResponseEndTimeInAPIHelper = new Date();
            appSession.appSessionObj.apiDuration = Math.abs(appSession.appSessionObj.apiResponseEndTimeInAPIHelper - appSession.appSessionObj.apiRequestStartTime);
            //-------------api details log---------------
            let response = {
                status: status,
                data: error.response?.data ?? null,
                error: {
                    message: error.message ?? null,
                    code: error.code ?? null,
                    isTimeout: isTimeout ?? false
                }}
            let apiResTemplate = callPath.apiResTemplate(response, appSession);
            //-------------api details log---------------
            return response;
        }


    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};

module.exports = {
    getRequestObject,
    getResponseObject
};
