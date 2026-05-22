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
const now = new Date();
const { isTokenExpired } = require("../Common/getAccessToken");
//const { getSecretValue } = require("../Common/secretHelper");
const { DateTime } = require("luxon");
const timezone = "America/Los_Angeles"; // if need, change timezone here
const { getSecretValue, updateSecret, fetchSecret } = require("../Common/secretHelper");
const { generateToken } = require("../Common/getAccessToken");
const secretManager = require("../Common/secretHelper");
const callPath = require("../Common/callPathHelper");
const xmlTojson = require("../Common/soapApiReq");
const dynamoDBHelper = require("../Common/dynamoDBHelper");

const getRequestObject = async function (SCG_WS_ID, param, intentRequest, intentName, callback) {
    const timeStamp = DateTime.now().setZone(timezone).toISO();
    // appSession.appSessionObj.webServiceId = SCG_WS_ID;
    //logger.info(`${SCG_WS_ID} - Request is being formed`);
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
        const template = allTemplates[SCG_WS_ID];
        const httpsAgent = new https.Agent(allTemplates.httpsAgent);


        if (!template) {
            throw new Error(`No template found for SCG_WS_ID: ${SCG_WS_ID}`);
        }
        // Clone and assign method & timeout
        reqObject.method = template.method || "POST";
        reqObject.body = { ...template.body };
        reqObject.timeout = template.timeout || 20000;

        switch (SCG_WS_ID) {
            case "I_DG_02_001_Get":
                appSession.appSessionObj.webServiceId = "I_DG_02_001 Business Partner-Get";
                reqObject.body.RequestedBy = appSession.appSessionObj.ANI;
                reqObject.body.RequestedTimestamp = timeStamp;
                reqObject.body.RelatedBusinessPartner = param.relatedBusinessPartner;
                reqObject.url = process.env[SCG_WS_ID];
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
                reqObject.body.ZGUpdContactInfo[0].IsPrimaryPhone = param.zGUpdContactInfoIsPrimaryPhone;
                reqObject.body.ZGUpdContactInfo[0].AddressNumber = param.zGUpdContactInfoAddressNumber;
                reqObject.body.ZGUpdContactInfo[0].SequenceNumber = param.zGUpdContactInfoSequenceNumber;
                reqObject.url = process.env[SCG_WS_ID];
                break;
            case "I_DG_02_006_Cancel":
                appSession.appSessionObj.webServiceId = "I_DG_02_006 Cancel Move-Out";
                //reqObject.body.Action = param.action;
                reqObject.body.RequestedBy = appSession.appSessionObj.ANI;
                reqObject.body.RequestedTimestamp = timeStamp;
                reqObject.body.RelatedBusinessPartner = param.relatedBusinessPartner;
                reqObject.body.ContractAccount = param.contractAccount;
                reqObject.body.ZGCancelMIMOItm[0].Contract = param.contract;
                reqObject.body.ZGCancelMIMOItm[0].Type = param.type;
                reqObject.url = process.env[SCG_WS_ID];
                break;
            case "I_DG_03_003_GET":
                appSession.appSessionObj.webServiceId = "I_DG_03_003 Get Charges and Payments-Get Balance";
                //reqObject.body.Action = param.action;
                reqObject.body.RequestedBy = appSession.appSessionObj.ANI;
                reqObject.body.RequestedTimestamp = timeStamp;
                reqObject.body.ZGGetBalAcc[0].ContractAccount = param.contractAccount;
                reqObject.url = process.env[SCG_WS_ID];
                break;
            case "I_DG_02_005_Process":
                appSession.appSessionObj.webServiceId = "I_DG_02_005 Process Move-In Move-Out";
                reqObject.body.RequestedBy = appSession.appSessionObj.ANI;
                reqObject.body.RequestedTimestamp = timeStamp;
                reqObject.body.ContractAccount = param.contractAccount;
                reqObject.body.ZGMovesItem[0].Installation = param.installation;
                reqObject.body.ZGMovesItem[0].MoveOutDate = param.moveOutDate;
                reqObject.body.ZGMovesItem[0].AppointmentDate = param.appointmentDate;
                reqObject.body.ZGMovesItem[0].IsSoNeeded = param.isSoNeeded;
                reqObject.body.ZGMovesItem[0].ZGMovesFwdAddr.IsServiceAddress = param.isServiceAddress;
                reqObject.body.ZGMovesItem[0].ZGMovesFwdAddr.AddressType = param.addressType;
                reqObject.body.ZGMovesItem[0].ZGMovesFwdAddr.HouseNumber = param.houseNumber;
                reqObject.body.ZGMovesItem[0].ZGMovesFwdAddr.StreetPrefix = param.streetPrefix;
                reqObject.body.ZGMovesItem[0].ZGMovesFwdAddr.Street = param.street;
                reqObject.body.ZGMovesItem[0].ZGMovesFwdAddr.StreetType = param.streetType;
                reqObject.body.ZGMovesItem[0].ZGMovesFwdAddr.StreetPostfix = param.streetPostfix;
                reqObject.body.ZGMovesItem[0].ZGMovesFwdAddr.PoBox = param.poBox;
                reqObject.body.ZGMovesItem[0].ZGMovesFwdAddr.Supplement = param.supplement;
                reqObject.body.ZGMovesItem[0].ZGMovesFwdAddr.ZipCode = param.zipCode;
                reqObject.body.ZGMovesItem[0].ZGMovesFwdAddr.City = param.city;
                reqObject.body.ZGMovesItem[0].ZGMovesFwdAddr.State = param.state;
                reqObject.body.ZGMovesItem[0].ZGMovesFwdAddr.Country = param.country;
                reqObject.url = process.env[SCG_WS_ID];
                break;
            case "SAP_DQM":
                appSession.appSessionObj.webServiceId = "SAP_DQM";
                reqObject.body.addressInput.mixed = param.mixed;
                reqObject.body.addressInput.locality = param.locality;
                reqObject.body.addressInput.region = param.region;
                reqObject.body.addressInput.postcode = param.postcode;
                reqObject.url = process.env[SCG_WS_ID];
                break;
            case "I_DG_02_004_GET":
                appSession.appSessionObj.webServiceId = "I_DG_02_004 Get Premise Details and Eligibility-Move Out";
                //reqObject.body.Action = param.action;
                reqObject.body.RequestedBy = appSession.appSessionObj.ANI;
                reqObject.body.RequestedTimestamp = timeStamp;
                reqObject.body.ContractAccount = param.contractAccount;
                reqObject.url = process.env[SCG_WS_ID];
                break;
            case "I_DG_02_012_GET":
                appSession.appSessionObj.webServiceId = "I_DG_02_012 Service Order-Get";
                //reqObject.body.Action = param.action;
                reqObject.body.RequestedBy = appSession.appSessionObj.ANI;
                reqObject.body.RequestedTimestamp = timeStamp;
                reqObject.body.ContractAccount = param.contractAccount;
                reqObject.url = process.env[SCG_WS_ID];
                break;
            case "I_DG_02_015_GET":
                appSession.appSessionObj.webServiceId = "I_DG_02_015-MAT Code Determination-Move Out";
                //reqObject.body.Action = param.action;
                reqObject.body.RequestedBy = appSession.appSessionObj.ANI;
                reqObject.body.RequestedTimestamp = timeStamp;
                reqObject.body.ContractAccount = param.contractAccount;
                reqObject.body.WantedDate = param.wantedDate;
                reqObject.url = process.env[SCG_WS_ID];
                break;
            default:
                throw new Error("Unsupported SCG_WS_ID");
        }
        process.env.apiTrackingId = crypto.randomBytes(16).toString("hex");
        let headers = {
            "Content-Type": "application/json",
            "APITrackingId": process.env.apiTrackingId + "_" + appSession.conversationID,
            Accept: "*/*"
        };


        if (appSession.appSessionObj.env == "qa" || appSession.appSessionObj.env == "tst" || appSession.appSessionObj.env == "uat" || appSession.appSessionObj.env == "preprod") {
            if (SCG_WS_ID == "SAP_DQM") {
                let dqmToken = await getDQMToken(intentRequest, intentName, callback);
                dqmToken = JSON.parse(dqmToken.body);
                headers["Authorization"] = `Bearer ${dqmToken.access_token}`;
            } else {
                headers["x-api-key"] = process.env.vXAPIKey;
                headers["Authorization"] = `Bearer ${process.env.accessToken}`;
            }
        } else {
            headers["x-api-key"] = process.env.xApiKey;
        }

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
        console.log(reqObject);
        appSession.appSessionObj.apiName = appSession.appSessionObj.webServiceId;
        let apiReqTemplate = callPath.apiReqTemplate(appSession.appSessionObj.apiName, reqObject, param);
        console.log(reqObject);
        return reqObject;
    } catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};

