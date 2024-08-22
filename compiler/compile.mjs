// writes this entire project to two different file paths, depending on the language.

import { JSDOM } from "jsdom";
import { readdirSync, copyFileSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync, unlinkSync } from "fs";
import { log } from "console";
import { watch } from "chokidar";

function sl() {
    return process.platform === "win32" ? "\\" : "/";
}

const TOOLS = ["foods"];
const LANDING_PAGE_ID = "landing-page";
const EXCLUDED_ROOT_PATHS = {
    "foods": ["scrapes", "compiler", "robots.txt", "LICENSE.md", "README.md", "sitemap.xml", "node_modules", ".vscode", ".git"]
};
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

        buildTool(tool, rootFiles);
        if (CONTINUOUS) {
            const watcher = watch(rootFiles, { persistent: true });
            watcher
                .on('add', (p) => { log(`Adding: ${getToolDir(tool) + p}`); buildFile(p, tool) })
                .on('change', (p) => { log(`Changing: ${getToolDir(tool) + p}`); buildFile(p, tool) })
                .on('unlink', (p) => { log(`Removing: ${getToolDir(tool) + p}`); removeFile(p, tool) });
        }
    }

    if (CONTINUOUS) log(`Initial build phase done! Watching for changes...`);
    else log("Done! Ready To Deploy :D");
}

main();