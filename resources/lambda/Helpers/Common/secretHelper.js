const AWS = require('aws-sdk');
const sessionHelper = require("./sessionHelper");
const catchHelper = require("../Common/catchHelper");
const logger = require("../Utilities/logger");
const secretsManager = new AWS.SecretsManager({
  region: process.env.region,
});

let secretCache;
let appSession = sessionHelper.AppSession;

// General helper: fetch secret and parse
const fetchSecret = async () => {
  let secretName = process.env.secretName;
  const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();

  if ("SecretString" in data) {
    secret = data.SecretString;
  } else {
    secret = Buffer.from(data.SecretBinary, "base64").toString("ascii");
  }

  try {
    return JSON.parse(secret);
  } catch {
    return secret; // not JSON
  }
};

const getSecretValue = async function (secretName, intentRequest, callback) {
  //console.info("intentRequest.sessionState.intent.name " + intentRequest?.sessionState?.intent?.name);
  const intentName = intentRequest?.sessionState?.intent?.name;
  //Override secretName if env is int or tst
  if (appSession.appSessionObj.env === "tst" || appSession.appSessionObj.env === "qa" || appSession.appSessionObj.env === "uat"|| appSession.appSessionObj.env === "preprod") {
    secretName = appSession.appSessionObj.env ==="uat"  ?
      "scg-gyyst-uat-wus2-secretmanager-iva-mastersecrets" : "scg-gyyst-qa-wus2-secretmanager-iva-mastersecrets";
  }
  try {
    const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
    if (data && data.SecretString) {
      secretCache = JSON.parse(data.SecretString);
      console.info("Successfully retrieved secret managers values");
    } else {
      console.info("Secret not found or missing SecretString");
    }
    return secretCache;
  } catch (error) {
    catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
  }
};

// main: update secret
const updateSecret = async function (access_token, expires_in, secretName, currentSecret) {

  if (appSession.appSessionObj.env === "tst" || appSession.appSessionObj.env === "qa" || appSession.appSessionObj.env === "uat"|| appSession.appSessionObj.env === "preprod") {
    secretName = appSession.appSessionObj.env ==="uat" ?
      "scg-gyyst-uat-wus2-secretmanager-iva-mastersecrets" : "scg-gyyst-qa-wus2-secretmanager-iva-mastersecrets";
  }

  try {
    // const currentSecret = await fetchSecret();
    // console.log("[DEBUG] Current secret (parsed):", JSON.stringify(currentSecret, null, 2));

    if (access_token) {
      // console.log("[INFO] Updating AccessToken and Timestamp...");
      currentSecret.accessToken = access_token;
      currentSecret.accessTokenGeneratedTimestamp = new Date().toISOString();
      currentSecret.accessTokenExpirationTimestamp = expires_in;
    } else {
      console.warn("[WARN] No token provided. Secret will NOT be updated with new token.");
    }

    // console.log("[DEBUG] Final secret payload to store:", JSON.stringify(currentSecret, null, 2));

    const response = await secretsManager.updateSecret({
      SecretId: secretName,
      SecretString: JSON.stringify(currentSecret),
    }).promise();

    console.log("[SUCCESS] Secret updated successfully. Response metadata:", response);

    return currentSecret; // returning updated secret for downstream use
  } catch (err) {
    console.error("Error updating secret:", err);
    throw err;
  }
};

module.exports = {
  getSecretValue,
  updateSecret,
  fetchSecret
};