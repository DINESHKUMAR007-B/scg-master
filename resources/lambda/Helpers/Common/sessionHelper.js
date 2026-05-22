// const SetSession = function SetSession(sessionAttributesStr) {
//     let sessionObj = {};
//     if (sessionAttributesStr != null || sessionAttributesStr != undefined || sessionAttributesStr != " ") {
//         if (sessionAttributesStr.length != 0) {
//             let sessionDict = sessionAttributesStr.split("|");

//             Object.keys(sessionDict).forEach(function (kvp) {
//                 let kvpArr = sessionDict[kvp].split(":");
//                 sessionObj[kvpArr[0]] = kvpArr[1];
//             });
//         }
//     }
//     return sessionObj;
// };
const SetSession = function (sessionAttributesStr) {
    let sessionObj = {};

    // Validate input properly
    if (!sessionAttributesStr || sessionAttributesStr.trim() === "") {
        return sessionObj;
    }

    sessionAttributesStr.split("|").forEach(item => {
        const index = item.indexOf(":");

        if (index === -1) {
            return;  // skip invalid item
        }

        const key = item.substring(0, index).trim();
        const value = item.substring(index + 1).trim();

        sessionObj[key] = value;
    });

    return sessionObj;
};
const GetSession = function (sessionObj) {
    let tempObjArr = [];

    Object.keys(sessionObj).forEach(function (key) {
        tempObjArr.push(key + ":" + sessionObj[key]);
    });

    return tempObjArr.join("|").toString();
};


exports.AppSession = {
    appSessionObj: {},
    set attributes(value) {
        this.appSessionObj = SetSession(value);
    },
    get attributes() {
        return GetSession(this.appSessionObj);
    },

    PutAttributes(key, value) {
        this.appSessionObj[key] = value;
    },

    ///----new key added set and get attributes  


    set env(value) {
        this.appSessionObj.env = value;
    },
    get env() {
        return this.appSessionObj.env;
    },
    set conversationID(value) {
        this.appSessionObj.conversationID = value;
    },
    get conversationID() {
        return this.appSessionObj.conversationID;
    },
    set participantID(value) {
        this.appSessionObj.participantID = value;
    },
    get participantID() {
        return this.appSessionObj.participantID;
    },
    set fallBack(value) {
        this.appSessionObj.fallBack = value;
    },
    get fallBack() {
        return this.appSessionObj.fallBack;
    },
    set globalCommandCounter(value) {
        this.appSessionObj.globalCommandCounter = value;
    },
    get globalCommandCounter() {
        return this.appSessionObj.globalCommandCounter;
    },
    set stateName(value) {
        this.appSessionObj.stateName = value;
    },
    get stateName() {
        return this.appSessionObj.stateName;
    },
    set routeMapping(value) {
        this.appSessionObj.routeMapping = value;
    },
    get routeMapping() {
        return this.appSessionObj.routeMapping;
    },
    set fallBackCounter(value) {
        this.appSessionObj.fallBackCounter = value;
    },
    get fallBackCounter() {
        return this.appSessionObj.fallBackCounter;
    },
    set nextStateName(value) {
        this.appSessionObj.nextStateName = value;
    },
    get nextStateName() {
        return this.appSessionObj.nextStateName;
    },
    set preStateName(value) {
        this.appSessionObj.preStateName = value;
    },
    get preStateName() {
        return this.appSessionObj.preStateName;
    },
    set baseLine(value) {
        this.appSessionObj.baseLine = value;
    },
    get baseLine() {
        return this.appSessionObj.baseLine;
    },
    set authenticated(value) {
        this.appSessionObj.authenticated = value;
    },
    get authenticated() {
        return this.appSessionObj.authenticated;
    },
    set transfer(value) {
        this.appSessionObj.transfer = value;
    },
    get transfer() {
        return this.appSessionObj.transfer;
    },
    set selfService(value) {
        this.appSessionObj.selfService = value;
    },
    get selfService() {
        return this.appSessionObj.selfService;
    },
    set disconnect(value) {
        this.appSessionObj.disconnect = value;
    },
    get disconnect() {
        return this.appSessionObj.disconnect;
    },
    set secureTransfer(value) {
        this.appSessionObj.secureTransfer = value;
    },
    get secureTransfer() {
        return this.appSessionObj.secureTransfer;
    },
    set nextBot(value) {
        this.appSessionObj.nextBot = value;
    },
    get nextBot() {
        return this.appSessionObj.nextBot;
    },
    set nextIntent(value) {
        this.appSessionObj.nextIntent = value;
    },
    get nextIntent() {
        return this.appSessionObj.nextIntent;
    },
    set callerGoal(value) {
        this.appSessionObj.callerGoal = value;
    },
    get callerGoal() {
        return this.appSessionObj.callerGoal;
    },
    set audioStartTimeOut(value) {
        this.appSessionObj.audioStartTimeOut = value;
    },
    get audioStartTimeOut() {
        return this.appSessionObj.audioStartTimeOut;
    },
    set dtmfEndTimeOut(value) {
        this.appSessionObj.dtmfEndTimeOut = value;
    },
    get dtmfEndTimeOut() {
        return this.appSessionObj.dtmfEndTimeOut;
    },
    set audioEndTimeOut(value) {
        this.appSessionObj.audioEndTimeOut = value;
    },
    get audioEndTimeOut() {
        return this.appSessionObj.audioEndTimeOut;
    },
    set bargeIn(value) {
        this.appSessionObj.bargeIn = value;
    },
    get bargeIn() {
        return this.appSessionObj.bargeIn;
    },
    set logLevel(value) {
        this.appSessionObj.logLevel = value;
    },
    get logLevel() {
        return this.appSessionObj.logLevel;
    }
};


