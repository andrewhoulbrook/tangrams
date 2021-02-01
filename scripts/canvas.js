/* JavaScript to dyanmically create an interactive classical Chinese tangram puzzle */

// Get the SVG canvas
let svg = document.querySelector("svg");

// Build tangram and add the SVG canvas
buildTangram(svg);

// Add drag and rotate functionality selected tans using Subjx.js api
function onClick(evt) {
    subjx(evt.target).drag({
        resizable: false, // Disable resizing
        rotationPoint: false, // Disable manipulation of rotation point

        // Calibrate sensitivity of drage/rotate actions
        snap: {
            x: 1,
            y: 1,
            angle: 1
        },

        // Enable/disable actions
        each: {
            move: true,
            resize: false,
            rotate: true
        },

        // Disable drag/rotate actions once tans is deselected
        onDrop() {
            this.disable();
        },
    });
}
/* ---- End of mouse and touch event handling code ---- */

// Add event listener
window.addEventListener("click", onClick, false);