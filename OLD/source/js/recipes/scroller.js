const recipeGrid = document.getElementById("recipe-grid");

const selectionStart = document.getElementById("selection-start");
const selectionEnd = document.getElementById("selection-end");


const scrollerChildren = scroller.getElementsByTagName("button");
const recipes = recipeGrid.children;

let currentIndex = 0;

function updateIndexIndicator() {
    let pageButtons = scrollerChildren.length - 3;
    while (scrollerChildren.length - 4 < Math.ceil(recipes.length / allowedChildrenOnScreen())) {
        let button = document.createElement("button");
        button.innerText = pageButtons;
        scrollerChildren[scrollerChildren.length - 2].before(button);
        button.addEventListener("click", () => {
            let i = Array.from(scrollerChildren).indexOf(button);
            console.log("Page " + (i - 1));
        
            for (let j = 0; j < (i - 2) * allowedChildrenOnScreen(); j++) {
                if (recipes[j]) recipes[j].style.display = "none";
            }
            for (let j = (i - 2) * allowedChildrenOnScreen(); j < (i - 1) * allowedChildrenOnScreen(); j++) {
                if (recipes[j]) recipes[j].style.display = "block";
            }
            currentIndex = (i - 2) * allowedChildrenOnScreen();
            updateIndexIndicator();
            window.history.pushState(null, null, `?index=${currentIndex}`);
        });
        pageButtons++;
    }
    while (scrollerChildren.length - 4 > Math.ceil(recipes.length / allowedChildrenOnScreen())) {
        scrollerChildren[scrollerChildren.length - 3].remove();
    }
    selectionStart.innerText = currentIndex + 1;
    selectionEnd.innerText = Math.min(currentIndex + allowedChildrenOnScreen(), recipeGrid.children.length);
    let selectedPage = Math.floor(currentIndex / allowedChildrenOnScreen());
    for (let i = 2; i < scrollerChildren.length - 2; i++) {
        if (i == selectedPage + 2) {
            scrollerChildren[i].classList.add("selected");
        } else {
            scrollerChildren[i].classList.remove("selected");
        }
    }
}

window.addEventListener("resize", updateIndexIndicator);

scrollerChildren[0].addEventListener("click", () => {
    if (currentIndex === 0) return;
    console.log("First page");
    
    for (let i = 0; i < allowedChildrenOnScreen(); i++) {
        (recipes[i] ?? {}).style.display = "block";
    }
    currentIndex = 0;
    updateIndexIndicator();
    window.history.pushState(null, null, "?index=0");
});

scrollerChildren[1].addEventListener("click", () => {
    if (currentIndex === 0) return;
    console.log("Previous page");
    
    for (let i = currentIndex - allowedChildrenOnScreen(); i < currentIndex; i++) {
        if (recipes[i]) recipes[i].style.display = "block";
    }
    currentIndex = currentIndex - allowedChildrenOnScreen();
    updateIndexIndicator();
    window.history.pushState(null, null, `?index=${currentIndex}`);
});

for (let i = 2; i < scrollerChildren.length - 2; i++) {
    if ((i - 2) * allowedChildrenOnScreen() >= recipes.length) break;
    scrollerChildren[i].addEventListener("click", () => {
        console.log("Page " + (i - 1));
        
        for (let j = 0; j < (i - 2) * allowedChildrenOnScreen(); j++) {
            if (recipes[j]) recipes[j].style.display = "none";
        }
        for (let j = (i - 2) * allowedChildrenOnScreen(); j < (i - 1) * allowedChildrenOnScreen(); j++) {
            if (recipes[j]) recipes[j].style.display = "block";
        }
        currentIndex = (i - 2) * allowedChildrenOnScreen();
        updateIndexIndicator();
        window.history.pushState(null, null, `?index=${currentIndex}`);
    });
}

scrollerChildren[scrollerChildren.length - 2].addEventListener("click", () => {
    if (currentIndex === recipes.length - allowedChildrenOnScreen()) return;
    console.log("Next page");
    
    for (let i = currentIndex; i < currentIndex + allowedChildrenOnScreen(); i++) {
        console.log(i + ", " +  currentIndex + ", " + allowedChildrenOnScreen());
        
        if (recipes[i]) recipes[i].style.display = "none";
    }
    currentIndex = currentIndex + allowedChildrenOnScreen();
    updateIndexIndicator();
    window.history.pushState(null, null, `?index=${currentIndex}`);
});

scrollerChildren[scrollerChildren.length - 1].addEventListener("click", () => {
    if (currentIndex === recipes.length - allowedChildrenOnScreen()) return;
    console.log("Last page");
    
    for (let i = 0; i < recipes.length - allowedChildrenOnScreen(); i++) {
        if (recipes[i]) recipes[i].style.display = "none";
    }
    currentIndex = recipes.length - allowedChildrenOnScreen();
    updateIndexIndicator();
    window.history.pushState(null, null, `?index=${currentIndex}`);
});

function allowedChildrenOnScreen() {
    if (window.innerWidth < 759) return 4;
    return Math.floor((window.innerWidth - 80) / 340);
}

updateIndexIndicator();
document.getElementById("total-recipes").innerText = recipes.length;