const getDQMToken = async function (intentRequest, intentName, callback) {
    console.log("Enter getDQMToken");
    const reqParam = require("../Config/template/apiReqResp.json");
    let options = {};
    options = reqParam["DQM_TOKEN"];
    options.form.client_id = process.env.DQM_client_id;
    options.form.client_secret = process.env.DQM_client_secret;
    options.url = process.env.DQM_TOKEN;
    return getDQMTokenFunc(options, intentRequest, intentName, callback);

}
const getDQMTokenFunc = async function (reqObject, intentRequest, intentName, callback) {

    return new Promise(function (resolve, reject) {
        requestExt(reqObject, function (error, response, body) {
            if (error) {
                logger.error("code:" + error.code);
                if (error.code === "ESOCKETTIMEDOUT") {
                    reject(null);
                }
                else if (error.code === "ETIMEDOUT") {
                    reject(null);
                }
                else {
                    reject(null);
                }
            }
            else {

                resolve(response);
            }
        });
    }).catch((error) => {
        logger.error("Exception: " + error);
    });
}

const getSOAPRequestObject = async function (MS_WS_ID, reqObj, intentRequest, intentName, callback) {
    let inputJson = require("../Config/template/inputJson.json");
    let reqObject = {};
    let soapApiRequest;
    inputJson.UserName = process.env.apiKey;
    inputJson.Password = process.env.apiValue;
    inputJson.AppStateString = reqObj;
    appSession.appSessionObj.webServiceId = MS_WS_ID;
    //logger.info(`${MS_WS_ID} - Request is being formed`);
    try {

        const keyStorePwAsString = process.env.keyStorePw;
        const jksPath = appSession["env"] === "prod" ? "civasocalgascom" : ["uat", "int", "tst", "trng", "preprod"].includes(appSession["env"]) ?
            "qa-civasocalgascom" : `${appSession["env"]}-civasocalgascom`;
        const keyPath = path.join(__dirname, '../Config/certs/' + jksPath);
        const certPath = path.join(__dirname, '../Config/certs/cacerts');
        //console.log("Files in cacerts folder:", fs.readdirSync(path.join(__dirname, "../Config/certs/cacerts")));
        const keyStorePsw = Buffer.from(keyStorePwAsString, 'utf-8').toString();
        const keystore = jks.toPem(
            fs.readFileSync(keyPath),
            keyStorePsw
        );
        const trustStorePwAsString = process.env.trustStorePw;
        const trustStorePsw = Buffer.from(trustStorePwAsString, 'utf-8').toString();
        const truststore = jks.toPem(
            fs.readFileSync(certPath),
            trustStorePsw
        );
        const keyStorePath = appSession["env"] === "prod" ? "civa.socalgas.com" : ["uat", "int", "tst", "trng", "preprod"].includes(appSession["env"]) ?
            "qa-civa.socalgas.com" : `${appSession["env"]}-civa.socalgas.com`;
        const { cert, key } = keystore[keyStorePath];
        const { ca } = truststore[process.env.rootCert];
        const secureContext = tls.createSecureContext({
            key,
            cert,
            ca
        });

        const agent = new https.Agent({
            secureContext, //the custom SSL context
            rejectUnauthorized: true, // Ensure the server's certificate is validated
        });
        switch (MS_WS_ID) {

            case "MS_WS01":
                inputJson.CustomSOAPEnvFileName = "../Config/wsXmlTemplate/CustomerContactService_SMS.xml"; //sms 
                reqObject.headers = {
                    "Content-Type": "text/xml",
                    SOAPAction: "sendOnDemandText"
                };
                break;
            case "MS_WS07":
                inputJson.CustomSOAPEnvFileName = "../Config/wsXmlTemplate/CustomerContactService_SMS.xml"; //sms 
                reqObject.headers = {
                    "Content-Type": "text/xml",
                    SOAPAction: "sendOnDemandText"
                };
                break;
        }
        let fileNameWithExt = inputJson.CustomSOAPEnvFileName.split('/').pop();
        let fileName = fileNameWithExt.split('.').slice(0, -1).join('.');
        appSession.appSessionObj.cxiApiId = fileName;
        // soapApiRequest = MS_WS_ID == "MS_WS07" ? soapApiReqXml.CustomerContactServiceSMS(inputJson) :
        //     MS_WS_ID == "MS_WS09" ? soapApiReqXml.CustomerContactService(inputJson, appSession, intentRequest) : soapApiReqXml.SoapReqXmlUpdate(inputJson);
        soapApiRequest = "MS_WS07" ? soapApiReqXml.CustomerContactServiceSMS(inputJson) : soapApiReqXml.SoapReqXmlUpdate(inputJson);

        //soapApiRequest = MS_WS_ID == "MS_WS01" ? soapApiReqXml.CustomerContactServiceSMS(inputJson) : soapApiReqXml.SoapReqXmlUpdate(inputJson);
        //reqObject.config = {};
        reqObject.body = soapApiRequest;
        reqObject.method = "POST";
        reqObject.url = process.env[MS_WS_ID];
        reqObject.timeout = 20000;
        reqObject.agent = agent;
        reqObject.headers = reqObject.headers
        //API Logging
        appSession.appSessionObj.apiName = reqObject.headers.SOAPAction;
        callPath.apiReqTemplate(appSession.appSessionObj.apiName, reqObject, reqObj);
        return reqObject;
    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }


};


