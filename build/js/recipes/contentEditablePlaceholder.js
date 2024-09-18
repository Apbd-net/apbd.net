let showPlaceholders = `

[placeholder]:empty:before {
    content: attr(placeholder);
    color: #555; 
}

[placeholder]:not(:empty):focus:before {
    content: "";
}
`;

var styleSheet = document.createElement("style");
styleSheet.textContent = showPlaceholders;
document.head.appendChild(styleSheet);

/**
 * @type {HTMLCollectionOf<HTMLElement>}
 */
let contentEditables = document.querySelectorAll("[contenteditable]");
for (let element of contentEditables) {
    let height = element.offsetHeight;
    element.style.minHeight = `${height}px`;
    element.addEventListener('focusout', () => {
        if (element.textContent.replace(/\s/g, "").length === 0) {
            element.textContent = "";
        }
    })
}