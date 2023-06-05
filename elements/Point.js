import globalId from './globalId';
class Point {
  constructor(x, y) {
    this._x = x; // координата x точки
    this._y = y; // координата y точки
    this._id = globalId.id++;
  }
  get x() {
    return this._x;
  }
  get y() {
    return this._y;
  }

  get id() {
    return this._id;
  }

  set x(val) {
    this._x = val;
  }

  set y(val) {
    this._y = val;
  }
};

export {Point};