const getResponseObject = async function (reqObject, intentRequest, intentName, callback) {
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
            }
        }
        let apiResTemplate = callPath.apiResTemplate(response, appSession);
        //-------------api details log---------------
        return response;
    }
}
const getSOAPResponseObject = async function (reqObject, intentRequest, intentName, callback) {
    try {

        appSession.appSessionObj.apiRequestStartTime = new Date();//For API Start Time
        return new Promise(function (resolve, reject) {
            requestExt(reqObject, function (error, response, body) {
                if (error) {
                    logger.error("code:" + error.code);
                    if (error.code === "ESOCKETTIMEDOUT") {
                        reject(null);
                    }
                    else if (error.code === "ETIMEDOUT") {
                        reject(null);
                    }
                    else {
                        reject(null);
                    }
                }
                else {
                    let responseObj = xmlTojson.XmlToJson(response.body);
                    appSession.appSessionObj.apiResponseEndTimeInAPIHelper = new Date();
                    appSession.appSessionObj.apiDuration = Math.abs(appSession.appSessionObj.apiResponseEndTimeInAPIHelper - appSession.appSessionObj.apiRequestStartTime);
                    //-------------api details log---------------
                    callPath.apiResTemplate(response, appSession, responseObj);
                    //-------------api details log---------------
                    responseObj = {
                        body: responseObj,
                        statusCode: response.statusCode
                    };
                    resolve(responseObj);
                }
            });
        }).catch((error) => {
            logger.error("Exception: " + error);
        });
    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};


module.exports = {
    getRequestObject, getSOAPRequestObject, getSOAPResponseObject,
    getResponseObject
};