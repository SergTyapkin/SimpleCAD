import { konvaStage, konvaLayer } from '../utils/konvaHelpers/init';
import { DataLayer } from '../../DataLayer/DataLayer';
import { Kernel } from '../../Kernel/Kernel';
import { cloneLayer } from '../utils/konvaHelpers/clone';
import { getAllObjects } from '../utils/konvaHelpers/getAllObjects';
import { highlightObjects } from '../utils/konvaHelpers/highlightObjects';
import { ref, watch } from 'vue';
import { ConstraintsTypes } from '../../ConstraintsTypes';
import Konva from 'konva';
import setPointEvents from './pointEventHandlers';
import setLineEvents from './lineEventHandlers';
import setArcEvents from './arcEventHandlers';

class Editor {
  constructor() {
    this.konvaStage = null;
    this.stageLayers = [];
    this.stageLayersList = ref([]);
    this.dataLayers = [];
    this.drawingPoints = [];
    this.projectionsMap = new Map();
    this.kernel = null;
    this._currentLayerIndex = ref(-1);
    this.selectedElementList = { lines: [], arcs: [] };
    this.tmpConstraint = null;
    this.tmpConstraintId = null;
    this.tmpLayerIndex = null;
    this.frameTime = 1;
    this.prevLineDrag = Date.now();
    this.arcDrawingStage = 0;
    this.endOfLine = false;
    this._selectedInstrument = ref(1);
    this._selectedObjectForConstraints = ref(null);
    this._selectedObjectInfo = ref(null);
    this.constraintsMap = new Map();

    watch(this._selectedInstrument, (_, oldValue) => {
      if (oldValue === 28) {
        this.selectedObjectForConstraints = null;
        this.selectedObjectInfo = null;
      }
      if (oldValue === 30) {
        this.tmpLayerIndex = null;
      }
    })
  }

  get currentLayerIndex() {
    return this._currentLayerIndex.value;
  }

  set currentLayerIndex(value) {
    this._currentLayerIndex.value = value;
  }

  get selectedInstrument() {
    return this._selectedInstrument.value;
  }

  set selectedInstrument(value) {
    this._selectedInstrument.value = value;
  }

  get selectedObjectForConstraints() {
    return this._selectedObjectForConstraints.value;
  }

  set selectedObjectInfo(value) {
    this._selectedObjectInfo.value = value;
  }

  get selectedObjectInfo() {
    return this._selectedObjectInfo.value;
  }

  set selectedObjectForConstraints(value) {
    this._selectedObjectForConstraints.value = value;
  }

  get currentStageLayer() {
    return this.stageLayers[this.currentLayerIndex];
  }

  get currentDataLayer() {
    return this.dataLayers[this.currentLayerIndex];
  }

  get currentDrawingPoints() {
    return this.drawingPoints[this.currentLayerIndex];
  }

  get stageContainer() {
    return this.konvaStage.container();
  }

