const xml2js = require('xml2js');
const { DOMParser, XMLSerializer } = require('xmldom');
const parser = new DOMParser();
const serializer = new XMLSerializer();
const fs = require("fs");
const path = require('path');
const sessionHelper = require("./sessionHelper");//stub
const logger = require("../Utilities/logger");
let appSession = sessionHelper.AppSession;//stub

exports.SoapReqXmlUpdate = function (inputJson) {
    let webServicePath = path.join(__dirname, inputJson.CustomSOAPEnvFileName);
    let readXml = fs.readFileSync(webServicePath, 'utf8');
    //console.log("readXml", readXml);
    let header = `<soapenv:Header>
<wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
<wsse:UsernameToken>
<wsse:Username>${inputJson.UserName}</wsse:Username>
<wsse:Password>${inputJson.Password}</wsse:Password>
</wsse:UsernameToken>
</wsse:Security>
</soapenv:Header>`;
    readXml = readXml.replace('<soapenv:Header/>', header);
    //console.log("readXml:\n", readXml);
    const xmlDoc = parser.parseFromString(readXml, "text/xml");
    const bodyNode = xmlDoc.getElementsByTagName("soapenv:Body")[0];

    function updateNodeText(node) {
        if (node.nodeType === 1) {
            const tagName = node.tagName.split(":")[1];
            if (inputJson.AppStateString.hasOwnProperty(tagName)) {
                node.textContent = inputJson.AppStateString[tagName];
            }
            for (let i = 0; i < node.childNodes.length; i++) {
                updateNodeText(node.childNodes[i]);
            }
        }
    }
    updateNodeText(bodyNode);
    const updatedXML = serializer.serializeToString(xmlDoc);
    //console.log("updatedXML:\n", updatedXML);
    //logger.info("updatedXML:\n" + updatedXML);
    return updatedXML;

};
exports.CustomerContactServiceSMS = function(inputJson) {
     let webServicePath = path.join(__dirname, inputJson.CustomSOAPEnvFileName);
     let readXml = fs.readFileSync(webServicePath, 'utf8');
     let header = `<soapenv:Header>
      <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
         <wsse:UsernameToken>
          <wsse:Username>${inputJson.UserName}</wsse:Username>
<wsse:Password>${inputJson.Password}</wsse:Password>
         </wsse:UsernameToken>
      </wsse:Security>
      <emf:EMFHeader soapenv:mustUnderstand="?" soapenv:actor="?">
         <emf:requester/>
         <emf:transactionID/>
         <emf:requestID></emf:requestID>
         <emf:timestamp></emf:timestamp>
         <emf:originatingSystem></emf:originatingSystem>
         <emf:orignatingSentTime></emf:orignatingSentTime>
         <emf:serviceName></emf:serviceName>
         <emf:operationName></emf:operationName>
         <emf:sequenceNumber></emf:sequenceNumber>
         <!--Optional:-->
         <emf:recordID></emf:recordID>
      </emf:EMFHeader>
   </soapenv:Header>`;
   readXml = readXml.replace('<soapenv:Header/>',header);
     const xmlDoc = parser.parseFromString(readXml, "text/xml");
xmlDoc.getElementsByTagName("tex:phoneNumber")[0].textContent = inputJson.AppStateString[0].phoneNumber;
xmlDoc.getElementsByTagName("tex:templateId")[0].textContent = inputJson.AppStateString[0].templateId;
xmlDoc.getElementsByTagName("tex:needTracking")[0].textContent = inputJson.AppStateString[0].needTracking;
xmlDoc.getElementsByTagName("tex:billAccountNumber")[0].textContent = inputJson.AppStateString[0].billAccountNumber;
const dynamicPropertiesNode = xmlDoc.getElementsByTagName("tex:dynamicProperties")[0];
function updateDynamicProperties(node, properties) {
    // Remove all existing dynamicProperty nodes
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }

    // Create and append new dynamicProperty nodes
    properties.slice(1).forEach(property => {
        const dynamicPropertyNode = xmlDoc.createElement("tex:dynamicProperty");

        const propertyKeyNode = xmlDoc.createElement("tex:propertyKey");
        propertyKeyNode.appendChild(xmlDoc.createTextNode(property.propertyKey));

        const propertyValueNode = xmlDoc.createElement("tex:propertyValue");
        propertyValueNode.appendChild(xmlDoc.createTextNode(property.propertyValue));

        dynamicPropertyNode.appendChild(propertyKeyNode);
        dynamicPropertyNode.appendChild(propertyValueNode);

        node.appendChild(dynamicPropertyNode);
    });
}
updateDynamicProperties(dynamicPropertiesNode, inputJson.AppStateString);

