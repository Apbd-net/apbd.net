const ingredientsSideview = document.getElementById("sideview-ingredients");
const ingredientsTitle = document.getElementById("sideview-ingredients-title");
const ingredientsHr = document.getElementById("sideview-ingredients-hr");
const ingredients = document.getElementById("ingredients");

const recipeTitle = document.getElementById("title");
const sideviewTitle = document.getElementById("sideview-title");

const blockqoute = document.getElementById("blockquote");
const main = document.getElementsByTagName("main")[0];

let observer = new IntersectionObserver((entries) => {
    if (entries[0].target.id === "ingredients") {
        if (entries[0].isIntersecting) {
            ingredientsSideview.style.display = "none";
            ingredientsTitle.style.display = "none";
            ingredientsHr.style.display = "none";

        } else {
            ingredientsSideview.style.display = "block";
            ingredientsTitle.style.display = "block";
            ingredientsHr.style.display = "block";
        }
    }

    if (entries[0].target.id === "title") {
        if (entries[0].isIntersecting) {
            sideviewTitle.style.display = "none";
        } else {
            sideviewTitle.innerHTML = recipeTitle.innerHTML
            sideviewTitle.style.display = "block";
        }
    }
});

observer.observe(ingredients);
observer.observe(recipeTitle);
