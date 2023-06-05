import { Constraint } from "../../../Constraint";
import { ConstraintsTypes } from "../../../ConstraintsTypes";
import { Line } from "../../../elements/Line";
import { drawingColors } from "../constants";
import { line as konvaLine } from "../konvaHelpers/draw";
import setLineEvents from "./index";
import setPointEvents from "../pointEventHandlers";
import arcHandlers from "../arcEventHandlers/handlers";
import pointHandlers from "../pointEventHandlers/handlers";
import { processLine } from "../konvaHelpers/clone";

// Удаление
function deleteLine(editorStore, line) {
  const startP = line.startPoint;
  const endP = line.endPoint;
  const sPId = startP.relatedId;
  const ePId = endP.relatedId;

  editorStore.currentDataLayer.removePoint(sPId);
  editorStore.currentDataLayer.removePoint(ePId);
  if (line.relatedLine) {
    editorStore.currentDataLayer.removeElement(line.relatedLine.id);
  }

  let pointIndex = editorStore.currentDrawingPoints.findIndex(
    (el) => el.relatedId == sPId
  );
  editorStore.currentDrawingPoints.splice(pointIndex, 1);
  pointIndex = editorStore.currentDrawingPoints.findIndex(
    (el) => el.relatedId == ePId
  );
  editorStore.currentDrawingPoints.splice(pointIndex, 1);

  startP.destroy();
  endP.destroy();
  line.destroy();

  editorStore.currentStageLayer.draw();
}

// Горизонтальность
function horizontalLine(editorStore, line) {
  if (!line.relatedConstraints[ConstraintsTypes.HORIZONTAL]?.length) {
    const points = [line.startPoint.relatedPoint, line.endPoint.relatedPoint];
    console.log("Line Handler Horizontal");
    const constraint = new Constraint({ type: "HORIZONTAL", points });
    line.relatedConstraints[constraint.type] = [constraint];
    editorStore.currentDataLayer.addConstraint(constraint);
    editorStore.updateDrawing();
  }
}

// Расстояние между точками / длина отрезка
function lineLength(editorStore, line) {
  const answer = parseFloat(prompt("Введите расстояние:"));
  if (isNaN(answer)) {
    alert("Введено неверное значение расстояния");
    editorStore.tmpConstraint.points[0].relatedConstraints["LENGTH"].pop();
    editorStore.tmpConstraint = null;
    return;
  }
  const points = [line.startPoint.relatedPoint, line.endPoint.relatedPoint];
  console.log("Line Handler Length");
  const constraint = new Constraint({ type: "LENGTH", points, value: answer });
  line.relatedConstraints[constraint.type] = [constraint];
  editorStore.currentDataLayer.addConstraint(constraint);
  editorStore.updateDrawing();
}

// Вертикальность
function verticalLine(editorStore, line) {
  if (!line.relatedConstraints[ConstraintsTypes.VERTICAL]?.length) {
    const points = [line.startPoint.relatedPoint, line.endPoint.relatedPoint];
    console.log("Line Handler Vertical");
    const constraint = new Constraint({ type: "VERTICAL", points });
    line.relatedConstraints[constraint.type] = [constraint];
    editorStore.currentDataLayer.addConstraint(constraint);
    editorStore.updateDrawing();
  }
}

// Параллельность отрезков
function parallelLine(editorStore, line) {
  if (!editorStore.tmpConstraint) {
    const constraint = new Constraint({
      type: "PARALLEL",
      lines: [[line.startPoint.relatedPoint, line.endPoint.relatedPoint]],
    });
    editorStore.tmpConstraint = constraint;
    if (line.relatedConstraints[constraint.type]) {
      line.relatedConstraints[constraint.type].push(constraint);
    } else {
      line.relatedConstraints[constraint.type] = [constraint];
    }
  } else {
    editorStore.tmpConstraint.lines.push([
      line.startPoint.relatedPoint,
      line.endPoint.relatedPoint,
    ]);
    editorStore.currentDataLayer.addConstraint(editorStore.tmpConstraint);
    if (line.relatedConstraints[editorStore.tmpConstraint.type]) {
      line.relatedConstraints[editorStore.tmpConstraint.type].push(
        editorStore.tmpConstraint
      );
    } else {
      line.relatedConstraints[editorStore.tmpConstraint.type] = [
        editorStore.tmpConstraint,
      ];
    }
    editorStore.updateDrawing();
    editorStore.tmpConstraint = null;
  }
}