const updatedXML = serializer.serializeToString(xmlDoc);
//console.log("updatedXML----->", updatedXML);
//logger.info("updatedXML----->" + updatedXML);
return updatedXML;
};
exports.CustomerContactService = function(inputJson,appSession,intentRequest) {
     let webServicePath = path.join(__dirname, inputJson.CustomSOAPEnvFileName);
     let readXml = fs.readFileSync(webServicePath, 'utf8');
     let header = `<soapenv:Header>
      <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
         <wsse:UsernameToken>
          <wsse:Username>${inputJson.UserName}</wsse:Username>
<wsse:Password>${inputJson.Password}</wsse:Password>
         </wsse:UsernameToken>
      </wsse:Security>
      <emf:EMFHeader soapenv:mustUnderstand="?" soapenv:actor="?">
         <emf:requester/>
         <emf:transactionID>${intentRequest.sessionId}</emf:transactionID>
         <emf:requestID>${appSession.conversationID}</emf:requestID>
         <emf:timestamp>${new Date().toISOString()}</emf:timestamp>
         <emf:originatingSystem>${process.const.WS_ChannelID}</emf:originatingSystem>
         <emf:orignatingSentTime>${new Date().toISOString()}</emf:orignatingSentTime>
         <emf:serviceName>${process.const.WS_EmailServiceName}</emf:serviceName>
         <emf:operationName>${process.const.WS_EmailOperationName}</emf:operationName>
         <emf:sequenceNumber>${process.const.WS_EmailSequenceNumber}</emf:sequenceNumber>
         <!--Optional:-->
         <emf:recordID>?</emf:recordID>
      </emf:EMFHeader>
   </soapenv:Header>`;
   readXml = readXml.replace('<soapenv:Header/>',header);
     const xmlDoc = parser.parseFromString(readXml, "text/xml");
 
       xmlDoc.getElementsByTagName("con:to")[0].textContent = appSession.appSessionObj.emailAddress;//appSession.appSessionObj.emailAddress
       if(appSession.appSessionObj.configEmailAddress){
           //console.log("configEmailAddress",appSession.appSessionObj.configEmailAddress);
       xmlDoc.getElementsByTagName("con:to")[0].textContent = appSession.appSessionObj.configEmailAddress.split("@").includes("scgcontractor.com") == true ? appSession.appSessionObj.configEmailAddress : appSession.appSessionObj.emailAddress;
       }
    xmlDoc.getElementsByTagName("con:templateId")[0].textContent =  appSession.appSessionObj.notificationCode == "163" ? process.const.WS_StopServiceConfigEmailTemplateId : process.const.WS_StopServiceCancelConfigEmailTemplateId;
const dynamicPropertiesNode = xmlDoc.getElementsByTagName("con:dynamicProperties")[0];
function updateDynamicProperties(node, properties) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
    properties.forEach(property => {
        const dynamicPropertyNode = xmlDoc.createElement("con:dynamicProperty");
        const propertyKeyNode = xmlDoc.createElement("con:propertyKey");
        propertyKeyNode.appendChild(xmlDoc.createTextNode(property.propertyKey));
        const propertyValueNode = xmlDoc.createElement("con:propertyValue");
        propertyValueNode.appendChild(xmlDoc.createTextNode(property.propertyValue));
        dynamicPropertyNode.appendChild(propertyKeyNode);
        dynamicPropertyNode.appendChild(propertyValueNode);
        node.appendChild(dynamicPropertyNode);
    });
}

// Update dynamic properties with requestObj.AppStateString
updateDynamicProperties(dynamicPropertiesNode, inputJson.AppStateString);
const updatedXML = serializer.serializeToString(xmlDoc);
//console.log("updatedXML:\n", updatedXML);
//logger.info("updatedXML----->" + updatedXML);
return updatedXML;
};
exports.XmlToJson = function(ResObj) {
    //-----------------------Stub---------------------//
    
    if(appSession.appSessionObj.Stubbing && appSession.appSessionObj.webServiceId != "MS_WS07" && appSession.appSessionObj.webServiceId != "MS_WS09"){
     if(appSession.appSessionObj.Stubbing == "MAIN" || appSession.appSessionObj.Stubbing.split(",").includes("MAIN") == true){
      //if(appSession.appSessionObj.Stubbing == "MAIN"){
      return ResObj;
    }
    }
    
    //-----------------------Stub---------------------//
    let getresult;
    const options = {
        explicitArray: false,
        ignoreAttrs: true,
        trim: true,
        tagNameProcessors: [name => name.replace(/^[^:]+:/, '')]
    };
    xml2js.parseString(ResObj, options, (err, result) => {
        if (err) throw err;
        getresult = result;
    });
    return getresult;

};
