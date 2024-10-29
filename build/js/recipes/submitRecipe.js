const submitButton = document.getElementById("submit");
const submitionOutput = document.getElementById("submition-output");
const displayOnMissingFields = document.getElementById("display-on-missing-fields");
const inputs = [
    { id: "title", element: document.getElementById("title") },
    { id: "author", element: document.getElementById("author") },
    { id: "ingredients", element: document.getElementById("ingredients") },
    { id: "instructions", element: document.getElementById("instructions") },
    { id: "preview-image", element: document.getElementById("preview-image") },
    { id: "preview-image-description", element: document.getElementById("preview-image-description") },
    { id: "cook-time", element: document.getElementById("cook-time") },
    { id: "cook-time-units", element: document.getElementById("cook-time-units") },
    { id: "difficulty", element: document.getElementById("difficulty") },
    { id: "servings-min", element: document.getElementById("servings-min") },
    { id: "servings-max", element: document.getElementById("servings-max") },
    { id: "kashrut", element: document.getElementById("kashrut") },
    { id: "food-kashrut-type", element: document.getElementById("food-kashrut-type") },
    { id: "serving-size", element: document.getElementById("serving-size") },
    { id: "carbs", element: document.getElementById("carbs") },
    { id: "fiber", element: document.getElementById("fiber") },
    { id: "sugar", element: document.getElementById("sugar") },
    { id: "starch", element: document.getElementById("starch") },
    { id: "glycemic-load", element: document.getElementById("glycemic-load") },
];

