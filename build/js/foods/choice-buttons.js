/**
 * @type {HTMLCollectionOf<HTMLElement>}
 */
let all_B = document.getElementsByClassName("button-row");

for (let element of all_B) {
    let buttons = Array.from(element.getElementsByTagName("*"));
    for (let button of buttons) {
        button.addEventListener("click", function () {
            buttons.forEach(b => {
                if (b !== button) {
                    b.classList.remove("selected")
                    return;
                }
                if (b.classList.contains("selected")) b.classList.remove("selected")
                else b.classList.add("selected")
            })
        });
    }
}