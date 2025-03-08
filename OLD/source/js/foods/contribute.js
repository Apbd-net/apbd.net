/**
 * 
 * @param {string} name The name of the contributor, Leave empty for anonymous.
 * @param {Array} foodEn First item is the english name, second item is the sureness factor
 * @param {Array} foodHe First item is the hebrew name, second item is the sureness factor
 * @param {{ID: string, en: string, he: string}} foodCompany the company's ID and its translation. Leave this as null if no company was provided.
 * @returns {Promise<string>} The response from the cloudflare worker
 */
async function requestUsingDetails(name, foodEn, foodHe, foodCompany) {
    if (!name) name = "Anonymous";
    if (foodEn[0].length === 0 && foodHe[0].length === 0) return Promise.resolve("Request not submitted: No food name provided.");
    let payload = {
        type: "request-details",
        name: name,
        foodEnglish: foodEn[0],
        foodEnglishSureness: foodEn[1],
        foodHebrew: foodHe[0],
        foodHebrewSureness: foodHe[1],
        foodCompany: foodCompany,
    }
    return await fetch("https://apbd-contrib-bot.shaharmsecond.workers.dev/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    })
        .then(response => response.text())
        .then(data => data);
}

/**
 * Sends a request using images to the cloudflare worker.
 *
 * @param {string} name - The name of the contributor, Leave empty for anonymous.
 * @param {string[]} imageBase64s - An array of base64 encoded images.
 * @returns {Promise<string>} The response from the cloudflare worker.
 */
async function requestUsingImages(name, imageBase64s) {    
    let processed = imageBase64s.map(base64 => {
        return base64.replace(/^data:image\/[a-z]+;base64,/, "");
    })
    processed = processed.filter(base64 => {
        return base64 != "data:,"
    })
    imageBase64s = processed;
    if (!name) name = "Anonymous";
    let payload = {
        type: "request-images",
        name: name,
        imageBase64s: imageBase64s
    }
    return await fetch("https://apbd-contrib-bot.shaharmsecond.workers.dev/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    })
        .then(response => response.text())
        .then(data => data);
}

/**
 * 
 * @param {string} name The name of the contributor, Leave empty for anonymous.
 * @param {Array} foodEn First item is the english name, second item is the sureness factor
 * @param {Array} foodHe First item is the hebrew name, second item is the sureness factor
 * @param {number} defaultWeight The default weight of the food
 * @param {{ID: string, en: string, he: string}} foodCompany An object containing the company's ID and its translation. Leave this as null if no company was provided.
 * @param {{value: number, metadata: string}} gi The food's glycemic index, and additional metadata if needed.
 * @param {{value: number, metadata: string}} gl The food's glycemic load, and additional metadata if needed. 
 * @param {{value: number, metadata: string}} sugar The food's amount of sugar, and additional metadata if needed.
 * @param {{value: number, metadata: string}} starch The food's amount of starch, and additional metadata if needed.
 * @param {{value: number, metadata: string}} fiber The food's amount of fiber, and additional metadata if needed.
 * @param {{value: number, metadata: string}} carbs The food's amount of carbs, and additional metadata if needed.
 */
async function provideUsingDetails(name, foodEn, foodHe, defaultWeight, foodCompany, gi, gl, sugar, starch, fiber, carbs) {
    if (!name) name = "Anonymous";
    if (foodEn[0].length === 0 && foodHe[0].length === 0) return Promise.resolve("Addition not submitted: No food name provided.");
    let payload = {
        type: "provide",
        name: name,
        foodEnglish: foodEn[0],
        foodEnglishSureness: foodEn[1],
        foodHebrew: foodHe[0],
        foodHebrewSureness: foodHe[1],
        foodCompany: foodCompany,
        defaultWeight: defaultWeight,
        glycemicIndex: gi.value,
        glycemicIndexMetadata: gi.metadata,
        glycemicLoad: gl.value,
        glycemicLoadMetadata: gl.metadata,
        sugar: sugar.value,
        sugarMetadata: sugar.metadata,
        starch: starch.value,
        starchMetadata: starch.metadata,
        fiber: fiber.value,
        fiberMetadata: fiber.metadata,
        carbs: carbs.value,
        carbsMetadata: carbs.metadata
    }

    return await fetch("https://apbd-contrib-bot.shaharmsecond.workers.dev/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    })
        .then(response => response.text())
        .then(data => data);

}