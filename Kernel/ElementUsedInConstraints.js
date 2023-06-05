class ElementUsedInConstraints {
    constructor(type, id) {
        this._id = id;
        this._type = type;
        this._dFi1 = false;
        this._dFi2 = false;
        this._dR = false;
    }
    
    get id() {
        return this._id;
    }

    get type() {
        return this._type;
    }
    
    set dFi1(flag) {
        this._dFi1 = flag;
    }
    get dFi1() {
        return this._dFi1;
    }

    set dFi2(flag) {
        this._dFi2 = flag;
    }
    get dFi2() {
        return this._dFi2;
    }

    set dR(flag) {
        this._dR = flag;
    }
    get dR() {
        return this._dR;
    }
}

export { ElementUsedInConstraints };
