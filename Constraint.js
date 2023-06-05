class Constraint {
  static curId = 0;

  constructor({type, points, lines, value, elements, mode, isInternal = false}) {
    this._type = type;
    this._points = points;
    this._lines = lines;
    this._elements = elements;
    this._value = value;
    this._mode = mode;
    this._id = Constraint.curId++;
    this._isInternal = isInternal
  }

  set value(val) {
    this._value = val;
  }

  get value() {
    return this._value;
  }

  get type() {
    return this._type;
  }

  get points() {
    return this._points;
  }

  set points(val) {
    this._points = val;
  }  
  
  get lines() {
    return this._lines;
  }

  set lines(val) {
    this._lines = val;
  }

  get elements() {
    return this._elements;
  }

  set elements(val) {
    this._elements = val;
  }

  get id() {
    return this._id;
  }

  set mode(val) {
    this._mode = val;
  }

  get mode() {
    return this._mode;
  }

  get isInternal() {
    return this._isInternal;
  }
}

export { Constraint };