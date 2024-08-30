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
        type: "request",
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
 * 
 * @param {string} name The name of the contributor, Leave empty for anonymous.
 * @param {Array} foodEn First item is the english name, second item is the sureness factor
 * @param {Array} foodHe First item is the hebrew name, second item is the sureness factor
 * @param {number} defaultWeight The default weight of the food
 * @param {{ID: string, en: string, he: string}} foodCompany An object containing the company's ID and its translation. Leave this as null if no company was provided.
 * @param {{value: number, metadata: string}} gi The food's glycemic index, and additional metadata if needed.
 * @param {{value: number, metadata: string}} gl The food's glycemic load, and additional metadata if needed. 
 * @param {{value: number, metadata: string}} sugar The food's amount of sugar, and additional metadata if needed.
 * @param {{value: number, metadata: string}} carbs The food's amount of carbs, and additional metadata if needed.
 */
async function provideUsingDetails(name, foodEn, foodHe, defaultWeight, foodCompany, gi, gl, sugar, carbs) {
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