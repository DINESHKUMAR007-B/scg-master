const xml2js = require('xml2js');
const { DOMParser, XMLSerializer } = require('xmldom');
const parser = new DOMParser();
const serializer = new XMLSerializer();
const fs = require("fs");
const path = require('path');
const logger = require("../Utilities/logger");
const sessionHelper = require("./sessionHelper");//stub
let appSession = sessionHelper.AppSession;//stub

exports.SoapReqXmlUpdate = function(inputJson) {
    let webServicePath = path.join(__dirname, inputJson.CustomSOAPEnvFileName);
    let readXml = fs.readFileSync(webServicePath, 'utf8');
    logger.info("Enter Soap Request Helper ");
    let header = `<soapenv:Header>
    <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
    <wsse:UsernameToken>
    <wsse:Username>${inputJson.UserName}</wsse:Username>
    <wsse:Password>${inputJson.Password}</wsse:Password>
    </wsse:UsernameToken>
    </wsse:Security>
    </soapenv:Header>`;
    readXml = readXml.replace('<soapenv:Header/>', header);
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
    return updatedXML;

};
exports.XmlToJson = function (ResObj) {
      //-----------------------Stub---------------------//
       if(appSession.appSessionObj.Stubbing){
      if(appSession.appSessionObj.Stubbing == "AUTH" || appSession.appSessionObj.Stubbing.split(",").includes("AUTH") == true){
          //if(appSession.appSessionObj.Stubbing == "AUTH"){
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