/* JavaScript functions to create the fifteen-piece variation of the Chinese tangram puzzle */

// Build tan component as SVG polygon objects
function polygon(tan, size, colour) {
    let polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("points", buildPolygonTan(tan, size));
    polygon.setAttribute('fill', colour);
    polygon.setAttribute('class', "draggable");
    polygon.setAttribute('opacity', "0.9");
    polygon.setAttribute("stroke", 'DarkSlateGray');
    polygon.setAttribute("stroke-width", "1.5");

    return polygon
}

// Calculate the dimensions of each polygon tan in tangram
function buildPolygonTan(tan, size) {
    let points;
    switch (tan) {
        case 'smTriangle1':
            points = `0,${size/3} 0,${2*(size/3)} ${size/3},${2*(size/3)}`;
            break;
        case 'smParallelogram':
            points = `0,0 0,${size/3} ${size/3},${2*(size/3)} ${size/3},${size/3}`;
            break;
        case 'lgTriangle1':
            points = `0,0 ${size/3},${size/3} ${2*(size/3)},0`;
            break;
        case 'lgTriangle2':
            points = `${2*(size/3)},0 ${size/3},${size/3} ${size},${size/3}`;
            break;
        case 'smTriangle2':
            points = `${2*(size/3)},0 ${size},0 ${size},${size/3}`;
            break;
        case 'leg1':
            points = `${2*(size/3)},${size/3} ${size},${size/3} ${size},${(size/3)+((size/6))} ${(2*(size/3))+(size/6)},${(size/3)+(size/6)} ${(2*(size/3))+(size/6)},${(size/3)+(3*(size/6))} ${2*(size/3)},${5*(size/6)}`;
            break;
        case 'leg2':
            points = `${size},${(size/3)+((size/6))} ${size},${size} ${2*(size/3)},${size} ${2*(size/3)},${5*(size/6)} ${(2*(size/3))+(size/6)},${5*(size/6)} ${(2*(size/3))+(size/6)},${3*(size/6)}`;
            break;
        case 'pentagon1':
            points = `0,${2*(size/3)} 0,${size} ${size/6},${size} ${(size/3)+(size/5)},${2*(size/3)}`;
            break;
        case 'pentagon2':
            points = `${size/6},${size} ${2*(size/3)},${size} ${2*(size/3)},${2*(size/3)} ${(size/3)+(size/5)},${2*(size/3)}`;
            break;
        default:
            console.log("ERROR: tan component not recognised.")
    }
    return points
}

// Build each semi-circle tan as SVG path objects
function semiCircle(tan, size, colour) {
    let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute('fill', colour);
    path.setAttribute('class', "draggable");
    path.setAttribute('opacity', "0.9");
    path.setAttribute("stroke", 'DarkSlateGray');
    path.setAttribute("stroke-width", "1.5");
    switch (tan) {
        case 'rightSemiCircle':
            path.setAttribute("d", `M${size/2},${(size/3)+(size/18)} A${(size/6)-(size/18)},${(size/6)-(size/18)} 0 0,1 ${size/2},${(2*(size/3))-(size/18)} L${size/2},${(2*(size/3))-(size/18)} ${size/2},${(size/3)+(size/18)}`);
            break;
        case 'leftSemiCircle':
            path.setAttribute("d", `M${size/2},${(size/3)+(size/18)} A${(size/6)-(size/18)},${(size/6)-(size/18)} 0 0,0 ${size/2},${(2*(size/3))-(size/18)} L${size/2},${(2*(size/3))-(size/18)} ${size/2},${(size/3)+(size/18)}`);
            break;
        default:
            console.log("ERROR: tan component not recognised.")
    }

    return path
}

