// writes this entire project to two different file paths, depending on the language.

import { JSDOM } from "jsdom";
import { readdirSync, copyFileSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync, unlinkSync, cpSync } from "fs";
import { info, log } from "console";
import { watch } from "chokidar";
import { chdir, cwd } from "process";
import { exec } from "child_process";
import liveServer from "live-server";

function sl() {
    return process.platform === "win32" ? "\\" : "/";
}

const TOOLS = ["landing-page", "foods", "recipes"];
const EXCLUDED_ROOT_PATHS = {
    "landing-page": [],
    "foods": ["scrapes"],
    "recipes": [],
};

/**
 * These script pre-process files in the `html` directory, right before theyre compiled. 
 * Changes commited here are permanent.
 */
const PROJECT_SCRIPTS = {
    "landing-page": {},
    "foods": {
        "data.json": (_, runsOnLiveLoad) => {
            if (runsOnLiveLoad) return null; // Slight optimization
            // We know were running from project root
            // foods' index.html is in source/html/foods/
            let tableHtml = readFileSync("source/html/foods/index.html", "utf8");
            let p = new JSDOM(tableHtml);
            let tableBody = p.window.document.getElementById("FOODLIST_ENTRIES");
            let json = {
                companies: [],
                array: []
            };
            let rows = tableBody.getElementsByTagName("tr");
            for (let row of rows) {
                // Check if the company exists, and if its already in the companies array
                if (row.children[1].hasAttribute("company-id")) {
                    let companyID = row.children[1].getAttribute("company-id");
                    if (!json.companies.some(data => data.ID == companyID)) {
                        json.companies.push({
                            ID: companyID,
                            en: row.children[1].getAttribute("company-en"),
                            he: row.children[1].getAttribute("company-he")
                        })
                    }
                }
                json.array.push({
                    food: {
                        en: row.children[1].getAttribute("en"),
                        he: row.children[1].getAttribute("he")
                    },
                    company: {
                        ID: row.children[1].getAttribute("company-id"),
                        en: row.children[1].getAttribute("company-en"),
                        he: row.children[1].getAttribute("company-he")
                    },
                    defaultWeight: parseFloat(row.children[0].getAttribute("value")),
                    glycemicIndex: parseFloat(row.children[2].getElementsByTagName("span")[0].innerText),
                    glycemicIndexMetadata: row.children[2]
                        .getElementsByTagName("span")[0]
                        .getAttributeNames()
                        .filter(name => name !== "value" && name !== "style" && name !== "class")
                        .map(name => {
                            return {
                                key: name,
                                value: row.children[2].getElementsByTagName("span")[0].getAttribute(name)
                            }
                        }),
                    glycemicLoad: parseFloat(row.children[3].getElementsByTagName("span")[0].getAttribute("value")),
                    glycemicLoadMetadata: row.children[3]
                        .getElementsByTagName("span")[0]
                        .getAttributeNames()
                        .filter(name => name !== "value" && name !== "style" && name !== "class")
                        .map(name => {
                            return {
                                key: name,
                                value: row.children[3].getElementsByTagName("span")[0].getAttribute(name)
                            }
                        }),
                    sugar: parseFloat(row.children[4].getElementsByTagName("span")[0].getAttribute("value")),
                    sugarMetadata: row.children[4]
                        .getElementsByTagName("span")[0]
                        .getAttributeNames()
                        .filter(name => name !== "value" && name !== "style" && name !== "class")
                        .map(name => {
                            return {
                                key: name,
                                value: row.children[4].getElementsByTagName("span")[0].getAttribute(name)
                            }
                        }),
                    carbs: parseFloat(row.children[5].getElementsByTagName("span")[0].getAttribute("value")),
                    carbsMetadata: row.children[5]
                        .getElementsByTagName("span")[0]
                        .getAttributeNames()
                        .filter(name => name !== "value" && name !== "style" && name !== "class")
                        .map(name => {
                            return {
                                key: name,
                                value: row.children[5].getElementsByTagName("span")[0].getAttribute(name)
                            }
                        })
                })
            }
            return JSON.stringify(json);
        },
        
        "contribute/leaderboards.html": (content, runsOnLiveLoad) => {
            if (runsOnLiveLoad) return null; // Slight optimization
            if (content.startsWith("<!DOCTYPE html>")) return content;
            if (content.startsWith("PROV") || content.startsWith("REQ")) {
                let regex = /(PROV|REQ) "([^"]+)"/g;
                let contributorName = regex.exec(content)[2];
                let contributionType = regex.exec(content)[1].toLowerCase();
                content = content.replace(regex, "");
                // Look for the contributor. If they arent found, Create a new row.
                // The tbody at which the contributors are present is called CONTRIBUTORS.
                let parser = new JSDOM(content);
                let tbody = parser.window.document.getElementById("CONTRIBUTORS");
                let rows = tbody.getElementsByTagName("tr");
                let found = false;
                for (let row of rows) {
                    if (row.id.includes(contributorName)) {
                        let toIncrement = row.querySelector(`[${contributionType}]`);
                        let previous = parseInt(toIncrement.innerHTML);
                        if (Number.isNaN(previous)) {
                            previous = 0;
                        }
                        toIncrement.innerHTML = previous + 1;

                        let score = row.querySelector("[score]");
                        let previousScore = parseInt(score.innerHTML);
                        if (Number.isNaN(previousScore)) {
                            previousScore = 0;
                        }
                        score.innerHTML = previousScore + (contributionType == "prov" ? 10 : 1);
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    let row = tbody.getElementsByTagName("tr")[0].cloneNode(true);
                    row.id = `CONTRIBUTOR__${contributorName}`;
                    row.getElementsByTagName("th")[0].innerHTML = contributorName;
                    row.querySelector("[prov]").innerHTML = contributionType == "prov" ? 1 : 0;
                    row.querySelector("[prov]").id = `PROV__${contributorName}`;
                    row.querySelector("[req]").innerHTML = contributionType == "req" ? 1 : 0;
                    row.querySelector("[req]").id = `REQ__${contributorName}`;
                    row.querySelector("[score]").innerHTML = contributionType == "req" ? 1 : 10;
                    tbody.appendChild(row);
                }

                return parser.serialize().replace(/([prov|req|score])=""/g, "$1");
            }
        }
    },
    "recipes": {
        
    },
}


