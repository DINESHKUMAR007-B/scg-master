let logger = require("../../Helpers/Utilities/logger");
const catchHelper = require("../Common/catchHelper");
const sessionHelper = require("../Common/sessionHelper");
// dynamoDbHelper.js
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const { getSecretValue, updateSecret, fetchSecret } = require("../Common/secretHelper");
const secretManager = require("../Common/secretHelper");
const { generateToken } = require("../Common/getAccessToken");
const { isTokenExpired } = require("../Common/getAccessToken");
const {
    DynamoDBClient,
    PutItemCommand,
    DeleteItemCommand
} = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({});

const putData = async function (intentRequest) {
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    try {
        let time = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
        const deleteRowForEvery = process.const.DeleteRowForEvery;
        // Current time in seconds (UTC)
        const currentEpochSeconds = Math.floor(Date.now() / 1000);
        // TTL = current time + 15 days (in seconds)
        const epochTime = currentEpochSeconds + deleteRowForEvery * 24 * 60 * 60;
        let dataToWrite = {
            ANI: appSession.appSessionObj.ANI,
            conversationId: appSession.conversationID,
            DNIS: appSession.appSessionObj.DNIS,
            timeStamp: time,
            expirationDate: epochTime,
            selfService: intentRequest.sessionState.sessionAttributes.selfService,
            lastIntent: intentRequest.sessionState.sessionAttributes.lastIntent,
            callResult: intentRequest.sessionState.sessionAttributes.callResult,
            callerGoal: intentRequest.sessionState.sessionAttributes.callerGoal
        };
        const params = {
            TableName: process.env.CallHistoryDBName,
            Item: dataToWrite
        };
        await dynamoDb.put(params).promise();
        logger.info("Successfully write data to DynamoDb");
    } catch (error) {
        logger.error("Put Data To DynamoDB Error " + error);
        return;
    }
};
const accessTokenLock = async function (intentRequest, callback) {
    let TABLE_NAME = process.env.TokenDynamoDBName;
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    appSession.appSessionObj.TokenDynamoDBName=process.env.TokenDynamoDBName;
    // if (appSession.appSessionObj.env === "tst" || appSession.appSessionObj.env === "qa" || appSession.appSessionObj.env === "uat") {
    //   TABLE_NAME = appSession.appSessionObj.env === "uat" ? "scg-gyyst-uat-wus2-dydb-iva-master-tokentable" : "scg-gyyst-qa-wus2-dydb-iva-master-tokentable";
    // }

    const LOCK_KEY = "ACCESS_TOKEN_LOCK";
    let lockAcquired = false;
    try {
        try {
            await client.send(new PutItemCommand({
                TableName: TABLE_NAME,
                Item: {
                    lockKey: { S: LOCK_KEY },
                    ttl: { N: Math.floor(Date.now() / 1000 + 10).toString() } // 10 sec TTL
                },
                ConditionExpression: "attribute_not_exists(lockKey)"
            }));

            const secret = await secretManager.getSecretValue(process.env.secretName, intentRequest, callback);
            const status = await isTokenExpired(secret.accessTokenGeneratedTimestamp, secret.accessTokenExpirationTimestamp);

            if (status === "generate") {
                lockAcquired = true;
                console.log("lockAcquired ", lockAcquired);
            }
            else {
                logger.info("Token is valid. No lock required.");
                process.env.accessToken = secret.accessToken;
                process.env.accessTokenGeneratedTimestamp = secret.accessTokenGeneratedTimestamp;
                process.env.accessTokenExpirationTimestamp = secret.accessTokenExpirationTimestamp;
                await client.send(new DeleteItemCommand({
                    TableName: TABLE_NAME,
                    Key: {
                        lockKey: { S: LOCK_KEY }
                    }
                }));
                return;
            }
        } catch (err) {
            console.log("Err", err);

            if (err.name === "ConditionalCheckFailedException") {
                lockAcquired = false; // someone else has lock
                console.log("lockAcquired ", lockAcquired);
            } else {
                throw err;
            }
        }

        if (lockAcquired) {
            console.log("I got lock");

            try {

                const secret = await secretManager.getSecretValue(process.env.secretName, intentRequest, callback);
                const token = await generateToken(secret);
                await updateSecret(token.access_token, token.expires_in, process.env.secretName, secret);
                console.log("Generated Token:", token.access_token);
                process.env.accessToken = token.access_token;
                process.env.accessTokenGeneratedTimestamp = new Date().toISOString();
                process.env.accessTokenExpirationTimestamp = token.expires_in;

            }
            finally {

                await client.send(new DeleteItemCommand({
                    TableName: TABLE_NAME,
                    Key: {
                        lockKey: { S: LOCK_KEY }
                    }
                }));

                console.log("Lock released");
            }
            return;
        } else {
            console.log("Waiting for token...");

            let retry = 0;

            while (retry < 3) {
                console.log("While loop ctr ", retry);
                await new Promise(res => setTimeout(res, 300));

                const secret = await getSecretValue(process.env.secretName, intentRequest, callback);

                if (secret) {
                    process.env.accessToken = secret.accessToken;
                    process.env.accessTokenGeneratedTimestamp = secret.accessTokenGeneratedTimestamp;
                    process.env.accessTokenExpirationTimestamp = secret.accessTokenExpirationTimestamp;
                }


                const status = await isTokenExpired(process.env.accessTokenGeneratedTimestamp, process.env.accessTokenExpirationTimestamp);
                if (status != "generate") {
                    console.log("Token not expired in dynamoDB helper");
                    return;
                }
                retry++;
            }
        }
    } catch (error) {
        logger.error("Put Data To DynamoDB Error " + error);
        return;
    }
};
module.exports = { putData, accessTokenLock };