exports.CxiSession = {
    cxiSessionObj: {},

    set attributes(value) {
        this.cxiSessionObj = SetSession(value);
    },
    get attributes() {
        return GetSession(this.cxiSessionObj);
    },
    PutAttributes(key, value) {
        this.cxiSessionObj[key] = value;
    },
    ///----new key added set and get attributes  

    set selfService(value) {
        this.cxiSessionObj.selfService = value;
    },
    get selfService() {
        return this.cxiSessionObj.selfService;
    },
    set authenticated(value) {
        this.cxiSessionObj.authenticated = value;
    },
    get authenticated() {
        return this.cxiSessionObj.authenticated;
    },
    set exitPoint(value) {
        this.cxiSessionObj.exitPoint = value;
    },
    get exitPoint() {
        return this.cxiSessionObj.exitPoint;
    },
    set exitReason(value) {
        this.cxiSessionObj.exitReason = value;
    },
    get exitReason() {
        return this.cxiSessionObj.exitReason;
    },
    set callResult(value) {
        this.cxiSessionObj.callResult = value;
    },
    get callResult() {
        return this.cxiSessionObj.callResult;
    },
    get callerType() {
        return this.cxiSessionObj.callerType;
    },
    set callerType(value) {
        this.cxiSessionObj.callerType = value;
    },
    get callPath() {
        return this.cxiSessionObj.callPath;
    },
    set callPath(value) {
        this.cxiSessionObj.callPath = value;
    },
    set pegPath(value) {
        this.cxiSessionObj.pegPath = value;
    },
    get pegPath() {
        return this.cxiSessionObj.pegPath;
    }
};

exports.CtiData = {
    ctiDataObj: {},

    ///----new key added set and get attributes
    set attributes(value) {
        this.ctiDataObj = SetSession(value);
    },
    get attributes() {
        return GetSession(this.ctiDataObj);
    },
    PutAttributes(key, value) {
        this.ctiDataObj[key] = value;
    }
};

exports.cxidetailArr = {

    apiDetailarr: [],
    slotDetailarr: [],

    get apiDetails() {

        return this.apiDetailarr;
    },
    set apiDetails(obj) {

        this.apiDetailarr.push(obj);

    },
    get slotDetails() {

        return this.slotDetailarr;
    },
    set slotDetails(obj) {
        this.slotDetailarr.push(obj);
    },
};
