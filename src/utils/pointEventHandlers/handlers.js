import { Constraint } from "../../../Constraint";
import { ConstraintsTypes } from "../../../ConstraintsTypes";
import { drawingColors } from "../constants";
import { processPoint } from "../konvaHelpers/clone";
import setPointEvents from "./index";
import {constraintImage, text} from "../konvaHelpers/draw";
import {promptMMLength} from "../konvaHelpers/utils";

// удаление точки
function deletePoint(editorStore, point) {
  console.log('delete POINT !!!!!!');
  // если у точки нет родительской линии, то удаляем ее
  if (!point.relatedLine) {
    const pointId = point.relatedId;
    editorStore.currentDataLayer.removePoint(pointId);
    const pointIndex = editorStore.currentDrawingPoints.findIndex(
      (el) => el.relatedId == pointId
    );
    editorStore.currentDrawingPoints.splice(pointIndex, 1);

    for (const key in point.relatedConstraints) {
      point.relatedConstraints[key].forEach(c => {
        c?._image?.destroy(); // delete constraints images
        c?._text?.destroy(); // delete constraints texts
      });
    }
    point.destroy();
    editorStore.currentStageLayer.draw();
  }
}

// Расстояние между точками / длина отрезка
async function pointsDistance(editorStore, point) {
  if (editorStore?.tmpConstraint?.type !== ConstraintsTypes["LENGTH"]) {
    const constraint = new Constraint({
      type: ConstraintsTypes["LENGTH"],
      points: [point],
      image: await constraintImage(point.x(), point.y(), ConstraintsTypes["LENGTH"]),
    });
    editorStore.tmpConstraint?._image?.destroy();
    editorStore.tmpConstraint = constraint;
    editorStore.currentStageLayer.add(constraint._image);
    if (point.relatedConstraints[constraint.type]) {
      point.relatedConstraints[constraint.type].push(constraint);
    } else {
      point.relatedConstraints[constraint.type] = [constraint];
    }
  } else {
    const [pxLength, mmLength] = promptMMLength("Введите расстояние:");
    if (pxLength === null || pxLength <= 0) {
      alert("Введено неверное значение расстояния");
      editorStore.tmpConstraint.points[0].relatedConstraints[
        ConstraintsTypes["LENGTH"]
      ].pop();
      editorStore.tmpConstraint?._image?.destroy();
      editorStore.tmpConstraint = null;
      return;
    }
    editorStore.tmpConstraint.value = pxLength;
    editorStore.tmpConstraint._text = text(point.x(), point.y(), String(mmLength));
    editorStore.currentStageLayer.add(editorStore.tmpConstraint._text);
    const constraintPoint = editorStore.tmpConstraint.points[0];
    editorStore.tmpConstraint.points = [
      constraintPoint.relatedPoint,
      point.relatedPoint,
    ];
    editorStore.currentDataLayer.addConstraint(editorStore.tmpConstraint);
    point.relatedConstraints[editorStore.tmpConstraint.type] = [
      editorStore.tmpConstraint,
    ];
    editorStore.updateDrawing();
    editorStore.tmpConstraint = null;
  }
}

