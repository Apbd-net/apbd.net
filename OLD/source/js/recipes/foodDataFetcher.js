(async () => {
    const data = await fetch("/en/foods/data.json").then(d => d.json());
    /**
     * @type {number}
     */
    const buildCount = data.buildCount;
    if (!window.localStorage.foodListData || JSON.parse(window.localStorage.foodListData).buildCount != buildCount) {
        window.localStorage.foodListData = JSON.stringify(data);
    } 
    if (window.dataLoadedCallback) for (let func of window.dataLoadedCallback) func();
})();
