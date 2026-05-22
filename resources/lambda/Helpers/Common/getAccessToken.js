
const https = require('https');
const querystring = require('querystring');
const logger = require("../Utilities/logger");
const callPath = require("./callPathHelper");
const sessionHelper = require("./sessionHelper");

const generateToken = async function (secret) {
  let appSession = sessionHelper.AppSession;
  const postData = querystring.stringify({
    client_id: secret.clientId,
    client_secret: secret.clientSecret,
    grant_type: 'client_credentials',
    scope: 'api://cissaps4-api-external/.default'
  });

  const options = {
    hostname: 'login.microsoftonline.com',
    path: '/a2e7980c-11ea-4838-8f1a-2f497d8c4072/oauth2/v2.0/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  appSession.appSessionObj.apiName = "I_DG_00_000 Generate token";
  let apiReqTemplate = callPath.apiReqTemplate(appSession.appSessionObj.apiName, options);
  return new Promise((resolve, reject) => {
    appSession.appSessionObj.apiRequestStartTime = new Date();//For API Start Time
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const tokenResponse = JSON.parse(data);
          console.log('tokenResponse:', tokenResponse);
          if (tokenResponse.error) {
            console.error("Token error:", tokenResponse);
            return reject(tokenResponse);
          }
          console.log('[INFO] Token generation success');
          appSession.appSessionObj.apiResponseEndTimeInAPIHelper = new Date();
          appSession.appSessionObj.apiDuration = Math.abs(appSession.appSessionObj.apiResponseEndTimeInAPIHelper - appSession.appSessionObj.apiRequestStartTime);
          //console.log('[DEBUG] Access Token:', tokenResponse.access_token);
          let apiResTemplate = callPath.apiResTemplate(response, appSession);
          resolve(tokenResponse);
        } catch (e) {
          console.error('[ERROR] Failed to parse token response:', data);
          reject(new Error('Failed to parse token response'));
        }
      });
    });

    req.on('error', (err) => {
      console.error('[ERROR] Token request failed:', err);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

async function isTokenExpired(accessTokenGeneratedTimestamp, accessTokenExpirationTimestamp) {
  // console.log("accessTokenGeneratedTimestamp : ", accessTokenGeneratedTimestamp);
  // console.log("accessTokenExpirationTimestamp : ", accessTokenExpirationTimestamp);
  // If either value is missing, regenerate token
  if (!accessTokenGeneratedTimestamp || !accessTokenExpirationTimestamp || accessTokenGeneratedTimestamp === "null" || accessTokenExpirationTimestamp.trim() === "null") {
    logger.info("Token timestamp or expiry missing.");
    return "generate";
  }

  // Convert generated timestamp string into milliseconds
  const tokenTime = new Date(accessTokenGeneratedTimestamp).getTime();

  // If timestamp is invalid (wrong format), regenerate token
  if (isNaN(tokenTime)) {
    logger.info("Invalid token timestamp.");
    return "generate";
  }

  // Convert accessTokenExpirationTimestamp string → number
  const expiresInSecondsNum = Number(accessTokenExpirationTimestamp);
  if (isNaN(expiresInSecondsNum) || expiresInSecondsNum <= 0) {
    logger.info("Invalid expiresInSeconds value: " + accessTokenExpirationTimestamp);
    return "generate";
  }

  // Convert everything to minutes with descriptive variable names
  const tokenGeneratedTimeInMinutes = tokenTime / (1000 * 60);          // When token was generated
  const currentTimeInMinutes = Date.now() / (1000 * 60);                // Current time
  const tokenExpiryDurationInMinutes = expiresInSecondsNum / 60;        // Token validity duration

  // Calculate elapsed minutes since token was generated
  const elapsedMinutes = currentTimeInMinutes - tokenGeneratedTimeInMinutes;

  console.info("Elapsed Minutes: " + elapsedMinutes);
  console.info("Token Valid For (Minutes): " + tokenExpiryDurationInMinutes);

  // If elapsed time is greater than or equal to allowed expiry time
  if (elapsedMinutes >= tokenExpiryDurationInMinutes - 10) {
    return "generate"; // Token expired → reload
  }

  // Otherwise token is still valid
  return "valid";
}

module.exports = { isTokenExpired, generateToken };