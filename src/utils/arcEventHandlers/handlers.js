import setArcEvents from "./index";
import { Constraint } from "../../../Constraint";
import { ConstraintsTypes } from "../../../ConstraintsTypes";
import { drawingColors } from "../constants";
import { processArc } from "../konvaHelpers/clone";
import setLineEvents from "../lineEventHandlers";
import setPointEvents from "../pointEventHandlers";

// Длина дуги
function arcLength(editorStore, arc) {
  if (!arc.relatedConstraints[ConstraintsTypes.ARC_LENGTH]?.length) {
    console.log("arc length");
    const answer = prompt("Введите длину дуги:");
    const lenght = parseFloat(answer);
    if (isNaN(lenght) || lenght <= 0) {
      alert("Введено неверное значение длины:" + answer);
      return;
    }
    const constraint = new Constraint({
      type: ConstraintsTypes.ARC_LENGTH,
      elements: [arc.relatedArc],
      value: lenght,
    });
    arc.relatedConstraints[constraint.type] = [constraint];
    editorStore.currentDataLayer.addConstraint(constraint);
    editorStore.updateDrawing();
  }
}

// Радиус дуги
function arcRadius(editorStore, arc) {
  if (!arc.relatedConstraints[ConstraintsTypes.ARC_RADIUS]?.length) {
    console.log("arc radius");
    const answer = prompt("Введите радиус дуги:");
    const radius = parseFloat(answer);
    if (isNaN(radius) || radius <= 0) {
      alert("Введено неверное значение радиуса: " + answer);
      return;
    }
    const constraint = new Constraint({
      type: ConstraintsTypes.ARC_RADIUS,
      elements: [arc.relatedArc],
      value: radius,
    });
    arc.relatedConstraints[constraint.type] = [constraint];
    editorStore.currentDataLayer.addConstraint(constraint);
    editorStore.updateDrawing();
  }
}

// Угол дуги
function arcAngle(editorStore, arc) {
  if (!arc.relatedConstraints[ConstraintsTypes.ARC_ANGLE]?.length) {
    console.log("arc angle");
    const answer = prompt("Введите угол дуги:");
    const angle = parseFloat(answer);
    if (isNaN(angle) || angle <= 0 || angle > 360) {
      alert("Введено неверное значение угла: " + answer);
      return;
    }
    const constraint = new Constraint({
      type: ConstraintsTypes.ARC_ANGLE,
      elements: [arc.relatedArc],
      value: angle,
    });
    arc.relatedConstraints[constraint.type] = [constraint];
    editorStore.currentDataLayer.addConstraint(constraint);
    editorStore.updateDrawing();
  }
}

// Внешнее касание дуг
// Внутреннее касание дуг
function arcTouch(editorStore, arc) {
  if (!editorStore.tmpConstraint) {
    const constraint = new Constraint({
      type: "ARC_TANGENT_ToArc",
      elements: [arc.relatedArc],
      mode: editorStore.selectedInstrument === 18 ? "OUT" : "IN",
    });
    editorStore.tmpConstraint = constraint;
    if (arc.relatedConstraints[constraint.type]) {
      arc.relatedConstraints[constraint.type].push(constraint);
    } else {
      arc.relatedConstraints[constraint.type] = [constraint];
    }
  } else {
    editorStore.tmpConstraint.elements.push(arc.relatedArc);
    editorStore.currentDataLayer.addConstraint(editorStore.tmpConstraint);
    if (arc.relatedConstraints[editorStore.tmpConstraint.type]) {
      arc.relatedConstraints[editorStore.tmpConstraint.type].push(
        editorStore.tmpConstraint
      );
    } else {
      arc.relatedConstraints[editorStore.tmpConstraint.type] = [
        editorStore.tmpConstraint,
      ];
    }
    editorStore.updateDrawing();
    editorStore.tmpConstraint = null;
  }
}

