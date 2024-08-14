const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const axios = require('axios');
const XLSX = require('xlsx');
function wToFile(fileName, data, botName = "Bank Assist") {
    // downloadFile(data,fileName);
    const directory = `./BotVariables/${botName}`;
    var filePath = path.join(directory, fileName);
    // Check if the directory exists, if not create it
    // if (!fs.existsSync(directory)) {
    //     fs.mkdirSync(directory);
    // }
    let date = new Date();
    filePath = filePath ?? `default-${date.getDate()}-${date.getMonth()}-${date.getFullYear()}.json`
    fs.writeFileSync(fileName, JSON.stringify(data));
}
function downloadFile(data, filename,userName) {
    filename = filename || "File";
    if (navigator && navigator.msSaveBlob) {
        var blob = new Blob([data], { type: 'data:text/plain;charset=utf-8' });
        return window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(data));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
};
function getBotName(inputString) {
    const pattern = /clientfilename=([^&]+)/;
    const match = inputString.match(pattern);
    if (match && match[1]) {
        const encodedFilename = match[1];
        const decodedFilename = decodeURIComponent(encodedFilename).split(".")[0];
        const extenstion = decodeURIComponent(encodedFilename).split(".")[1];
        console.log(decodedFilename, extenstion);
        return { decodedFilename, extenstion }
    } else {
        console.log('Filename not found in the input string.');
    }
}
function fileName(file, ext) {
    var date = new Date();
    var fileName = file ?? "BankAssist_"
    fileName += `_D${date.getDate()}-${Number(date.getMonth() + 1)}-${date.getFullYear()}T${date.getHours()}-${date.getMinutes()}.${ext ?? "json"}`
    return fileName
}
function fileNameSuffixByDate(file, ext) {
    var date = new Date();
    var fileName = file ?? "BankAssist_"
    fileName += `_D${date.getDate()}-${Number(date.getMonth() + 1)}-${date.getFullYear()}T${date.getHours()}-${date.getMinutes()}.${ext ?? "json"}`
    console.log(fileName);
    return fileName
}
function generateCsv(data) {
    return data.map(variable => `${variable.key},${variable.value},${variable.group},${variable.isSecured}`).join('\n');
}
function getBotVariables(botVariables, botName = "Bank Assist") {
    const defaultOptions = {
        createFile: false,
        fileType: "json",
        fileName: "",
        variableType: "",
        group: "",
        lang: "en",
        isSecured: false,
        meta: [""]
    };
    const { createFile, fileType, fileName, variableType, group, lang, isSecured } = defaultOptions;
    var env = {};
    var content = {};
    var contentVariables = [];
    var envVariables = [];
    var groupVariables = {
        env: [],
        content: []
    };
    var securedVariables = {
        env: [],
        content: []
    };
    const processVariable = (variable) => {
        if (variable.variableType === "locale") {
            contentVariables.push({
                key: variable.key,
                value: variable.localeData[lang].value,
                group: variable.group,
            });

            content[variable.key] = variable.localeData[lang].value;
        }
        if (variable.variableType === "env") {
            envVariables.push({
                key: variable.key,
                value: variable.value,
                group: variable.group,
                isSecured: variable.isSecured,
            });
            env[variable.key] = variable.value;
        }
    }
    const botVars = botVariables;
    botVars.forEach(processVariable);
    if (group) {
        groupVariables.env = envVariables.filter(value => value.group === group);
        groupVariables.content = contentVariables.filter(value => value.group === group);
    }
    if (isSecured) {
        securedVariables.env = envVariables.filter(value => value.isSecured);
        securedVariables.content = contentVariables.filter(value => value.isSecured);
    }
    if (createFile) {
        wToFile("env.json", env, botName);
        wToFile("content.json", content, botName);
        if (fileType === "csv") {
            wToFile(`${fileName ? fileName + "CNT" : "contentVariables"}${lang.toUpperCase()}.csv`, generateCsv(contentVariables));
            wToFile(`${fileName ? fileName + "ENV" : "envVariables"}.csv`, generateCsv(envVariables));
        } else {
            wToFile(`${fileName ? fileName + "CNT" : "contentVariables"}${lang.toUpperCase()}.json`, contentVariables, botName);
            wToFile(`${fileName ? fileName + "ENV" : "envVariables"}.json`, envVariables, botName);
        }
    }
    if (isSecured) {
        fileType === "csv" ? wToFile(`securedVar.csv`, generateCsv(securedVariables)) : wToFile(`securedVar.json`, JSON.stringify(securedVariables));
    }
    if (group) {
        fileType === "csv" ? wToFile(`groupedVar.csv`, generateCsv(securedVariables)) : wToFile(`groupedVar.json`, JSON.stringify(securedVariables));
    }
    return { content, env };
}
async function downloadAndExtractZip(url, zipFilePath, extractDir) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        fs.writeFileSync(zipFilePath, response.data);
        const zip = new AdmZip(zipFilePath);
        zip.extractAllTo(extractDir, true);
        console.log('Zip file extracted successfully.');
        return `Zip file extracted successfully in ${extractDir}`
    } catch (error) {
        console.error('Error downloading or extracting the zip file:', error);
        return;
    }
}
function createExcelfile(data, fileName = 'contentEnvDiff', path = "BotVariables/Bank Assist/") {
    var workbook = XLSX.utils.book_new();

    function createWorksheet(sheetName, data) {
        if (sheetName === "added" || sheetName === "deleted" || sheetName === "same") {
            var worksheet = XLSX.utils.aoa_to_sheet([["Variable Name", "Value"]]);
        } else if(sheetName === "Summary") {
            var worksheet = XLSX.utils.aoa_to_sheet([["Content Variables"]]);
            worksheet['!merges'] =[
                { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } } // Merge first row for header
        ]
        worksheet = XLSX.utils.aoa_to_sheet([["Source Variable -> Target	"]]);
        worksheet['!merges'] =[
            { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } } // Merge first row for header
    ]
        } else {
            var worksheet = XLSX.utils.aoa_to_sheet([["Variable Name", "Source Value", "Target Value"]]);
        }
        let row = 2;
        for (const [key, value] of Object.entries(data)) {
            if (sheetName === "added" || sheetName === "deleted" || sheetName === "same") {
                XLSX.utils.sheet_add_aoa(worksheet, [[key, value]], { origin: `A${row}` });
            } else if(sheetName === "Summary") {
                XLSX.utils.sheet_add_aoa(worksheet, [[key, value]], { origin: `A${row}` });
            }
             else {
                XLSX.utils.sheet_add_aoa(worksheet, [[key, value.oldValue,value.newValue]], { origin: `A${row}` });
            }
            row++;
        }
        return worksheet;
    }
    for (var [key, value] of Object.entries(data)) {
        workbook.SheetNames.push(`${key} changes`);
        workbook.Sheets[`${key} changes`] = createWorksheet("changes", value.changes);
        workbook.SheetNames.push(`${key} added`);
        workbook.Sheets[`${key} added`] = createWorksheet("added", value.added);
        workbook.SheetNames.push(`${key} deleted`);
        workbook.Sheets[`${key} deleted`] = createWorksheet("deleted", value.deleted);
        workbook.SheetNames.push(`${key} same`);
        workbook.Sheets[`${key} same`] = createWorksheet("same", value.same);
        workbook.SheetNames.push(`${key} Summary`);
        workbook.Sheets[`${key} Summary`] = createWorksheet("Summary", value.Analytics);
    }

    var filePath = `${path}${fileNameSuffixByDate(fileName, "xlsx")}`;
    XLSX.writeFile(workbook, filePath);
    return workbook; // Return the workbook
}
function compareJSON(source, target) {
    var changes = {};
    var added = {};
    var deleted = {};
    var same = {};
    // Find keys that are common to both objects
    var keys = new Set([...Object.keys(source), ...Object.keys(target)]);
    for (var key of keys) {
        let sourceValue = source[key];
        let targetValue = target[key];
        if (sourceValue !== undefined && targetValue !== undefined) {
            // Key exists in both objects
            if (sourceValue !== targetValue) {
                // Values are different
                changes[key] = { oldValue: targetValue, newValue: sourceValue };
            } else {
                same[key] = sourceValue;
            }
        } else if (sourceValue !== undefined) {
            // Key exists only in source
            added[key] = sourceValue;
        } else {
            // Key exists only in target
            deleted[key] = targetValue;
        }
    }
    var Analytics = {
            "Total Source Count:":Object.keys(source).length,
            "Total Target Count:":Object.keys(target).length,
            "Same:":Object.keys(same).length,
            "Changed:":Object.keys(changes).length,
            "Deleted:":Object.keys(deleted).length,
            "Added:":Object.keys(added).length,
    }
    var data = { changes, added, deleted, same , Analytics};
    // convertJSONToSpreadsheet(data,Analytics);
    return data;
}

// createExcelfile(text);
module.exports = { getBotVariables, downloadAndExtractZip, wToFile, generateCsv, fileName, getBotName, compareJSON ,createExcelfile,fileNameSuffixByDate}