function GI(gi) {
    if (gi < 30) return '<span style="color: #00ff00">' + gi + '</span>'
    else if (gi < 56) return '<span style="color: #9fe2bf">' + gi + '</span>'
    else if (gi < 70) return '<span style="color: #ffff00">' + gi + '</span>'
    else return '<span style="color: #ff0000">' + gi + '</span>'
}

/**
 * Creates an input element for the grams value with the given glycemic load and name.
 *
 * @param {number} gl - The global load value.
 * @param {string} name - The name of the input element.
 * @return {string} The HTML string representing the input element.
 */
function GL(gl, name) {
    let start = `<span id="GLFIELD-${name}">`;
    let end = `</span>`
    if (gl < 5) return start + '<span style="color: #00ff00">' + gl + '</span>' + end;
    else if (gl < 10) return start + '<span style="color: #9fe2bf">' + gl + '</span>' + end;
    else if (gl < 20) return start + '<span style="color: #ffff00">' + gl + '</span>' + end;
    else return start + '<span style="color: #ff0000">' + gl + '</span>' + end;
}

var table = document.getElementsByClassName("tftable")[0];

var rows = table.getElementsByTagName("tr");
var arr = [];
for (var i = 0; i < rows.length; i++) {
    var cells = rows[i].getElementsByTagName("td");
    if (cells.length > 0) {
        // var photo = cells[0].getElementsByTagName("a")[0].getElementsByTagName("img")[0];
        var n = cells[1].getElementsByTagName("a")[0];
        var gi = cells[2].getElementsByTagName("a")[0];
        var gl = cells[3].getElementsByTagName("a")[0];

        var food = {
            name: n.innerText,
            gi: gi.innerText,
            gl: gl.innerText
        };

        let changeFunction = `var v = (${food.gl} / 100) * parseFloat(this.value);
document.getElementById("SUGARFIELD-${food.name}").innerHTML = (-1 / 100) * this.value;
document.getElementById("CARBFIELD-${food.name}").innerHTML = (-1 / 100) * this.value;
var e = document.getElementById("GLFIELD-${food.name}");
if (v < 10) e.innerHTML = "<span style=\\"color: #00ff00\\">" + v + "</span>";
else if (v < 20) e.innerHTML = "<span style=\\"color: #ffff00\\">" + v + "</span>";
else e.innerHTML = "<span style=\\"color: #ff0000\\">" + v + "</span>";`;
    let gramsInput = `<input type="number" id="grams" value="100" onchange='${changeFunction}'>`;

        arr.push(`<tr>
    <td>${gramsInput}</td>
    <td>{{${food.name}}}</td>
    <td>${GI(parseFloat(food.gi))}</td>
    <td>${GL(parseFloat(food.gl), food.name)}</td>
    <td><span id="SUGARFIELD-${food.name}">-1</span></td>
    <td><span id="CARBFIELD-${food.name}">-1</span></td>
</tr>`);
    }
}

arr.join("\n");
window.onclick = function () {
    navigator.clipboard.writeText(arr.join("\n"));
}