// Build each arch-like tan, surrounding the semi-circles, as SVG path objects
function arches(tan, size, colour) {
    let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute('fill', colour);
    path.setAttribute('class', "draggable");
    path.setAttribute('opacity', "0.9");
    path.setAttribute("stroke", 'DarkSlateGray');
    path.setAttribute("stroke-width", "1.5");
    switch (tan) {
        case 'topRightArch':
            path.setAttribute("d", `M${size/2},${(size/3)} L${size/2},${(size/3)+(size/18)} ${size/2},${(size/3)+(size/18)} A${(size/6)-(size/18)},${(size/6)-(size/18)} 0 0,1 ${(2*(size/3))-(size/18)},${size/2} L${(2*(size/3))-(size/18)},${size/2} ${2*(size/3)},${size/2} L${2*(size/3)},${size/2} ${2*(size/3)},${(size/3)} L${2*(size/3)},${(size/3)} ${size/2},${(size/3)}`);
            break;
        case 'topLeftArch':
            path.setAttribute("d", `M${size/2},${(size/3)} L${size/2},${(size/3)+(size/18)} ${size/2},${(size/3)+(size/18)} A${(size/6)-(size/18)},${(size/6)-(size/18)} 0 0,0 ${(size/3)+(size/18)},${size/2} L${(size/3)+(size/18)},${size/2} ${size/3},${size/2} L${size/3},${size/2} ${size/3},${(size/3)} L${size/3},${(size/3)} ${size/2},${(size/3)}`);
            break;
        case 'bottomRightArch':
            path.setAttribute("d", `M${size/2},${2*(size/3)} L${size/2},${2*(size/3)} ${size/2},${(2*(size/3))-(size/18)} A${(size/6)-(size/18)},${(size/6)-(size/18)} 0 0,0 ${(2*(size/3))-(size/18)},${size/2} L${(2*(size/3))-(size/18)},${size/2} ${2*(size/3)},${size/2} L${2*(size/3)},${size/2} ${2*(size/3)},${2*(size/3)} L${2*(size/3)},${2*(size/3)} ${size/2},${2*(size/3)}`);
            break;
        case 'bottomLeftArch':
            path.setAttribute("d", `M${size/2},${2*(size/3)} L${size/2},${2*(size/3)} ${size/2},${(2*(size/3))-(size/18)} A${(size/6)-(size/18)},${(size/6)-(size/18)} 0 0,1 ${(size/3)+(size/18)},${size/2} L${(size/3)+(size/18)},${size/2} ${size/3},${size/2} L${size/3},${size/2} ${size/3},${2*(size/3)} L${size/3},${2*(size/3)} ${size/2},${2*(size/3)}`);
            break;
        default:
            console.log("ERROR: tan component not recognised.")
    }

    return path
}

// Function to build an interactive fifteen-piece SVG tangram
function buildTangram(svgCanvas) {

    // Set the size of the tangram relative to the viewbox
    let vbox = svgCanvas.viewBox.baseVal;
    let size = vbox.height / 3;

    // Create and add tans to the SVG canvas to build the interactive tangram
    svgCanvas.appendChild(polygon('lgTriangle1', size, 'Orange'));
    svgCanvas.appendChild(polygon('lgTriangle2', size, 'Green'));
    svgCanvas.appendChild(polygon('smTriangle1', size, "Navy"));
    svgCanvas.appendChild(polygon('smTriangle2', size, 'Brown'));
    svgCanvas.appendChild(polygon('leg1', size, 'Red'));
    svgCanvas.appendChild(polygon('leg2', size, 'Yellow'));
    svgCanvas.appendChild(polygon('smParallelogram', size, 'SkyBlue'));
    svgCanvas.appendChild(polygon('pentagon1', size, 'Purple'));
    svgCanvas.appendChild(polygon('pentagon2', size, 'LimeGreen'));
    svgCanvas.appendChild(semiCircle('leftSemiCircle', size, 'Magenta'));
    svgCanvas.appendChild(semiCircle('rightSemiCircle', size, 'Magenta'));
    svgCanvas.appendChild(arches('topRightArch', size, 'Pink'));
    svgCanvas.appendChild(arches('topLeftArch', size, 'Pink'));
    svgCanvas.appendChild(arches('bottomRightArch', size, 'Gray'));
    svgCanvas.appendChild(arches('bottomLeftArch', size, 'Gray'));
}