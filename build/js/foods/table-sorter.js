/**
 * @param {HTMLTableRowElement[]} rows 
 * @param {"name-d"|"name-u"|"company-d"|"company-u"|"glycemic-index-d"|"glycemic-index-u"|"glycemic-load-d"|"glycemic-load-u"|"carbs-d"|"carbs-u"|"sugar-d"|"sugar-u"} method 
 */
function sortBy(rows, method) {
    const parameters = new URLSearchParams(window.location.search);
    console.log("Sorting by " + parameters.get("sort"));
    let header = rows.shift();
    switch (method) {
        case "last-added": {
            rows.reverse();
            break;
        }
        case "first-added": {
            break;
        }
        case "name-d": {
            rows.sort((a, b) => {
                let aName = a.getElementsByTagName("td")[1].innerText;
                let bName = b.getElementsByTagName("td")[1].innerText;
                if (aName > bName) return 1;
                if (aName < bName) return -1;
                return 0;
            });
            break;
        }
        case "name-u": {
            rows.sort((a, b) => {
                let aName = a.getElementsByTagName("td")[1].innerText;
                let bName = b.getElementsByTagName("td")[1].innerText;
                if (aName < bName) return 1;
                if (aName > bName) return -1;
                return 0;
            });
            break;
        }
        case "company-d": {
            rows.sort((a, b) => {
                let aName = translateCompanyName(a.getElementsByTagName("td")[1].getAttribute("company")) ?? String.fromCharCode(65535);
                let bName = translateCompanyName(b.getElementsByTagName("td")[1].getAttribute("company")) ?? String.fromCharCode(65535);
                if (aName > bName) return 1;
                if (aName < bName) return -1;
                return 0;
            });
            break;
        }
        case "company-u": {
            rows.sort((a, b) => {
                let aName = translateCompanyName(a.getElementsByTagName("td")[1].getAttribute("company")) ?? String.fromCharCode(65535);
                let bName = translateCompanyName(b.getElementsByTagName("td")[1].getAttribute("company")) ?? String.fromCharCode(65535);
                if (aName < bName) return 1;
                if (aName > bName) return -1;
                return 0;
            });
            break;
        }
        case "glycemic-index-d": {
            rows.sort((a, b) => {
                let aIndex = parseFloat(a.getElementsByTagName("td")[2].getElementsByTagName("span")[0].innerText);
                let bIndex = parseFloat(b.getElementsByTagName("td")[2].getElementsByTagName("span")[0].innerText);
                if (aIndex == -1 && bIndex == -1) return 0;
                if (aIndex == -1) return 1;
                if (bIndex == -1) return -1;
                if (aIndex > bIndex) return 1;
                if (aIndex < bIndex) return -1;
                return 0;
            });
            break;
        }
        case "glycemic-index-u": {
            rows.sort((a, b) => {
                let aIndex = parseFloat(a.getElementsByTagName("td")[2].getElementsByTagName("span")[0].innerText);
                let bIndex = parseFloat(b.getElementsByTagName("td")[2].getElementsByTagName("span")[0].innerText);
                if (aIndex == -1 && bIndex == -1) return 0;
                if (aIndex == -1) return 1;
                if (bIndex == -1) return -1;
                if (aIndex < bIndex) return 1;
                if (aIndex > bIndex) return -1;
                return 0;
            });
            break;
        }
        case "glycemic-load-d": {
            rows.sort((a, b) => {
                let aLoad = parseFloat(a.getElementsByTagName("td")[3].getElementsByTagName("span")[0].innerText);
                let bLoad = parseFloat(b.getElementsByTagName("td")[3].getElementsByTagName("span")[0].innerText);
                if (aLoad < 0 && bLoad < 0) return 0;
                if (aLoad < 0) return 1;
                if (bLoad < 0) return -1;
                if (aLoad > bLoad) return 1;
                if (aLoad < bLoad) return -1;
                return 0;
            });
            break;
        }
        case "glycemic-load-u": {
            rows.sort((a, b) => {
                let aLoad = parseFloat(a.getElementsByTagName("td")[3].getElementsByTagName("span")[0].innerText);
                let bLoad = parseFloat(b.getElementsByTagName("td")[3].getElementsByTagName("span")[0].innerText);
                if (aLoad < 0 && bLoad < 0) return 0;
                if (aLoad < 0) return 1;
                if (bLoad < 0) return -1;
                if (aLoad < bLoad) return 1;
                if (aLoad > bLoad) return -1;
                return 0;
            });
            break;
        }
        case "sugars-d": {
            rows.sort((a, b) => {
                let aSugars = parseFloat(a.getElementsByTagName("td")[4].getElementsByTagName("span")[0].innerText);
                let bSugars = parseFloat(b.getElementsByTagName("td")[4].getElementsByTagName("span")[0].innerText);
                if (aSugars < 0 && bSugars < 0) return 0;
                if (aSugars < 0) return 1;
                if (bSugars < 0) return -1;
                if (aSugars > bSugars) return 1;
                if (aSugars < bSugars) return -1;
                return 0;
            });
            break;
        }
        case "sugars-u": {
            rows.sort((a, b) => {
                let aSugars = parseFloat(a.getElementsByTagName("td")[4].getElementsByTagName("span")[0].innerText);
                let bSugars = parseFloat(b.getElementsByTagName("td")[4].getElementsByTagName("span")[0].innerText);
                if (aSugars < 0 && bSugars < 0) return 0;
                if (aSugars < 0) return 1;
                if (bSugars < 0) return -1;
                if (aSugars < bSugars) return 1;
                if (aSugars > bSugars) return -1;
                return 0;
            });
            break;
        }
        case "carbs-d": {
            rows.sort((a, b) => {
                let aCarbs = parseFloat(a.getElementsByTagName("td")[5].getElementsByTagName("span")[0].innerText);
                let bCarbs = parseFloat(b.getElementsByTagName("td")[5].getElementsByTagName("span")[0].innerText);
                if (aCarbs < 0 && bCarbs < 0) return 0;
                if (aCarbs < 0) return 1;
                if (bCarbs < 0) return -1;
                if (aCarbs > bCarbs) return 1;
                if (aCarbs < bCarbs) return -1;
                return 0;
            });
            break;
        }
        case "carbs-u": {
            rows.sort((a, b) => {
                let aCarbs = parseFloat(a.getElementsByTagName("td")[5].getElementsByTagName("span")[0].innerText);
                let bCarbs = parseFloat(b.getElementsByTagName("td")[5].getElementsByTagName("span")[0].innerText);
                if (aCarbs < 0 && bCarbs < 0) return 0;
                if (aCarbs < 0) return 1;
                if (bCarbs < 0) return -1;
                if (aCarbs < bCarbs) return 1;
                if (aCarbs > bCarbs) return -1;
                return 0;
            });
            break;
        }
        default: break;
    }
    rows.unshift(header);
}