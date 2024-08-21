/**
 * @type{{
            defaultWeight: float,
            foodNameEn: string,
            foodNameHe: string,
            foodTranslationIndices: int[],
            preprocessedFoodName: string,
            companyId: string,
            companyEn: string,
            companyHe: string,
            glycemicIndex: {
                value: float,
                metadata: {
                    key: string,
                    details: string
                }[]
            },
            glycemicLoad: {
                value: float,
                metadata: {
                    key: string,
                    details: string
                }[]
            },
            sugar: {
                value: float,
                metadata: {
                    key: string,
                    details: string
                }[]
            },
            carbs: {
                value: float,
                metadata: {
                    key: string,
                    details: string
                }
            }
    }[]}
 */
var TABLE_DATA;


/**
 * @param {HTMLTableElement} table 
 */
function onTableReady(table) {
    const parameters = new URLSearchParams(window.location.search);
    localStorage.table = table;
    localStorage.lastTableLang = parameters.get("lang") || "en";
    TABLE_DATA = Array.from(table.rows).slice(1).map(row => {
        let defaultWeight = parseFloat(row.children[0].getElementsByTagName("input")[0].value);
        let translationIndices = row.children[1].getAttribute("ti").split(" ").map(x => parseInt(x));
        let foodNameEn = translateString(row.children[1].getAttribute("pre-ti"), translationIndices, 0);
        let foodNameHe = translateString(row.children[1].getAttribute("pre-ti"), translationIndices, 1);
        let companyId = row.children[1].getAttribute("company");
        let companyEn = translateCompanyName(companyId, 0);
        let companyHe = translateCompanyName(companyId, 1);
        console.log(translateCompanyName(companyId, 0), translateCompanyName(companyId, 1), translateCompanyName(companyId, 2));
        let glycemicIndex = {
            value: parseFloat(row.children[2].getElementsByTagName("span")[0].innerText),
            metadata: row.children[2].getAttributeNames().map(name => {
                return {
                    key: name,
                    details: row.children[2].getAttribute(name)
                }
            })
        }

        let glycemicLoad = {
            value: parseFloat(row.children[3].getElementsByTagName("span")[0].getElementsByTagName("span")[0].innerText),
            metadata: row.children[3].getElementsByTagName("span")[0].getAttributeNames().map(name => {
                return {
                    key: name,
                    details: row.children[3].getElementsByTagName("span")[0].getAttribute(name)
                }
            })
        } 

        let sugar = {
            value: parseFloat(row.children[4].getElementsByTagName("span")[0].innerText),
            metadata: row.children[4].getElementsByTagName("span")[0].getAttributeNames().map(name => {
                return {
                    key: name,
                    details: row.children[4].getElementsByTagName("span")[0].getAttribute(name)
                }
            })
        }

        let carbs = {
            value: parseFloat(row.children[5].getElementsByTagName("span")[0].innerText),
            metadata: row.children[5].getElementsByTagName("span")[0].getAttributeNames().map(name => {
                return {
                    key: name,
                    details: row.children[5].getElementsByTagName("span")[0].getAttribute(name)
                }
            })
        }

        return {
            defaultWeight: defaultWeight,
            foodNameEn: foodNameEn,
            foodNameHe: foodNameHe,
            foodTranslationIndices: translationIndices,
            preprocessedFoodName: row.children[1].getAttribute("pre-ti"),
            companyId: companyId,
            companyEn: companyEn,
            companyHe: companyHe,
            glycemicIndex: glycemicIndex,
            glycemicLoad: glycemicLoad,
            sugar: sugar,
            carbs: carbs,
        }
    });

    localStorage.tableRows = JSON.stringify(TABLE_DATA);
}