// Совмещение точек
async function pointsAlignment(editorStore, point) {
  if (editorStore?.tmpConstraint?.type !== ConstraintsTypes["COINCIDENT"]) {
    const constraint = new Constraint({
      type: ConstraintsTypes["COINCIDENT"],
      points: [point],
      image: await constraintImage(point.x(), point.y(), ConstraintsTypes["COINCIDENT"]),
    });
    editorStore.tmpConstraint?._image?.destroy();
    editorStore.tmpConstraint = constraint;
    editorStore.currentStageLayer.add(constraint._image);
    if (point.relatedConstraints[constraint.type]) {
      point.relatedConstraints[constraint.type].push(constraint);
    } else {
      point.relatedConstraints[constraint.type] = [constraint];
    }
  } else {
    const constraintPoint = editorStore.tmpConstraint.points[0];
    editorStore.tmpConstraint.points = [
      constraintPoint.relatedPoint,
      point.relatedPoint,
    ];
    editorStore.currentDataLayer.addConstraint(editorStore.tmpConstraint);
    if (point.relatedConstraints[editorStore.tmpConstraint.type]) {
      point.relatedConstraints[editorStore.tmpConstraint.type].push(
        editorStore.tmpConstraint
      );
    } else {
      point.relatedConstraints[editorStore.tmpConstraint.type] = [
        editorStore.tmpConstraint,
      ];
    }
    if (constraintPoint.relatedConstraints["FIX_POINT"]) {
      const fixConstraint = new Constraint({
        type: ConstraintsTypes["FIX_POINT"],
        points: [point.relatedPoint],
        image: await constraintImage(point.x(), point.y(), ConstraintsTypes["FIX_POINT"]),
      });
      editorStore.currentStageLayer.add(fixConstraint._image);
      point.relatedConstraints["FIX_POINT"] = [fixConstraint];
      point.draggable(false);
      point.fill(drawingColors["DISABLED_ELEMENT_COLOR"]);
      editorStore.currentDataLayer.addConstraint(fixConstraint);
    } else if (point.relatedConstraints["FIX_POINT"]) {
      const fixConstraint = new Constraint({
        type: ConstraintsTypes["FIX_POINT"],
        points: [constraintPoint.relatedPoint],
        image: await constraintImage(point.x(), point.y(), ConstraintsTypes["FIX_POINT"]),
      });
      editorStore.currentStageLayer.add(fixConstraint._image);
      constraintPoint.relatedConstraints["FIX_POINT"] = [fixConstraint];
      constraintPoint.draggable(false);
      constraintPoint.fill(drawingColors["DISABLED_ELEMENT_COLOR"]);
      editorStore.currentDataLayer.addConstraint(fixConstraint);
    }
    editorStore.updateDrawing();
    editorStore.tmpConstraint = null;
  }
}

// Фиксация точки
async function fixPoint(editorStore, point) {
  if (!(ConstraintsTypes["FIX_POINT"] in point.relatedConstraints)) {
    const constraint = new Constraint({
      type: ConstraintsTypes["FIX_POINT"],
      points: [point.relatedPoint],
      image: await constraintImage(point.x(), point.y(), ConstraintsTypes["FIX_POINT"]),
    });
    editorStore.currentStageLayer.add(constraint._image);
    point.relatedConstraints[constraint.type] = [constraint];
    point.draggable(false);
    point.fill(drawingColors["DISABLED_ELEMENT_COLOR"]);
    editorStore.currentDataLayer.addConstraint(constraint);
    editorStore.updateDrawing();
  }
}

// Точка на прямой
async function pointOnLine(editorStore, point) {
  if (editorStore?.tmpConstraint?.type !== ConstraintsTypes["POINT_ON_LINE"]) {
    const constraint = new Constraint({
      type: ConstraintsTypes["POINT_ON_LINE"],
      points: [point.relatedPoint],
      image: await constraintImage(point.x(), point.y(), ConstraintsTypes["POINT_ON_LINE"]),
    });
    editorStore.tmpConstraint?._image?.destroy();
    editorStore.tmpConstraint = constraint;
    editorStore.currentStageLayer.add(constraint._image);
    if (point.relatedConstraints[constraint.type]) {
      point.relatedConstraints[constraint.type].push(constraint);
    } else {
      point.relatedConstraints[constraint.type] = [constraint];
    }
  } else {
    editorStore.tmpConstraint.points = [point.relatedPoint];
    editorStore.currentDataLayer.addConstraint(editorStore.tmpConstraint);
    if (point.relatedConstraints[editorStore.tmpConstraint.type]) {
      point.relatedConstraints[editorStore.tmpConstraint.type].push(
        editorStore.tmpConstraint
      );
    } else {
      point.relatedConstraints[editorStore.tmpConstraint.type] = [
        editorStore.tmpConstraint,
      ];
    }
    editorStore.updateDrawing();
    editorStore.tmpConstraint = null;
  }
}

