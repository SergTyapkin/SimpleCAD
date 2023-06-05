class PointUsedInConstraints {
    constructor(id) {
        this._id = id;
        this._dx = false;
        this._dy = false;
    }
    
    get id() {
        return this._id;
    }

    set dx(flag) {
        this._dx = flag;
    }
    get dx() {
        return this._dx;
    }

    set dy(flag) {
        this._dy = flag;
    }
    get dy() {
        return this._dy;
    }
}

export { PointUsedInConstraints };