// Угол между отрезками
function linesAngle(editorStore, line) {
  if (!editorStore.tmpConstraint) {
    const constraint = new Constraint({
      type: "ANGLE",
      lines: [[line.startPoint.relatedPoint, line.endPoint.relatedPoint]],
    });
    editorStore.tmpConstraint = constraint;
    if (line.relatedConstraints[constraint.type]) {
      line.relatedConstraints[constraint.type].push(constraint);
    } else {
      line.relatedConstraints[constraint.type] = [constraint];
    }
  } else {
    const answer = parseFloat(prompt("Введите угол:"));
    if (isNaN(answer)) {
      alert("Введено неверное значение угла");
      editorStore.tmpConstraint = null;
      return;
    }
    editorStore.tmpConstraint.lines.push([
      line.startPoint.relatedPoint,
      line.endPoint.relatedPoint,
    ]);
    editorStore.tmpConstraint.value = { val: answer, mode: "DEG" };
    editorStore.currentDataLayer.addConstraint(editorStore.tmpConstraint);
    if (line.relatedConstraints[editorStore.tmpConstraint.type]) {
      line.relatedConstraints[editorStore.tmpConstraint.type].push(
        editorStore.tmpConstraint
      );
    } else {
      line.relatedConstraints[editorStore.tmpConstraint.type] = [
        editorStore.tmpConstraint,
      ];
    }
    editorStore.updateDrawing();
    editorStore.tmpConstraint = null;
  }
}

// Перпендикулярность отрезков
function perpendicularLines(editorStore, line) {
  if (!editorStore.tmpConstraint) {
    const constraint = new Constraint({
      type: "PERPENDICULAR",
      lines: [[line.startPoint.relatedPoint, line.endPoint.relatedPoint]],
    });
    editorStore.tmpConstraint = constraint;
    if (line.relatedConstraints[constraint.type]) {
      line.relatedConstraints[constraint.type].push(constraint);
    } else {
      line.relatedConstraints[constraint.type] = [constraint];
    }
  } else {
    editorStore.tmpConstraint.lines.push([
      line.startPoint.relatedPoint,
      line.endPoint.relatedPoint,
    ]);
    editorStore.currentDataLayer.addConstraint(editorStore.tmpConstraint);
    if (line.relatedConstraints[editorStore.tmpConstraint.type]) {
      line.relatedConstraints[editorStore.tmpConstraint.type].push(
        editorStore.tmpConstraint
      );
    } else {
      line.relatedConstraints[editorStore.tmpConstraint.type] = [
        editorStore.tmpConstraint,
      ];
    }
    editorStore.updateDrawing();
    editorStore.tmpConstraint = null;
  }
}

// Точка на прямой
function pointOnLine(editorStore, line) {
  if (!editorStore.tmpConstraint) {
    const constraint = new Constraint({
      type: "POINT_ON_LINE",
      lines: [[line.startPoint.relatedPoint, line.endPoint.relatedPoint]],
    });
    editorStore.tmpConstraint = constraint;
    if (line.relatedConstraints[constraint.type]) {
      line.relatedConstraints[constraint.type].push(constraint);
    } else {
      line.relatedConstraints[constraint.type] = [constraint];
    }
  } else {
    editorStore.tmpConstraint.lines = [
      [line.startPoint.relatedPoint, line.endPoint.relatedPoint],
    ];
    editorStore.currentDataLayer.addConstraint(editorStore.tmpConstraint);
    if (line.relatedConstraints[editorStore.tmpConstraint.type]) {
      line.relatedConstraints[editorStore.tmpConstraint.type].push(
        editorStore.tmpConstraint
      );
    } else {
      line.relatedConstraints[editorStore.tmpConstraint.type] = [
        editorStore.tmpConstraint,
      ];
    }
    editorStore.updateDrawing();
    editorStore.tmpConstraint = null;
  }
}

