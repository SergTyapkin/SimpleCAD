import handlers from "./handlers";
import { drawingColors } from '../constants';

export default function setArcEvents(editorStore, arc, events = null) {

  if (events === null || Array.isArray(events) && events.includes('click')) {
    arc.on('click', () => {
      switch (editorStore.selectedInstrument) {
        // Удаление
        case 2:
          handlers.deleteArc(editorStore, arc);
          break;
        // Длина дуги
        case 15:
          handlers.arcLength(editorStore, arc);
          break;
        // Радиус дуги
        case 16:
          handlers.arcRadius(editorStore, arc);
          break;
        // Угол дуги
        case 17:
          handlers.arcAngle(editorStore, arc);
          break;
        // Внешнее касание дуг
        // Внутреннее касание дуг
        case 18:
        case 19:
          handlers.arcTouch(editorStore, arc);
          break;
        // Касание дуги и отрезка
        case 20:
          handlers.arcAndLine(editorStore, arc);
          break;
        // Длина полилинии
        case 26:
          handlers.polylineLength(editorStore, arc);
          break;
        // Вывод параметров объекта (выберите точку/отрезок/дугу)
        case 27:
          handlers.arcInfo(editorStore, arc);
          break;
        // Управление ограничениями объекта
        case 28:
          handlers.arcConstraints(editorStore, arc);
          break;
        // Проекция дуги
        case 30:
          handlers.projectArc(editorStore, arc);
          break;
      }
    });
  }

  if (events === null || Array.isArray(events) && events.includes('dragmove')) {
    arc.on('dragmove', () => {
      editorStore.updateArcObject(arc);
      if (Date.now() - editorStore.prevLineDrag > editorStore.frameTime) {
        try {
          let { status } = editorStore.currentDataLayer.resolve();
          console.log(`resolve status ${status}`);
          if (status === "OK" || status === null) {
            editorStore.updateDrawing()
          }
        } catch (e) {
          console.error(e.message);
        }
        editorStore.prevLineDrag = Date.now();
      }
    });
  }

  if (events === null || Array.isArray(events) && events.includes('mouseenter')) {
    arc.on('mouseenter', () => {
      arc.outerRadius(arc.innerRadius() + 5);
      arc.fill('green');
      editorStore.currentStageLayer.draw();
    });
  }

  if (events === null || Array.isArray(events) && events.includes('mouseleave')) {
    arc.on('mouseleave', () => {
      arc.outerRadius(arc.innerRadius() + 3);
      arc.fill(drawingColors.DEFAULT_ELEMENT_COLOR);
      for (const arcElement of editorStore.selectedElementList.arcs) {
        arcElement.fill(drawingColors.SELECTED_ELEMENT_COLOR);
      }
      editorStore.currentStageLayer.draw();
    });
  }
}
