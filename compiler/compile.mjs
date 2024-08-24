// writes this entire project to two different file paths, depending on the language.

import { JSDOM } from "jsdom";
import { readdirSync, copyFileSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync, unlinkSync } from "fs";
import { log } from "console";
import { watch } from "chokidar";
import { chdir, cwd } from "process";

function sl() {
    return process.platform === "win32" ? "\\" : "/";
}

const LANDING_PAGE_ID = "landing-page";
const TOOLS = ["foods", LANDING_PAGE_ID];

const EXCLUDED_ROOT_PATHS = {
    "foods": ["scrapes", "LICENSE.md", "README.md", ".vscode", "favicon.ico"],
};
EXCLUDED_ROOT_PATHS[LANDING_PAGE_ID] = ["favicon.ico", "testing"];

const SUPPORTED_LANGUAGES = ["en", "he"];
const MIGRATE_TRANSLATION_SYSTEM = process.argv.includes("--migrate-translation-system") || process.argv.includes("--mts");
const CONTINUOUS = process.argv.includes("--continuous") || process.argv.includes("--c");
const BUILD_PATH = `.${sl()}build`;
const SOURCE_PATH = `.${sl()}source`;



/**
 * Returns the directory path for a given language.
 *
 * @param {string} lang - the language code (e.g. "en", "he")
 * @param {string} toolId - the ID of the tool
 * @return {string} the directory path for the given language
 */
function getLangDir(lang) {
    return `${BUILD_PATH}${sl()}${lang}${sl()}`;
}

function getToolBuildDir(lang, toolId) {
    if (toolId === LANDING_PAGE_ID) {
        return getLangDir(lang);
    }

    return getLangDir(lang) + toolId + sl();
}

/**
 * Returns the directory path for a given tool.
 *
 * @param {string} toolId - the ID of the tool
 * @return {string} the directory path for the given tool
 */
function getToolDir(toolId) {
    return `${SOURCE_PATH}${sl()}${toolId}${sl()}`;
}

/**
 * builds a file and adds it to the build folder for each language
 *
 * @param {string} path - the path of the file
 * @param {string} toolId - the id of the tool to build for
 * @return {void}
 */
function buildFile(path, toolId) {
    SUPPORTED_LANGUAGES.forEach(lang => {
        if (path.endsWith(".html")) {
            let content = readFileSync(getToolDir(toolId) + path, "utf-8");
            // May support different langauges, produce translated documents

            let result = generateTranslation(content, lang);
            // Create the dir if it doesn't exist
            mkdirSync(`${getToolBuildDir(lang, toolId)}${path.split(sl()).slice(0, -1).join(sl())}`, { recursive: true });
            writeFileSync(`${getToolBuildDir(lang, toolId)}${path}`, result);
        } else {
            // Copy other files
            // Create the dir if it doesn't exist
            mkdirSync(`${getToolBuildDir(lang, toolId)}${path.split(sl()).slice(0, -1).join(sl())}`, { recursive: true });
            copyFileSync(getToolDir(toolId) + path, `${getToolBuildDir(lang, toolId)}${path}`);
        }
    });
}

/**
 * Removes a file from the build directory for each supported language.
 *
 * @param {string} path - the path of the file to remove, relative to the tool's source directory
 * @param {string} toolId - the ID of the tool
 * @return {void}
 */
function removeFile(path, toolId) {
    for (let lang of SUPPORTED_LANGUAGES) {
        let filePath = getToolBuildDir(lang, toolId) + path;
        if (existsSync(filePath)) {
            unlinkSync(filePath);
        }
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
        buildFile(file, toolId);
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

    return "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
}

function main() {

    // Make sure each language's subfolder exists
    // If it already exists, wipe it clean
    SUPPORTED_LANGUAGES.forEach(lang => {
        rmSync(getLangDir(lang), { recursive: true, force: true });
        mkdirSync(getLangDir(lang), { recursive: true });
    });

    for (let tool of TOOLS) {
        let rootFiles = readdirSync(getToolDir(tool));
        rootFiles = rootFiles
            .filter(file => !EXCLUDED_ROOT_PATHS[tool].includes(file))

        buildTool(tool, Array.from(rootFiles));
    }

    if (CONTINUOUS) {
        log(`Initial build phase done! Watching for changes...`);
        const watcher = watch(SOURCE_PATH, { recursive: true, ignoreInitial: true, useFsEvents: true });
        watcher
            .on("ready", () => {})
            .on("change", path => {
                let toolId = path.split(sl())[1];
                let actualPath = path.split(sl()).slice(2).join(sl());
                log(`File Changed: ${path.replace(SOURCE_PATH + sl(), "")}`);
                buildFile(actualPath, toolId);
            })
            .on("add", path => {
                let toolId = path.split(sl())[1];
                let actualPath = path.split(sl()).slice(2).join(sl());
                log(`File Added: ${path.replace(SOURCE_PATH + sl(), "")}`);
                buildFile(actualPath, toolId);
            })
            .on("unlink", path => {
                let toolId = path.split(sl())[1];
                let actualPath = path.split(sl()).slice(2).join(sl());
                log(`File Removed: ${path.replace(SOURCE_PATH + sl(), "")}`);
                removeFile(actualPath, toolId);
            });

    }
    else log("Done! Ready To Deploy :D");
}

main();