// Касание дуги и отрезка
function arcAndLine(editorStore, line) {
  if (!editorStore.tmpConstraint) {
    const constraint = new Constraint({
      type: "ARC_TANGENT_ToLine",
      lines: [[line.startPoint.relatedPoint, line.endPoint.relatedPoint]],
    });
    editorStore.tmpConstraint = constraint;
    if (line.relatedConstraints[constraint.type]) {
      line.relatedConstraints[constraint.type].push(constraint);
    } else {
      line.relatedConstraints[constraint.type] = [constraint];
    }
  } else {
    if (editorStore.tmpConstraint.lines) {
      editorStore.tmpConstraint = null;
      return;
    }
    editorStore.tmpConstraint.lines = [
      [line.startPoint.relatedPoint, line.endPoint.relatedPoint],
    ];
    editorStore.currentDataLayer.addConstraint(editorStore.tmpConstraint);
    if (line.relatedConstraints[editorStore.tmpConstraint.type]) {
      line.relatedConstraints[editorStore.tmpConstraint.type].push(
        editorStore.tmpConstraint
      );
    } else {
      line.relatedConstraints[editorStore.tmpConstraint.type] = [
        editorStore.tmpConstraint,
      ];
    }
    editorStore.updateDrawing();
    editorStore.tmpConstraint = null;
  }
}

// Равная длина отрезков
function equalLines(editorStore, line) {
  if (!editorStore.tmpConstraint) {
    const constraint = new Constraint({
      type: "EQUAL_LINES",
      lines: [[line.startPoint.relatedPoint, line.endPoint.relatedPoint]],
    });
    editorStore.tmpConstraint = constraint;
    if (line.relatedConstraints[constraint.type]) {
      line.relatedConstraints[constraint.type].push(constraint);
    } else {
      line.relatedConstraints[constraint.type] = [constraint];
    }
  } else {
    editorStore.tmpConstraint.lines.push([
      line.startPoint.relatedPoint,
      line.endPoint.relatedPoint,
    ]);
    editorStore.currentDataLayer.addConstraint(editorStore.tmpConstraint);
    if (line.relatedConstraints[editorStore.tmpConstraint.type]) {
      line.relatedConstraints[editorStore.tmpConstraint.type].push(
        editorStore.tmpConstraint
      );
    } else {
      line.relatedConstraints[editorStore.tmpConstraint.type] = [
        editorStore.tmpConstraint,
      ];
    }
    editorStore.updateDrawing();
    editorStore.tmpConstraint = null;
  }
}

// Расстояние между точкой и отрезком
function poinAndLineDist(editorStore, line) {
  if (!editorStore.tmpConstraint) {
    const constraint = new Constraint({
      type: "DISTANCE_POINT_LINE",
      lines: [[line.startPoint.relatedPoint, line.endPoint.relatedPoint]],
    });
    editorStore.tmpConstraint = constraint;
    if (line.relatedConstraints[constraint.type]) {
      line.relatedConstraints[constraint.type].push(constraint);
    } else {
      line.relatedConstraints[constraint.type] = [constraint];
    }
  } else {
    if (editorStore.tmpConstraint.lines) {
      editorStore.tmpConstraint = null;
      return;
    }
    const answer = parseFloat(prompt("Введите расстояние:"));
    if (isNaN(answer)) {
      alert("Введено неверное значение расстояние");
      editorStore.tmpConstraint = null;
      return;
    }
    editorStore.tmpConstraint.lines = [
      [line.startPoint.relatedPoint, line.endPoint.relatedPoint],
    ];
    editorStore.tmpConstraint.value = answer;
    editorStore.currentDataLayer.addConstraint(editorStore.tmpConstraint);
    if (line.relatedConstraints[editorStore.tmpConstraint.type]) {
      line.relatedConstraints[editorStore.tmpConstraint.type].push(
        editorStore.tmpConstraint
      );
    } else {
      line.relatedConstraints[editorStore.tmpConstraint.type] = [
        editorStore.tmpConstraint,
      ];
    }
    editorStore.updateDrawing();
    editorStore.tmpConstraint = null;
  }
}

