const parameters = new URLSearchParams(window.location.search);

if (!parameters.has("sort")) parameters.set("sort", "name-d");
else {
    let sort = parameters.get("sort");
    if (!["first-added", "last-added"].includes(sort)) {
        let selectElement = document.getElementById("sort-switch");
        selectElement.value = sort;
    }
}

/**
 * @type {HTMLTableElement}
 */
let table = document.getElementById("food-list");
let rows = Array.from(table.getElementsByTagName("tr"));

sortBy(rows, parameters.get("sort"));

table.innerHTML = rows.map(row => row.outerHTML).join("\n");

table = document.getElementById("food-list");
rows = Array.from(table.getElementsByTagName("tr"));

// Add meta-data
/*
 - Floating Point Errors
 - less/more than signs (< or >, `less-than` or `more-than`)
 - Estimated values (~) (`inaccurate`)
 - Attach approximated value indicator (todo) (`approximated`)
 - Attach company name + image (`company="..."`)
 - Attach danger notes (`danger="..."`)
*/
let pre = document.createElement("p"); //Global creating is easier
pre.style.width = "min(150px, 20vw)";
pre.style.position = "fixed";
pre.style.zIndex = "1000";
pre.style.display = "none";
pre.style.fontSize = "0.8em";
pre.style.backgroundColor = "#222222";
pre.style.border = "2px solid gray";
pre.style.borderRadius = "5px";
pre.style.padding = "5px";
pre.style.display = "none";
document.body.append(pre);

window.colorByGL = (gl) => {
    if (gl < 5) return "#00ff00";
    if (gl < 10) return "#9fe2bf";
    if (gl < 15) return "#ffff00";
    return "#ff0000";
}

