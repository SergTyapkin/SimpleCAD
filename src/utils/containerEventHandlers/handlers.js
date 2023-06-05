import { Constraint } from "../../../Constraint";
import { ConstraintsTypes } from "../../../ConstraintsTypes";
import { drawingColors } from "../constants";
import { point, line, arc as konvaArc } from "../konvaHelpers/draw";
import { Point } from "../../../elements/Point";
import { Arc } from "../../../elements/Arc";
import setPointEvents from '../pointEventHandlers';
import setLineEvents from '../lineEventHandlers';
import setArcEvents from '../arcEventHandlers';

// Точка
function containerPoint(editorStore, pointerX, pointerY) {
  // //получить текущее положение холста на странице
  // var pos = editorStore.konvaStage.getPointerPosition();
  // //переводим экранные координаты в координаты stage
  // pointerX = pos.x;
  // pointerY = pos.y;

  console.log("point");
  const modelPoint = new Point(pointerX, pointerY);
  editorStore.currentDataLayer.addPoint(modelPoint);
  const drawingPoint = point(pointerX, pointerY);
  drawingPoint.relatedPoint = modelPoint;
  drawingPoint.relatedId = modelPoint.id;
  drawingPoint.relatedConstraints = {};
  setPointEvents(editorStore, drawingPoint);
  editorStore.currentDrawingPoints.push(drawingPoint);
  editorStore.currentStageLayer.add(drawingPoint);
  editorStore.currentStageLayer.draw();
}

// Отрезок
function containerLine(editorStore, pointerX, pointerY) {
  if (!editorStore.endOfLine) {
    const startModelPoint = new Point(pointerX, pointerY);
    const endModelPoint = new Point(pointerX, pointerY);
    editorStore.currentDataLayer.addPoint(startModelPoint);
    editorStore.currentDataLayer.addPoint(endModelPoint);
    const sP = point(pointerX, pointerY);
    const eP = sP.clone();
    setPointEvents(editorStore, sP);
    setPointEvents(editorStore, eP);

    editorStore.currentDrawingPoints.push(sP, eP);
    const linePoints = [
      startModelPoint.x,
      startModelPoint.y,
      endModelPoint.x,
      endModelPoint.y,
    ];
    const drawingLine = line(linePoints);
    drawingLine.startPoint = sP;
    drawingLine.endPoint = eP;
    drawingLine.relatedConstraints = {};
    setLineEvents(editorStore, drawingLine);

    sP.relatedPoint = startModelPoint;
    sP.relatedLine = drawingLine;
    sP.relatedId = startModelPoint.id;
    sP.relatedConstraints = {};

    eP.relatedPoint = endModelPoint;
    eP.relatedLine = drawingLine;
    eP.relatedId = endModelPoint.id;
    eP.relatedConstraints = {};

    editorStore.endOfLine = true;
    editorStore.currentStageLayer.add(drawingLine);
    editorStore.currentStageLayer.add(sP);
    editorStore.currentStageLayer.add(eP);
    editorStore.currentStageLayer.draw();
  } else {
    editorStore.endOfLine = false;
    const endPoint =
      editorStore.currentDrawingPoints[
        editorStore.currentDrawingPoints.length - 1
      ];
    const relPoint = endPoint.relatedPoint;
    relPoint.x = endPoint.x();
    relPoint.y = endPoint.y();
  }
}

