/* JavaScript functions to dyanmically create seven pieces (tans) of a classical Chinese tangram puzzle */

// Build each tan component as an SVG polygon object
function buildPolygon(tan, size, colour) {
    let polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', buildTan(tan, size));
    polygon.setAttribute('fill', colour);
    polygon.setAttribute('class', 'draggable');
    polygon.setAttribute('opacity', '0.9');
    polygon.setAttribute('stroke', 'DarkSlateGray');
    polygon.setAttribute('stroke-width', '1.5');

    return polygon
}

// Calculate the dimensions of each tan in tangram
function buildTan(tan, size) {
    let points;
    switch (tan) {
        case 'lgTriangle1':
            points = `0,0, ${size},0 ${size/2},${size/2}`;
            break;
        case 'lgTriangle2':
            points = `0,0 ${size/2},${size/2} 0,${size}`;
            break;
        case 'mdTriangle':
            points = `${size},${size} ${size/2},${size} ${size},${size/2}`;
            break;
        case 'smTriangle1':
            points = `${3*(size/4)},${3*(size/4)} ${size/4},${3*(size/4)} ${size/2},${size/2}`;
            break;
        case 'smTriangle2':
            points = `${size},0 ${size},${size/2} ${3*(size/4)},${size/4}`;
            break;
        case 'smSquare':
            points = `${size/2},${size/2} ${3*(size/4)},${size/4} ${size},${size/2} ${3*(size/4)},${3*(size/4)}`;
            break;
        case 'smParallelogram':
            points = `0,${size} ${size/2},${size} ${3*(size/4)},${3*(size/4)} ${size/4},${3*(size/4)}`;
            break;
        default:
            console.log("ERROR: tan component not recognised.")
    }

    return points
}

// Function to build an interactive seven-piece SVG tangram
function buildTangram(svgCanvas) {

    // Set the size of the tangram relative to the viewbox
    let vbox = svgCanvas.viewBox.baseVal;
    let size = vbox.height / 3;

    // Create and add tans to the SVG canvas to build the interactive tangram
    svgCanvas.appendChild(buildPolygon('lgTriangle1', size, 'Orange'));
    svgCanvas.appendChild(buildPolygon('lgTriangle2', size, 'Green'));
    svgCanvas.appendChild(buildPolygon('mdTriangle', size, 'Red'));
    svgCanvas.appendChild(buildPolygon('smTriangle1', size, "Navy"));
    svgCanvas.appendChild(buildPolygon('smTriangle2', size, 'Brown'));
    svgCanvas.appendChild(buildPolygon('smSquare', size, 'Yellow'));
    svgCanvas.appendChild(buildPolygon('smParallelogram', size, 'SkyBlue'));
}