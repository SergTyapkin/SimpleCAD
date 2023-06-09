import { defineStore } from "pinia";
import { konvaStage, konvaLayer } from '../utils/konvaHelpers/init';
import { DataLayer } from '../../DataLayer/DataLayer';
import { Kernel } from '../../Kernel/Kernel';
import setPointEvents from '../utils/pointEventHandlers';
import { cloneDeep } from 'lodash';
import { cloneLayer } from '../utils/konvaHelpers/clone';

export const useEditor = defineStore("editor", {
  state: () => {
    return {
      // konvaStage: null,
      // stageLayers: [],
      // dataLayers: [],
      // drawingPoints: [],
      // kernel: null,
      // currentLayerIndex: -1,
      selectedInstrument: 1,
      // selectedElementList: { lines: [], arcs: [] },
      // tmpConstraint: null,
      // tmpConstraintId: null,
      // frameTime: 1,
      // prevLineDrag: Date.now(),
      // arcDrawingStage: 0,
      // endOfLine: false,
    };
  },

  // getters: {
  //   currentStageLayer(state) {
  //     return state.stageLayers[state.currentLayerIndex];
  //   },

  //   currentDataLayer(state) {
  //     return state.dataLayers[state.currentLayerIndex];
  //   },

  //   currentDrawingPoints(state) {
  //     return state.drawingPoints[state.currentLayerIndex];
  //   },

  //   stageContainer(state) {
  //     return state.konvaStage.container();
  //   }
  // },

  // actions: {
  //   initStage(containerId, width, height) {
  //     this.konvaStage = konvaStage(containerId, width, height);
  //     this.kernel = new Kernel();
  //   },
  //   addLayer(clone = false) {
  //     let newDataLayer, newStageLayer, newDrawingPoints;
  //     if (clone) {
  //       const {
  //         dataLayer,
  //         stageLayer,
  //         drawingPoints
  //       } = cloneLayer(this.kernel, this, this.currentDrawingPoints);
  //       newDataLayer = dataLayer;
  //       newStageLayer = stageLayer;
  //       newDrawingPoints = drawingPoints;
  //     } else {
  //       newDataLayer = new DataLayer(this.kernel);
  //       newStageLayer = konvaLayer();
  //       newDrawingPoints = [];
  //     }
  //     if (this.currentLayerIndex >= 0) {
  //       this.currentStageLayer.opacity(0.3);
  //       this.currentStageLayer.cache();
  //     }
  //     this.currentLayerIndex++;

  //     this.dataLayers.push(newDataLayer);
  //     const layer = newStageLayer;
  //     this.konvaStage.add(layer);
  //     this.stageLayers.push(layer);
  //     this.drawingPoints.push(newDrawingPoints);
  //     this.selectedInstrument = 1;
  //     this.selectedElementList = { lines: [], arcs: [] };
  //   },
  //   updatePointPos(point) {
  //     const relatedPoint = point.relatedPoint;
  //     point.x(relatedPoint.x);
  //     point.y(relatedPoint.y);
  //     if (point.relatedLine) {
  //       const line = point.relatedLine;
  //       const linePoints = line.points();
  //       const lineX = line.x();
  //       const lineY = line.y();
  //       if (point.relatedId === line.startPoint.relatedId) {
  //         linePoints[0] = point.x() - lineX;
  //         linePoints[1] = point.y() - lineY;
  //       } else {
  //         linePoints[2] = point.x() - lineX;
  //         linePoints[3] = point.y() - lineY;
  //       }
  //       line.points(linePoints);
  //     }
  //     this.currentStageLayer.draw();
  //   },
  //   updateArcPos(arc) {
  //     const arcModel = arc.relatedArc;
  //     let { p0, p1, p2 } = arcModel;
  //     const R = arcModel.calcRadius();

  //     const dx1 = p1.x - p0.x;
  //     const dy1 = p1.y - p0.y;
  //     let fi1 = Math.acos(dx1 / R);
  //     if (dy1 < 0) { // for angle more than PI rad;
  //       fi1 = 2 * Math.PI - fi1;
  //     }

  //     const dx2 = p2.x - p0.x;
  //     const dy2 = p2.y - p0.y;
  //     let fi2 = Math.acos(dx2 / R);
  //     if (dy2 < 0) { // for angle more than PI rad;
  //       fi2 = 2 * Math.PI - fi2;
  //     }

  //     let angle = fi2 - fi1;
  //     if (fi2 < fi1) {
  //       angle += 2 * Math.PI;
  //     }
  //     const fi1Deg = fi1 * 180 / Math.PI;
  //     const angleDeg = angle * 180 / Math.PI;

  //     arc.x(p0.x);
  //     arc.y(p0.y);
  //     arc.rotation(fi1Deg)
  //     arc.angle(angleDeg);
  //     arc.innerRadius(R)
  //     arc.outerRadius(R + 3);

  //     arc.centerPoint.x(p0.x);
  //     arc.centerPoint.y(p0.y);
  //     arc.startPoint.x(p1.x);
  //     arc.startPoint.y(p1.y);
  //     arc.endPoint.x(p2.x);
  //     arc.endPoint.y(p2.y);

  //     arc.relatedRadiusStartLine.points()[0] = p0.x;
  //     arc.relatedRadiusStartLine.points()[1] = p0.y;
  //     arc.relatedRadiusStartLine.points()[2] = p1.x;
  //     arc.relatedRadiusStartLine.points()[3] = p1.y;
  //     arc.relatedRadiusEndLine.points()[0] = p0.x;
  //     arc.relatedRadiusEndLine.points()[1] = p0.y;
  //     arc.relatedRadiusEndLine.points()[2] = p2.x;
  //     arc.relatedRadiusEndLine.points()[3] = p2.y;

  //     this.currentStageLayer.draw();
  //   },
  //   updateDrawing() {
  //     for (let point of this.currentDrawingPoints) {
  //       this.updatePointPos(point);
  //       if (point.relatedArc) {
  //         this.updateArcPos(point.relatedArc);
  //       }
  //     }
  //   },
  //   updateLineObject(line) {
  //     const linePoints = line.points();
  //     const x = line.x();
  //     const y = line.y();
  //     const startP = line.startPoint;
  //     const startPRel = startP.relatedPoint;
  //     const endP = line.endPoint;
  //     const endPRel = endP.relatedPoint;

  //     startP.x(linePoints[0] + x);
  //     startP.y(linePoints[1] + y);
  //     endP.x(linePoints[2] + x);
  //     endP.y(linePoints[3] + y);

  //     startPRel.x = startP.x();
  //     startPRel.y = startP.y();
  //     endPRel.x = endP.x();
  //     endPRel.y = endP.y();

  //     this.currentStageLayer.draw();
  //   },
  //   updateArcObject(arc) {
  //     const centerPoint = arc.centerPoint;
  //     const startPoint = arc.startPoint;
  //     const endPoint = arc.endPoint;

  //     const arcX = arc.x();
  //     const arcY = arc.y();
  //     const deltaX = arcX - centerPoint.x();
  //     const deltaY = arcY - centerPoint.y();
  //     const arcRad = arc.innerRadius();

  //     centerPoint.x(arcX);
  //     centerPoint.y(arcY);
  //     centerPoint.relatedPoint.x = centerPoint.x();
  //     centerPoint.relatedPoint.y = centerPoint.y();

  //     startPoint.x(startPoint.x() + deltaX);
  //     startPoint.y(startPoint.y() + deltaY);
  //     startPoint.relatedPoint.x = startPoint.x();
  //     startPoint.relatedPoint.y = startPoint.y();

  //     endPoint.x(endPoint.x() + deltaX);
  //     endPoint.y(endPoint.y() + deltaY);
  //     endPoint.relatedPoint.x = endPoint.x();
  //     endPoint.relatedPoint.y = endPoint.y();

  //     this.currentStageLayer.draw();
  //   },
  // }
});