// Перпендикулярность отрезка к радиусу дуги
function arcRadiusLinePerp(editorStore, line) {
  if (line.relatedArc == null) {
    if (!editorStore.tmpConstraint) {
      const constraint = new Constraint({
        type: ConstraintsTypes.ARC_LINE_PERPENDICULAR,
        lines: [[line.startPoint.relatedPoint, line.endPoint.relatedPoint]],
      });
      editorStore.tmpConstraint = constraint;
      if (line.relatedConstraints[constraint.type]) {
        line.relatedConstraints[constraint.type].push(constraint);
      } else {
        line.relatedConstraints[constraint.type] = [constraint];
      }
    } else {
      if (editorStore.tmpConstraint.lines) {
        editorStore.tmpConstraint = null;
        return;
      }
      editorStore.tmpConstraint.lines = [
        [line.startPoint.relatedPoint, line.endPoint.relatedPoint],
      ];
      editorStore.currentDataLayer.addConstraint(editorStore.tmpConstraint);
      if (line.relatedConstraints[editorStore.tmpConstraint.type]) {
        line.relatedConstraints[editorStore.tmpConstraint.type].push(
          editorStore.tmpConstraint
        );
      } else {
        line.relatedConstraints[editorStore.tmpConstraint.type] = [
          editorStore.tmpConstraint,
        ];
      }
      editorStore.updateDrawing();
      editorStore.tmpConstraint = null;
    }
  } else {
    const relatedArc = line.relatedArc.relatedArc;
    const relatedDrawingArc = line.relatedArc;
    let mode = 0;
    if (line.isArcStart) {
      mode = 1;
    } else if (line.isArcEnd) {
      mode = 2;
    } else {
      return;
    }
    if (!editorStore.tmpConstraint) {
      const constraint = new Constraint({
        type: ConstraintsTypes.ARC_LINE_PERPENDICULAR,
        elements: [relatedArc],
        mode,
      });
      editorStore.tmpConstraint = constraint;
      if (relatedDrawingArc.relatedConstraints[constraint.type]) {
        relatedDrawingArc.relatedConstraints[constraint.type].push(constraint);
      } else {
        relatedDrawingArc.relatedConstraints[constraint.type] = [constraint];
      }
    } else {
      if (editorStore.tmpConstraint.elements) {
        editorStore.tmpConstraint = null;
        return;
      }
      editorStore.tmpConstraint.elements = [relatedArc];
      editorStore.tmpConstraint.mode = mode;
      editorStore.currentDataLayer.addConstraint(editorStore.tmpConstraint);
      if (
        relatedDrawingArc.relatedConstraints[editorStore.tmpConstraint.type]
      ) {
        relatedDrawingArc.relatedConstraints[
          editorStore.tmpConstraint.type
        ].push(editorStore.tmpConstraint);
      } else {
        relatedDrawingArc.relatedConstraints[editorStore.tmpConstraint.type] = [
          editorStore.tmpConstraint,
        ];
      }
      editorStore.updateDrawing();
      editorStore.tmpConstraint = null;
    }
  }
}

