

/**
 * @type {HTMLSpanElement}
 */
const ingredientAmount = document.getElementById("ingredient-amount");
/**
 * @type {HTMLUListElement}
 */
const ingredientContainer = document.getElementById("ingredients");

/**
 * @type {HTMLSpanElement}
 */
const instructionAmount = document.getElementById("step-amount");
/**
 * @type {HTMLOListElement}
 */
const instructionContainer = document.getElementById("instructions");


/** @type {HTMLInputElement} */
const previewSelector = document.getElementById("preview-selector");

/** @type {HTMLImageElement} */
const previewImage = document.getElementById("preview-image");

// For both ingredient and instruction elements, if all of them are not empty, we need to add another one at the end.

function onIngredientChange() {
    let shouldAddEmptyIngredientEntry = true;
    for (let ingredient of Array.from(ingredientContainer.children)) {
        /** @type {HTMLSpanElement} */
        let contentSpan = ingredient.querySelector("span[contenteditable]");
        /** @type {HTMLInputElement} */
        let weightInput = ingredient.querySelector("input[type=number]");

        if (contentSpan.innerText.length === 0 && weightInput.value.length === 0) {
            if (!shouldAddEmptyIngredientEntry) {
                ingredientContainer.removeChild(ingredient);
            }
            shouldAddEmptyIngredientEntry = false;
        } 
    }
    ingredientAmount.innerText = ingredientContainer.children.length;
    if (shouldAddEmptyIngredientEntry) {
        addIngredientEntry();
    }

    // Update the sideview list preview

    ingredientsSideview.innerHTML = "";

    for (let ingredient of Array.from(ingredientContainer.children)) {
        let span = document.createElement("li");

        let foodName = ingredient.querySelector("span[contenteditable]").textContent;
        let foodWeight = ingredient.querySelector("input[type=number]").value;
        if (foodWeight.length === 0 && foodName.length === 0) continue;
        let foodUnits = ingredient.querySelector("select");
        span.innerText = foodName + ", " + foodWeight + " " + foodUnits.options[foodUnits.selectedIndex].label;
        ingredientsSideview.appendChild(span);
    }

}

function addIngredientEntry() {
    /** @type {HTMLLIElement} */
    let newIngredient = ingredientContainer.children[0].cloneNode(true);
    newIngredient.querySelector("span[contenteditable]").innerText = "";
    newIngredient.querySelector("span[contenteditable]").addEventListener("input", onIngredientChange);
    newIngredient.querySelector("input[type=number]").value = "";
    newIngredient.querySelector("input[type=number]").addEventListener("input", onIngredientChange);
    newIngredient.querySelector("select").value = "g";

    ingredientContainer.appendChild(newIngredient);
}

function onInstructionChange() {
    let shouldAddEmptyInstructionEntry = true;
    for (let instruction of instructionContainer.children) {
        /** @type {HTMLSpanElement[]} */
        let contentSpans = instruction.querySelectorAll("span[contenteditable]");
        console.log(contentSpans);
        let hasAllEmpty = true;
        for (let contentSpan of contentSpans) {
            console.log(contentSpan.textContent, contentSpan.textContent.length);
            
            if (contentSpan.textContent.length > 0) {
                hasAllEmpty = false;
                break;
            }
        }
        if (hasAllEmpty) {
            if (!shouldAddEmptyInstructionEntry) {
                instructionContainer.removeChild(instruction);
            }
            shouldAddEmptyInstructionEntry = false;
        }
    }
    instructionAmount.textContent = instructionContainer.children.length;
    if (shouldAddEmptyInstructionEntry) {
        addInstructionEntry();
    }
}

function addInstructionEntry() {
    /** @type {HTMLLIElement} */
    let newInstruction = instructionContainer.children[0].cloneNode(true);
    newInstruction.querySelectorAll("span[contenteditable]").forEach(span => {
        span.innerText = "";
        span.addEventListener("input", onInstructionChange);
    });
    instructionContainer.appendChild(newInstruction);
}

ingredientContainer.querySelectorAll("span[contenteditable], input[type=number]").forEach(span => span.addEventListener("input", onIngredientChange));
instructionContainer.querySelectorAll("span[contenteditable]").forEach(span => span.addEventListener("input", onInstructionChange));

ingredientAmount.innerText = "0";
instructionAmount.innerText = "0";


previewSelector.addEventListener("change", e => {
    previewImage.src = URL.createObjectURL(e.target.files[0]);
})