// Совмещение точки и конца дуги
async function pointAndArcAlignment(editorStore, point) {
  if (editorStore?.tmpConstraint?.type !== ConstraintsTypes["ARC_POINT_COINCIDENT"]) {
    let constraint;
    if (point.relatedArc) {
      const arc = point.relatedArc;
      if (point.relatedId == arc.centerPoint.relatedId) {
        return;
      }
      const mode = point.relatedId == arc.startPoint.relatedId ? 1 : 2;
      constraint = new Constraint({
        type: ConstraintsTypes["ARC_POINT_COINCIDENT"],
        elements: [arc.relatedArc],
        image: await constraintImage(point.x(), point.y(), ConstraintsTypes["ARC_POINT_COINCIDENT"]),
        mode,
      });
      editorStore.currentStageLayer.add(constraint._image);
    } else {
      constraint = new Constraint({
        type: ConstraintsTypes["ARC_POINT_COINCIDENT"],
        points: [point.relatedPoint],
        image: await constraintImage(point.x(), point.y(), ConstraintsTypes["ARC_POINT_COINCIDENT"]),
      });
      editorStore.currentStageLayer.add(constraint._image);
    }
    editorStore.tmpConstraint?._image?.destroy();
    editorStore.tmpConstraint = constraint;
    if (point.relatedConstraints[constraint.type]) {
      point.relatedConstraints[constraint.type].push(constraint);
    } else {
      point.relatedConstraints[constraint.type] = [constraint];
    }
  } else {
    if (point.relatedArc) {
      if (editorStore.tmpConstraint.elements) {
        editorStore.tmpConstraint = null;
        return;
      }
      const arc = point.relatedArc;
      if (point.relatedId == arc.centerPoint.relatedId) {
        editorStore.tmpConstraint = null;
        return;
      }
      editorStore.tmpConstraint.elements = [point.relatedArc.relatedArc];
      const mode = point.relatedId == arc.startPoint.relatedId ? 1 : 2;
      editorStore.tmpConstraint.mode = mode;
    } else {
      if (editorStore.tmpConstraint.points) {
        editorStore.tmpConstraint = null;
        return;
      } else {
        editorStore.tmpConstraint.points = [point.relatedPoint];
      }
    }
    editorStore.currentDataLayer.addConstraint(editorStore.tmpConstraint);
    if (point.relatedConstraints[editorStore.tmpConstraint.type]) {
      point.relatedConstraints[editorStore.tmpConstraint.type].push(
        editorStore.tmpConstraint
      );
    } else {
      point.relatedConstraints[editorStore.tmpConstraint.type] = [
        editorStore.tmpConstraint,
      ];
    }
    editorStore.updateDrawing();
    editorStore.tmpConstraint = null;
  }
}

// Фиксация конца дуги
async function fixArcEnd(editorStore, point) {
  if (!(ConstraintsTypes["ARC_POINT_FIX"] in point.relatedConstraints)) {
    if (!point.relatedArc) {
      return;
    }
    let mode;
    if (point.relatedId == point.relatedArc.startPoint.relatedId) {
      mode = 1;
    } else {
      mode = 2;
    }

    const constraint = new Constraint({
      type: "ARC_POINT_FIX",
      elements: [point.relatedArc.relatedArc],
      image: await constraintImage(point.x(), point.y(), ConstraintsTypes["ARC_POINT_FIX"]),
      mode,
    });
    editorStore.currentStageLayer.add(constraint._image);
    point.relatedConstraints[constraint.type] = [constraint];
    point.draggable(false);
    point.fill(drawingColors["DISABLED_ELEMENT_COLOR"]);
    editorStore.currentDataLayer.addConstraint(constraint);
    editorStore.updateDrawing();
  }
}

