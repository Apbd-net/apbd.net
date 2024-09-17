/**
 * @type {HTMLSpanElement}
 */
const ingredientAmount = document.getElementById("ingredient-amount");
/**
 * @type {HTMLSpanElement}
 */
const stepAmount = document.getElementById("step-amount");

/**
 * @type {HTMLUListElement}
 */
const ingredientContainer = document.getElementById("ingredients");

/**
 * @type {HTMLOListElement}
 */
const instructionContainer = document.getElementById("instructions");

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
    if (shouldAddEmptyIngredientEntry) {
        addIngredientEntry();
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
        /** @type {HTMLSpanElement} */
        let contentSpans = instruction.querySelectorAll("span[contenteditable]");
        let hasAllEmpty = true;
        for (let contentSpan of contentSpans) {
            if (contentSpan.innerText.length > 0) {
                hasAllEmpty = false;
                break;
            }
        }
        if (hasAllEmpty) {
            if (!shouldAddEmptyInstructionEntry) {
                instructionContainer.removeChild(instruction);
            }
            shouldAddEmptyInstructionEntry = false;
            break;
        }
    }
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
instructionContainer.querySelectorAll("span[contenteditable]").forEach(span => span.addEventListener("input", onInstructionChange))