  initStage(containerId, width, height) {
    this.konvaStage = konvaStage(containerId, width, height);
    this.kernel = new Kernel();
  }
  addLayer(clone = false, full = false) {
    let newDataLayer, newStageLayer, newDrawingPoints;
    if (clone) {
      const {
        dataLayer,
        stageLayer,
        drawingPoints
      } = cloneLayer(this.kernel, this, this.currentDrawingPoints, full);
      newDataLayer = dataLayer;
      newStageLayer = stageLayer;
      newDrawingPoints = drawingPoints;
    } else {
      newDataLayer = new DataLayer(this.kernel);
      newStageLayer = konvaLayer();
      newDrawingPoints = [];
    }
    if (this.currentLayerIndex >= 0) {
      this.currentStageLayer.opacity(0.3);
      this.currentStageLayer.cache();
    }
    this.currentLayerIndex++;

    this.dataLayers.push(newDataLayer);
    const layer = newStageLayer;
    this.konvaStage.add(layer);
    this.stageLayers.push(layer);
    this.stageLayersList.value.push({ id: layer._id, index: layer.index });
    this.drawingPoints.push(newDrawingPoints);
    this.selectedElementList = { lines: [], arcs: [] };
    console.log('editor', this)
    return layer;
  }
  switchLayer(index) {
    if (this.stageLayers.length < index + 1) return;

    if ( this.currentLayerIndex < index) {
      this.currentStageLayer.opacity(0.3);
    } else {
      this.currentStageLayer.hide();
    }
    this.currentStageLayer.cache();

    const currentLayerObjects = getAllObjects(this.currentDrawingPoints);
    for (let drawingObject of currentLayerObjects) {
      drawingObject.off("click dragmove mouseenter mouseleave");
    }

    this.currentLayerIndex = index;

    const newLayerObjects = getAllObjects(this.currentDrawingPoints);
    for (let drawingObject of newLayerObjects) {
      if (drawingObject instanceof Konva.Circle) setPointEvents(this, drawingObject);
      if (drawingObject instanceof Konva.Arc) setArcEvents(this, drawingObject);
      if (drawingObject instanceof Konva.Line) setLineEvents(this, drawingObject);
    }

    this.currentStageLayer.opacity(1);
    this.currentStageLayer.clearCache()
    this.currentStageLayer.show();

    // обновляем проекции
    this.updateProjections();
    try {
      let { status } = this.currentDataLayer.resolve();
      if (status == "OK") {
        this.updateDrawing();
      }
    } catch (e) {
      console.error(e.message);
    }
  }
  updateProjections() {
    this.projectionsMap.forEach((projections, drawingObject) => {
      if (drawingObject instanceof Konva.Circle) {
        const objectPoint = drawingObject.relatedPoint;
        projections.forEach((projection) => {
          projection.relatedPoint.x = objectPoint.x;
          projection.relatedPoint.y = objectPoint.y;
          
          this.updatePointPos(projection);
        })
      }
      if (drawingObject instanceof Konva.Line) {
        const objectStartPoint = drawingObject.startPoint;
        const objectEndPoint = drawingObject.endPoint;
        projections.forEach((projection) => {
          projection.startPoint.relatedPoint.x = objectStartPoint.relatedPoint.x;
          projection.startPoint.relatedPoint.y = objectStartPoint.relatedPoint.y;
          projection.endPoint.relatedPoint.x = objectEndPoint.relatedPoint.x;
          projection.endPoint.relatedPoint.y = objectEndPoint.relatedPoint.y;
          
          this.updatePointPos(projection.startPoint);
          this.updatePointPos(projection.endPoint);
        })
      }

      if (drawingObject instanceof Konva.Arc) {
        const objectStartPoint = drawingObject.startPoint;
        const objectEndPoint = drawingObject.endPoint;
        const objectCenterPoint = drawingObject.centerPoint;
        projections.forEach((projection) => {
          projection.startPoint.relatedPoint.x = objectStartPoint.relatedPoint.x;
          projection.startPoint.relatedPoint.y = objectStartPoint.relatedPoint.y;
          projection.endPoint.relatedPoint.x = objectEndPoint.relatedPoint.x;
          projection.endPoint.relatedPoint.y = objectEndPoint.relatedPoint.y;
          projection.centerPoint.relatedPoint.x = objectCenterPoint.relatedPoint.x;
          projection.centerPoint.relatedPoint.y = objectCenterPoint.relatedPoint.y;
          
          this.updateArcPos(projection);
        })
      }
    })
  }
  updatePointPos(point) {
    const relatedPoint = point.relatedPoint;
    point.x(relatedPoint.x);
    point.y(relatedPoint.y);
    if (point.relatedLine) {
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
      line.points(linePoints);
    }
    this.currentStageLayer.draw();
  }
  updateArcPos(arc) {
    const arcModel = arc.relatedArc;
    let { p0, p1, p2 } = arcModel;
    const R = arcModel.calcRadius();

    const dx1 = p1.x - p0.x;
    const dy1 = p1.y - p0.y;
    let fi1 = Math.acos(dx1 / R);
    if (dy1 < 0) { // for angle more than PI rad;
      fi1 = 2 * Math.PI - fi1;
    }

    const dx2 = p2.x - p0.x;
    const dy2 = p2.y - p0.y;
    let fi2 = Math.acos(dx2 / R);
    if (dy2 < 0) { // for angle more than PI rad;
      fi2 = 2 * Math.PI - fi2;
    }

    let angle = fi2 - fi1;
    if (fi2 < fi1) {
      angle += 2 * Math.PI;
    }
    const fi1Deg = fi1 * 180 / Math.PI;
    const angleDeg = angle * 180 / Math.PI;

    arc.x(p0.x);
    arc.y(p0.y);
    arc.rotation(fi1Deg)
    arc.angle(angleDeg);
    arc.innerRadius(R)
    arc.outerRadius(R + 3);

    arc.centerPoint.x(p0.x);
    arc.centerPoint.y(p0.y);
    arc.startPoint.x(p1.x);
    arc.startPoint.y(p1.y);
    arc.endPoint.x(p2.x);
    arc.endPoint.y(p2.y);

    arc.relatedRadiusStartLine.points()[0] = p0.x;
    arc.relatedRadiusStartLine.points()[1] = p0.y;
    arc.relatedRadiusStartLine.points()[2] = p1.x;
    arc.relatedRadiusStartLine.points()[3] = p1.y;
    arc.relatedRadiusEndLine.points()[0] = p0.x;
    arc.relatedRadiusEndLine.points()[1] = p0.y;
    arc.relatedRadiusEndLine.points()[2] = p2.x;
    arc.relatedRadiusEndLine.points()[3] = p2.y;

    this.currentStageLayer.draw();
  }
  updateDrawing() {
    console.log('current drawing points', this.currentDrawingPoints);
    for (let point of this.currentDrawingPoints) {
      this.updatePointPos(point);
      if (point.relatedArc) {
        this.updateArcPos(point.relatedArc);
      }
    }
  }
  updateLineObject(line) {
    const linePoints = line.points();
    const x = line.x();
    const y = line.y();
    const startP = line.startPoint;
    const startPRel = startP.relatedPoint;
    const endP = line.endPoint;
    const endPRel = endP.relatedPoint;

    startP.x(linePoints[0] + x);
    startP.y(linePoints[1] + y);
    endP.x(linePoints[2] + x);
    endP.y(linePoints[3] + y);

    startPRel.x = startP.x();
    startPRel.y = startP.y();
    endPRel.x = endP.x();
    endPRel.y = endP.y();

    this.currentStageLayer.draw();
  }
  updateArcObject(arc) {
    const centerPoint = arc.centerPoint;
    const startPoint = arc.startPoint;
    const endPoint = arc.endPoint;

    const arcX = arc.x();
    const arcY = arc.y();
    const deltaX = arcX - centerPoint.x();
    const deltaY = arcY - centerPoint.y();
    const arcRad = arc.innerRadius();

    centerPoint.x(arcX);
    centerPoint.y(arcY);
    centerPoint.relatedPoint.x = centerPoint.x();
    centerPoint.relatedPoint.y = centerPoint.y();

    startPoint.x(startPoint.x() + deltaX);
    startPoint.y(startPoint.y() + deltaY);
    startPoint.relatedPoint.x = startPoint.x();
    startPoint.relatedPoint.y = startPoint.y();

    endPoint.x(endPoint.x() + deltaX);
    endPoint.y(endPoint.y() + deltaY);
    endPoint.relatedPoint.x = endPoint.x();
    endPoint.relatedPoint.y = endPoint.y();

    this.currentStageLayer.draw();
  }
  generateConstraintsMap() {
    let constraintsMap = new Map();
    const currentDrawingObjects = getAllObjects(this.currentDrawingPoints);
    for (let drawingObject of currentDrawingObjects) {
      const objectConstraints = drawingObject.relatedConstraints;
      for (let constraintType in objectConstraints) {
        console.log('object constraints', objectConstraints);
        objectConstraints[constraintType].forEach((constraint) => {
          if (constraintsMap.has(constraint)) {
            constraintsMap.set(constraint, [...constraintsMap.get(constraint), drawingObject]);
          } else {
            constraintsMap.set(constraint, [drawingObject]);
          }
        })
      }
    }
    console.log('constraints map', constraintsMap);
    this.constraintsMap = constraintsMap;
    return constraintsMap
  }
  getObjectConstraints(obj) {
    let objectConstraints = [];
    for (let constraintType in obj.relatedConstraints) {
      const typeConstraints = obj.relatedConstraints[constraintType].filter((el) => !el.isInternal);
      objectConstraints.push(...typeConstraints);
    }
    console.log('object constraints', objectConstraints);
    return objectConstraints;
  }
  highlightConstraintObjects(constraint, highlight) {
    const objectsToHighlight = this.constraintsMap.get(constraint);
    highlightObjects(objectsToHighlight, highlight);
    this.currentStageLayer.draw();
  }
  deleteConstraint(constraint) {
    const constraintObjects = this.constraintsMap.get(constraint);
    for (let obj of constraintObjects) {
      if (constraint.type === ConstraintsTypes.FIX_POINT) {
        obj.draggable(true);
      }
      for (let constraintType in obj.relatedConstraints) {
        const constraintIndex = obj.relatedConstraints[constraintType].findIndex((el) => el.id === constraint.id);
        if (constraintIndex >= 0) {
          obj.relatedConstraints[constraintType].splice(constraintIndex, 1);
        }
      }
    }
    this.currentDataLayer.removeConstraint(constraint.id);
  }
}

const editor = new Editor();

export default editor;