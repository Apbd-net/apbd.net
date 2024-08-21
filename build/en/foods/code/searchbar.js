function activateSearchbar() {
    /**
     * @type {HTMLInputElement}
     */
    let searchbar = document.getElementById("food-search");

    let typingTimer;

    searchbar.addEventListener("keyup", function () {
        console.log("typing");
        clearTimeout(typingTimer);
        typingTimer = setTimeout(function () {
            let params = new URLSearchParams(window.location.search);
            params.set("search", searchbar.value);
            window.history.pushState({html: document.documentElement.innerHTML}, "", window.location.pathname + "?" + params.toString());
        }, 1000)
    })

    searchbar.addEventListener("input", function () {

        let table = document.getElementById("food-list");

        let rows = table.getElementsByTagName("tr");

        let shouldTableRemainVisible = false;
        for (let i = 0; i < rows.length; i++) {
            let cells = rows[i].getElementsByTagName("td");
            if (cells.length > 0) {
                /**
                 * @type {HTMLSpanElement}
                 */
                let name = cells[1];
                if (name.textContent.toLowerCase().includes(searchbar.value.toLowerCase())) {
                    rows[i].style.display = "";
                    shouldTableRemainVisible = true;
                } else {
                    rows[i].style.display = "none";
                }
            }
        }

        if (shouldTableRemainVisible) {
            table.style.display = "";
        } else {
            table.style.display = "none";
        }
        
    })

    searchbar.addEventListener("keydown", function () {
        clearTimeout(typingTimer);
    })

    if (searchbar.value.length > 0) {
        searchbar.dispatchEvent(new Event("input"));
    }
}