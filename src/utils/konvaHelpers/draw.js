import Konva from 'konva';
import { drawingColors } from '../constants';

function point(pointerX, pointerY, color = drawingColors['DEFAULT_ELEMENT_COLOR']) {
  return new Konva.Circle({
    radius: 5,
    fill: color,
    x: pointerX,
    y: pointerY,
    draggable: true,
  });
}

function line(points, withDash = false) {
  return new Konva.Line({
    points,
    stroke: drawingColors['DEFAULT_ELEMENT_COLOR'],
    strokeWidth: 3,
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
}