submitButton.onclick = () => {
    let initial = submitButton.innerHTML;
    submitButton.innerHTML = submitButton.getAttribute("submitting");
    submitionOutput.classList.remove("invisible");
    submitionOutput.innerHTML = submitionOutput.getAttribute("output-4");
    let payload = {};

    let missingRequireds = [];
    let missingOptionals = [];
    for (let input of inputs) {
        switch (true) {
            case ["cook-time", "difficulty", "servings-min", "servings-max", "serving-size"].includes(input.id):                                
                if (input.element.value.length === 0) {
                    missingRequireds.push(input.id);
                    break;
                }
                payload[input.id] = input.element.value;
                break;
            case ["title"].includes(input.id): {
                if (input.element.textContent.length === 0) {
                    missingRequireds.push(input.id);
                    break;
                }
                payload[input.id] = input.element.value;
                break;
            }
            case ["author", "preview-image-description"].includes(input.id):
                if (input.element.textContent.length === 0) {
                    missingOptionals.push(input.id);
                    break;
                }
                payload[input.id] = input.element.textContent;
                break;
            case input.id === "preview-image":
                if (input.element.src.length === 0) {
                    missingOptionals.push(input.id);
                    break;
                }
                // Convert img to base64
                let canvas = document.createElement("canvas");
                let ctx = canvas.getContext("2d");
                let img = new Image();
                img.src = input.element.src;
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                let base64 = canvas.toDataURL("image/png");
                // Strip the data: prefix
                base64 = base64.slice(base64.indexOf(",") + 1);
                payload[input.id + "-base64"] = input.element.src;
                break;
            case ["cook-time-units", "kashrut", "food-kashrut-type"].includes(input.id):
                if (input.element.selectedIndex === 0) {
                    missingRequireds.push(input.id);
                    break;
                }
                payload[input.id] = input.element.options[input.element.selectedIndex].value;
                break;
            case ["carbs", "fiber", "sugar", "starch", "glycemic-load"].includes(input.id):
                let inputs = input.element.getElementsByTagName("input");
                if (inputs[0].value.length === 0 || inputs[1].value.length === 0) {
                    missingOptionals.push(input.id);
                    break;
                }
                payload[input.id + "100g"] = inputs[0].value;
                payload[input.id + "-serving"] = inputs[1].value;
                break;
            case input.id === "instructions":
                payload["instructions-element"] = "";
                payload["instructions-count"] = 0;
                for (const child of input.element.children) {
                    let instruction = child.querySelector("span[contenteditable]").textContent;
                    let note = child.querySelector("p.note").textContent;
                    if (instruction.length === 0 && note.trim().length === 0) continue;
                    payload["instructions-count"]++;
                    payload["instructions-element"] += `
                <li>
                    <p
                        ${document.documentElement.getAttribute("lang")}="${instruction}"
                    ></p>${(note.trim().length > 0 ? `
                    <p class="note
                        ${document.documentElement.getAttribute("lang")}="${note}"
                    ></p>` : "")}
                </li>`
                }
                if (payload["instructions-element"].length === 0) missingRequireds.push("instructions");
                break;
            case ["ingredients"].includes(input.id):
                payload["ingredients-element"] = "";
                payload["ingredients-sideview-element"] = "";
                payload["ingredients-count"] = 0;
                
                for (const child of input.element.children) {
                    let ingName = child.querySelector("span[contenteditable]").textContent;
                    let ingAmount = child.querySelector("input[type=number]").value;
                    let ingUnit = child.querySelector("select").options[child.querySelector("select").selectedIndex].value;
                    let ingUnitLabel = child.querySelector("select").options[child.querySelector("select").selectedIndex].label;
                    if (ingName.length === 0 && ingAmount.length === 0) continue;
                    payload["ingredients-count"]++;
                    payload["ingredients-element"] += `
                <li>
                    <span class="ing-weight">${ingAmount}</span> 
                    <span class="ing-unit">${ingUnitLabel}</span> 
                    <span class="ing-name">${ingName}</span>
                </li>`
                    payload["ingredients-sideview-element"] += `
                <li><span class="ing-name">${ingName}</span>, ${ingAmount}${ingUnit}</li>`
                }
                
                if (payload["ingredients-element"].length === 0) missingRequireds.push("ingredients");
                break;
        }
    }
    
    if (missingRequireds.length !== 0) {
        for (let item of missingRequireds) {
            try {
                displayOnMissingFields.getElementsByClassName(item)[0].classList.remove("invisible");
                inputs.find(i => i.id === item).element.classList.add("required");
            } catch (e) {console.log(e);}
        }
        displayOnMissingFields.classList.remove("invisible");
        submitionOutput.classList.add("invisible");
        submitButton.innerHTML = initial;
        return;
    } else if (missingOptionals.length !== 0) {
        let innerText = missingOptionals.join("\n");
        let prefix, postfix;
        switch (document.documentElement.getAttribute("lang")) {
            case "en": 
                prefix = "The Following optional fields are missing:"
                postfix = "Do you want to submit the recipe anyway?\n(missing optionals won't impact acceptence)"
                break;
            case "he":
                prefix = "השדות האופציונאליים הבאים חסרים:"
                postfix = "להמשיך בכל זאת?\n(שדות אופציונאליים חסרים לא ישפיעו על קבלת המתכון לאתר)"
                break;
        }

        let answer = window.confirm(prefix + "\n\n" + innerText + "\n\n" + postfix);
        if (!answer) {
            submitButton.innerHTML = initial;
            submitionOutput.innerHTML = "";
        }
    }
    // Manipulate payload keys to remove - and turn them into camelCase
    let newObj = {};
    for (let [key, value] of Object.entries(payload)) {
        while(key.includes("-")) {
            let ind = key.indexOf("-");
            let letter = key.charAt(ind + 1).toUpperCase();
            key = key.substring(0, ind) + letter + key.substring(ind + 2);
        }
        newObj[key] = value;0
    }

    payload.type = "recipes-submit-recipe"
    payload.language = document.documentElement.getAttribute("lang");

    submitionOutput.innerHTML = submitionOutput.getAttribute("output-5");
    console.log(payload);
    return;
    fetch("https://apbd-contrib-bot.shaharmsecond.workers.dev/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify("payload")
    })
        .then(response => response.text())
        .then(text => {
            submitionOutput.innerHTML = text;
            submitButton.innerHTML = initial;
        })

}