/**
 * Takes a table cell and displays its content.
 *
 * @param {HTMLTableCellElement} tdCell - the table cell to display
 * @return {void}
 */
function takeAndDisplay(tdCell) {
    navigator.mediaDevices.getUserMedia({ video: true }).then((media) => {
        let video = document.createElement("video");
        video.srcObject = media;
        pickImage(video, tdCell);
    })
}

/**
 * Picks an image from a video stream and displays it in a table cell.
 *
 * @param {HTMLVideoElement} video - The video element from which to pick the image.
 * @param {HTMLTableCellElement} tdCell - The table cell in which to display the image.
 * @return {void} This function does not return anything.
 */
function pickImage(video, tdCell) {

    video.style.width = "100vw";
    video.style.height = "100vh";
    video.style.objectFit = "cover";
    video.style.position = "absolute";
    video.style.top = "0";
    video.style.left = "0";
    video.style.zIndex = "1000";
    video.style.opacity = "1";
    video.play();
    document.body.appendChild(video);

    // Now add the take-picture button, and guiding text

    let dropshadow = document.createElement("div");
    dropshadow.style.cssText = "position: absolute; top: 70vh; left: 0; width: 100vw; height: 30vh; background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 1)); z-index: 1999;";

    let button = document.createElement("button");
    button.textContent = "⬤"
    button.style.cssText = "font-size: 100px; font-weight: 900; position: absolute; top: 90%; left: 50%; transform: translate(-50%, -50%); z-index: 2000; background: none; border: none; color: white;";
    button.addEventListener("click", function () {
        let canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);
        let data = canvas.toDataURL();
        let img = tdCell.getElementsByTagName("img")[0];
        img.src = data;
        img.style.width = video.videoWidth / 4 + "px";
        img.style.height = video.videoHeight / 4 + "px";
        img.style.display = "block";
        video.remove();
        button.remove();
        dropshadow.remove();
    });

    document.body.appendChild(dropshadow);
    document.body.appendChild(button);

    
}