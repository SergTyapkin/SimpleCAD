import { konvaLayer } from "./init";
import { line, arc, point } from "./draw";
import { DataLayer } from "../../../DataLayer/DataLayer";
import { Constraint } from "../../../Constraint";
import { ConstraintsTypes } from "../../../ConstraintsTypes";
import { Point } from "../../../elements/Point";
import { Arc } from "../../../elements/Arc";
import { Line } from "../../../elements/Line";
import setPointEvents from "../pointEventHandlers";
import setLineEvents from "../lineEventHandlers";
import setArcEvents from "../arcEventHandlers";
import { cloneConstraints } from "./cloneConstraints";
import { drawingColors } from "../constants";

function mergeMaps(m1, m2) {
  m2.forEach((value, key) => {
    if (m1.has(key)) {
      let currValue = m1.get(key);
      currValue.push(...value);
      m1.set(key, currValue);
    } else {
      m1.set(key, value);
    }
  });
}

function processPoint(editorStore, drawingPoint, fix = false) {
  let newDrawingPointMap = new Map();
  let newDataPointMap = new Map();
  let newPointConstraintsMap = new Map();
  let appliedConstraints = [];

  const oldRelatedPoint = drawingPoint.relatedPoint;
  const newPoint = drawingPoint.clone();
  console.log("new point", newPoint);
  const newRelatedPoint = new Point(oldRelatedPoint.x, oldRelatedPoint.y);
  newPoint.relatedPoint = newRelatedPoint;
  newPoint.relatedId = newRelatedPoint.id;
  newPoint.relatedConstraints = {};
  setPointEvents(editorStore, newPoint);

  if (fix) {
    const fixConstraint = new Constraint({
      type: ConstraintsTypes.FIX_POINT,
      points: [newRelatedPoint],
    });
    newPoint.relatedConstraints[fixConstraint.type] = [fixConstraint];
    appliedConstraints.push(fixConstraint);

    newPoint.draggable(false);
    newPoint.fill(drawingColors["DISABLED_ELEMENT_COLOR"]);
  }

  //adding drawing objects, data objects, constraints to maps
  newDrawingPointMap.set(drawingPoint, [newPoint]);
  newDataPointMap.set(drawingPoint.relatedPoint, [newRelatedPoint]);
  for (let constraintType in drawingPoint.relatedConstraints) {
    drawingPoint.relatedConstraints[constraintType].map((el) => {
      newPointConstraintsMap.set(el, [drawingPoint]);
    });
  }
  return {
    newPoint,
    newRelatedPoint,
    constraints: appliedConstraints,
    newDrawingPointMap,
    newDataPointMap,
    newPointConstraintsMap,
  };
}

function processLine(editorStore, drawingLine, fix = false) {
  let newDrawingLineMap = new Map();
  let newDataLineMap = new Map();
  let newLineConstraintsMap = new Map();
  let lineStartPoint = drawingLine.startPoint;
  let lineEndPoint = drawingLine.endPoint;

  const newLine = drawingLine.clone();
  const startPointData = processPoint(editorStore, lineStartPoint, fix);
  const endPointData = processPoint(editorStore, lineEndPoint, fix);
  newLine.startPoint = startPointData.newPoint;
  newLine.endPoint = endPointData.newPoint;
  newLine.relatedConstraints = {};
  setLineEvents(editorStore, newLine);

  startPointData.newPoint.relatedLine = newLine;
  endPointData.newPoint.relatedLine = newLine;

  if (drawingLine.relatedLine) {
    newLine.relatedLine = new Line(
      startPointData.newRelatedPoint,
      endPointData.newRelatedPoint
    );
    newDataLineMap.set(drawingLine.relatedLine, [newLine.relatedLine]);
  }

  //adding drawing objects, data objects, constraints to maps
  newDrawingLineMap.set(drawingLine, [newLine]);
  for (let constraintType in drawingLine.relatedConstraints) {
    drawingLine.relatedConstraints[constraintType].map((el) => {
      newLineConstraintsMap.set(el, [drawingLine]);
    });
  }

  return {
    line: newLine,
    startPoint: startPointData,
    endPoint: endPointData,
    constraints: [],
    newDrawingLineMap,
    newDataLineMap,
    newLineConstraintsMap,
  };
}

