import handlers from "./handlers";
import { drawingColors } from "../constants";

export default function setLineEvents(editorStore, line, events = null) {
  console.log("line", line);

  if (events === null || Array.isArray(events) && events.includes('click')) {
    line.on("click", () => {
      switch (editorStore.selectedInstrument) {
        // Удаление
        case 2:
          handlers.deleteLine(editorStore, line);
          break;
        // Горизонтальность
        case 5:
          handlers.horizontalLine(editorStore, line);
          break;
        // Расстояние между точками / длина отрезка
        case 6:
          handlers.lineLength(editorStore, line);
          break;
        // Вертикальность
        case 7:
          handlers.verticalLine(editorStore, line);
          break;
        // Параллельность отрезков
        case 10:
          handlers.parallelLine(editorStore, line);
          break;
        // Угол между отрезками
        case 11:
          handlers.linesAngle(editorStore, line);
          break;
        // Перпендикулярность отрезков
        case 12:
          handlers.perpendicularLines(editorStore, line);
          break;
        // Точка на прямой
        case 13:
          handlers.pointOnLine(editorStore, line);
          break;
        // Касание дуги и отрезка
        case 20:
          handlers.arcAndLine(editorStore, line);
          break;
        // Равная длина отрезков
        case 23:
          handlers.equalLines(editorStore, line);
          break;
        // Расстояние между точкой и отрезком
        case 24:
          handlers.poinAndLineDist(editorStore, line);
          break;
        // Перпендикулярность отрезка к радиусу дуги
        case 25:
          handlers.arcRadiusLinePerp(editorStore, line);
          break;
        // Длина полилинии (отрезки/дуги)
        case 26:
          handlers.polylineLength(editorStore, line);
          break;
        // Вывод параметров объекта (выберите точку/отрезок/дугу)
        case 27:
          handlers.lineInfo(editorStore, line);
          break;
        // Управление ограничениями объекта
        case 28:
          handlers.lineConstraints(editorStore, line)
          break;
        // Схлопывание линий и дуги
        case 29:
          handlers.collapse(editorStore, line)
          break;
        // Проекция линии
        case 30:
          handlers.projectLine(editorStore, line)
          break;
      }
    });
  }

  if (events === null || Array.isArray(events) && events.includes('dragmove')) {
    line.on("dragmove", () => {
      editorStore.updateLineObject(line);
      if (Date.now() - editorStore.prevLineDrag > editorStore.frameTime) {
        try {
          let { status } = editorStore.currentDataLayer.resolve();
          if (status == "OK") {
            editorStore.updateDrawing();
          }
        } catch (e) {
          console.error(e.message);
        }
        editorStore.prevLineDrag = Date.now();
      }
    });
  }

  if (events === null || Array.isArray(events) && events.includes('mouseenter')) {
    line.on("mouseenter", () => {
      line.strokeWidth(5);
      line.stroke("green");
      editorStore.currentStageLayer.draw();
    });
  }

  if (events === null || Array.isArray(events) && events.includes('mouseleave')) {
    line.on("mouseleave", () => {
      line.strokeWidth(3);
      line.stroke(drawingColors.DEFAULT_ELEMENT_COLOR);
      for (const lineElement of editorStore.selectedElementList.lines) {
        lineElement.stroke(drawingColors.SELECTED_ELEMENT_COLOR);
      }
      editorStore.currentStageLayer.draw();
    });
  }
}
