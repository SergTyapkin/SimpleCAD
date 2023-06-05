import handlers from './handlers';
import { drawingColors } from '../constants';

export default function setPointEvents(editorStore, point, events = null) {

  // TODO add event handler for dragstart and dragend
  if (events === null || Array.isArray(events) && events.includes('click')) {
    point.on('click', () => {
      console.log('point click', point);
      switch(editorStore.selectedInstrument) {
        // удаление точки
        case 2:
          handlers.deletePoint(editorStore, point);
          break;
        // Расстояние между точками / длина отрезка
        case 6:
          handlers.pointsDistance(editorStore, point);
          break;
        // Совмещение точек
        case 8:
          handlers.pointsAlignment(editorStore, point);
          break;
        // Фиксация точки
        case 9:
          handlers.fixPoint(editorStore, point);
          break;
        // Точка на прямой
        case 13:
          handlers.pointOnLine(editorStore, point);
          break;
        // Совмещение точки и конца дуги
        case 21:
          handlers.pointAndArcAlignment(editorStore, point);
          break;
        // Фиксация конца дуги
        case 22:
          handlers.fixArcEnd(editorStore, point);
          break;
        // Расстояние между точкой и отрезком
        case 24:
          handlers.pointAndLineDistance(editorStore, point);
          break;
        // Вывод параметров объекта (выберите точку/отрезок/дугу)
        case 27:
          handlers.pointParams(editorStore, point)
          break;
        // Управление ограничениями объекта
        case 28:
          handlers.pointConstraints(editorStore, point)
          break;
        // Проекция точки
        case 30:
          handlers.projectPoint(editorStore, point)
          break;
      }
    });
  }


  if (events === null || Array.isArray(events) && events.includes('dragmove')) {
    point.on('dragmove', () => {
      if (point.relatedLine) {
        console.log('related line')
        const relatedPoint = point.relatedPoint;
        const line = point.relatedLine;
        const linePoints = line.points();
        const lineX = line.x();
        const lineY = line.y();
        if (point.relatedId === line.startPoint.relatedId) {
          linePoints[0] = point.x() - lineX;
          linePoints[1] = point.y() - lineY;
        } else {
          linePoints[2] = point.x() - lineX;
          linePoints[3] = point.y() - lineY;
        }
        relatedPoint.x = point.x();
        relatedPoint.y = point.y();
        line.points(linePoints);
        console.log('current stage layer', editorStore.currentStageLayer);
        editorStore.currentStageLayer.draw();
      } else if (point.relatedArc) {
        const relatedPoint = point.relatedPoint;
        const arc = point.relatedArc;
        const arcModel = point.relatedArc.relatedArc;
        const centerPoint = arc.centerPoint;
        const startPoint = arc.startPoint;
        const endPoint = arc.endPoint;
  
        if (point.relatedId == centerPoint.relatedId) { // move arc center
          const deltaX = point.x() - relatedPoint.x;
          const deltaY = point.y() - relatedPoint.y;
  
          relatedPoint.x = point.x();
          relatedPoint.y = point.y();
  
          arc.x(point.x());
          arc.y(point.y());
  
          startPoint.x(startPoint.x() + deltaX);
          startPoint.y(startPoint.y() + deltaY);
          startPoint.relatedPoint.x = startPoint.x();
          startPoint.relatedPoint.y = startPoint.y();
          
          endPoint.x(endPoint.x() + deltaX);
          endPoint.y(endPoint.y() + deltaY);
          endPoint.relatedPoint.x = endPoint.x();
          endPoint.relatedPoint.y = endPoint.y();
        } else if (point.relatedId == startPoint.relatedId) { // move arc start point
          const arcRadius = arc.innerRadius();
          const deltaX = point.x() - centerPoint.x();
          const deltaY = point.y() - centerPoint.y();
  
          let startAngleRad = Math.atan(deltaY / deltaX);
          let startAngleDeg = startAngleRad * (180 / Math.PI);
          if ((deltaX < 0 && deltaY >= 0) || (deltaX < 0 && deltaY < 0)) {
            startAngleDeg += 180;
            startAngleRad += Math.PI;
          }
          const rotationDelta = startAngleDeg - arc.rotation();
          const newStartYPos = (Math.sin(startAngleRad) * arcRadius) + centerPoint.y();
          const newStartXPos = (Math.cos(startAngleRad) * arcRadius) + centerPoint.x();
          arc.rotation(startAngleDeg);
          point.x(newStartXPos);
          point.y(newStartYPos);
          relatedPoint.x = point.x();
          relatedPoint.y = point.y();
  
          const newArcAngle = arc.angle() - rotationDelta;
          arc.angle(newArcAngle);
  
        } else if (point.relatedId == endPoint.relatedId) { // move arc end point
          const arcRadius = arc.innerRadius();
          const deltaX = point.x() - centerPoint.x();
          const deltaY = point.y() - centerPoint.y();
  
          let endAngleRad = Math.atan(deltaY / deltaX);
          let endAngleDeg = endAngleRad * (180 / Math.PI);
          if ((deltaX < 0 && deltaY >= 0) || (deltaX < 0 && deltaY < 0)) {
            endAngleDeg += 180;
            endAngleRad += Math.PI;
          }
          const newEndYPos = (Math.sin(endAngleRad) * arcRadius) + centerPoint.y();
          const newEndXPos = (Math.cos(endAngleRad) * arcRadius) + centerPoint.x();
          point.x(newEndXPos);
          point.y(newEndYPos);
          relatedPoint.x = point.x();
          relatedPoint.y = point.y();
  
          const newArcAngle = endAngleDeg - arc.rotation();
          arc.angle(newArcAngle);
        }
        arcModel.center = centerPoint.relatedPoint;
        arcModel.fi1 = arc.rotation();
        arcModel.fi2 = arc.rotation() + arc.angle();
  
        editorStore.currentStageLayer.draw();
      } else {
        const relatedPoint = point.relatedPoint;
        relatedPoint.x = point.x();
        relatedPoint.y = point.y();
      }
      if (Date.now() - editorStore.prevLineDrag > editorStore.frameTime) {
        try {
          console.log(editorStore.currentDataLayer);
          let { status } = editorStore.currentDataLayer.resolve();
          if (status == "OK") {
            console.log('updating drawing');
            editorStore.updateDrawing()
          }
        } catch (e) {
          console.error(e);
        }
        editorStore.prevLineDrag = Date.now();
      }
    });
  }

  if (events === null || Array.isArray(events) && events.includes('mouseenter')) {
    point.on('mouseenter', () => {
      if (point.draggable()) {
        point.radius(8);
        point.fill('green');
        editorStore.currentStageLayer.draw();
      }
    });
  }

  if (events === null || Array.isArray(events) && events.includes('mouseleave')) {
    point.on('mouseleave', () => {
      if (point.draggable()) {
        point.radius(5);
        if (point.relatedArc && point.relatedArc.centerPoint == point) {
          point.fill('#ffd500');
        } else {
          point.fill(drawingColors.DEFAULT_ELEMENT_COLOR);
        }
        editorStore.currentStageLayer.draw();
      }
    });
  }
};