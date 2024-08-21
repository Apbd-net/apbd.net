let blockquote;
let blockquoteContent;
/**
 * A function that creates a help sign element with a question mark content.
 *
 * @param {string} content - description of the content parameter
 * @param {HTMLElement} parent - The parent element of the help sign
 * @return {HTMLElement} The created help sign element
 */
function createHelpMark(content, parent) {
    let mark = document.createElement("help-sign");
    mark.textContent = "?";

    mark.onmouseenter = function () {
        blockquote.innerText = content;
    }

    mark.ontouchstart = function () {
        blockquote.innerText = blockquote.innerText === content ? blockquoteContent : content;
    }

    mark.onmouseleave = function () {
        blockquote.innerText = blockquoteContent;
    }

    return mark;
}

function activateHelpMarks() {

    blockquote = document.getElementsByTagName("blockquote")[0];
    blockquote.style.height = `calc(${blockquote.getBoundingClientRect().height}px - 12px)`;
    blockquoteContent = blockquote.innerText;
    /**
     * @type {HTMLCollectionOf<HTMLElement>}
     */
    let all = document.getElementsByTagName("help");

    for (let element of all) {
        var content = element.textContent;
        element.style.display = "none";
        element.before(createHelpMark(content, element.parentElement));
    }
}