const SUPPORTED_LANGUAGES = ["en", "he"];
const MIGRATE_TRANSLATION_SYSTEM = process.argv.includes("--migrate-translation-system") || process.argv.includes("--mts") || process.argv.includes("--m");
const CONTINUOUS = process.argv.includes("--continuous") || process.argv.includes("--c");
const LAUNCH_DEV_SERVER = process.argv.includes("--launch-dev-server") || process.argv.includes("--dev") || process.argv.includes("--d");

const BUILD_PATH = `.${sl()}build`;
const SOURCE_PATH = `.${sl()}source`;

const CSS = `css`;
const HTML = `html`;
const JS = `js`;
const IMG = `img`;
const SUPPORTED_PROGRAMMING_LANGUAGES = [CSS, JS, IMG];

var LIVE_SERVER_ACTIVE = false;

/**
 * Returns the directory build path for a given language.
 *
 * @param {string} lang - the language code (e.g. "en", "he") or the programming language code (e.g. "css", "js")
 * @return {string} the buid directory for the given language
 */
function getLangBuildDir(lang) {
    return `${BUILD_PATH}${sl()}${lang}${sl()}`;
}

/**
 * Returns a tool's build directory, given language and tool ID.
 * 
 * Language here only refers to actualy languages, since they are the only ones that are split into dedicated build directories.
 *
 * @param {string} lang - The language code (e.g. "en", "he").
 * @param {string} toolId - The ID of the tool.
 * @return {string} The build directory for the given language and tool ID.
 */
function getToolBuildDir(lang, toolId) {
    if (toolId === "landing-page") {
        return getLangBuildDir(lang);
    }

    return getLangBuildDir(lang) + toolId + sl();
}



/**
 * Returns the directory path for a given languages's source.
 * 
 * Language here only refers to programming languages, since their sources are present before compilation
 *
 * @param {string} lang - the language code (`HTML`, `CSS`, `JS`)
 * @return {string} the source directory for the given language
 */
function getLangDir(lang) {
    return `${SOURCE_PATH}${sl()}${lang}${sl()}`;
}

/**
 * Returns the directory path for a given tool.
 *
 * @param {string} toolId The ID of the tool
 * @return {string} The directory path for the given tool
 */
function getToolDir(toolId) {
    return `${getLangDir(HTML)}${toolId}${sl()}`;
}

/**
 * builds an HTML file thats multilang ready and adds it to the build folder for each language
 *
 * @param {string} path The path of the file
 * @param {string} toolId The id of the tool to build for
 * @return {void}
 */
function buildHTMLFile(path, toolId) {
    SUPPORTED_LANGUAGES.forEach(lang => {
        let content = readFileSync(getToolDir(toolId) + path, "utf-8");
        // May support different langauges, produce translated documents

        let result = !path.endsWith(".html") ? content : generateTranslation(content, lang);
        // Create the dir if it doesn't exist
        mkdirSync(`${getToolBuildDir(lang, toolId)}${path.split(sl()).slice(0, -1).join(sl())}`, { recursive: true });
        writeFileSync(`${getToolBuildDir(lang, toolId)}${path}`, result);
    });
}

/**
 * Removes a file from the build directory for each supported language.
 *
 * @param {string} path - the path of the file to remove, relative to the tool's source directory
 * @param {string} toolId - the ID of the tool
 * @return {void}
 */