// Длина полилинии (отрезки/дуги)
function polylineLength(editorStore, line) {
  if (!editorStore.tmpConstraint) {
    const newLine = new Line(
      line.startPoint.relatedPoint,
      line.endPoint.relatedPoint
    );
    const constraint = new Constraint({
      type: ConstraintsTypes.LENGTH_TOTAL,
      elements: [newLine],
    });
    editorStore.tmpConstraint = constraint;
    line.relatedLine = newLine;
    if (line.relatedConstraints[constraint.type]) {
      line.relatedConstraints[constraint.type].push(constraint);
    } else {
      line.relatedConstraints[constraint.type] = [constraint];
    }
  } else {
    const newLine = new Line(
      line.startPoint.relatedPoint,
      line.endPoint.relatedPoint
    );
    editorStore.tmpConstraint.elements.push(newLine);
    line.relatedLine = newLine;
    if (line.relatedConstraints[editorStore.tmpConstraint.type]) {
      line.relatedConstraints[editorStore.tmpConstraint.type].push(
        editorStore.tmpConstraint
      );
    } else {
      line.relatedConstraints[editorStore.tmpConstraint.type] = [
        editorStore.tmpConstraint,
      ];
    }
  }
  editorStore.selectedElementList.lines.push(line);
  line.stroke(drawingColors.SELECTED_ELEMENT_COLOR);
  editorStore.currentStageLayer.draw();
}

// Вывод параметров объекта (выберите точку/отрезок/дугу)
function lineInfo(editorStore, line) {
  const startP = line.startPoint;
  const endP = line.endPoint;
  const sPId = startP.relatedId;
  const ePId = endP.relatedId;

  const distance = this.dataLayer.getPointsDistance(sPId, ePId);
  const message = "Length is " + distance.toFixed(2);
  alert(message);
}

function lineConstraints(editorStore, line) {
  editorStore.generateConstraintsMap();
  editorStore.selectedObjectForConstraints = line;

  let lineInfo = [];
  const startP = line.startPoint;
  const endP = line.endPoint;
  const sPId = startP.relatedId;
  const ePId = endP.relatedId;
  const distance = editorStore.currentDataLayer.getPointsDistance(sPId, ePId);
  lineInfo.push({ key: "Длина", value: distance.toFixed(2) });
  editorStore.selectedObjectInfo = lineInfo;
}

