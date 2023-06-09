import handlers from "./handlers";
import { drawingColors } from "../constants";

export default function setContainerEvents(editorStore, container) {
  container.addEventListener("mousemove", (event) => {
    const pointerX = event.clientX;
    const pointerY = event.clientY;

    if (editorStore.endOfLine) {
      const endPoint =
        editorStore.currentDrawingPoints[
          editorStore.currentDrawingPoints.length - 1
        ];
      endPoint.x(pointerX);
      endPoint.y(pointerY);
      const linePoints = endPoint.relatedLine.points();
      linePoints[2] = pointerX;
      linePoints[3] = pointerY;
      endPoint.relatedLine.points(linePoints);
      editorStore.currentStageLayer.draw();
    } else if (editorStore.arcDrawingStage == 1) {
      const radiusPoint =
        editorStore.currentDrawingPoints[
          editorStore.currentDrawingPoints.length - 1
        ];
      radiusPoint.x(pointerX);
      radiusPoint.y(pointerY);
      radiusPoint.relatedPoint.x = radiusPoint.x();
      radiusPoint.relatedPoint.y = radiusPoint.y();
      editorStore.currentStageLayer.draw();
    } else if (editorStore.arcDrawingStage == 2) {
      const endPoint =
        editorStore.currentDrawingPoints[
          editorStore.currentDrawingPoints.length - 1
        ];
      const centerPoint =
        editorStore.currentDrawingPoints[
          editorStore.currentDrawingPoints.length - 3
        ];
      const arcRadius = endPoint.relatedArc.innerRadius();
      const deltaX = pointerX - centerPoint.x();
      const deltaY = pointerY - centerPoint.y();
      let startAngleRad = Math.atan(deltaY / deltaX);
      let startAngleDeg = startAngleRad * (180 / Math.PI);
      if ((deltaX < 0 && deltaY >= 0) || (deltaX < 0 && deltaY < 0)) {
        startAngleDeg += 180;
        startAngleRad += Math.PI;
      }
      const newYPos = Math.sin(startAngleRad) * arcRadius + centerPoint.y();
      const newXPos = Math.cos(startAngleRad) * arcRadius + centerPoint.x();
      endPoint.x(newXPos);
      endPoint.y(newYPos);
      endPoint.relatedPoint.x = endPoint.x();
      endPoint.relatedPoint.y = endPoint.y();
      endPoint.relatedArc.angle(startAngleDeg - endPoint.relatedArc.rotation());
      editorStore.currentStageLayer.draw();
    }
  });

  // key event for LENGTH_TOTAL constraint
  container.addEventListener("keydown", (event) => {
    if (event.keyCode === 13) {
      console.log("enter pressed");
      const answer = prompt("Введите длину:");
      const length = parseFloat(answer);
      if (isNaN(length) || length <= 0) {
        alert("Введено неверное значение длины:" + answer);
        return;
      }
      editorStore.tmpConstraint.value = length;
      editorStore.currentDataLayer.addConstraint(editorStore.tmpConstraint);
      for (const line of editorStore.selectedElementList.lines) {
        line.stroke(drawingColors.DEFAULT_ELEMENT_COLOR);
      }
      editorStore.selectedElementList.lines = [];
      for (const arc of editorStore.selectedElementList.arcs) {
        arc.fill(drawingColors.DEFAULT_ELEMENT_COLOR);
      }
      editorStore.selectedElementList.arcs = [];
      editorStore.updateDrawing();
      editorStore.tmpConstraint = null;
    }
  });

  container.addEventListener("click", (event) => {
    const pointerX = event.clientX;
    const pointerY = event.clientY;

    switch (editorStore.selectedInstrument) {
      // Точка
      case 3:
        handlers.containerPoint(editorStore, pointerX, pointerY);
        break;
      // Отрезок
      case 4:
        handlers.containerLine(editorStore, pointerX, pointerY);
        break;
      // Дуга:
      case 14:
        handlers.containerArc(editorStore, pointerX, pointerY);
        break;
    }
  });

  container.addEventListener("mousedown", (event) => {
    const pointerX = event.clientX;
    const pointerY = event.clientY;

    switch (editorStore.selectedInstrument) {
      case 1:
        handlers.startFieldMove(editorStore, pointerX, pointerY);
        break;
    }
  });

  container.addEventListener("mousemove", (event) => {
    const pointerX = event.clientX;
    const pointerY = event.clientY;

    switch (editorStore.selectedInstrument) {
      case 1:
        //handlers.continueFieldMove(editorStore, pointerX, pointerY);
        break;
    }
  });

  container.addEventListener("mouseup", (event) => {
    const pointerX = event.clientX;
    const pointerY = event.clientY;

    handlers.endFieldMove(editorStore, pointerX, pointerY);
  });

  container.addEventListener("wheel", (event) => {
    var scaleBy = 1.1;

    let oldScale = editorStore.konvaStage.scaleX();
    let pointer = editorStore.konvaStage.getPointerPosition();

    let mousePointTo = {
      x: (pointer.x - editorStore.konvaStage.x()) / oldScale,
      y: (pointer.y - editorStore.konvaStage.y()) / oldScale,
    };

    // how to scale? Zoom in? Or zoom out?
    let direction = event.deltaY > 0 ? 1 : -1;

    // when we zoom on trackpad, e.evt.ctrlKey is true
    // in that case lets revert direction
    if (event.ctrlKey) {
      direction = -direction;
    }

    let newScale = direction > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    if (newScale > 0.1 && newScale < 30) {
      editorStore.konvaStage.scale({ x: newScale, y: newScale });

      let newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };
      editorStore.konvaStage.position(newPos);
      editorStore.gridObject.draw();
    }
  });
}