// Расстояние между точкой и отрезком
async function pointAndLineDistance(editorStore, point) {
  if (editorStore?.tmpConstraint?.type !== ConstraintsTypes["DISTANCE_POINT_LINE"]) {
    const constraint = new Constraint({
      type: ConstraintsTypes["DISTANCE_POINT_LINE"],
      points: [point.relatedPoint],
      image: await constraintImage(point.x(), point.y(), ConstraintsTypes["DISTANCE_POINT_LINE"]),
    });
    editorStore.tmpConstraint?._image?.destroy();
    editorStore.tmpConstraint = constraint;
    editorStore.currentStageLayer.add(constraint._image);
    if (point.relatedConstraints[constraint.type]) {
      point.relatedConstraints[constraint.type].push(constraint);
    } else {
      point.relatedConstraints[constraint.type] = [constraint];
    }
  } else {
    if (editorStore.tmpConstraint.points) {
      editorStore.tmpConstraint = null;
      return;
    }
    const [pxLength, mmLength] = promptMMLength("Введите расстояние:");
    if (pxLength === null || pxLength <= 0) {
      alert("Введено неверное значение расстояние");
      editorStore.tmpConstraint = null;
      return;
    }
    editorStore.tmpConstraint._text = text(point.x(), point.y(), String(mmLength));
    editorStore.currentStageLayer.add(editorStore.tmpConstraint._text);

    editorStore.tmpConstraint.points = [point.relatedPoint];
    editorStore.tmpConstraint.value = pxLength;
    editorStore.currentDataLayer.addConstraint(editorStore.tmpConstraint);
    if (point.relatedConstraints[editorStore.tmpConstraint.type]) {
      point.relatedConstraints[editorStore.tmpConstraint.type].push(
        editorStore.tmpConstraint
      );
    } else {
      point.relatedConstraints[editorStore.tmpConstraint.type] = [
        editorStore.tmpConstraint,
      ];
    }
    editorStore.updateDrawing();
    editorStore.tmpConstraint = null;
  }
}

// Вывод параметров объекта (выберите точку/отрезок/дугу)
async function pointParams(editorStore, point) {
  const pointId = point.relatedId;
  const pointInfo = editorStore.currentDataLayer.getPointInfo(pointId);
  const message = `Point#${pointId} (${pointInfo.x.toFixed(
    2
  )}; ${pointInfo.y.toFixed(2)})`;
  alert(message);
}

function pointConstraints(editorStore, point) {
  editorStore.generateConstraintsMap();
  editorStore.selectedObjectForConstraints = point;

  let pointInfo = [];
  const pointId = point.relatedId;
  const info = editorStore.currentDataLayer.getPointInfo(pointId);
  pointInfo.push(
    { key: "id", value: `Point#${pointId}` },
    { key: "x", value: info.x.toFixed(2) },
    { key: "y", value: info.y.toFixed(2) }
  );
  editorStore.selectedObjectInfo = pointInfo;
}

// проекция точки
function projectPoint(editorStore, point) {
  const { newPoint, newRelatedPoint, constraints } =
    processPoint(editorStore, point, true);
  newPoint.off("click dragmove mouseenter mouseleave");
  setPointEvents(editorStore, newPoint, ["click"]);
  newPoint.draggable(false);
  newPoint.fill(drawingColors.PROJECTION_ELEMENT_COLOR);

  const layerToProject = editorStore.tmpLayerIndex;
  editorStore.dataLayers[layerToProject].addPoint(newRelatedPoint);
  constraints.forEach((constraint) =>
    editorStore.dataLayers[layerToProject].addConstraint(constraint)
  );
  editorStore.stageLayers[layerToProject].add(newPoint);


  if (editorStore.projectionsMap.has(point)) {
    const currentProjections = editorStore.projectionsMap.get(point);
    editorStore.projectionsMap.set(point, [...currentProjections, newPoint]);
  } else {
    editorStore.projectionsMap.set(point, [newPoint]);
  }

  // editorStore.tmpLayerIndex = null;
}

export default {
  deletePoint,
  pointsDistance,
  pointsAlignment,
  fixPoint,
  pointOnLine,
  pointAndArcAlignment,
  fixArcEnd,
  pointAndLineDistance,
  pointParams,
  pointConstraints,
  projectPoint,
};