function removeHTMLFile(path, toolId) {
    for (let lang of SUPPORTED_LANGUAGES) {
        let filePath = getToolBuildDir(lang, toolId) + path;
        if (existsSync(filePath)) {
            unlinkSync(filePath);
        }
    }
}

/**
 * Copies files from their source directory to their build directory.
 * 
 * Used for files that don't need postprocessing.
 * 
 * @param {string} path The path of the file to copy
 * @param {string} fileType The type of the file to copy (`JS`, `CSS` or even `HTML`)
 */
function copyOtherFiles(path, fileType) {
    // Copy other files
    // Create the dir if it doesn't exist
    mkdirSync(getLangBuildDir(fileType) + path.split(sl()).slice(0, -1).join(sl()), { recursive: true });
    copyFileSync(getLangDir(fileType) + path, getLangBuildDir(fileType) + path);
}

/**
 * Removes a file from the build directory for a specific language.
 *
 * @param {string} path - the path of the file to remove
 * @param {string} fileType - the type of the file to remove (e.g. JS, CSS or even HTML)
 * @return {void}
 */
function removeOtherFiles(path, fileType) {
    if (existsSync(getLangBuildDir(fileType) + path)) {
        unlinkSync(getLangBuildDir(fileType) + path);
    }
}


/**
 * Syncs current files.
 * @param {string} toolId - the id of the tool. Will be the output folder name
 * @param {string[]} rootFiles - the list of root files for the tool to build/copy
 * @return {void}
 */
function buildTool(toolId, rootFiles) {
    let folderQueue = rootFiles.filter(file => !file.includes("."));
    rootFiles = rootFiles.filter(file => file.includes("."));
    while (folderQueue.length > 0) {
        let folder = folderQueue.shift();
        let newFiles = readdirSync(getToolDir(toolId) + folder);
        newFiles.forEach(file => {
            if (!file.includes(".")) {
                folderQueue.push(`${folder}${sl()}${file}`);
            }
            else {
                rootFiles.push(`${folder}${sl()}${file}`);
            }
        });
    }

    rootFiles.forEach(file => {
        let f = file.replace(sl(), "/");
        if (PROJECT_SCRIPTS[toolId][f]) {
            let content = readFileSync(getToolDir(toolId) + file, "utf-8");
            log(`Running specified script on ${file}`);
            content = PROJECT_SCRIPTS[toolId][f](content, LIVE_SERVER_ACTIVE) || content;
            writeFileSync(getToolDir(toolId) + file, content);
        }
        else {
            // Check if the file's parent folder has a script instead
            let fArray = f.split("/");
            fArray.pop(); // Remove the file name
            while (fArray.length > 0) {
                let part = fArray.join("/") + "/";
                fArray.pop(); // Remove the current folder name
                // We're doing it in reverse to make sure more nested folders have higher priority
                if (PROJECT_SCRIPTS[toolId][part]) {
                    log(`Running specified script on ${file} (Inherited from folder \`${part}\`)`);
                    let content = readFileSync(getToolDir(toolId) + file, "utf-8");
                    content = PROJECT_SCRIPTS[toolId][part](content, LIVE_SERVER_ACTIVE, f) || content;
                    writeFileSync(getToolDir(toolId) + file, content);
                    break;
                }
            }
        }
        // Other types of files are not present in the tool's directories
        buildHTMLFile(file, toolId);
    })

    log(`Build Successful For \`${toolId}\` for languages: [${SUPPORTED_LANGUAGES.join(", ")}]`)
}

function generateTranslation(content, lang) {
    const parser = new JSDOM(content);
    const doc = parser.window.document;

    let list = doc.getElementsByTagName("*");

    for (let element of list) {
        if (element.hasAttribute(lang)) element.innerHTML = element.getAttribute(lang);
        for (let l of SUPPORTED_LANGUAGES) if (element.hasAttribute(l)) element.removeAttribute(l);
        for (let attribute of element.getAttributeNames()) {
            if (attribute.endsWith("-" + lang)) {
                if (element.hasAttribute(attribute.replace("-" + lang, ""))) {
                    element.setAttribute(attribute, element.getAttribute(attribute.replace("-" + lang, "")) + element.getAttribute(attribute));
                }
                element.setAttribute(attribute.replace("-" + lang, ""), element.getAttribute(attribute));
                element.removeAttribute(attribute);
            }
            for (let l of SUPPORTED_LANGUAGES) if (attribute.endsWith("-" + l)) element.removeAttribute(attribute);
        }
        if (MIGRATE_TRANSLATION_SYSTEM) {
            if (element.hasAttribute("ti")) element.removeAttribute("ti");
            if (element.hasAttribute("pre-ti")) element.removeAttribute("pre-ti");
        }
    }
    let result = parser.serialize();
    // For some reason, JSDom likes moves the gtag into the head element
    // It doesnt do the same with html comments
    // So we detect where the gtag comment it, and put the boilerplate there.
    result = result.replace(`<!-- Google tag (gtag.js) -->`, `<!-- Google tag (gtag.js) -->
<script async="" src="https://www.googletagmanager.com/gtag/js?id=G-Y5TJK47MS3"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());

    gtag('config', 'G-Y5TJK47MS3');
</script>
`);
    return result;
}

