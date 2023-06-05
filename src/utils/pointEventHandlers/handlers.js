import { Constraint } from "../../../Constraint";
import { ConstraintsTypes } from "../../../ConstraintsTypes";
import { drawingColors } from "../constants";
import { processPoint } from "../konvaHelpers/clone";
import setPointEvents from "./index";

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
    point.destroy();
    editorStore.currentStageLayer.draw();
  }
}

// Расстояние между точками / длина отрезка
function pointsDistance(editorStore, point) {
  if (!editorStore.tmpConstraint) {
    const constraint = new Constraint({
      type: ConstraintsTypes["LENGTH"],
      points: [point],
    });
    editorStore.tmpConstraint = constraint;
    if (point.relatedConstraints[constraint.type]) {
      point.relatedConstraints[constraint.type].push(constraint);
    } else {
      point.relatedConstraints[constraint.type] = [constraint];
    }
  } else {
    const answer = parseFloat(prompt("Введите расстояние:"));
    if (isNaN(answer)) {
      alert("Введено неверное значение расстояния");
      editorStore.tmpConstraint.points[0].relatedConstraints[
        ConstraintsTypes["LENGTH"]
      ].pop();
      editorStore.tmpConstraint = null;
      return;
    }
    editorStore.tmpConstraint.value = answer;
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
function pointsAlignment(editorStore, point) {
  if (!editorStore.tmpConstraint) {
    const constraint = new Constraint({
      type: ConstraintsTypes["COINCIDENT"],
      points: [point],
    });
    editorStore.tmpConstraint = constraint;
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
      });
      point.relatedConstraints["FIX_POINT"] = [fixConstraint];
      point.draggable(false);
      point.fill(drawingColors["DISABLED_ELEMENT_COLOR"]);
      editorStore.currentDataLayer.addConstraint(fixConstraint);
    } else if (point.relatedConstraints["FIX_POINT"]) {
      const fixConstraint = new Constraint({
        type: ConstraintsTypes["FIX_POINT"],
        points: [constraintPoint.relatedPoint],
      });
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
function fixPoint(editorStore, point) {
  if (!(ConstraintsTypes["FIX_POINT"] in point.relatedConstraints)) {
    const constraint = new Constraint({
      type: ConstraintsTypes["FIX_POINT"],
      points: [point.relatedPoint],
    });
    point.relatedConstraints[constraint.type] = [constraint];
    point.draggable(false);
    point.fill(drawingColors["DISABLED_ELEMENT_COLOR"]);
    editorStore.currentDataLayer.addConstraint(constraint);
    editorStore.updateDrawing();
  }
}

// Точка на прямой
function pointOnLine(editorStore, point) {
  if (!editorStore.tmpConstraint) {
    const constraint = new Constraint({
      type: ConstraintsTypes["POINT_ON_LINE"],
      points: [point.relatedPoint],
    });
    editorStore.tmpConstraint = constraint;
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
function pointAndArcAlignment(editorStore, point) {
  if (!editorStore.tmpConstraint) {
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
        mode,
      });
    } else {
      constraint = new Constraint({
        type: ConstraintsTypes["ARC_POINT_COINCIDENT"],
        points: [point.relatedPoint],
      });
    }
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
function fixArcEnd(editorStore, point) {
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
      mode,
    });
    point.relatedConstraints[constraint.type] = [constraint];
    point.draggable(false);
    point.fill(drawingColors["DISABLED_ELEMENT_COLOR"]);
    editorStore.currentDataLayer.addConstraint(constraint);
    editorStore.updateDrawing();
  }
}

// Расстояние между точкой и отрезком
function pointAndLineDistance(editorStore, point) {
  if (!editorStore.tmpConstraint) {
    const constraint = new Constraint({
      type: ConstraintsTypes["DISTANCE_POINT_LINE"],
      points: [point.relatedPoint],
    });
    editorStore.tmpConstraint = constraint;
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
    const answer = parseFloat(prompt("Введите расстояние:"));
    if (isNaN(answer)) {
      alert("Введено неверное значение расстояние");
      editorStore.tmpConstraint = null;
      return;
    }
    editorStore.tmpConstraint.points = [point.relatedPoint];
    editorStore.tmpConstraint.value = answer;
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
function pointParams(editorStore, point) {
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