function collapse(editorStore, line) {
  if (!editorStore.tmpConstraint) {
    editorStore.tmpConstraint = line;
    return;
  }

  const line1 = editorStore.tmpConstraint;
  const l1Sp = line1.startPoint;
  const l1Ep = line1.endPoint;
  const lSp = line.startPoint;
  const lEp = line.endPoint;

  if (
    (!l1Sp.relatedConstraints[ConstraintsTypes.COINCIDENT] &&
      !l1Ep.relatedConstraints[ConstraintsTypes.COINCIDENT]) ||
    (!lSp.relatedConstraints[ConstraintsTypes.COINCIDENT] &&
      !lEp.relatedConstraints[ConstraintsTypes.COINCIDENT])
  ) {
    console.log("lines not coincident");
    editorStore.tmpConstraint = null;
    return;
  }

  // все дуги на эскизе
  let drawingArcs = editorStore.currentDrawingPoints.reduce((acc, el) => {
    if (el.relatedArc) {
      acc.add(el.relatedArc);
    }
    return acc;
  }, new Set());
  drawingArcs = [...drawingArcs];

  const linesPoints = [l1Sp, l1Ep, lSp, lEp];
  let selectedArc = null;
  let pointsMatchSelected;

  for (let arc of drawingArcs) {
    const arcSp = arc.startPoint;
    const arcEp = arc.endPoint;
    if (
      !arcSp.relatedConstraints[ConstraintsTypes.COINCIDENT] ||
      !arcEp.relatedConstraints[ConstraintsTypes.COINCIDENT]
    ) {
      continue;
    }

    const pointsMatch = [arcSp, arcEp].map((arcPoint) => {
      return arcPoint.relatedConstraints[ConstraintsTypes.COINCIDENT].reduce(
        (acc, arcConstraint) => {
          const match = linesPoints.find((el) => {
            if (!el.relatedConstraints[ConstraintsTypes.COINCIDENT])
              return false;
            return !!el.relatedConstraints[ConstraintsTypes.COINCIDENT].find(
              (el) => el.id === arcConstraint.id
            );
          });
          if (match) {
            acc = match;
          }
          return acc;
        },
        null
      );
    });
    if (pointsMatch[0] !== null && pointsMatch[1] !== null) {
      selectedArc = arc;
      pointsMatchSelected = pointsMatch;
    }
  }

  if (!selectedArc) {
    console.log("arc not selected");
    editorStore.tmpConstraint = null;
    return;
  }
  console.log("selectedArc", selectedArc);

  editorStore.generateConstraintsMap();
  // remove arc
  const arcSp = selectedArc.startPoint;
  const arcEp = selectedArc.endPoint;
  const arcCp = selectedArc.centerPoint;
  [selectedArc, arcSp, arcEp, arcCp].forEach((el) => {
    const elConstraints = editorStore.getObjectConstraints(el);
    elConstraints.forEach((el) => {
      if (el.type !== ConstraintsTypes.LENGTH_TOTAL) {
        editorStore.deleteConstraint(el);
      } else {
      }
    });
  });

  // удаляем все ограничения с точек линий, которыйе были соединены с дугой, а также сами точки
  pointsMatchSelected.forEach((el) => {
    const elConstraints = editorStore.getObjectConstraints(el);
    elConstraints.forEach((el) => editorStore.deleteConstraint(el));
    delete el.relatedLine;
    pointHandlers.deletePoint(editorStore, el);
  });

  // удаляем все ограничения с линий, кроме длины и касания к дугам
  [line, line1].forEach((el) => {
    const elConstraints = editorStore.getObjectConstraints(el);
    elConstraints.forEach((el) => {
      if (
        el.type !== ConstraintsTypes.ARC_LINE_PERPENDICULAR &&
        el.type !== ConstraintsTypes.LENGTH_TOTAL
      ) {
        editorStore.deleteConstraint(el);
      }
    });
  });

  // new line
  const pointsMatchIds = pointsMatchSelected.map((el) => el._id);
  const linesOuterPoints = linesPoints.filter(
    (el) => !pointsMatchIds.includes(el._id)
  );
  linesOuterPoints.forEach((el) => {
    const elConstraints = editorStore.getObjectConstraints(el);
    elConstraints.forEach((el) => {
      if (el.type !== ConstraintsTypes.COINCIDENT) {
        editorStore.deleteConstraint(el);
      }
    });
  });

  const newLinePoints = linesOuterPoints.reduce((acc, el) => {
    acc.push(el.relatedPoint.x, el.relatedPoint.y);
    return acc;
  }, []);
  const newLine = konvaLine(newLinePoints);
  setLineEvents(editorStore, newLine);
  newLine.startPoint = linesOuterPoints[0];
  newLine.endPoint = linesOuterPoints[1];
  newLine.relatedConstraints = {};

  // total length constraints
  editorStore.generateConstraintsMap();
  editorStore.constraintsMap.forEach((drawingObjects, constraint) => {
    if (constraint.type !== ConstraintsTypes.LENGTH_TOTAL) {
      return;
    }
    let lineIncluded = false;
    if (drawingObjects.includes(selectedArc)) {
      constraint.elements = constraint.elements.filter(
        (el) => el.id !== selectedArc.relatedArc.id
      );
      lineIncluded = true;
      console.log("include arc");
    }
    if (drawingObjects.includes(line)) {
      constraint.elements = constraint.elements.filter(
        (el) => el.id !== line.relatedLine.id
      );
      editorStore.currentDataLayer.removeElement(line.relatedLine.id);
      lineIncluded = true;
      console.log("include line");
    }
    if (drawingObjects.includes(line1)) {
      constraint.elements = constraint.elements.filter(
        (el) => el.id !== line1.relatedLine.id
      );
      editorStore.currentDataLayer.removeElement(line1.relatedLine.id);
      lineIncluded = true;
      console.log("include line1");
    }
    if (lineIncluded) {
      const newRelatedLine = new Line(
        newLine.startPoint.relatedPoint,
        newLine.endPoint.relatedPoint
      );
      newLine.relatedLine = newRelatedLine;
      if (newLine.relatedConstraints[ConstraintsTypes.LENGTH_TOTAL]) {
        newLine.relatedConstraints[ConstraintsTypes.LENGTH_TOTAL].push(constraint);
      } else {
        newLine.relatedConstraints[ConstraintsTypes.LENGTH_TOTAL] = [constraint];
      }
      constraint.elements.push(newRelatedLine);
    }
  });

  [line, line1].forEach((lineObject) => {
    if (
      lineObject.relatedConstraints[ConstraintsTypes.ARC_LINE_PERPENDICULAR]
    ) {
      for (let perpConstraint of lineObject.relatedConstraints[
        ConstraintsTypes.ARC_LINE_PERPENDICULAR
      ]) {
        perpConstraint.lines = [linesOuterPoints.map((el) => el.relatedPoint)];
        if (
          newLine.relatedConstraints[ConstraintsTypes.ARC_LINE_PERPENDICULAR]
        ) {
          newLine.relatedConstraints[
            ConstraintsTypes.ARC_LINE_PERPENDICULAR
          ].push(perpConstraint);
        } else {
          newLine.relatedConstraints[ConstraintsTypes.ARC_LINE_PERPENDICULAR] =
            [perpConstraint];
        }
      }
    }
  });
  line.destroy();
  line1.destroy();
  linesOuterPoints[0].relatedLine = newLine;
  linesOuterPoints[1].relatedLine = newLine;
  editorStore.currentStageLayer.add(newLine);
  editorStore.tmpConstraint = null;

  arcHandlers.deleteArc(editorStore, selectedArc);
  // pointsMatchSelected.forEach((el) => {
  //   pointHandlers.deletePoint(editorStore, el);
  // });

  let { status } = editorStore.currentDataLayer.resolve();
  if (status == "OK") {
    editorStore.updateDrawing();
  }
}

