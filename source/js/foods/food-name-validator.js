fetch("/en/foods/data.json").then((response) => response.text()).then((data) => {
    activateFoodNameValidator(JSON.parse(data));
})

function activateFoodNameValidator(data) {
    console.log(data);
    
    let enNames = data.array.map(entry => entry.food.en);
    let heNames = data.array.map(entry => entry.food.he);
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

        if (enNames.some(data => data == enField.value)) {
            enField.classList.add("already-exists");
            enSpan.innerHTML = "already exists";
        } else {
            enField.classList.remove("already-exists");
            enSpan.innerHTML = "";
        }
    });

    heField.addEventListener("input", (_) => {
        if (heField.value.length == 0) return;

        if (heNames.some(data => data == heField.value)) {
            heSpan.innerHTML = "already exists";
            heField.classList.add("already-exists");
        } else {
            heField.classList.remove("already-exists");
            heSpan.innerHTML = "";
        }
    });

    companyField.addEventListener("input", (_) => {
        if (companyField.value.length == 0) return;

        let processed = companyField.value.trim().toLowerCase().replace(" ", "-");


        if (false) {
            heField.classList.remove("already-exists");
            heSpan.innerHTML = "";
            enField.classList.remove("already-exists");
            enSpan.innerHTML = "";
        } else if (false) {
            heField.classList.add("already-exists");
            heSpan.innerHTML = translationMatrix[89][languageIndex];
            enField.classList.add("already-exists");
            enSpan.innerHTML = translationMatrix[89][languageIndex];
        }
    });

    let companiesDatalist = document.getElementById("companies");

    companiesDatalist.innerHTML = data.companies.map(company => `<option value='{"ID": "${company.ID}", "en": "${company.en}", "he": "${company.he}"}'>${window.document.dir == "ltr" ? company.en : company.he}</option>`).join("\n");
}