// Касание дуги и отрезка
function arcAndLine(editorStore, arc) {
  if (!editorStore.tmpConstraint) {
    const constraint = new Constraint({
      type: "ARC_TANGENT_ToLine",
      elements: [arc.relatedArc],
    });
    editorStore.tmpConstraint = constraint;
    if (arc.relatedConstraints[constraint.type]) {
      arc.relatedConstraints[constraint.type].push(constraint);
    } else {
      arc.relatedConstraints[constraint.type] = [constraint];
    }
  } else {
    if (editorStore.tmpConstraint.elements) {
      editorStore.tmpConstraint = null;
      return;
    }
    editorStore.tmpConstraint.elements = [arc.relatedArc];
    editorStore.currentDataLayer.addConstraint(editorStore.tmpConstraint);
    if (arc.relatedConstraints[editorStore.tmpConstraint.type]) {
      arc.relatedConstraints[editorStore.tmpConstraint.type].push(
        editorStore.tmpConstraint
      );
    } else {
      arc.relatedConstraints[editorStore.tmpConstraint.type] = [
        editorStore.tmpConstraint,
      ];
    }
    editorStore.updateDrawing();
    editorStore.tmpConstraint = null;
  }
}

// Длина полилинии
function polylineLength(editorStore, arc) {
  if (!editorStore.tmpConstraint) {
    const constraint = new Constraint({
      type: ConstraintsTypes.LENGTH_TOTAL,
      elements: [arc.relatedArc],
    });
    editorStore.tmpConstraint = constraint;
    if (arc.relatedConstraints[constraint.type]) {
      arc.relatedConstraints[constraint.type].push(constraint);
    } else {
      arc.relatedConstraints[constraint.type] = [constraint];
    }
  } else {
    editorStore.tmpConstraint.elements.push(arc.relatedArc);
    if (arc.relatedConstraints[editorStore.tmpConstraint.type]) {
      arc.relatedConstraints[editorStore.tmpConstraint.type].push(
        editorStore.tmpConstraint
      );
    } else {
      arc.relatedConstraints[editorStore.tmpConstraint.type] = [
        editorStore.tmpConstraint,
      ];
    }
  }
  editorStore.selectedElementList.arcs.push(arc);
  arc.fill(drawingColors.SELECTED_ELEMENT_COLOR);
  editorStore.currentStageLayer.draw();
}

// Вывод параметров объекта (выберите точку/отрезок/дугу)
function arcInfo(editorStore, arc) {
  const radius = arc.relatedArc.calcRadius();
  const fi1 = arc.relatedArc.calcFi1Deg();
  const fi2 = arc.relatedArc.calcFi2Deg();
  const angle = arc.relatedArc.calcAngleDeg();
  const arcLength = radius * ((Math.PI * angle) / 180);
  const message = `Arc#${arc.relatedArc.id}:\nR = ${radius.toFixed(
    2
  )}\n\nArc length is ${arcLength.toFixed(2)}\n\nAngle = ${angle.toFixed(
    2
  )}\nfi1 = ${fi1.toFixed(2)}\nfi2 = ${fi2.toFixed(2)}`;
  alert(message);
}

function arcConstraints(editorStore, arc) {
  editorStore.generateConstraintsMap();
  editorStore.selectedObjectForConstraints = arc;

  let arcInfo = [];
  const radius = arc.relatedArc.calcRadius();
  const fi1 = arc.relatedArc.calcFi1Deg();
  const fi2 = arc.relatedArc.calcFi2Deg();
  const angle = arc.relatedArc.calcAngleDeg();
  const arcLength = radius * ((Math.PI * angle) / 180);
  arcInfo.push(
    { key: "id", value: `Arc#${arc.relatedArc.id}` },
    { key: "R", value: radius.toFixed(2) },
    { key: "fi1", value: fi1.toFixed(2) },
    { key: "fi2", value: fi2.toFixed(2) },
    { key: "Длина дуги", value: arcLength.toFixed(2) },
    { key: "Угол дуги", value: angle.toFixed(2) }
  );
  editorStore.selectedObjectInfo = arcInfo;
}