function main() {

    // This script has to run from the parent repository directory (/apbd.net/ instead of /apbd.net/compiler)
    // Incase this mistake is made, well change CWD and log it.
    // We will check for this by looking wether or not the `compiler` directory exists at CWD.

    if (!existsSync(BUILD_PATH)) {
        log(`Compiler started at incorrect directory: ${cwd()}`);
        log(`Next time, Please run this script from the root directory of the apbd.net repository.`);
    }
    while (!existsSync(BUILD_PATH)) {
        log(`Going backwards one directory and retrying...`);
        try {
            process.chdir("../")
            log(`Successfully Changed CWD to ${cwd()}`);
        } catch (e) {
            log(`Cannot go backwards from ${cwd()}`);
            log("Exiting...");
            process.exit(1);
        }
    }
    log(`\nStarting Build Process...`);
    // Make sure each language's subfolder exists
    // If it already exists, wipe it clean
    SUPPORTED_LANGUAGES.concat(SUPPORTED_PROGRAMMING_LANGUAGES).forEach(lang => {
        rmSync(getLangBuildDir(lang), { recursive: true, force: true });
        mkdirSync(getLangBuildDir(lang), { recursive: true });
    });

    for (let tool of TOOLS) {
        let rootFiles = readdirSync(getToolDir(tool));
        rootFiles = rootFiles
            .filter(file => !EXCLUDED_ROOT_PATHS[tool].includes(file))

        buildTool(tool, Array.from(rootFiles));
    }

    for (let lang of SUPPORTED_PROGRAMMING_LANGUAGES) {
        cpSync(getLangDir(lang), getLangBuildDir(lang), { recursive: true });
        log(`Copied ${lang} files to build folder.`);
    }

    if (CONTINUOUS) {

        if (LAUNCH_DEV_SERVER) {
            log(`Starting development server...`);
            liveServer.start({ root: BUILD_PATH, open: true });
            LIVE_SERVER_ACTIVE = true;
            process.on("SIGINT", () => {
                liveServer.shutdown()
                log("Server stopped. Exiting...");
                process.exit(0);
            })
        }

        if (!CONTINUOUS) log(`Initial build phase done! Watching for changes...`);
        const watcher = watch(getLangDir(HTML), { recursive: true, ignoreInitial: true, useFsEvents: true });
        watcher
            .on("ready", () => { })
            .on("change", path => {
                let toolId = path.split(sl())[2];
                let actualPath = path.split(sl()).slice(3).join(sl());
                if (!LAUNCH_DEV_SERVER) log(`File Changed: ${path.replace(getLangDir(HTML), "")}`);
                buildHTMLFile(actualPath, toolId);
            })
            .on("add", path => {
                let toolId = path.split(sl())[2];
                let actualPath = path.split(sl()).slice(3).join(sl());
                if (!LAUNCH_DEV_SERVER) log(`File Added: ${path.replace(getLangDir(HTML), "")}`);
                buildHTMLFile(actualPath, toolId);
            })
            .on("unlink", path => {
                let toolId = path.split(sl())[2];
                let actualPath = path.split(sl()).slice(3).join(sl());
                if (!LAUNCH_DEV_SERVER) log(`File Removed: ${path.replace(getLangDir(HTML), "")}`);
                removeHTMLFile(actualPath, toolId);
            });

        for (let lang of SUPPORTED_PROGRAMMING_LANGUAGES) {
            let langWatcher = watch(getLangDir(lang), { recursive: true, ignoreInitial: true, useFsEvents: true });
            langWatcher
                .on("ready", () => { })
                .on("change", path => {
                    path = path.split(sl()).slice(2).join(sl());
                    if (!LAUNCH_DEV_SERVER) log(`Asset Changed (${lang}): ${path}`);
                    copyOtherFiles(path, lang);
                })
                .on("add", path => {
                    path = path.split(sl()).slice(2).join(sl());
                    if (!LAUNCH_DEV_SERVER) log(`Asset Added (${lang}): ${path}`);
                    copyOtherFiles(path, lang);
                })
                .on("unlink", path => {
                    path = path.split(sl()).slice(2).join(sl());
                    if (!LAUNCH_DEV_SERVER) log(`Asset Removed (${lang}): ${path}`);
                    removeOtherFiles(path, lang);
                });
        }
    }
    else log("Done! Ready To Deploy :D");
}

main();