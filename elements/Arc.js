import { ElementTypes } from './ElementTypes.js';
import globalId from './globalId';

class Arc {
  constructor(p0, p1, p2, angleMode = 'RAD') {
    this._p0 = p0; // точка начала дуги
    this._p1 = p1; // точка конца дуги
    this._p2 = p2; // точка центра дуги
    this._angleMode = angleMode; // 'DEG' or 'RAD'
    this._id = globalId.id++;
  }

  get type() {
    return ElementTypes.ARC;
  }
  get center() {
    return this._p0;
  }
  get p0() {
    return this._p0;
  }
  get p1() {
    return this._p1;
  }
  get p2() {
    return this._p2;
  }
  get R() {
    return this._R;
  }

  calcRadius() {
    return Math.sqrt(Math.pow((this._p1.x - this._p0.x), 2) + Math.pow((this._p1.y - this._p0.y), 2));
  }

  calcFi1Rad() {
    const dx1 = this._p1.x - this._p0.x;
    const dy1 = this._p1.y - this._p0.y;
    const R = this.calcRadius()
    let fi1 = Math.acos(dx1 / R);
    if (dy1 < 0) { // for angle more than PI rad;
      fi1 = 2 * Math.PI - fi1;
    }
    return fi1;
  }
  
  calcFi1Deg() {
    return this.calcFi1Rad() * 180 / Math.PI;
  }

  calcFi2Rad() {
    const dx2 = this._p2.x - this._p0.x;
    const dy2 = this._p2.y - this._p0.y;
    const R = this.calcRadius()
    let fi2 = Math.acos(dx2 / R);
    if (dy2 < 0) { // for angle more than PI rad;
      fi2 = 2 * Math.PI - fi2;
    }
    return fi2;
  }
  
  calcFi2Deg() {
    return this.calcFi2Rad() * 180 / Math.PI;
  }

  calcAngleRad() {
    const fi1 = this.calcFi1Rad();
    const fi2 = this.calcFi2Rad();
    let angle = fi2 - fi1;
    if (fi2 < fi1) {
      angle += 2 * Math.PI;
    }
    return angle;
  }
  
  calcAngleDeg() {
    return this.calcAngleRad() * 180 / Math.PI;
  }

  get fi1() {
    return this._fi1;
  }
  get fi2() {
    return this._fi2;
  }

  get id() {
    return this._id;
  }

  set center(val) {
    this._p0 = val;
  }
  set p0(val) {
    this._p0 = val;
  }
  set p1(val) {
    this._p1 = val;
  }
  set p2(val) {
    this._p2 = val;
  }
  set R(val) {
    this._R = val;
  }
  set fi1(val) {
    this._fi1 = val;
  }
  set fi2(val) {
    this._fi2 = val;
  }

  set angleMode(val) {
    this._angleMode = val;
  }
  get angleMode() {
    return this._angleMode;
  }
};

export {Arc};
