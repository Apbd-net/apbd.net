const submitButton = document.getElementById("submit");
const inputs = [
    {id: "title",                       element: document.getElementById("title")},
    {id: "author",                      element: document.getElementById("author")},
    {id: "ingredients",                 element: document.getElementById("ingredients")},
    {id: "instructions",                element: document.getElementById("instructions")},
    {id: "preview-image",               element: document.getElementById("preview-image")},
    {id: "preview-image-description",   element: document.getElementById("preview-image-description")},
    {id: "cook-time",                   element: document.getElementById("cook-time")},
    {id: "cook-time-units",             element: document.getElementById("cook-time-units")},
    {id: "difficulty",                  element: document.getElementById("difficulty")},
    {id: "servings-min",                element: document.getElementById("servings-min")},
    {id: "servings-max",                element: document.getElementById("servings-max")},
    {id: "kashrut",                     element: document.getElementById("kashrut")},
    {id: "food-kashrut-type",           element: document.getElementById("food-kashrut-type")},
    {id: "servings-size",               element: document.getElementById("servings-size")},
    {id: "carbs",                       element: document.getElementById("carbs")},
    {id: "fiber",                       element: document.getElementById("fiber")},
    {id: "sugar",                       element: document.getElementById("sugar")},
    {id: "starch",                      element: document.getElementById("starch")},
    {id: "glycemic-load",               element: document.getElementById("glycemic-load")},
];

submitButton.onclick = () => {
    let payload = {};

    let missingRequireds = [];
    let missingOptionals = [];
    for (let input of inputs) {
        switch (input.id) {
            case "title" | "cook-time" | "difficulty" | "servings-min" | "servings-max" | "servings-size":
                if (input.element.value.length === 0) {
                    missingRequireds.push(input.id);
                    break;
                }
                payload[input.id] = input.element.value;
                break;
            case "author" | "preview-image-description":
                if (input.element.textContent.length === 0) {
                    missingOptionals.push(input.id);
                    break;
                }
                payload[input.id] = input.element.textContent;
                break;
            case "preview-image":
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
                payload[input.id] = input.element.src;
                break;
            case "cook-time-units" | "kashrut" | "food-kashrut-type":
                payload[input.id] = input.element.options[input.element.selectedIndex].value;
                break;
            case "carbs" | "fiber" | "sugar" | "starch" | "glycemic-load":
                let inputs = input.element.getElementsByTagName("input");
                payload[input.id + "-100g"] = inputs[0].value;
                payload[input.id + "-serving"] = inputs[1].value;
                break;
        }
    }
}