for (let i = 0; i < rows.length; i++) {
    let cells = rows[i].getElementsByTagName("td");
    if (cells.length > 0) {
        
        let input = cells[0].getElementsByTagName("input")[0];
        let defaultWeight = parseFloat(cells[0].getElementsByTagName("input")[0].value);
        input.setAttribute("default-value", defaultWeight);
        input.addEventListener("input", () => {
            let glSpan = rows[i].getElementsByClassName('GLFIELD')[0], 
                sugarSpan = rows[i].getElementsByClassName('SUGARFIELD')[0], 
                carbsSpan = rows[i].getElementsByClassName('CARBFIELD')[0];
            let gl = Math.trunc((((glSpan.getAttribute("value")) / input.getAttribute("default-value")) * input.value) * 1000) / 1000;
            sugarSpan.textContent = Math.trunc((((sugarSpan.getAttribute("value")) / input.getAttribute('default-value')) * input.value) * 1000) / 1000;
            carbsSpan.textContent = Math.trunc((((carbsSpan.getAttribute("value")) / input.getAttribute('default-value')) * input.value) * 1000) / 1000;
            glSpan.style.color = window.colorByGL(gl);
            glSpan.textContent = gl;
        });

        input.dispatchEvent(new Event("input"));

        // Get the "gi", "gl", "sugar" and "carbs" spans
        let gi = cells[2].getElementsByTagName("span")[0];
        let gl = cells[3].getElementsByTagName("span")[0];
        let sugar = cells[4].getElementsByTagName("span")[0];
        let carbs = cells[5].getElementsByTagName("span")[0];


        // Add actual meta-data
        let elements = [gi, gl, sugar, carbs];
        for (let element of elements) {
            if (parseFloat(element.innerText) < 0) {
                let par = document.createElement("desc");
                par.innerText = window.document.documentElement.getAttribute("nodata");
                par.style.color = "gray";
                element.style.display = "none";
                element.after(par)
            } else if (element.hasAttribute("inaccurate")) {
                let par = document.createElement("desc");
                par.innerText = "~"
                par.style.marginInlineStart = "0";
                element.after(par)
            } else if (element.hasAttribute("less-than")) {
                let par = document.createElement("desc");
                par.innerText = "<"
                par.style.marginInlineStart = "0";
                element.before(par)
            } else if (element.hasAttribute("more-than")) {
                let par = document.createElement("desc");
                par.innerText = "<"
                par.style.marginInlineStart = "0";
                element.after(par)
            } else if (element.hasAttribute("danger")) {
                let par = document.createElement("desc");
                par.innerText = "⚠"
                par.style.color = "red";
                par.style.fontWeight = "900"
                par.style.marginInlineStart = "0";
                element.after(par)
                if (element.getElementsByTagName("span").length == 0) element.style.cssText += "color: red;"
                else element.getElementsByTagName("span")[0].style.cssText += "color: red;"
                let text = "TODO";

                element.addEventListener("mouseover", function () {
                    pre.textContent = text;
                    pre.style.top = `${element.getBoundingClientRect().y}px`;
                    pre.style.left = `${element.getBoundingClientRect().x}px`;
                    pre.style.display = "block";
                });
                par.addEventListener("mouseover", function () {
                    pre.textContent = text;
                    pre.style.top = `${element.getBoundingClientRect().y}px`;
                    pre.style.left = `${element.getBoundingClientRect().x}px`;
                    pre.style.display = "block";
                })
                element.addEventListener("mouseleave", function () {
                    pre.style.display = "none";
                });
                par.addEventListener("mouseleave", function () {
                    pre.style.display = "none";
                })
                element.addEventListener("touchstart", function () {
                    console.log("touchstart");
                    pre.textContent = text;
                    pre.style.top = `${element.getBoundingClientRect().y}px`;
                    pre.style.left = `${element.getBoundingClientRect().x}px`;
                    if (pre.focused === element) {
                        pre.style.display = "none";
                        pre.focused = null;
                    } else {
                        pre.focused = element;
                        pre.style.display = "block";
                    }

                })

                document.body.append(pre);
            }
        }

        let name = cells[1];
        if (name.hasAttribute("company")) {
            name.style.display = "flex";
            name.style.alignItems = "center";

            let companyName = name.getAttribute("company-id");
            let companyImg = document.createElement("img");
            companyImg.crossOrigin = "Anonymous";
            companyImg.style.height = "1.2em";
            companyImg.style.display = "inline";
            companyImg.src = `./assets/logos/${companyName}.png`;
            companyImg.alt = companyName + " Logo";
            companyImg.style.paddingInlineEnd = "0.5rem";

            companyImg.onerror = function () {
                companyImg.src = window.location.origin + "/assets/logos/default.png";
            }

            name.prepend(companyImg);

            let par = document.createElement("desc");
            par.innerText = name.getAttribute("company") + ":";
            par.style.color = "gray";
            par.style.paddingInlineEnd = "0.5rem";
            par.style.textTransform = "capitalize";
            par.classList.add("company-name");
            companyImg.after(par);
        }
    }
}

if (parameters.has("search")) {
    let search = parameters.get("search");
    let searchField = document.getElementById("food-search");
    searchField.value = search;
    searchField.dispatchEvent(new Event("input"));
}

// Grab previous amount of rows, before this load
let prevRows = parseInt(localStorage.currentRowAmount);
let currentRows = parseInt(table.rows.length);
console.log(`Current Rows: ${currentRows}, Previous Rows: ${prevRows}`);
if (prevRows !== currentRows) {
    if (localStorage.currentRowAmount === undefined) {
        localStorage.currentRowAmount = currentRows;
    } else {
        let t = document.getElementById("change-count-text");
        switch (languageIndex) {
            case 0: t.innerText = `${currentRows - prevRows} Food Items Were Added Since Your Last Visit 😃`; break;
            case 1: t.innerText = `${currentRows - prevRows} מוצרים נוספו לרשימה מאז ביקורך האחרון 😃`; break;
        }
        t.style.display = "block";
        localStorage.currentRowAmount = currentRows;
    }
}

onTableReady(table);