function processArc(editorStore, drawingArc, fix = false) {
  let newDrawingArcMap = new Map();
  let newDataArcMap = new Map();
  let newArcConstraintsMap = new Map();
  let startArcPoint = drawingArc.startPoint;
  let endArcPoint = drawingArc.endPoint;

  const newArc = drawingArc.clone();
  const centerPointData = processPoint(editorStore, drawingArc.centerPoint);
  const startPointData = processPoint(editorStore, startArcPoint, fix);
  const endPointData = processPoint(editorStore, endArcPoint, fix);
  const relatedRadiusStartLine = drawingArc.relatedRadiusStartLine.clone();
  const relatedRadiusEndLine = drawingArc.relatedRadiusEndLine.clone();
  const newRelatedArc = new Arc(
    centerPointData.newRelatedPoint,
    startPointData.newRelatedPoint,
    endPointData.newRelatedPoint,
    "DEG"
  );
  const equalRadiusConstraint = new Constraint({
    type: ConstraintsTypes["EQUAL_LINES"],
    lines: [
      [centerPointData.newRelatedPoint, startPointData.newRelatedPoint],
      [centerPointData.newRelatedPoint, endPointData.newRelatedPoint],
    ],
    isInternal: true,
  });
  newArc.relatedArc = newRelatedArc;
  newArc.relatedId = newRelatedArc.id;
  newArc.centerPoint = centerPointData.newPoint;
  newArc.startPoint = startPointData.newPoint;
  newArc.endPoint = endPointData.newPoint;
  newArc.relatedRadiusStartLine = relatedRadiusStartLine;
  newArc.relatedRadiusEndLine = relatedRadiusEndLine;
  newArc.relatedConstraints = {};
  newArc.relatedConstraints[equalRadiusConstraint.type] = [
    equalRadiusConstraint,
  ];

  centerPointData.newPoint.relatedArc = newArc;
  startPointData.newPoint.relatedArc = newArc;
  endPointData.newPoint.relatedArc = newArc;

  relatedRadiusStartLine.isConstructionLine = true;
  relatedRadiusStartLine.isArcStart = true;
  relatedRadiusStartLine.relatedArc = newArc;
  relatedRadiusEndLine.isConstructionLine = true;
  relatedRadiusEndLine.isArcEnd = true;
  relatedRadiusEndLine.relatedArc = newArc;

  setLineEvents(editorStore, relatedRadiusStartLine);
  setLineEvents(editorStore, relatedRadiusEndLine);
  setArcEvents(editorStore, newArc);

  //adding drawing objects, data objects, constraints to maps
  newDrawingArcMap.set(drawingArc, [newArc]);
  newDataArcMap.set(drawingArc.relatedArc, [newRelatedArc]);
  for (let constraintType in drawingArc.relatedConstraints) {
    drawingArc.relatedConstraints[constraintType].map((el) => {
      newArcConstraintsMap.set(el, [drawingArc]);
    });
  }

  const constraints = [equalRadiusConstraint];

  return {
    arc: { newArc, newRelatedArc },
    centerPoint: centerPointData,
    startPoint: startPointData,
    endPoint: endPointData,
    startLine: relatedRadiusStartLine,
    endLine: relatedRadiusEndLine,
    constraints,
    newDrawingArcMap,
    newDataArcMap,
    newArcConstraintsMap,
  };
}

