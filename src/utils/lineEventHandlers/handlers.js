import { Constraint } from "../../../Constraint";
import { ConstraintsTypes } from "../../../ConstraintsTypes";
import { Line } from "../../../elements/Line";
import { drawingColors } from "../constants";
import {constraintImage, line as konvaLine, text} from "../konvaHelpers/draw";
import setLineEvents from "./index";
import setPointEvents from "../pointEventHandlers";
import arcHandlers from "../arcEventHandlers/handlers";
import pointHandlers from "../pointEventHandlers/handlers";
import { processLine } from "../konvaHelpers/clone";
import {promptDegAngle, promptMMLength} from "../konvaHelpers/utils";

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
  for (const key in line.relatedConstraints) {
    line.relatedConstraints[key].forEach(c => {
      c?._image?.destroy(); // delete constraints images
      c?._text?.destroy(); // delete constraints texts
    });
  }
  startP.destroy();
  endP.destroy();
  line.destroy();

  editorStore.currentStageLayer.draw();
}

// Горизонтальность
async function horizontalLine(editorStore, line) {
  if (!line.relatedConstraints[ConstraintsTypes.HORIZONTAL]?.length) {
    const points = [line.startPoint.relatedPoint, line.endPoint.relatedPoint];
    console.log("Line Handler Horizontal");
    const cX = (line.startPoint.relatedPoint.x + line.endPoint.relatedPoint.x) / 2 - 15;
    const cY = (line.startPoint.relatedPoint.y + line.endPoint.relatedPoint.y) / 2 - 15;
    const constraint = new Constraint({
      type: "HORIZONTAL",
      image: await constraintImage(cX, cY, ConstraintsTypes["HORIZONTAL"]),
      points
    });
    line.relatedConstraints[constraint.type] = [constraint];
    editorStore.currentStageLayer.add(constraint._image);
    editorStore.currentDataLayer.addConstraint(constraint);
    editorStore.updateDrawing();
  }
}

// Расстояние между точками / длина отрезка
async function lineLength(editorStore, line) {
  const [pxLength, mmLength] = promptMMLength("Введите расстояние:");
  if (pxLength === null || pxLength <= 0) {
    alert("Введено неверное значение расстояния");
    editorStore.tmpConstraint.points[0].relatedConstraints["LENGTH"].pop();
    editorStore.tmpConstraint?._image?.destroy();
    editorStore.tmpConstraint = null;
    return;
  }
  const points = [line.startPoint.relatedPoint, line.endPoint.relatedPoint];
  console.log("Line Handler Length");
  const cX = (line.startPoint.relatedPoint.x + line.endPoint.relatedPoint.x) / 2 - 15;
  const cY = (line.startPoint.relatedPoint.y + line.endPoint.relatedPoint.y) / 2 - 15;
  const constraint = new Constraint({
    type: "LENGTH",
    points,
    image: await constraintImage(cX, cY, ConstraintsTypes["LENGTH"]),
    value: pxLength,
  });
  constraint._text = text(cX, cY, String(mmLength));
  editorStore.currentStageLayer.add(constraint._text);
  line.relatedConstraints[constraint.type] = [constraint];
  editorStore.currentStageLayer.add(constraint._image);
  editorStore.currentDataLayer.addConstraint(constraint);
  editorStore.updateDrawing();
}

// Вертикальность
async function verticalLine(editorStore, line) {
  if (!line.relatedConstraints[ConstraintsTypes.VERTICAL]?.length) {
    const points = [line.startPoint.relatedPoint, line.endPoint.relatedPoint];
    console.log("Line Handler Vertical");
    const cX = (line.startPoint.relatedPoint.x + line.endPoint.relatedPoint.x) / 2 - 15;
    const cY = (line.startPoint.relatedPoint.y + line.endPoint.relatedPoint.y) / 2 - 15;
    const constraint = new Constraint({
      type: "VERTICAL",
      image: await constraintImage(cX, cY, ConstraintsTypes["VERTICAL"]),
      points,
    });
    line.relatedConstraints[constraint.type] = [constraint];
    editorStore.currentStageLayer.add(constraint._image);
    editorStore.currentDataLayer.addConstraint(constraint);
    editorStore.updateDrawing();
  }
}

