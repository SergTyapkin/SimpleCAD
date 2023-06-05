class DataLayer {
  constructor(kernel) {
    this._points = [];
    this._elements = [];
    this._constrains = [];
    this._kernel = kernel;
  }

  get points() {
    return this._points;
  }

  get constraints() {
    return this._constrains;
  }

  addPoint(point) {
    this._points.push(point);
  }

  addArc(arc) {
    this._elements.push(arc);
  }

  removePoint(id) {
    const pointIndex = this._points.findIndex((el) => el.id === id);
    console.log(pointIndex);
    if (pointIndex >= 0) {
      this._points.splice(pointIndex, 1);
    }
    // TODO добавить удаление связанных ограничений
  }

  removeElement(id) {
    const elementIndex = this._elements.findIndex((el) => el.id === id);
    console.log(elementIndex);
    if (elementIndex >= 0) {
      this._elements.splice(elementIndex, 1);
    }
    // TODO добавить удаление связанных ограничений
  }

  addTmpConstraint(constraint) {
    this._constrains.push(constraint);
  }

  addConstraint(constraint) {
    let result;
    // TODO добавить проверку вводимых ограничений
    this._constrains.push(constraint);

    try {
      result = this._kernel.solve(this._points, this._elements, this._constrains);
      console.log(this._points);
    } catch (e) {
      console.error(e);
      this._constrains.pop();
    }
    return result;
  }

  removeConstraint(id) {
    const constraintIndex = this._constrains.findIndex((el) => el.id === id);
    this._constrains.splice(constraintIndex, 1);
  }

  resolve() {
    let result;
    try {
      result = this._kernel.solve(this._points, this._elements, this._constrains);
    } catch (e) {
      console.error(e.message);
      throw e;
    }
    return result;
  }

  getPointInfo(id) {
    const point = this._points.find((el) => el.id === id);
    return {x: point.x, y: point.y}
  }

  getPointsDistance(idP1, idP2) {
    const point1 = this._points.find((el) => el.id === idP1);
    const point2 = this._points.find((el) => el.id === idP2);
    const dPow2 = (point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2
    return Math.sqrt(dPow2)
  }
}

export {
  DataLayer,
};