// проекция линии
function projectLine(editorStore, line) {
  const {
    line: newLine,
    startPoint,
    endPoint,
  } = processLine(editorStore, line, true);

  newLine.off("click dragmove mouseenter mouseleave");
  setLineEvents(editorStore, newLine, ["click"]);
  newLine.draggable(false);
  newLine.stroke(drawingColors.PROJECTION_ELEMENT_COLOR);

  startPoint.newPoint.off("click dragmove mouseenter mouseleave");
  setPointEvents(editorStore, startPoint.newPoint, ["click"]);
  startPoint.newPoint.draggable(false);
  startPoint.newPoint.fill(drawingColors.PROJECTION_ELEMENT_COLOR);

  endPoint.newPoint.off("click dragmove mouseenter mouseleave");
  setPointEvents(editorStore, endPoint.newPoint, ["click"]);
  endPoint.newPoint.draggable(false);
  endPoint.newPoint.fill(drawingColors.PROJECTION_ELEMENT_COLOR);

  const layerToProject = editorStore.tmpLayerIndex;
  [startPoint, endPoint].forEach((p) => {

    editorStore.dataLayers[layerToProject].addPoint(p.newRelatedPoint);
    p.constraints.forEach((constraint) =>
      editorStore.dataLayers[layerToProject].addConstraint(constraint)
    );
  });
  editorStore.stageLayers[layerToProject].add(newLine, startPoint.newPoint, endPoint.newPoint);

  if (editorStore.projectionsMap.has(line)) {
    const currentProjections = editorStore.projectionsMap.get(line);
    editorStore.projectionsMap.set(line, [...currentProjections, newLine]);
  } else {
    editorStore.projectionsMap.set(line, [newLine]);
  }

  // editorStore.tmpLayerIndex = null;
}

export default {
  deleteLine,
  horizontalLine,
  lineLength,
  verticalLine,
  parallelLine,
  linesAngle,
  perpendicularLines,
  pointOnLine,
  arcAndLine,
  equalLines,
  poinAndLineDist,
  arcRadiusLinePerp,
  polylineLength,
  lineInfo,
  lineConstraints,
  collapse,
  projectLine,
};
