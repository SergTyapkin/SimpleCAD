import Konva from 'konva';
import {CONSTRAINTS_ICONS, drawingColors} from '../constants';
const constraintsIcons = import.meta.globEager('../../assets/toolbarIcons/*.svg');

async function constraintImage(x, y, constraintType, size=30) {
  x -= size / 2
  y += 10
  const image = new Image();
  image.src = constraintsIcons[`../../assets/toolbarIcons/${CONSTRAINTS_ICONS[constraintType]}`].default;
  await image.decode(); // wait for load image
  let height = image.naturalHeight;
  let width = image.naturalWidth;
  console.log(width, height)
  if (width < height) {
    width = width / height * size;
    height = size;
  } else {
    height = height / width * size;
    width = size;
  }
  console.log(width, height)
  return new Konva.Image({
    x: x,
    y: y,
    name: size, // store size in name field
    height: height,
    width: width,
    image: image,
    draggable: false,
    listening: false,
  });
}

function text(x, y, text) {
  return new Konva.Text({
    x: x,
    y: y,
    fill: drawingColors['DEFAULT_ELEMENT_COLOR'],
    text: text,
    align: "center",
    verticalAlign: "center",
    draggable: false,
    listening: false,
  });
}

function point(pointerX, pointerY, color = drawingColors['DEFAULT_ELEMENT_COLOR']) {
  return new Konva.Circle({
    radius: 5,
    fill: color,
    x: pointerX,
    y: pointerY,
    draggable: true,
  });
}

function line(points, withDash = false, color=drawingColors['DEFAULT_ELEMENT_COLOR'], width=3) {
  return new Konva.Line({
    points,
    stroke: color,
    strokeWidth: width,
    draggable: true,
    dash: withDash ? [16, 9] : []
  });
}

function arc(x, y, arcRadius, startAngle) {
  return new Konva.Arc({
    x,
    y,
    innerRadius: arcRadius,
    outerRadius: arcRadius + 3,
    angle: 0,
    fill: drawingColors['DEFAULT_ELEMENT_COLOR'],
    stroke: drawingColors['DEFAULT_ELEMENT_COLOR'],
    strokeWidth: 0,
    rotation: startAngle,
    // clockwise: true,
    draggable: true,
  });
}

export {
  point,
  line,
  arc,
  constraintImage,
  text,
}
