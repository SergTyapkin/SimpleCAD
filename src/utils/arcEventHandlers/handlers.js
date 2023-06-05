import setArcEvents from "./index";
import { Constraint } from "../../../Constraint";
import { ConstraintsTypes } from "../../../ConstraintsTypes";
import { drawingColors } from "../constants";
import { processArc } from "../konvaHelpers/clone";
import setLineEvents from "../lineEventHandlers";
import setPointEvents from "../pointEventHandlers";
import {constraintImage, text} from "../konvaHelpers/draw";
import {promptDegAngle, promptMMLength} from "../konvaHelpers/utils";

// Длина дуги
async function arcLength(editorStore, arc) {
  if (!arc.relatedConstraints[ConstraintsTypes.ARC_LENGTH]?.length) {
    console.log("arc length");
    const [pxLength, mmLength] = promptMMLength("Введите длину дуги:");
    if (pxLength === null || pxLength <= 0) {
      alert("Введено неверное значение длины:" + mmLength);
      return;
    }
    const constraint = new Constraint({
      type: ConstraintsTypes.ARC_LENGTH,
      elements: [arc.relatedArc],
      image: await constraintImage(arc.relatedArc._p2.x - 15, arc.relatedArc._p2.y - 15, ConstraintsTypes["ARC_LENGTH"]),
      value: pxLength,
    });
    constraint._text = text(arc.relatedArc._p2.x, arc.relatedArc._p2.y, String(mmLength) + "*");
    editorStore.currentStageLayer.add(constraint._text);
    arc.relatedConstraints[constraint.type] = [constraint];
    editorStore.currentStageLayer.add(constraint._image);
    editorStore.currentDataLayer.addConstraint(constraint);
    editorStore.updateDrawing();
  }
}

// Радиус дуги
async function arcRadius(editorStore, arc) {
  if (!arc.relatedConstraints[ConstraintsTypes.ARC_RADIUS]?.length) {
    console.log("arc radius");
    const [pxLength, mmLength] = promptMMLength("Введите радиус дуги:");
    if (pxLength === null || pxLength <= 0) {
      alert("Введено неверное значение радиуса: " + mmLength);
      return;
    }
    const constraint = new Constraint({
      type: ConstraintsTypes.ARC_RADIUS,
      elements: [arc.relatedArc],
      image: await constraintImage(arc.relatedArc._p2.x - 15, arc.relatedArc._p2.y - 15, ConstraintsTypes["ARC_RADIUS"]),
      value: pxLength,
    });
    constraint._text = text(arc.relatedArc._p2.x, arc.relatedArc._p2.y, String(mmLength));
    editorStore.currentStageLayer.add(constraint._text);
    arc.relatedConstraints[constraint.type] = [constraint];
    editorStore.currentStageLayer.add(constraint._image);
    editorStore.currentDataLayer.addConstraint(constraint);
    editorStore.updateDrawing();
  }
}

// Угол дуги
async function arcAngle(editorStore, arc) {
  if (!arc.relatedConstraints[ConstraintsTypes.ARC_ANGLE]?.length) {
    console.log("arc angle");
    const angle = promptDegAngle("Введите угол дуги:")[0];
    if (angle === null || angle <= 0 || angle >= 360) {
      alert("Введено неверное значение угла: " + angle);
      return;
    }
    const constraint = new Constraint({
      type: ConstraintsTypes.ARC_ANGLE,
      elements: [arc.relatedArc],
      image: await constraintImage(arc.relatedArc._p2.x - 15, arc.relatedArc._p2.y - 15, ConstraintsTypes["ARC_ANGLE"]),
      value: angle,
    });
    constraint._text = text(arc.relatedArc._p2.x, arc.relatedArc._p2.y, String(angle) + "°");
    editorStore.currentStageLayer.add(constraint._text);
    arc.relatedConstraints[constraint.type] = [constraint];
    editorStore.currentStageLayer.add(constraint._image);
    editorStore.currentDataLayer.addConstraint(constraint);
    editorStore.updateDrawing();
  }
}

// Внешнее касание дуг
// Внутреннее касание дуг
async function arcTouch(editorStore, arc) {
  if (editorStore?.tmpConstraint?.type !== ConstraintsTypes["ARC_TANGENT_ToArc"]) {
    const constraint = new Constraint({
      type: "ARC_TANGENT_ToArc",
      elements: [arc.relatedArc],
      mode: editorStore.selectedInstrument === 18 ? "OUT" : "IN",
      image: await constraintImage(arc.relatedArc._p2.x - 15, arc.relatedArc._p2.y - 15, ConstraintsTypes["ARC_TANGENT_ToArc"]),
    });
    editorStore.tmpConstraint?._image?.destroy();
    editorStore.tmpConstraint = constraint;
    editorStore.currentStageLayer.add(constraint._image);
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
async function arcAndLine(editorStore, arc) {
  if (editorStore?.tmpConstraint?.type !== ConstraintsTypes["ARC_TANGENT_ToLine"]) {
    const constraint = new Constraint({
      type: "ARC_TANGENT_ToLine",
      elements: [arc.relatedArc],
      image: await constraintImage(arc.relatedArc._p2.x - 15, arc.relatedArc._p2.y - 15, ConstraintsTypes["ARC_TANGENT_ToLine"]),
    });
    editorStore.tmpConstraint?._image?.destroy();
    editorStore.tmpConstraint = constraint;
    editorStore.currentStageLayer.add(constraint._image);
    if (arc.relatedConstraints[constraint.type]) {
      arc.relatedConstraints[constraint.type].push(constraint);
    } else {
      arc.relatedConstraints[constraint.type] = [constraint];
    }
  } else {
    if (editorStore.tmpConstraint.elements) {
      editorStore.tmpConstraint?._image?.destroy();
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
async function polylineLength(editorStore, arc) {
  if (editorStore?.tmpConstraint?.type !== ConstraintsTypes["LENGTH_TOTAL"]) {
    const constraint = new Constraint({
      type: ConstraintsTypes.LENGTH_TOTAL,
      elements: [arc.relatedArc],
      image: await constraintImage(arc.relatedArc._p2.x - 15, arc.relatedArc._p2.y - 15, ConstraintsTypes["LENGTH_TOTAL"]),
    });
    editorStore.tmpConstraint?._image?.destroy();
    editorStore.tmpConstraint = constraint;
    editorStore.currentStageLayer.add(constraint._image);
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


  // for (const key in startP.relatedConstraints) {
  //   startP.relatedConstraints[key].forEach(c => {
  //     c?._image?.destroy(); // delete constraints
  //   });
  // }
  // for (const key in endP.relatedConstraints) {
  //   endP.relatedConstraints[key].forEach(c => {
  //     c?._image?.destroy(); // delete constraints
  //   });
  // }
  // for (const key in centerP.relatedConstraints) {
  //   centerP.relatedConstraints[key].forEach(c => {
  //     c?._image?.destroy(); // delete constraints
  //   });
  // }
  for (const key in arc.relatedConstraints) {
    arc.relatedConstraints[key].forEach(c => {
      c?._image?.destroy(); // delete constraints images
      c?._text?.destroy(); // delete constraints texts
    });
  }
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