// Дуга
function containerArc(editorStore, pointerX, pointerY) {
  console.log("arc");
  if (editorStore.arcDrawingStage == 0) {
    const centerModelPoint = new Point(pointerX, pointerY);
    const radiusModelPoint = new Point(pointerX, pointerY);
    editorStore.currentDataLayer.addPoint(centerModelPoint);
    editorStore.currentDataLayer.addPoint(radiusModelPoint);
    const cP = point(
      pointerX,
      pointerY,
      drawingColors.INTERMEDIATE_ELEMENT_COLOR
    );
    const rP = cP.clone();
    setPointEvents(editorStore, cP);
    setPointEvents(editorStore, rP);
    editorStore.currentDrawingPoints.push(cP);
    editorStore.currentDrawingPoints.push(rP);

    cP.relatedPoint = centerModelPoint;
    cP.relatedId = centerModelPoint.id;
    cP.relatedConstraints = {};

    rP.relatedPoint = radiusModelPoint;
    rP.relatedId = radiusModelPoint.id;
    rP.relatedConstraints = {};

    editorStore.currentStageLayer.add(cP);
    editorStore.currentStageLayer.add(rP);
    editorStore.currentStageLayer.draw();

    editorStore.arcDrawingStage = 1;
  } else if (editorStore.arcDrawingStage == 1) {
    const centerPoint =
      editorStore.currentDrawingPoints[
        editorStore.currentDrawingPoints.length - 2
      ];
    const startPoint =
      editorStore.currentDrawingPoints[
        editorStore.currentDrawingPoints.length - 1
      ];
    const endModelPoint = new Point(pointerX, pointerY);
    editorStore.currentDataLayer.addPoint(endModelPoint);
    const eP = point(pointerX, pointerY);
    setPointEvents(editorStore, eP);
    eP.relatedPoint = endModelPoint;
    eP.relatedId = endModelPoint.id;
    eP.relatedConstraints = {};
    editorStore.currentDrawingPoints.push(eP);

    const deltaX = startPoint.x() - centerPoint.x();
    const deltaY = startPoint.y() - centerPoint.y();
    let startAngle = Math.atan(deltaY / deltaX) * (180 / Math.PI);
    if ((deltaX < 0 && deltaY >= 0) || (deltaX < 0 && deltaY < 0)) {
      startAngle += 180;
    }
    const arcRadius = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
    const arc = konvaArc(centerPoint.x(), centerPoint.y(), arcRadius, startAngle);
    centerPoint.relatedArc = arc;
    startPoint.relatedArc = arc;
    eP.relatedArc = arc;
    arc.centerPoint = centerPoint;
    arc.startPoint = startPoint;
    arc.endPoint = eP;
    arc.relatedConstraints = {};
    const radiusStartLinePoints = [
      centerPoint.x(),
      centerPoint.y(),
      startPoint.x(),
      startPoint.y(),
    ];
    const radiusStartLine = line(radiusStartLinePoints, true);
    radiusStartLine.isConstructionLine = true;
    radiusStartLine.isArcStart = true;
    radiusStartLine.relatedArc = arc;
    arc.relatedRadiusStartLine = radiusStartLine;
    setLineEvents(editorStore, radiusStartLine);

    editorStore.currentStageLayer.add(eP);
    editorStore.currentStageLayer.add(arc);
    editorStore.currentStageLayer.add(radiusStartLine);
    editorStore.currentStageLayer.draw();
    editorStore.arcDrawingStage = 2;
  } else if (editorStore.arcDrawingStage == 2) {
    const arc =
      editorStore.currentDrawingPoints[
        editorStore.currentDrawingPoints.length - 1
      ].relatedArc;
    const p0 = arc.centerPoint.relatedPoint;
    const p1 = arc.startPoint.relatedPoint;
    const p2 = arc.endPoint.relatedPoint;
    const arcModel = new Arc(p0, p1, p2, "DEG");

    const equalRadiusConstraint = new Constraint({
      type: ConstraintsTypes["EQUAL_LINES"],
      lines: [
        [p0, p1],
        [p0, p2],
      ],
      isInternal: true
    });
    editorStore.currentDataLayer.addConstraint(equalRadiusConstraint);
    arc.relatedConstraints[equalRadiusConstraint.type] = [
      equalRadiusConstraint,
    ];

    arc.relatedArc = arcModel;
    arc.relatedId = arcModel.id;
    setArcEvents(editorStore, arc);
    editorStore.currentDataLayer.addArc(arcModel);
    const radiusEndLinePoints = [p0.x, p0.y, p2.x, p2.y];
    const radiusEndLine = line(radiusEndLinePoints, true);
    radiusEndLine.isConstructionLine = true;
    radiusEndLine.isArcEnd = true;
    radiusEndLine.relatedArc = arc;
    arc.relatedRadiusEndLine = radiusEndLine;
    setLineEvents(editorStore, radiusEndLine);
    editorStore.currentStageLayer.add(radiusEndLine);
    editorStore.currentStageLayer.draw();
    editorStore.arcDrawingStage = 0;
  }
}

function startFieldMove(editorStore, pointerX, pointerY) {
  editorStore.movingField = true;
  editorStore.movingFieldStartX = pointerX;
  editorStore.movingFieldStartY = pointerY;
}

function continueFieldMove(editorStore, pointerX, pointerY) {
  if (editorStore.movingField) {
    let dx = pointerX - editorStore.movingFieldStartX;
    let dy = pointerY - editorStore.movingFieldStartY;

    let oldScale = editorStore.konvaStage.scaleX();
    let pointer = editorStore.konvaStage.getPointerPosition();

    let real_dx = dx / oldScale;
    let real_dy = dy / oldScale;

    let newPos = {
      x: pointer.x + real_dx,
      y: pointer.y + real_dy,
    };

    editorStore.konvaStage.position(newPos);
    editorStore.gridObject.draw();
  }
}

function endFieldMove(editorStore, pointerX, pointerY) {
  editorStore.movingField = false;
  editorStore.movingFieldStartX = -1;
  editorStore.movingFieldStartY = -1;
}

export default {
  containerPoint,
  containerLine,
  containerArc,
  startFieldMove,
  continueFieldMove,
  endFieldMove
};
