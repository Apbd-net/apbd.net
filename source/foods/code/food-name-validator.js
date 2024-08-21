function activateFoodNameValidator() {
    /**
 * @type{{
            defaultWeight: float,
            foodNameEn: string,
            foodNameHe: string,
            foodTranslationIndices: int[],
            preprocessedFoodName: string,
            companyId: string,
            companyEn: string,
            companyHe: string,
            glycemicIndex: {
                value: float,
                metadata: {
                    key: string,
                    details: string
                }[]
            },
            glycemicLoad: {
                value: float,
                metadata: {
                    key: string,
                    details: string
                }[]
            },
            sugar: {
                value: float,
                metadata: {
                    key: string,
                    details: string
                }[]
            },
            carbs: {
                value: float,
                metadata: {
                    key: string,
                    details: string
                }
            }
    }[]}
 */
    let tableData = JSON.parse(localStorage.tableRows);
    /**
    * @type {HTMLInputElement}
    */
    const enField = document.getElementById("food-name-english");
    /**
     * @type {HTMLInputElement}
     */
    const heField = document.getElementById("food-name-hebrew");

    /**
     * @type {HTMLInputElement}
     */
    const companyField = document.getElementById("company");

    const enSpan = document.createElement("span");
    enSpan.classList.add("already-exists");
    const heSpan = document.createElement("span");
    heSpan.classList.add("already-exists");

    enField.parentElement.prepend(enSpan);
    heField.parentElement.prepend(heSpan);

    enField.addEventListener("input", (_) => {
        if (enField.value.length == 0) return;

        if (tableData.some(data => data.foodNameEn == enField.value)) {
            enField.classList.add("already-exists");
            enSpan.innerHTML = translationMatrix[89][languageIndex];
        } else {
            enField.classList.remove("already-exists");
            enSpan.innerHTML = "";
        }
    });

    heField.addEventListener("input", (_) => {
        if (heField.value.length == 0) return;

        if (tableData.some(data => data.foodNameHe == heField.value)) {
            heSpan.innerHTML = translationMatrix[89][languageIndex];
            heField.classList.add("already-exists");
        } else {
            heField.classList.remove("already-exists");
        }
    });

    companyField.addEventListener("input", (_) => {
        if (companyField.value.length == 0) return;

        let processed = companyField.value.trim().toLowerCase().replace(" ", "-");

        console.log(tableData.filter(data => data.foodNameEn == enField.value || data.foodNameHe == heField.value));

        if (tableData.some(data => (data.foodNameEn == enField.value || data.foodNameHe == heField.value) && (data.companyEn != processed && data.companyHe != processed && data.companyId != processed))) {
            heField.classList.remove("already-exists");
            heSpan.innerHTML = "";
            enField.classList.remove("already-exists");
            enSpan.innerHTML = "";
        } else if (tableData.some(data => (data.foodNameEn == enField.value || data.foodNameHe == heField.value) && (data.companyEn == processed || data.companyHe == processed || data.companyId == processed))) {
            heField.classList.add("already-exists");
            heSpan.innerHTML = translationMatrix[89][languageIndex];
            enField.classList.add("already-exists");
            enSpan.innerHTML = translationMatrix[89][languageIndex];
        }
    });
}