function cloneLayer(kernel, editorStore, drawingPoints, full = false) {
  let drawingObjectsMap = new Map();
  let dataObjectsMap = new Map();
  let constraintsMap = new Map();
  let pointConstraints = [];

  const newStageLayer = konvaLayer();
  const newDataLayer = new DataLayer(kernel);
  const newDrawingPoints = [];
  let processedItems = new Set();
  for (let drawingPoint of drawingPoints) {
    if (processedItems.has(drawingPoint._id)) continue;
    processedItems.add(drawingPoint._id);

    // disable all event on elements from prev layer
    drawingPoint.off("click dragmove mouseenter mouseleave");

    if (!drawingPoint.relatedArc && !drawingPoint.relatedLine) {
      console.log("simple point");
      const {
        newPoint,
        newRelatedPoint,
        constraints,
        newDrawingPointMap,
        newDataPointMap,
        newPointConstraintsMap,
      } = processPoint(editorStore, drawingPoint);
      newDataLayer.addPoint(newRelatedPoint);
      newDrawingPoints.push(newPoint);
      newStageLayer.add(newPoint);

      pointConstraints.push(...constraints);

      // for (let constraint of constraints) {
      //   newDataLayer.addConstraint(constraint);
      // }

      mergeMaps(drawingObjectsMap, newDrawingPointMap);
      mergeMaps(dataObjectsMap, newDataPointMap);
      mergeMaps(constraintsMap, newPointConstraintsMap);
    } else if (drawingPoint.relatedLine) {
      console.log("point with line");
      const drawingLine = drawingPoint.relatedLine;
      // disable all event on elements from prev layer
      drawingLine.off("click dragmove mouseenter mouseleave");
      drawingLine.startPoint.off("click dragmove mouseenter mouseleave");
      drawingLine.endPoint.off("click dragmove mouseenter mouseleave");

      processedItems.add(drawingLine._id);
      processedItems.add(drawingLine.startPoint._id);
      processedItems.add(drawingLine.endPoint._id);
      const {
        line,
        startPoint,
        endPoint,
        constraints,
        newDrawingLineMap,
        newDataLineMap,
        newLineConstraintsMap,
      } = processLine(editorStore, drawingLine);

      newDataLayer.addPoint(startPoint.newRelatedPoint);
      newDataLayer.addPoint(endPoint.newRelatedPoint);
      newDrawingPoints.push(startPoint.newPoint, endPoint.newPoint);
      newStageLayer.add(line, startPoint.newPoint, endPoint.newPoint);

      for (let constraint of constraints) {
        newDataLayer.addConstraint(constraint);
      }
      pointConstraints.push(...startPoint.constraints);
      pointConstraints.push(...endPoint.constraints);

      mergeMaps(drawingObjectsMap, newDrawingLineMap);
      mergeMaps(dataObjectsMap, newDataLineMap);
      mergeMaps(constraintsMap, newLineConstraintsMap);

      mergeMaps(drawingObjectsMap, startPoint.newDrawingPointMap);
      mergeMaps(dataObjectsMap, startPoint.newDataPointMap);
      mergeMaps(constraintsMap, startPoint.newPointConstraintsMap);

      mergeMaps(drawingObjectsMap, endPoint.newDrawingPointMap);
      mergeMaps(dataObjectsMap, endPoint.newDataPointMap);
      mergeMaps(constraintsMap, endPoint.newPointConstraintsMap);
    } else if (drawingPoint.relatedArc) {
      console.log("point with arc");
      const drawingArc = drawingPoint.relatedArc;
      // disable all event on elements from prev layer
      drawingArc.off("click dragmove mouseenter mouseleave");
      drawingArc.startPoint.off("click dragmove mouseenter mouseleave");
      drawingArc.endPoint.off("click dragmove mouseenter mouseleave");
      drawingArc.centerPoint.off("click dragmove mouseenter mouseleave");
      drawingArc.relatedRadiusEndLine.off(
        "click dragmove mouseenter mouseleave"
      );
      drawingArc.relatedRadiusStartLine.off(
        "click dragmove mouseenter mouseleave"
      );

      processedItems.add(drawingArc._id);
      processedItems.add(drawingArc.startPoint._id);
      processedItems.add(drawingArc.endPoint._id);
      const {
        arc,
        centerPoint,
        startPoint,
        endPoint,
        startLine,
        endLine,
        constraints,
        newDrawingArcMap,
        newDataArcMap,
        newArcConstraintsMap,
      } = processArc(editorStore, drawingArc);

      newDataLayer.addPoint(centerPoint.newRelatedPoint);
      newDataLayer.addPoint(startPoint.newRelatedPoint);
      newDataLayer.addPoint(endPoint.newRelatedPoint);
      newDataLayer.addArc(arc.newRelatedArc);

      for (let constraint of constraints) {
        newDataLayer.addConstraint(constraint);
      }
      pointConstraints.push(...startPoint.constraints);
      pointConstraints.push(...endPoint.constraints);
      pointConstraints.push(...centerPoint.constraints);

      newDrawingPoints.push(
        centerPoint.newPoint,
        startPoint.newPoint,
        endPoint.newPoint
      );
      newStageLayer.add(
        centerPoint.newPoint,
        startPoint.newPoint,
        endPoint.newPoint,
        arc.newArc,
        startLine,
        endLine
      );

      mergeMaps(drawingObjectsMap, newDrawingArcMap);
      mergeMaps(dataObjectsMap, newDataArcMap);
      mergeMaps(constraintsMap, newArcConstraintsMap);

      mergeMaps(drawingObjectsMap, startPoint.newDrawingPointMap);
      mergeMaps(dataObjectsMap, startPoint.newDataPointMap);
      mergeMaps(constraintsMap, startPoint.newPointConstraintsMap);

      mergeMaps(drawingObjectsMap, endPoint.newDrawingPointMap);
      mergeMaps(dataObjectsMap, endPoint.newDataPointMap);
      mergeMaps(constraintsMap, endPoint.newPointConstraintsMap);

      mergeMaps(drawingObjectsMap, centerPoint.newDrawingPointMap);
      mergeMaps(dataObjectsMap, centerPoint.newDataPointMap);
      mergeMaps(constraintsMap, centerPoint.newPointConstraintsMap);
    }
  }

  console.log("drawing map", drawingObjectsMap);
  console.log("data map", dataObjectsMap);
  console.log("constraints map", constraintsMap);
  console.log("points constraints", pointConstraints);

  let constraintsToClone;
  if (full) {
    constraintsToClone = null;
  } else {
    constraintsToClone = [
      ConstraintsTypes.LENGTH_TOTAL,
      ConstraintsTypes.COINCIDENT,
      ConstraintsTypes.ARC_LINE_PERPENDICULAR,
    ];
  }
  cloneConstraints(
    constraintsMap,
    drawingObjectsMap,
    dataObjectsMap,
    newDataLayer,
    constraintsToClone
  );

  for (let constraint of pointConstraints) {
    newDataLayer.addConstraint(constraint);
  }

  return {
    dataLayer: newDataLayer,
    stageLayer: newStageLayer,
    drawingPoints: newDrawingPoints,
  };
}

export { cloneLayer, processPoint, processLine, processArc };
