// writes this entire project to two different file paths, depending on the language.

import { JSDOM } from "jsdom";
import { readdirSync, copyFileSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync, unlinkSync, cpSync } from "fs";
import { log } from "console";
import { watch } from "chokidar";
import { chdir, cwd } from "process";
import { exec } from "child_process";
import liveServer from "live-server";

function sl() {
    return process.platform === "win32" ? "\\" : "/";
}

const TOOLS = ["foods", "landing-page"];
const EXCLUDED_ROOT_PATHS = {
    "foods": ["scrapes"],
    "landing-page": []
};

/**
 * These script pre-process files in the `html` directory, right before theyre compiled. 
 * Changes commited here are permanent.
 */
const PROJECT_SCRIPTS = {
    "foods": {
        "data.json": (_) => {
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
        "contribute/leaderboards.html": (content) => {
            if (content.startsWith("<tr>")) {
                // Content was just added by the bot. Move it to the correct place:
                let tRowEnd = content.indexOf("</tr>");
                let tRow = content.slice(0, tRowEnd + 5);
                content = content.slice(tRowEnd + 5);

                let p = new JSDOM(content);
                p.window.document.getElementById("CONTRIBUTORS").innerHTML += tRow;

                return p.serialize();
            }
        }
    },
    "landing-page": {}
}


const SUPPORTED_LANGUAGES = ["en", "he"];
const MIGRATE_TRANSLATION_SYSTEM = process.argv.includes("--migrate-translation-system") || process.argv.includes("--mts");
const CONTINUOUS = process.argv.includes("--continuous") || process.argv.includes("--c");
const LAUNCH_DEV_SERVER = process.argv.includes("--launch-dev-server") || process.argv.includes("--dev") || process.argv.includes("--d");

const BUILD_PATH = `.${sl()}build`;
const SOURCE_PATH = `.${sl()}source`;

const CSS = `css`;
const HTML = `html`;
const JS = `js`;
const IMG = `img`;
const SUPPORTED_PROGRAMMING_LANGUAGES = [CSS, JS, IMG];


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
        if (PROJECT_SCRIPTS[toolId][file]) {
            let content = readFileSync(getToolDir(toolId) + file, "utf-8");
            log(`Running specified script on ${file}`);
            content = PROJECT_SCRIPTS[toolId][file](content) || content;
            writeFileSync(getToolDir(toolId) + file, content);
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

    return parser.serialize();
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