// Параллельность отрезков
async function parallelLine(editorStore, line) {
  if (editorStore?.tmpConstraint?.type !== ConstraintsTypes["PARALLEL"]) {
    const cX = (line.startPoint.relatedPoint.x + line.endPoint.relatedPoint.x) / 2 - 15;
    const cY = (line.startPoint.relatedPoint.y + line.endPoint.relatedPoint.y) / 2 - 15;
    const constraint = new Constraint({
      type: "PARALLEL",
      lines: [[line.startPoint.relatedPoint, line.endPoint.relatedPoint]],
      image: await constraintImage(cX, cY, ConstraintsTypes["PARALLEL"]),
    });
    editorStore.tmpConstraint?._image?.destroy();
    editorStore.tmpConstraint = constraint;
    editorStore.currentStageLayer.add(constraint._image);
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
async function linesAngle(editorStore, line) {
  if (editorStore?.tmpConstraint?.type !== ConstraintsTypes["ANGLE"]) {
    const cX = (line.startPoint.relatedPoint.x + line.endPoint.relatedPoint.x) / 2 - 15;
    const cY = (line.startPoint.relatedPoint.y + line.endPoint.relatedPoint.y) / 2 - 15;
    const constraint = new Constraint({
      type: "ANGLE",
      lines: [[line.startPoint.relatedPoint, line.endPoint.relatedPoint]],
      image: await constraintImage(cX, cY, ConstraintsTypes["ANGLE"]),
    });
    editorStore.tmpConstraint?._image?.destroy();
    editorStore.tmpConstraint = constraint;
    editorStore.currentStageLayer.add(constraint._image);
    if (line.relatedConstraints[constraint.type]) {
      line.relatedConstraints[constraint.type].push(constraint);
    } else {
      line.relatedConstraints[constraint.type] = [constraint];
    }
  } else {
    const answer = promptDegAngle("Введите угол:")[0];
    if (answer === null || answer <= 0) {
      alert("Введено неверное значение угла");
      editorStore.tmpConstraint?._image?.destroy();
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
    const cX = (line.startPoint.relatedPoint.x + line.endPoint.relatedPoint.x) / 2;
    const cY = (line.startPoint.relatedPoint.y + line.endPoint.relatedPoint.y) / 2;
    editorStore.tmpConstraint._text = text(cX, cY, String(answer) + '°');
    editorStore.currentStageLayer.add(editorStore.tmpConstraint._text);
    editorStore.updateDrawing();
    editorStore.tmpConstraint = null;
  }
}

// Перпендикулярность отрезков
async function perpendicularLines(editorStore, line) {
  if (editorStore?.tmpConstraint?.type !== ConstraintsTypes["PERPENDICULAR"]) {
    const cX = (line.startPoint.relatedPoint.x + line.endPoint.relatedPoint.x) / 2 - 15;
    const cY = (line.startPoint.relatedPoint.y + line.endPoint.relatedPoint.y) / 2 - 15;
    const constraint = new Constraint({
      type: "PERPENDICULAR",
      lines: [[line.startPoint.relatedPoint, line.endPoint.relatedPoint]],
      image: await constraintImage(cX, cY, ConstraintsTypes["PERPENDICULAR"]),
    });
    editorStore.tmpConstraint?._image?.destroy();
    editorStore.tmpConstraint = constraint;
    editorStore.currentStageLayer.add(constraint._image);
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
async function pointOnLine(editorStore, line) {
  if (editorStore?.tmpConstraint?.type !== ConstraintsTypes["POINT_ON_LINE"]) {
    const cX = (line.startPoint.relatedPoint.x + line.endPoint.relatedPoint.x) / 2 - 15;
    const cY = (line.startPoint.relatedPoint.y + line.endPoint.relatedPoint.y) / 2 - 15;
    const constraint = new Constraint({
      type: "POINT_ON_LINE",
      lines: [[line.startPoint.relatedPoint, line.endPoint.relatedPoint]],
      image: await constraintImage(cX, cY, ConstraintsTypes["POINT_ON_LINE"]),
    });
    editorStore.tmpConstraint?._image?.destroy();
    editorStore.tmpConstraint = constraint;
    editorStore.currentStageLayer.add(constraint._image);
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
async function arcAndLine(editorStore, line) {
  if (editorStore?.tmpConstraint?.type !== ConstraintsTypes["ARC_TANGENT_ToLine"]) {
    const cX = (line.startPoint.relatedPoint.x + line.endPoint.relatedPoint.x) / 2 - 15;
    const cY = (line.startPoint.relatedPoint.y + line.endPoint.relatedPoint.y) / 2 - 15;
    const constraint = new Constraint({
      type: "ARC_TANGENT_ToLine",
      lines: [[line.startPoint.relatedPoint, line.endPoint.relatedPoint]],
      image: await constraintImage(cX, cY, ConstraintsTypes["ARC_TANGENT_ToLine"]),
    });
    editorStore.tmpConstraint?._image?.destroy();
    editorStore.tmpConstraint = constraint;
    editorStore.currentStageLayer.add(constraint._image);
    if (line.relatedConstraints[constraint.type]) {
      line.relatedConstraints[constraint.type].push(constraint);
    } else {
      line.relatedConstraints[constraint.type] = [constraint];
    }
  } else {
    if (editorStore.tmpConstraint.lines) {
      editorStore.tmpConstraint?._image?.destroy();
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
async function equalLines(editorStore, line) {
  if (editorStore?.tmpConstraint?.type !== ConstraintsTypes["EQUAL_LINES"]) {
    const cX = (line.startPoint.relatedPoint.x + line.endPoint.relatedPoint.x) / 2 - 15;
    const cY = (line.startPoint.relatedPoint.y + line.endPoint.relatedPoint.y) / 2 - 15;
    const constraint = new Constraint({
      type: "EQUAL_LINES",
      lines: [[line.startPoint.relatedPoint, line.endPoint.relatedPoint]],
      image: await constraintImage(cX, cY, ConstraintsTypes["EQUAL_LINES"]),
    });
    editorStore.tmpConstraint?._image?.destroy();
    editorStore.tmpConstraint = constraint;
    editorStore.currentStageLayer.add(constraint._image);
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
async function pointAndLineDist(editorStore, line) {
  if (editorStore?.tmpConstraint?.type !== ConstraintsTypes["DISTANCE_POINT_LINE"]) {
    const cX = (line.startPoint.relatedPoint.x + line.endPoint.relatedPoint.x) / 2 - 15;
    const cY = (line.startPoint.relatedPoint.y + line.endPoint.relatedPoint.y) / 2 - 15;
    const constraint = new Constraint({
      type: "DISTANCE_POINT_LINE",
      lines: [[line.startPoint.relatedPoint, line.endPoint.relatedPoint]],
      image: await constraintImage(cX, cY, ConstraintsTypes["DISTANCE_POINT_LINE"]),
    });
    editorStore.tmpConstraint?._image?.destroy();
    editorStore.tmpConstraint = constraint;
    editorStore.currentStageLayer.add(constraint._image);
    if (line.relatedConstraints[constraint.type]) {
      line.relatedConstraints[constraint.type].push(constraint);
    } else {
      line.relatedConstraints[constraint.type] = [constraint];
    }
  } else {
    if (editorStore.tmpConstraint.lines) {
      editorStore.tmpConstraint?._image?.destroy();
      editorStore.tmpConstraint = null;
      return;
    }
    const [pxLength, mmLength] = promptMMLength("Введите расстояние:");
    if (pxLength === null || pxLength <= 0) {
      alert("Введено неверное значение расстояние");
      editorStore.tmpConstraint?._image?.destroy();
      editorStore.tmpConstraint = null;
      return;
    }
    editorStore.tmpConstraint.lines = [
      [line.startPoint.relatedPoint, line.endPoint.relatedPoint],
    ];
    editorStore.tmpConstraint.value = pxLength;
    const cX = (line.startPoint.relatedPoint.x + line.endPoint.relatedPoint.x) / 2 - 15;
    const cY = (line.startPoint.relatedPoint.y + line.endPoint.relatedPoint.y) / 2 - 15;
    editorStore.tmpConstraint._text = text(cX, cY, String(mmLength));
    editorStore.currentStageLayer.add(editorStore.tmpConstraint._text);
    editorStore.currentDataLayer.addConstraint(editorStore.tmpConstraint);
    if (line.relatedConstraints[editorStore.tmpConstraint.type]) {
      line.relatedConstraints[editorStore.tmpConstraint.type].push(
        editorStore.tmpConstraint,
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
async function arcRadiusLinePerp(editorStore, line) {
  if (line.relatedArc == null) {
    if (editorStore?.tmpConstraint?.type !== ConstraintsTypes["ARC_LINE_PERPENDICULAR"]) {
      const cX = (line.startPoint.relatedPoint.x + line.endPoint.relatedPoint.x) / 2 - 15;
      const cY = (line.startPoint.relatedPoint.y + line.endPoint.relatedPoint.y) / 2 - 15;
      const constraint = new Constraint({
        type: ConstraintsTypes.ARC_LINE_PERPENDICULAR,
        lines: [[line.startPoint.relatedPoint, line.endPoint.relatedPoint]],
        image: await constraintImage(cX, cY, ConstraintsTypes["ARC_LINE_PERPENDICULAR"]),
      });
      editorStore.tmpConstraint?._image?.destroy();
      editorStore.tmpConstraint = constraint;
      editorStore.currentStageLayer.add(constraint._image);
      if (line.relatedConstraints[constraint.type]) {
        line.relatedConstraints[constraint.type].push(constraint);
      } else {
        line.relatedConstraints[constraint.type] = [constraint];
      }
    } else {
      if (editorStore.tmpConstraint.lines) {
        editorStore.tmpConstraint?._image?.destroy();
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
    if (editorStore?.tmpConstraint?.type !== ConstraintsTypes["ARC_LINE_PERPENDICULAR"]) {
      const cX = (line.startPoint.relatedPoint.x + line.endPoint.relatedPoint.x) / 2 - 15;
      const cY = (line.startPoint.relatedPoint.y + line.endPoint.relatedPoint.y) / 2 - 15;
      const constraint = new Constraint({
        type: ConstraintsTypes.ARC_LINE_PERPENDICULAR,
        elements: [relatedArc],
        mode,
        image: await constraintImage(cX, cY, ConstraintsTypes["ARC_LINE_PERPENDICULAR"]),
      });
      editorStore.tmpConstraint?._image?.destroy();
      editorStore.tmpConstraint = constraint;
      editorStore.currentStageLayer.add(constraint._image);
      if (relatedDrawingArc.relatedConstraints[constraint.type]) {
        relatedDrawingArc.relatedConstraints[constraint.type].push(constraint);
      } else {
        relatedDrawingArc.relatedConstraints[constraint.type] = [constraint];
      }
    } else {
      if (editorStore.tmpConstraint.elements) {
        editorStore.tmpConstraint?._image?.destroy();
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
async function polylineLength(editorStore, line) {
  if (editorStore?.tmpConstraint?.type !== ConstraintsTypes["LENGTH_TOTAL"]) {
    const newLine = new Line(
      line.startPoint.relatedPoint,
      line.endPoint.relatedPoint
    );
    const cX = (line.startPoint.relatedPoint.x + line.endPoint.relatedPoint.x) / 2 - 15;
    const cY = (line.startPoint.relatedPoint.y + line.endPoint.relatedPoint.y) / 2 - 15;
    const constraint = new Constraint({
      type: ConstraintsTypes.LENGTH_TOTAL,
      elements: [newLine],
      image: await constraintImage(cX, cY, ConstraintsTypes["LENGTH_TOTAL"]),
    });
    editorStore.tmpConstraint?._image?.destroy();
    editorStore.tmpConstraint = constraint;
    editorStore.currentStageLayer.add(constraint._image);
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
  if (editorStore?.tmpConstraint?.type !== ConstraintsTypes["COINCIDENT"]) {
    editorStore.tmpConstraint?._image?.destroy();
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
    editorStore.tmpConstraint?._image?.destroy();
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
    editorStore.tmpConstraint?._image?.destroy();
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
  if (status === "OK" || status === null) {
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
  poinAndLineDist: pointAndLineDist,
  arcRadiusLinePerp,
  polylineLength,
  lineInfo,
  lineConstraints,
  collapse,
  projectLine,
};