function deleteArc(editorStore, arc) {
  const startP = arc.startPoint;
  const endP = arc.endPoint;
  const centerP = arc.centerPoint;
  const sPId = startP.relatedId;
  const ePId = endP.relatedId;
  const cPId = centerP.relatedId;

  editorStore.currentDataLayer.removePoint(sPId);
  editorStore.currentDataLayer.removePoint(ePId);
  editorStore.currentDataLayer.removePoint(cPId);
  editorStore.currentDataLayer.removeElement(arc.relatedArc.id);

  let pointIndex = editorStore.currentDrawingPoints.findIndex(
    (el) => el.relatedId == sPId
  );
  editorStore.currentDrawingPoints.splice(pointIndex, 1);
  pointIndex = editorStore.currentDrawingPoints.findIndex(
    (el) => el.relatedId == ePId
  );
  editorStore.currentDrawingPoints.splice(pointIndex, 1);
  pointIndex = editorStore.currentDrawingPoints.findIndex(
    (el) => el.relatedId == cPId
  );
  editorStore.currentDrawingPoints.splice(pointIndex, 1);

  startP.destroy();
  endP.destroy();
  centerP.destroy();
  arc.relatedRadiusEndLine.destroy();
  arc.relatedRadiusStartLine.destroy();
  arc.destroy();

  editorStore.currentStageLayer.draw();
}

// проекция дуги
function projectArc(editorStore, arc) {
  const {
    arc: arcData,
    centerPoint,
    startPoint,
    endPoint,
    startLine,
    endLine,
    constraints,
  } = processArc(editorStore, arc, true);

  arcData.newArc.off("click dragmove mouseenter mouseleave");
  setArcEvents(editorStore, arcData.newArc, ["click"]);
  arcData.newArc.draggable(false);
  arcData.newArc.stroke(drawingColors.PROJECTION_ELEMENT_COLOR);
  arcData.newArc.fill(drawingColors.PROJECTION_ELEMENT_COLOR);

  centerPoint.newPoint.off("click dragmove mouseenter mouseleave");
  setPointEvents(editorStore, centerPoint.newPoint, ["click"]);
  centerPoint.newPoint.draggable(false);
  centerPoint.newPoint.fill(drawingColors.PROJECTION_ELEMENT_COLOR);

  startPoint.newPoint.off("click dragmove mouseenter mouseleave");
  setPointEvents(editorStore, startPoint.newPoint, ["click"]);
  startPoint.newPoint.draggable(false);
  startPoint.newPoint.fill(drawingColors.PROJECTION_ELEMENT_COLOR);

  endPoint.newPoint.off("click dragmove mouseenter mouseleave");
  setPointEvents(editorStore, endPoint.newPoint, ["click"]);
  endPoint.newPoint.draggable(false);
  endPoint.newPoint.fill(drawingColors.PROJECTION_ELEMENT_COLOR);

  startLine.off("click dragmove mouseenter mouseleave");
  setLineEvents(editorStore, startLine, ["click"]);
  startLine.draggable(false);
  startLine.stroke(drawingColors.PROJECTION_ELEMENT_COLOR);

  endLine.off("click dragmove mouseenter mouseleave");
  setLineEvents(editorStore, endLine, ["click"]);
  endLine.draggable(false);
  endLine.stroke(drawingColors.PROJECTION_ELEMENT_COLOR);

  const layerToProject = editorStore.tmpLayerIndex;
  [centerPoint, startPoint, endPoint].forEach((p) => {
    editorStore.dataLayers[layerToProject].addPoint(p.newRelatedPoint);
    p.constraints.forEach((constraint) =>
      editorStore.dataLayers[layerToProject].addConstraint(constraint)
    );
  });
  editorStore.dataLayers[layerToProject].addArc(arcData.newRelatedArc);
  constraints.forEach((constraint) =>
    editorStore.dataLayers[layerToProject].addConstraint(constraint)
  );

  editorStore.stageLayers[layerToProject].add(
    arcData.newArc,
    startPoint.newPoint,
    endPoint.newPoint,
    centerPoint.newPoint,
    startLine,
    endLine
  );

  if (editorStore.projectionsMap.has(arc)) {
    const currentProjections = editorStore.projectionsMap.get(arc);
    editorStore.projectionsMap.set(arc, [
      ...currentProjections,
      arcData.newArc,
    ]);
  } else {
    editorStore.projectionsMap.set(arc, [arcData.newArc]);
  }

  // editorStore.tmpLayerIndex = null;
}

export default {
  arcLength,
  arcRadius,
  arcAngle,
  arcTouch,
  arcAndLine,
  polylineLength,
  arcInfo,
  arcConstraints,
  deleteArc,
  projectArc,
};
