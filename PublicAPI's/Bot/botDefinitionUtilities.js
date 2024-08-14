const fs = require('fs-extra');
const botDefinition = require('../Bots/Extracted/botDefinition.json');
const config = require('../Bots/Extracted/config.json');
const path = require('path');
const { values } = require('lodash');
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function createFolders(...folders) {
    let currentPath = __dirname;

    for (let i = 0; i < folders.length; i++) {
        const folderName = folders[i];
        currentPath = path.join(currentPath, folderName);
        // Check if the directory already exists
        if (!fs.existsSync(currentPath)) {
            try {
                fs.mkdirSync(currentPath);
            } catch (err) {
                console.error(`Error creating directory: ${currentPath}`);
                console.error(err);
                return;
            }
        }
    }
    return currentPath;
}
function decodeURLcode(encodedString) {
    return decodeURIComponent(encodedString)
}
function keysOfBotDefination(botDefinition, all = true) {
    let keys = [];
    if (!all) {
        keysOfBotDefination.forEach((value) => {
            if (_.isArray(botDefinition[value]) || _.isObject(botDefinition[value])) {
                keys.push(value)
                // keys.push(botDefinition[value])
            }
        });
    }
    else {
        keys = Object.keys(botDefinition);
    }
    return keys;
}
function isFileEncrypted(botDefinition) {
    return botDefinition.encryptedHash ? true : false;
}
function wToFile(fileName, data) {
    fs.writeFileSync(fileName, JSON.stringify(data));
}
function generateCsv(data) {
    return data.map(variable => `${variable.key},${variable.value},${variable.group},${variable.nameSpaces},${variable.isSecured}`).join('\n');
}
function getBotVariables(botDefinition = {}, config = {}, options = {}) {
    const defaultOptions = {
        createFile: true,
        fileType: "json",
        fileName: "botVar",
        variableType: "",
        group: "",
        lang: "en",
        isSecured: false,
        meta: [""]
    };
    
    const { createFile, fileType, fileName, variableType, group, lang, isSecured } = Object.assign(defaultOptions, options);

    if (Object.keys(botDefinition).length === 0) {
        return "Empty bot definition file";
    }

    var env = {};
    var content = {};
    var contentVariables = [];
    var envVariables = [];

    const processVariable = (variable) => {
        const nameSpaces = retriveNameSpacesWithRefIds(variable.vNameSpace, botDefinition);
        const isContentLocale = variableType === "content" && variable.variableType === "locale" && variable.key && variable?.localeData[lang]?.value;
        const isEnvVariable = variableType === "env" && variable.variableType === "env";

        if (isContentLocale) {
            contentVariables.push({
                key: variable.key,
                value: variable.localeData[lang].value,
                group: variable.group,
                nameSpaces
            });
            content[variable.key] = variable.localeData[lang].value;
        } else if (isEnvVariable) {
            envVariables.push({
                key: variable.key,
                value: variable.value,
                group: variable.group,
                isSecured: variable.isSecured,
                nameSpaces
            });
            env[variable.key] = variable.value;
        }else{
            if(variable.variableType === "locale"){
                contentVariables.push({
                    key: variable.key,
                    value: variable.localeData[lang].value,
                    group: variable.group,
                    nameSpaces
                });
                
            content[variable.key] = variable.localeData[lang].value;
            }
            if(variable.variableType === "env"){
                envVariables.push({
                    key: variable.key,
                    value: variable.value,
                    group: variable.group,
                    isSecured: variable.isSecured,
                    nameSpaces
                });
            env[variable.key] = variable.value;
            }        
        }

        if (group) {
            envVariables = envVariables.filter(value => value.group === group);
            contentVariables = contentVariables.filter(value => value.group === group);
        }
        if (isSecured) {
            envVariables = envVariables.filter(value => value.isSecured);
        }
    };

    const botVars = [...botDefinition.contentVariables, ...config.envVariables];
    botVars.forEach(processVariable);
    if (createFile) {
        wToFile("env.json", env);
        wToFile("content.json", content);

        if (fileType === "csv") {
            wToFile(`${fileName ? fileName + "CNT" : "contentVariables"}${lang.toUpperCase()}.csv`, generateCsv(contentVariables));
            wToFile(`${fileName ? fileName + "ENV" : "envVariables"}.csv`, generateCsv(envVariables));
        } else {
            wToFile(`${fileName ? fileName + "CNT" : "contentVariables"}${lang.toUpperCase()}.json`, contentVariables);
            wToFile(`${fileName ? fileName + "ENV" : "envVariables"}.json`, envVariables);
        }
    }

    return [content, env];
}
function getDialogs(botDefinition, createFile = false) {
    if (Object.keys(botDefinition).length === 0) {
        return "Empty bot defination file";
    }
    let dialogs = botDefinition.exportOptions.subTasks.dialogs;
    let dialogNames = [];
    botDefinition.dialogComponents.forEach((value, index) => {
        for (let index = 0; index < dialogs.length; index++) {
            if (value.dialogId === dialogs[index])
                dialogNames.push({
                    "id": value.dialogId,
                    "IntentName": value.name,
                    "diaplayName": value.localeData.en.intent
                });
        }
    });
    if (createFile) {
        fs.writeFileSync("dialogs.json", JSON.stringify(dialogNames));
    }
    console.log("Retriving all the dialogs is sucessful...");
    return JSON.stringify(dialogNames);
}
function getComponents(botDefinition, createFile = false) {
    if (Object.keys(botDefinition).length === 0) {
        return "Empty bot defination file";
    }
    if (createFile) {
        fs.writeFileSync("dialogComponents.json", JSON.stringify(botDefinition.dialogComponents));
    }
    return JSON.stringify(botDefinition.dialogComponents);
}
function getDialogNodes(botDefinition, dialogName, createFile = true) {
    if (Object.keys(botDefinition).length === 0) {
        console.log("Empty bot defination file");
        return {};
    }
    let dialogId = ""
    botDefinition.dialogComponents.forEach((value, index) => {
        if (value.type === "intent" && value.name === dialogName) {
            dialogId = value.dialogId;
        }
    });
    if (!dialogId) {
        console.log("dialog not exists");
        return "dialog not exists"
    }
    let dialog = {}
    botDefinition.dialogs.forEach((value, index) => {
        if (value._id === dialogId) {
            dialog = value;
        }
    });
    let dialogInfo = {
        nodes: {

        },
        allNodes: []
    };
    if (Object.keys(dialog).length > 0) {
        dialog.nodes.forEach((value, index) => {
            botDefinition.dialogComponents.forEach((val, index) => {
                if (value.componentId === val._id) {
                    if (!dialogInfo.nodes[value.type]) {
                        dialogInfo.nodes[value.type] = [val.name]
                    }
                    else {
                        dialogInfo.nodes[value.type].push(val.name)
                    }
                    dialogInfo.allNodes.push(val.name)
                }
            });
        })
    }
    if (createFile) {
        fs.writeFileSync(dialogName + ".json", JSON.stringify(dialogInfo));
    }
    return dialogInfo;

}
function writeToFile(path, name, data) {
    fs.writeFileSync(path + "/" + name, data)
}
//  new script file
function getDialogScripts(botDefinition, dialogName, mainFolder,nodeAnalyticsValues = []) {
    var pathFile = "./Bot/"
    try {
        if (!botDefinition || !Object.keys(botDefinition).length) {
            console.log("Empty bot definition file");
            return {};
        }
        if (botDefinition.localeData?.en?.name && !mainFolder) {
            mainFolder = botDefinition.localeData.en.name;
            addToGitignoreSync(mainFolder);
        }
        const dialogComponent = botDefinition.dialogComponents.find((component) => component.type === "intent" && component.name === dialogName);
        if (!dialogComponent) {
            console.log("Dialog not exists");
            return "Dialog not exists";
        }
        let dialogId = dialogComponent.dialogId;
        let dialog = botDefinition.dialogs.find((value) => value._id === dialogId);
        let dialogInfo = { nodes: {}, allNodes: [] };
        if (dialog) {
            var mainPath = createFolders(mainFolder, dialogName);
            const allPath = createFolders(mainFolder, dialogName, "AllNodes");
            var transitionPath = createFolders(mainFolder, dialogName, "Transitions");
            var dialogInfomation = {
                dialogId: dialogComponent._id,
                componentId: dialogComponent.componentId,
                intentName: dialogComponent.name,
                displayName: dialogComponent.localeData.en.intent,
                intentDescription: dialogComponent.localeData.en.desc,
                nodes: {
                    intent: {
                        count: 0,
                        names: [],
                    },
                    entity: {
                        count: 0,
                        names: [],
                    },
                    message: {
                        count: 0,
                        names: [],
                    },
                    script: {
                        count: 0,
                        names: [],
                    },
                    service: {
                        count: 0,
                        names: [],
                    },
                    logic: {
                        count: 0,
                        names: [],
                    },
                    all: {
                        count: 0,
                        names: []
                    }
                },
                transitions: [],
                namespaces: {
                    dialogLevelNameSpaces: [],
                    nodeLevelNameSpaces: []
                }
            }
            // dialogName = dialogInfomation.displayName;
            var variableAnalysis = {
                intentName: dialogComponent.name,
                idfc: 0,
                koreDebugger: 0,
                accountName: 0,
                content: {
                    count: 0,
                    variables: []
                },
                env: {
                    count: 0,
                    variables: []
                },
                context: {
                    count: 0,
                    variables: []
                },
                nodes: []
            }
            const dialogTransition = [];
            dialogInfomation.namespaces.dialogLevelNameSpaces = retriveNameSpacesWithRefIds(dialog.vNameSpace, botDefinition);
            for (const node of dialog.nodes) {
                const component = botDefinition.dialogComponents.find((component) => component._id === node.componentId);
                const typePath = createFolders(mainFolder, dialogName, node.type);
                const name = component.name;
                var transition = transitionAnalytics(dialogComponent.name, component, node);
                var nodeInformation = {
                    nodeName: component.name,
                    nodeType: component.type,
                    nodeInformation: []
                }
                dialogInfomation.transitions.push(transition)
                dialogTransition.push(transition)
                if (!component.useTaskLevelNs) {
                    let nodeNameSpaces = {
                        nodeName: name,
                        namespaces: retriveNameSpacesWithRefIds(component.vNameSpace, botDefinition)
                    }
                    dialogInfomation.namespaces.nodeLevelNameSpaces.push(nodeNameSpaces);
                }
                if (dialogInfomation.nodes[component.type]) {
                    dialogInfomation.nodes[component.type].count++;
                    dialogInfomation.nodes[component.type].names.push(component.name);
                    dialogInfomation.nodes.all.count++;
                    dialogInfomation.nodes.all.names.push(component.name)
                } else {
                    dialogInfomation.nodes[component.type] = {
                        count: 0,
                        names: []
                    }
                }
                if (!dialogInfo.nodes[node.type]) {
                    dialogInfo.nodes[node.type] = [component.name];
                    dialogInfo.allNodes = [component.name];
                } else {
                    dialogInfo.nodes[node.type].push(component.name);
                    dialogInfo.allNodes.push(component.name);
                }
                if (node.type && name) {
                    writeToFile(typePath, `${name}${node.type}.json`, JSON.stringify(node));
                    const nodePath = createFolders(mainFolder, dialogName, node.type, component.name);
                    if (node.type === "entity" || node.type === "dialogAct" || node.type === "message") {
                        component.message.forEach((value, index) => {
                            var fileName = name;
                            script = decodeURLcode(value.localeData.en.text);
                            fileName = value.channel === "default" ? fileName += "AllChannel" : (value.channel === "rtm" ? fileName += "WebSDK" : fileName += "Others");
                            var inform = nodeAnalytics(nodePath, fileName, script, node.type, dialogInfomation.displayName);
                            variableAnalysis.nodes.push(inform);
                            writeToFile(nodePath, `${fileName}.js`, script);
                            writeToFile(allPath, `${fileName}.js`, script);
                        });
                    } else if (node.type === "script") {
                        var fileName = `${name}${capitalizeFirstLetter(node.type)}.js`;
                        const script = decodeURLcode(component.script);
                        var inform = nodeAnalytics(nodePath, fileName, script, node.type, dialogInfomation.displayName);
                        variableAnalysis.nodes.push(inform);
                        writeToFile(nodePath, `${name}.js`, script);
                        writeToFile(allPath, fileName, script);
                    } else if (node.type === "service") {
                        const service = component;
                        try {
                            service.payload = service?.payload?.type === "raw" && service?.payload?.value ? decodeURLcode(service.payload.value) : service?.payload?.value;
                            service.headers.value = service?.headers?.type === "raw" && service?.headers?.value !== undefined && typeof service?.headers?.value === "string" ? JSON.parse(service.headers.value) : service.headers.value;
                        } catch (error) {
                            console.log(error);
                        }
                        writeToFile(nodePath, `${name}${capitalizeFirstLetter(node.type)}.json`, JSON.stringify(service));
                    } else {
                        writeToFile(nodePath, `${name}${node.type}.json`, JSON.stringify(component));
                    }
                }
            }
            //  this block is related to variables code for dialog level
            variableAnalysis.idfc = variableAnalysis.nodes.reduce((acc, val) => acc + val.idfc.count, 0);
            variableAnalysis.accountName = variableAnalysis.nodes.reduce((acc, val) => acc + val.accountName.count, 0);
            variableAnalysis.koreDebugger = variableAnalysis.nodes.reduce((acc, val) => acc + val.koreDebugger.count, 0);
            variableAnalysis.context.count = variableAnalysis.nodes.reduce((acc, val) => acc + val.context.count, 0);
            variableAnalysis.env.count = variableAnalysis.nodes.reduce((acc, val) => acc + val.env.count, 0);
            variableAnalysis.content.count = variableAnalysis.nodes.reduce((acc, val) => acc + val.content.count, 0);
            variableAnalysis.content.variables = [...new Set(variableAnalysis.nodes.reduce((acc, node) => acc.concat(node.content.names), []))];
            variableAnalysis.env.variables = [...new Set(variableAnalysis.nodes.reduce((acc, node) => acc.concat(node.env.names), []))];
            variableAnalysis.context.variables = [...new Set(variableAnalysis.nodes.reduce((acc, node) => acc.concat(node.context.names), []))];

            //
            writeToFile(mainPath, "dialogInformation.json", JSON.stringify(dialogInfomation));
            writeToFile(mainPath, "variableAnalysis.json", JSON.stringify(variableAnalysis));
            writeToFile(transitionPath, dialogName + "Transitions.json", JSON.stringify(dialogTransition));
            writeToFile(mainPath, dialogName + "NodesInfo.json", JSON.stringify(dialogInfo));
            console.log(` Extraction of ${dialogName} scripts for all nodes is done.......`);
        } else {
            console.log(`${dialogName} is not exists.......`);
        }

    } catch (error) {
        console.log("Failed");
        console.log(error);
    }
    fs.writeFileSync("transJSON.json", JSON.stringify(transAna));
}
function addToGitignoreSync(name) {
    const gitignorePath = '.gitignore';

    // Check if the .gitignore file exists, create it if it doesn't
    if (!fs.existsSync(gitignorePath)) {
        fs.writeFileSync(gitignorePath, '');
    }

    // Read the current contents of the .gitignore file
    const gitignoreContent = fs.readFileSync(gitignorePath, { encoding: 'utf8' });

    // Add the name to the .gitignore file if it's not already there
    if (!gitignoreContent.includes(name)) {
        fs.appendFileSync(gitignorePath, `\n${name}/`);
    }
}
function getBotInformation(botDefinition, dialogName, mainFolder = "Dialogs") {
    try {
        if (!botDefinition || !Object.keys(botDefinition).length) {
            console.log("Empty bot definition file");
            return {};
        }
        if (botDefinition.localeData?.en?.name) {
            mainFolder = botDefinition.localeData.en.name;
            addToGitignoreSync(mainFolder);
        }
        const dialogComponent = botDefinition.dialogComponents.find((component) => component.type === "intent" && component.name === dialogName);
        if (!dialogComponent) {
            console.log("Dialog not exists");
            return "Dialog not exists";
        }
        let dialogId = dialogComponent.dialogId;
        let dialog = botDefinition.dialogs.find((value) => value._id === dialogId);
        let dialogInfo = { nodes: {}, allNodes: [] };
        if (dialog) {
            var mainPath = createFolders(mainFolder, dialogName);
            const allPath = createFolders(mainFolder, dialogName, "AllNodes");
            var transitionPath = createFolders(mainFolder, dialogName, "Transitions");
            var dialogInfomation = {
                dialogId: dialogComponent._id,
                componentId: dialogComponent.componentId,
                intentName: dialogComponent.name,
                displayName: dialogComponent.localeData.en.intent,
                intentDescription: dialogComponent.localeData.en.desc,
                nodes: {
                    intent: {
                        count: 0,
                        names: [],
                    },
                    entity: {
                        count: 0,
                        names: [],
                    },
                    message: {
                        count: 0,
                        names: [],
                    },
                    script: {
                        count: 0,
                        names: [],
                    },
                    service: {
                        count: 0,
                        names: [],
                    },
                    logic: {
                        count: 0,
                        names: [],
                    },
                    all: {
                        count: 0,
                        names: []
                    }

                },
                transitions: [],
                namespaces: {
                    dialogLevelNameSpaces: [],
                    nodeLevelNameSpaces: []
                }
            }
            const dialogTransition = [];
            dialogInfomation.namespaces.dialogLevelNameSpaces = retriveNameSpacesWithRefIds(dialog.vNameSpace, botDefinition);
            for (const node of dialog.nodes) {
                const component = botDefinition.dialogComponents.find((component) => component._id === node.componentId);
                const typePath = createFolders(mainFolder, dialogName, node.type);
                const name = component.name;
                var transition = {
                    nodeName: component.name,
                    transition: node.transitions
                }
                dialogInfomation.transitions.push(transition)
                dialogTransition.push(transition)
                if (!component.useTaskLevelNs) {
                    let nodeNameSpaces = {
                        nodeName: name,
                        namespaces: retriveNameSpacesWithRefIds(component.vNameSpace, botDefinition)
                    }
                    dialogInfomation.namespaces.nodeLevelNameSpaces.push(nodeNameSpaces);
                }
                if (dialogInfomation.nodes[component.type]) {
                    dialogInfomation.nodes[component.type].count++;
                    dialogInfomation.nodes[component.type].names.push(component.name);
                    dialogInfomation.nodes.all.count++;
                    dialogInfomation.nodes.all.names.push(component.name)
                } else {
                    dialogInfomation.nodes[component.type] = {
                        count: 0,
                        names: []
                    }
                }
                if (!dialogInfo.nodes[node.type]) {
                    dialogInfo.nodes[node.type] = [component.name];
                    dialogInfo.allNodes = [component.name];
                } else {
                    dialogInfo.nodes[node.type].push(component.name);
                    dialogInfo.allNodes.push(component.name);
                }
                if (node.type && name) {
                    writeToFile(typePath, `${name}${node.type}.json`, JSON.stringify(node));
                    const nodePath = createFolders(mainFolder, dialogName, node.type, component.name);
                    if (node.type === "entity" || node.type === "dialogAct" || node.type === "message") {
                        component.message.forEach((value, index) => {
                            var fileName = name;
                            script = decodeURLcode(value.localeData.en.text);
                            fileName = value.channel === "default" ? fileName += "AllChannel" : (value.channel === "rtm" ? fileName += "WebSDK" : fileName += "Others");
                            writeToFile(nodePath, `${fileName}.js`, script);
                            writeToFile(allPath, `${fileName}.js`, script);
                        });
                    } else if (node.type === "script") {
                        var fileName = `${name}${capitalizeFirstLetter(node.type)}.js`;
                        const script = decodeURLcode(component.script);
                        writeToFile(nodePath, `${name}.js`, script);
                        writeToFile(allPath, fileName, script);
                    } else if (node.type === "service") {
                        const service = component;
                        service.payload = service?.payload?.type === "raw" && service?.payload?.value ? decodeURLcode(service.payload.value) : service?.payload?.value;
                        service.headers.value = service?.headers?.type === "raw" && service?.headers?.value !== undefined && typeof service?.headers?.value === "string" ? JSON.parse(service.headers.value) : service.headers.value;
                        writeToFile(nodePath, `${name}${capitalizeFirstLetter(node.type)}.json`, JSON.stringify(service));
                    } else {
                        writeToFile(nodePath, `${name}${node.type}.json`, JSON.stringify(component));
                    }
                }
            }
            writeToFile(mainPath, "dialogInformation.json", JSON.stringify(dialogInfomation));
            writeToFile(transitionPath, dialogName + "Transitions.json", JSON.stringify(dialogTransition));
            writeToFile(mainFolder, dialogName + ".json", JSON.stringify(dialogInfo));
            console.log(` Extraction of ${dialogName} scripts for all nodes is done.......`);
        } else {
            console.log(`${dialogName} is not exists.......`);
        }

    } catch (error) {
        console.log("Failed");
        console.log(error);
    }

}
function retriveNameSpacesWithRefIds(ids, botDefinition) {
    if (ids.length === 0 || botDefinition.namespaces.length === 0) {
        console.log("NameSpaces are Empty");
        return [];
    }
    var vNameSpace = [];
    for (var id of ids) {
        try {
            var name = botDefinition.namespaces.find((value) => value.refId === id).name;
            if (name) {
                vNameSpace.push(name);
            } else {
                vNameSpace.push(null)
            }
        } catch (error) {
            return
        }
    }
    return vNameSpace;
}
var transAna = [];
function getAllDialogScripts(botDefinition) {
    if (!botDefinition || !Object.keys(botDefinition).length) {
        console.log("Empty bot definition file");
        return {};
    }
    try {
        let dialogs = JSON.parse(getDialogs(botDefinition));
        dialogs.forEach((dialog, index) => {
            console.log(`[${index + 1}/${dialogs.length}] : ${dialog.diaplayName} extraction is starting.............`);
            getDialogScripts(botDefinition, dialog.IntentName);
        });
    } catch (error) {
        console.log(error);
    }
}
function nodeAnalytics(path, name, code, nodeType, dialogName,nodeAnalyticsValues = ["sendDTMF","dtmfCollect","continuousASR","userNoInputTimeoutMS","userNoInputSendEvent","continuoesASRHypothesis"]) {
    // var code = fs.readFileSync("./txnDisplaySpendingsAllChannel.js").toString();
    var botVariables = {
        nodeName: name,
        nodeType: nodeType,
        dialogName: dialogName,
        content: {
            names: [],
            dynamicNames: []
        },
        env: {
            names: [],
            dynamicNames: []
        },
        context: {
            names: []
        },
        idfc: {
            count: 0,
            lineNumbers: []
        },
        koreDebugger: {
            count: 0,
            lineNumbers: []
        },
        accountName: {
            count: 0,
            lineNumbers: []
        }
    };
    nodeAnalyticsValues.forEach(value=>{
        botVariables[value] = {
            count: 0,
            lineNumbers: []
        }
        // while (match = contextRegex.exec(code)) {
        //     botVariables.context.names.push(match[1]);
        // }
        // Adding counts and line numbers for additional patterns
        let lineNumber = 0;
        code.split('\n').forEach((line) => {
            lineNumber++;
            if (line.toLowerCase().includes(value)) {
                botVariables[value].count++;
                botVariables[value].lineNumbers.push(lineNumber);
            }
        });
    })
    // Regular expressions to match the patterns
    // const contentRegex = /content\.(\w+)/g;
    const contentRegex = /(?:content)\.(\w+)|(?:content)\.(\w+)\s*=\s*["']?([^'"\n]+)["']?/g;
    const envRegex = /env\.(\w+)/g;
    const contextRegex = /context\.(\w+)/g;
    const idfcRegex = /idfc/ig;
    const koreDebuggerRegex = /koreDebugger/g;
    const accountNameRegex = /accountName/g;

    // Extracting words from the string and adding them to the respective arrays
    let match;
    while (match = contentRegex.exec(code)) {
        botVariables.content.names.push(match[1]);
    }

    while (match = envRegex.exec(code)) {
        botVariables.env.names.push(match[1]);
    }

    while (match = contextRegex.exec(code)) {
        botVariables.context.names.push(match[1]);
    }

    // Adding counts and line numbers for additional patterns
    let lineNumber = 0;
    code.split('\n').forEach((line) => {
        lineNumber++;
        if (line.toLowerCase().includes('idfc')) {
            botVariables.idfc.count++;
            botVariables.idfc.lineNumbers.push(lineNumber);
        }
        let koreDebuggerMatch = line.match(koreDebuggerRegex);
        if (koreDebuggerMatch) {
            botVariables.koreDebugger.count += koreDebuggerMatch.length;
            botVariables.koreDebugger.lineNumbers.push(lineNumber);
        }
        let accountNameMatch = line.match(accountNameRegex);
        if (accountNameMatch) {
            botVariables.accountName.count += accountNameMatch.length;
            botVariables.accountName.lineNumbers.push(lineNumber);

        }
    });
    // Removing duplicates from each array
    botVariables.content.names = [...new Set(botVariables.content.names)];
    botVariables.env.names = [...new Set(botVariables.env.names)];
    botVariables.context.names = [...new Set(botVariables.context.names)];
    botVariables.content.count = botVariables.content.names.length;
    botVariables.context.count = botVariables.context.names.length;
    botVariables.env.count = botVariables.env.names.length;
    if (path) {
        fs.writeFileSync(`${path}/${name}NodeAnalytics.json`, JSON.stringify(botVariables));
    }
    return botVariables;
}
function getEntities(botDefinition) {
    if (!botDefinition || !Object.keys(botDefinition).length) {
        console.log("Empty bot definition file");
        return {};
    }
    const dialogComponent = botDefinition.dialogComponents.find((component) => component.type === "intent");

}
function transitionAnalytics(dialogName, component, node, botDefinition) {
    if (botDefinition) {
        const dialogComponent = botDefinition.dialogComponents.forEach((component) => {
            if (component.type === "intent" && component.name === dialogName) {
                if (!dialogComponent) {
                    console.log("Dialog not exists");
                    return "Dialog not exists";
                }
                let dialogId = dialogComponent.dialogId;
                let dialog = botDefinition.dialogs.find((value) => value._id === dialogId);
            }
        });

    }
    var transition = {
        nodeName: component.name,
        fieldCode: {
            count: 0
        },
        transitions: node.transitions
    };
    var transitionStr = JSON.stringify(node.transitions);
    // Count occurrences of the word "code"
    // const occurrences = (transitionStr.match(/\bfieldCodes\b/g) || []).length;
    const occurrences = (transitionStr.match(/\btaskNotSupported\b/g) || []).length;
    // console.log(`Total occurrences of the word "fieldCodes": ${occurrences}`);
    var transAna1 = {
        dialogName: dialogName,
        nodeName: component.name,
        fieldCodeCount: occurrences
    };
    if (occurrences > 0) {
        transAna.push(transAna1);
    }

    fs.appendFileSync("TransitionsForFieldCodes.txt", `Total occurrences of the word "fieldCodes in ${component.name} node is ": ${occurrences} in ${dialogName}\n`);
    // fs.appendFileSync("TransitionsForFieldCodes.txt",`Total occurrences of the word "fieldCodes in ${component.name} node is ": ${occurrences} in ${dialogName}\n`);
    // transition.fieldCode.count = occurrences;
    return transition;

}
function transitionAnalyticsForGeneric(dialogName, botDefinition) {
    if (botDefinition) {
        const dialogComponent = botDefinition.dialogComponents.forEach((component) => {
            if (component.type === "intent" && component.name === dialogName) {
                let dialog = botDefinition.dialogs.find((value) => value._id === component.dialogId);
            }
        });

    }

    var transitionStr = JSON.stringify(node.transitions);
    // Count occurrences of the word "code"
    // const occurrences = (transitionStr.match(/\bfieldCodes\b/g) || []).length;
    // const occurrences = (transitionStr.match(/\btaskNotSupported\b/g) || []).length;
    // console.log(`Total occurrences of the word "fieldCodes": ${occurrences}`);
    var transAna1 = {
        dialogName: dialogName,
        nodeName: component.name,
        fieldCodeCount: occurrences
    };
    if (occurrences > 0) {
        transAna.push(transAna1);
    }

    // fs.appendFileSync("TransitionsForFieldCodes.txt",`Total occurrences of the word "fieldCodes in ${component.name} node is ": ${occurrences} in ${dialogName}\n`);
    // fs.appendFileSync("TransitionsForFieldCodes.txt",`Total occurrences of the word "fieldCodes in ${component.name} node is ": ${occurrences} in ${dialogName}\n`);
    // transition.fieldCode.count = occurrences;
    return transition;

}
function getTransitions() {
    if (botDefinition) {
        const dialogComponent = botDefinition.dialogComponents.forEach((component) => {
            if (component.type === "intent" && component.name === dialogName) {
                let dialog = botDefinition.dialogs.find((value) => value._id === component.dialogId);
            }
        });

    }

    var transitionStr = JSON.stringify(node.transitions);
    // Count occurrences of the word "code"
    // const occurrences = (transitionStr.match(/\bfieldCodes\b/g) || []).length;
    // const occurrences = (transitionStr.match(/\btaskNotSupported\b/g) || []).length;
    // console.log(`Total occurrences of the word "fieldCodes": ${occurrences}`);
    var transAna1 = {
        dialogName: dialogName,
        nodeName: component.name,
        fieldCodeCount: occurrences
    };
    if (occurrences > 0) {
        transAna.push(transAna1);
    }

    // fs.appendFileSync("TransitionsForFieldCodes.txt",`Total occurrences of the word "fieldCodes in ${component.name} node is ": ${occurrences} in ${dialogName}\n`);
    // fs.appendFileSync("TransitionsForFieldCodes.txt",`Total occurrences of the word "fieldCodes in ${component.name} node is ": ${occurrences} in ${dialogName}\n`);
    // transition.fieldCode.count = occurrences;
    return transition;
}
function getAllServiceNodes(botDefinition) {
    var serviceNodeNames = []
    let nodesInfor = {
    }
    var dialogComponent = botDefinition.dialogComponents.forEach((component) => {
        if (component.type === "service") {
            let serviceNode = {
                serviceNodeName: component.name,
            }
            serviceNodeNames.push(component.name)
            // serviceNodeNames.push(serviceNode)
        }

    });


    fs.writeFileSync("./ServiceNodes.json", JSON.stringify(serviceNodeNames));
}
function getConceptsAndSynonyms(botDefinition,lang){
    lang = lang ?? "en";
    var NLP ={
        synonymsAndConepts:[],
    }
    NLP.synonymsAndConepts = botDefinition.localeData[lang].synonyms;
    fs.writeFileSync("./synonymsAndConepts.json",JSON.stringify(NLP));
}



// getAllDialogScripts(botDefinition);
// getContentVarialbles(botDefinition,true);
// getDialogs(botDefinition,true)
getDialogScripts(botDefinition, "MoveMoney");

//  var code = fs.readFileSync("./BankAssist_Clone/GetAccountInformation/message/showAccountInformation/showAccountInformationAllChannel.js").toString();
// nodeAnalytics("./BankAssist_Clone", "showAccountInformationAllChannel", code,"message","dd");

// getConceptsAndSynonyms(botDefinition,"en")

// getBotVariables(botDefinition,config,{fileType :"json"});
// getAllServiceNodes(botDefinition,true);