
const servingWeightIdentifier = document.getElementById("serving-weight-identifier");
let w = servingWeightIdentifier.getAttribute("value");

let carbsRow = document.getElementById("carbs");
let fiberRow = document.getElementById("fiber");
let sugarRow = document.getElementById("sugar");
let starchRow = document.getElementById("starch");
let glycemicLoadRow = document.getElementById("glycemic-load");

if (carbsRow && fiberRow && sugarRow && starchRow && glycemicLoadRow) {
    let value100g = normalizeWeight(carbsRow.children[1].innerHTML);
    if (!value100g) value100g = carbsRow.children[1];
    
    let valueServing = normalizeWeight(carbsRow.children[2].innerHTML);
    if (!valueServing) valueServing = carbsRow.children[2];

    let fiber100g = normalizeWeight(fiberRow.children[1].innerHTML);
    if (!fiber100g) fiber100g = fiberRow.children[1];
    let fiberServing = normalizeWeight(fiberRow.children[2].innerHTML);
    if (!fiberServing) fiberServing = fiberRow.children[2];

    let sugar100g = normalizeWeight(sugarRow.children[1].innerHTML);
    if (!sugar100g) sugar100g = sugarRow.children[1];
    let sugarServing = normalizeWeight(sugarRow.children[2].innerHTML);
    if (!sugarServing) sugarServing = sugarRow.children[2];

    let starch100g = normalizeWeight(starchRow.children[1].innerHTML);
    if (!starch100g) starch100g = starchRow.children[1];
    let starchServing = normalizeWeight(starchRow.children[2].innerHTML);
    if (!starchServing) starchServing = starchRow.children[2];

    let colors = getRatioQuality(value100g.value, fiber100g.value, sugar100g.value, starch100g.value);
    
    carbsRow.children[1].style.color = colors.carbsColor + "!important";;
    fiberRow.children[1].style.color = colors.fiberColor + "!important";;
    sugarRow.children[1].style.color = colors.sugarColor + "!important";;
    starchRow.children[1].style.color = colors.starchColor + "!important";;
    
    let colorsServing = getRatioQuality(valueServing.value, fiberServing.value, sugarServing.value, starchServing.value);

    carbsRow.children[2].style.color = colorsServing.carbsColor + "!important";
    fiberRow.children[2].style.color = colorsServing.fiberColor + "!important";
    sugarRow.children[2].style.color = colorsServing.sugarColor + "!important";
    starchRow.children[2].style.color = colorsServing.starchColor + "!important";

    let load100g = parseFloat(glycemicLoadRow.children[1].innerHTML);
    let loadServing = parseFloat(glycemicLoadRow.children[2].innerHTML);

    let load100gColor = load100g < 0 ? "gray" : load100g < 5 ? "#00ff00" : load100g < 10 ? "#9fe2bf" : load100g < 15 ? "#ffff00" : "#00ff00";
    let loadServingColor = loadServing < 0 ? "gray" : loadServing < 5 ? "#00ff00" : loadServing < 10 ? "#9fe2bf" : loadServing < 15 ? "#ffff00" : "#00ff00";
    
    glycemicLoadRow.children[1].style.color = load100gColor + "!important";
    glycemicLoadRow.children[2].style.color = loadServingColor + "!important";

    if (load100g < 0) {
        glycemicLoadRow.children[1].innerHTML = document.documentElement.getAttribute("nodata");
    }
    if (loadServing < 0) {
        glycemicLoadRow.children[2].innerHTML = document.documentElement.getAttribute("nodata");
    }
}


/**
 * Normalize a number with units to a standardized format.
 *
 * @param {string} numberWithUnits - The number with units to be normalized.
 * @param {boolean} [assignWeightToUtils=true] - Whether to assign weight to units or volume. Default is true.
 * @return {{value: number, metric: "weight"|"volume"}|null} - The normalized number with the metric type (either "weight" or "volume") or null if the input is invalid.
 */
function normalizeWeight(numberWithUnits, assignWeightToUtils = true) {
    let splitter = /[0-9.]+([a-zA-Z])/;

    let match = splitter.exec(numberWithUnits);
    if (!match) return null;

    let number = parseFloat(match[0]);
    let unit = match[1];
    switch (unit.toLowerCase()) {
        case "mg": return {value: number / 1000, metric: "weight"};
        case "g": return {value: number, metric: "weight"};
        case "kg": return {value: number * 1000, metric: "weight"};
        case "oz": return {value: number * 28.3495, metric: "weight"};
        case "lb": return {value: number * 453.592, metric: "weight"};

        case "ml": return {value: number, metric: "volume"};
        case "cl": return {value: number * 10, metric: "volume"};
        case "dl": return {value: number * 100, metric: "volume"};
        case "l": return {value: number * 1000, metric: "volume"};

        case "tsp": return {value: number * 5, metric: assignWeightToUtils ? "weight" : "volume"};
        case "tbsp": return {value: number * 15, metric: assignWeightToUtils ? "weight" : "volume"};
        case "cup": return {value: number * 250, metric: assignWeightToUtils ? "weight" : "volume"};
    }
}

/**
 * Returns a color array based on the ratio of carbs.
 * 
 * @param {number} totalCarbs 
 * @param {number} ofWhichFiber 
 * @param {number} ofWhichSugar 
 * @param {number} ofWhichStarch 
 * @returns {{fiberColor: string, sugarColor: string, starchColor: string}}
 */
function getRatioQuality(totalCarbs, ofWhichFiber, ofWhichSugar, ofWhichStarch) {
    let fiberRatio = ofWhichFiber / totalCarbs;
    let fiberColor = fiberRatio >= 0.7 ? "#00ff00" : fiberRatio >= 0.55 ? "#9fe2bf" : "#ffffff";
    let fiberScore = ofWhichFiber * 2;

    let sugarColor = ofWhichSugar <= 2 ? "#00ff00" : ofWhichSugar <= 4 ? "#9fe2bf" : ofWhichSugar <= 8 ? "#ffff00" : "#ff0000";
    let sugarScore = ofWhichSugar * -4;

    let starchColor = ofWhichStarch <= 2 ? "#00ff00" : ofWhichStarch <= 4 ? "#9fe2bf" : ofWhichStarch <= 8 ? "#ffff00" : "#ff0000";
    let starchScore = ofWhichStarch * -4 ;
    
    let carbScore = fiberScore + sugarScore + starchScore;
    let carbsColor = totalCarbs >= 1 ? "#00ff00" : totalCarbs <= 1 ? "#9fe2bf" : totalCarbs <= -4 ? "#ffff00" : "#ff0000";
    

    return {carbsColor, fiberColor, sugarColor, starchColor};
}