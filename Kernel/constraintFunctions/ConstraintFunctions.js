/**
 * Dirac delta function
 * @param {Number} x argument 
 * @returns function value
 */
function dirac(x) {
    return x === 0 ? Number.MAX_VALUE : 0;
}

/**
 * Function for Horizontal constraint. 
 * This function fill local matrix J and vector F.
 * 
 * @param {Constraint} constraint 
 * @returns {Object} Object with axis names, local Jacobian and local vector F
 */
function getDerivativeFunction_Horizontal(constraint, unknowns, axisGlobal) {
    const dim = 3;

    const axisLocal = [];
    axisLocal.push('lambda_' + constraint.id);
    for (let i = 0; i < constraint.points.length; i++) {
        axisLocal.push('dy_' + constraint.points[i].id);
    }
    const localToGlobal = new Array(dim);
    for (let i = 0; i < dim; i++) {
        localToGlobal[i] = axisGlobal.indexOf(axisLocal[i]);
    }

    const JacobianLocal = new Array(dim);
    const F_Local = new Array(dim);
    for (let i = 0; i < dim; i++) {
        F_Local[i] = 0;
        JacobianLocal[i] = new Array(dim);
        for (let j = 0; j < dim; j++) {
            JacobianLocal[i][j] = 0;
        }
    }

    JacobianLocal[0][1] = -1;
    JacobianLocal[0][2] = 1;
    JacobianLocal[1][0] = -1;
    JacobianLocal[2][0] = 1;

    const y1 = constraint.points[0].y;
    const y2 = constraint.points[1].y;
    const lambda = unknowns[localToGlobal[0]];
    const dy1 = unknowns[localToGlobal[1]];
    const dy2 = unknowns[localToGlobal[2]];
    F_Local[0] = y2 + dy2 - y1 - dy1;
    F_Local[1] = -lambda; // -l
    F_Local[2] = lambda; // +l

    return({axisLocal, JacobianLocal, F_Local, dim, localToGlobal});
}

/**
 * Function for Length constraint. 
 * This function fill local matrix J and vector F.
 * 
 * @param {Constraint} constraint 
 * @returns {Object} Object with axis names, local Jacobian and local vector F
 */
function getDerivativeFunction_Length(constraint, unknowns, axisGlobal) {
    const dim = 5;

    const axisLocal = [];
    axisLocal.push('lambda_' + constraint.id);
    for (let i = 0; i < constraint.points.length; i++) {
        axisLocal.push('dx_' + constraint.points[i].id);
        axisLocal.push('dy_' + constraint.points[i].id);
    }
    const localToGlobal = new Array(dim);
    for (let i = 0; i < dim; i++) {
        localToGlobal[i] = axisGlobal.indexOf(axisLocal[i]);
    }

    const JacobianLocal = new Array(dim);
    const F_Local = new Array(dim);
    for (let i = 0; i < dim; i++) {
        F_Local[i] = 0;
        JacobianLocal[i] = new Array(dim);
        for (let j = 0; j < dim; j++) {
            JacobianLocal[i][j] = 0;
        }
    }

    const x1 = constraint.points[0].x;
    const y1 = constraint.points[0].y;
    const x2 = constraint.points[1].x;
    const y2 = constraint.points[1].y;

    const lambda = unknowns[localToGlobal[0]];
    const dx1 = unknowns[localToGlobal[1]];
    const dy1 = unknowns[localToGlobal[2]];
    const dx2 = unknowns[localToGlobal[3]];
    const dy2 = unknowns[localToGlobal[4]];

    const length = constraint.value;

    JacobianLocal[0][0] = 0; // 0
    JacobianLocal[0][1] = -2 * (x2 + dx2 - x1 - dx1); // -2(x2+dx2-x1-dx1)
    JacobianLocal[0][2] = -2 * (y2 + dy2 - y1 - dy1); // -2(y2+dy2-y1-dy1)
    JacobianLocal[0][3] = 2 * (x2 + dx2 - x1 - dx1); // 2(x2+dx2-x1-dx1)
    JacobianLocal[0][4] = 2 * (y2 + dy2 - y1 - dy1); // 2(y2+dy2-y1-dy1)

    JacobianLocal[1][0] = -2 * (x2 + dx2 - x1 - dx1); // -2(x2+dx2-x1-dx1)
    JacobianLocal[1][1] = 2 * lambda; // +2 l
    JacobianLocal[1][2] = 0; // 0
    JacobianLocal[1][3] = -2 * lambda; // -2 l
    JacobianLocal[1][4] = 0; // 0

    JacobianLocal[2][0] = -2 * (y2 + dy2 - y1 - dy1); // -2(y2+dy2-y1-dy1)
    JacobianLocal[2][1] = 0; // 0
    JacobianLocal[2][2] = 2 * lambda; // +2 l
    JacobianLocal[2][3] = 0; //0
    JacobianLocal[2][4] = -2 * lambda; // -2 l

    JacobianLocal[3][0] = 2 * (x2 + dx2 - x1 - dx1); // 2(x2+dx2-x1-dx1)
    JacobianLocal[3][1] = -2 * lambda; // -2 l
    JacobianLocal[3][2] = 0; // 0
    JacobianLocal[3][3] = 2 * lambda; // +2 l
    JacobianLocal[3][4] = 0; // 0

    JacobianLocal[4][0] = 2 * (y2 + dy2 - y1 - dy1); // 2(y2+dy2-y1-dy1)
    JacobianLocal[4][1] = 0; // 0
    JacobianLocal[4][2] = -2 * lambda; // -2 l
    JacobianLocal[4][3] = 0; // 0
    JacobianLocal[4][4] = 2 * lambda;// +2 l

    F_Local[0] = Math.pow((x2+dx2 - x1-dx1), 2) + Math.pow((y2+dy2 - y1-dy1), 2) - length * length; 
    F_Local[1] = -2 * lambda * (x2+dx2 - x1-dx1);
    F_Local[2] = -2 * lambda * (y2+dy2 - y1-dy1);
    F_Local[3] = 2 * lambda * (x2+dx2 - x1-dx1);
    F_Local[4] = 2 * lambda * (y2+dy2 - y1-dy1);

    return({axisLocal, JacobianLocal, F_Local, dim, localToGlobal});
}

/**
 * Function for FixPoint constraint. 
 * This function fill local matrix J and vector F.
 * 
 * @param {Constraint} constraint 
 * @returns {Object} Object with axis names, local Jacobian and local vector F
 */
function getDerivativeFunction_FixPoint(constraint, unknowns, axisGlobal) {
    const dim = 4;

    if(constraint.points.length !== 1) {
        throw new Error("getDerivativeFunction_FixPoint: not 1 point in constraint")
    }
    
    const axisLocal = [];
    axisLocal.push('lambda_' + constraint.id + '_1');
    axisLocal.push('lambda_' + constraint.id + '_2');
    axisLocal.push('dx_' + constraint.points[0].id);
    axisLocal.push('dy_' + constraint.points[0].id);
    const localToGlobal = new Array(dim);
    for (let i = 0; i < dim; i++) {
        localToGlobal[i] = axisGlobal.indexOf(axisLocal[i]);
    }

    const JacobianLocal = new Array(dim);
    const F_Local = new Array(dim);
    for (let i = 0; i < dim; i++) {
        F_Local[i] = 0;
        JacobianLocal[i] = new Array(dim);
        for (let j = 0; j < dim; j++) {
            JacobianLocal[i][j] = 0;
        }
    }

    JacobianLocal[0][2] = 1;
    JacobianLocal[1][3] = 1;
    JacobianLocal[2][0] = 1;
    JacobianLocal[3][1] = 1;

    // const x = constraint.points[0].x;
    // const y = constraint.points[0].y;
    const lambda1 = unknowns[localToGlobal[0]];
    const lambda2 = unknowns[localToGlobal[1]];
    const dx = unknowns[localToGlobal[2]];
    const dy = unknowns[localToGlobal[3]];
    F_Local[0] = dx;
    F_Local[1] = dy; // -l
    F_Local[2] = lambda1; // +l
    F_Local[3] = lambda2; // +l

    return({axisLocal, JacobianLocal, F_Local, dim, localToGlobal});
}

/**
 * Function for Vertical constraint. 
 * This function fill local matrix J and vector F.
 * 
 * @param {Constraint} constraint 
 * @returns {Object} Object with axis names, local Jacobian and local vector F
 */
function getDerivativeFunction_Vertical(constraint, unknowns, axisGlobal) {
    const dim = 3;

    const axisLocal = [];
    axisLocal.push('lambda_' + constraint.id);
    for (let i = 0; i < constraint.points.length; i++) {
        axisLocal.push('dx_' + constraint.points[i].id);
    }
    const localToGlobal = new Array(dim);
    for (let i = 0; i < dim; i++) {
        localToGlobal[i] = axisGlobal.indexOf(axisLocal[i]);
    }

    const JacobianLocal = new Array(dim);
    const F_Local = new Array(dim);
    for (let i = 0; i < dim; i++) {
        F_Local[i] = 0;
        JacobianLocal[i] = new Array(dim);
        for (let j = 0; j < dim; j++) {
            JacobianLocal[i][j] = 0;
        }
    }

    JacobianLocal[0][1] = -1;
    JacobianLocal[0][2] = 1;
    JacobianLocal[1][0] = -1;
    JacobianLocal[2][0] = 1;

    const x1 = constraint.points[0].x;
    const x2 = constraint.points[1].x;
    const lambda = unknowns[localToGlobal[0]];
    const dx1 = unknowns[localToGlobal[1]];
    const dx2 = unknowns[localToGlobal[2]];
    F_Local[0] = x2 + dx2 - x1 - dx1;
    F_Local[1] = -lambda; // -l
    F_Local[2] = lambda; // +l

    return({axisLocal, JacobianLocal, F_Local, dim, localToGlobal});
}

/**
 * Function for Coincident constraint. 
 * This function fill local matrix J and vector F.
 * 
 * @param {Constraint} constraint 
 * @returns {Object} Object with axis names, local Jacobian and local vector F
 */
function getDerivativeFunction_Coincident(constraint, unknowns, axisGlobal) {
    const dim = 6;

    if(constraint.points.length !== 2) {
        throw new Error("getDerivativeFunction_Coincident: not 2 points in constraint")
    }
    
    const axisLocal = [];
    axisLocal.push('lambda_' + constraint.id + '_1');
    axisLocal.push('lambda_' + constraint.id + '_2');
    for (let i = 0; i < constraint.points.length; i++) {
        axisLocal.push('dx_' + constraint.points[i].id);
        axisLocal.push('dy_' + constraint.points[i].id);
    }
    const localToGlobal = new Array(dim);
    for (let i = 0; i < dim; i++) {
        localToGlobal[i] = axisGlobal.indexOf(axisLocal[i]);
    }

    const JacobianLocal = new Array(dim);
    const F_Local = new Array(dim);
    for (let i = 0; i < dim; i++) {
        F_Local[i] = 0;
        JacobianLocal[i] = new Array(dim);
        for (let j = 0; j < dim; j++) {
            JacobianLocal[i][j] = 0;
        }
    }

    JacobianLocal[0][2] = -1;
    JacobianLocal[0][4] = 1;
    JacobianLocal[1][3] = -1;
    JacobianLocal[1][5] = 1;
    JacobianLocal[2][0] = -1;
    JacobianLocal[3][1] = -1;
    JacobianLocal[4][0] = 1;
    JacobianLocal[5][1] = 1;

    const x1 = constraint.points[0].x;
    const y1 = constraint.points[0].y;
    const x2 = constraint.points[1].x;
    const y2 = constraint.points[1].y;
    const lambda1 = unknowns[localToGlobal[0]];
    const lambda2 = unknowns[localToGlobal[1]];
    const dx1 = unknowns[localToGlobal[2]];
    const dy1 = unknowns[localToGlobal[3]];
    const dx2 = unknowns[localToGlobal[4]];
    const dy2 = unknowns[localToGlobal[5]];
    F_Local[0] = x2 + dx2 - x1 - dx1;
    F_Local[1] = y2 + dy2 - y1 - dy1;
    F_Local[2] = -lambda1; // -l
    F_Local[3] = -lambda2; // -l
    F_Local[4] = lambda1; // +l
    F_Local[5] = lambda2; // +l

    return({axisLocal, JacobianLocal, F_Local, dim, localToGlobal});
}

/**
 * Function for Parallel constraint. 
 * This function fill local matrix J and vector F.
 * 
 * @param {Constraint} constraint 
 * @returns {Object} Object with axis names, local Jacobian and local vector F
 */
function getDerivativeFunction_Parallel(constraint, unknowns, axisGlobal) {
    const dim = 9;

    const axisLocal = [];
    axisLocal.push('lambda_' + constraint.id);
    for (let i = 0; i < 2; i++) {
        axisLocal.push('dx_' + constraint.lines[i][0].id);
        axisLocal.push('dy_' + constraint.lines[i][0].id);
        axisLocal.push('dx_' + constraint.lines[i][1].id);
        axisLocal.push('dy_' + constraint.lines[i][1].id);
    }
    const localToGlobal = new Array(dim);
    for (let i = 0; i < dim; i++) {
        localToGlobal[i] = axisGlobal.indexOf(axisLocal[i]);
    }

    const JacobianLocal = new Array(dim);
    const F_Local = new Array(dim);
    for (let i = 0; i < dim; i++) {
        F_Local[i] = 0;
        JacobianLocal[i] = new Array(dim);
        for (let j = 0; j < dim; j++) {
            JacobianLocal[i][j] = 0;
        }
    }

    const line1 = constraint.lines[0];
    const line2 = constraint.lines[1];
    
    const x1_s = line1[0].x;
    const y1_s = line1[0].y;
    const x1_f = line1[1].x;
    const y1_f = line1[1].y
    const x2_s = line2[0].x;
    const y2_s = line2[0].y;
    const x2_f = line2[1].x;
    const y2_f = line2[1].y;

    const lambda = unknowns[localToGlobal[0]];
    const dx1_s = unknowns[localToGlobal[1]];
    const dy1_s = unknowns[localToGlobal[2]];
    const dx1_f = unknowns[localToGlobal[3]];
    const dy1_f = unknowns[localToGlobal[4]];
    const dx2_s = unknowns[localToGlobal[5]];
    const dy2_s = unknowns[localToGlobal[6]];
    const dx2_f = unknowns[localToGlobal[7]];
    const dy2_f = unknowns[localToGlobal[8]];
    
    const a_ = y2_s + dy2_s - y2_f - dy2_f;
    const b_ = -x2_s - dx2_s + x2_f + dx2_f;
    const c_ = -y2_s - dy2_s + y2_f + dy2_f;
    const d_ = x2_s + dx2_s - x2_f - dx2_f;
    const e_ = -y1_s - dy1_s + y1_f + dy1_f;
    const f_ = x1_s + dx1_s - x1_f - dx1_f;
    const g_ = y1_s + dy1_s - y1_f - dy1_f;
    const h_ = -x1_s - dx1_s + x1_f + dx1_f;

    // X1 * Y2 - X2 * Y1
    // F_Local[0] = (x1_s + dx1_s - x1_f - dx1_f)*(y2_s + dy2_s - y2_f - dy2_f) - (x2_s + dx2_s - x2_f - dx2_f)*(y1_s + dy1_s - y1_f - dy1_f);
    F_Local[0] = (y1_s + dy1_s - y1_f - dy1_f)*(x2_f + dx2_f - x2_s - dx2_s) - (y2_s + dy2_s - y2_f - dy2_f)*(x1_f + dx1_f - x1_s - dx1_s);
    F_Local[1] = lambda * a_;
    F_Local[2] = lambda * b_;
    F_Local[3] = lambda * c_;
    F_Local[4] = lambda * d_;
    F_Local[5] = lambda * e_;
    F_Local[6] = lambda * f_;
    F_Local[7] = lambda * g_;
    F_Local[8] = lambda * h_;

    JacobianLocal[0][1] = a_;
    JacobianLocal[0][2] = b_;
    JacobianLocal[0][3] = c_;
    JacobianLocal[0][4] = d_;
    JacobianLocal[0][5] = e_;
    JacobianLocal[0][6] = f_;
    JacobianLocal[0][7] = g_
    JacobianLocal[0][8] = h_;

    JacobianLocal[1][0] = a_;
    JacobianLocal[1][6] = lambda;
    JacobianLocal[1][8] = -lambda;
    
    JacobianLocal[2][0] = b_;
    JacobianLocal[2][5] = -lambda;
    JacobianLocal[2][7] = lambda;

    JacobianLocal[3][0] = c_;
    JacobianLocal[3][6] = -lambda;
    JacobianLocal[3][8] = lambda;
    
    JacobianLocal[4][0] = d_;
    JacobianLocal[4][5] = lambda;
    JacobianLocal[4][7] = -lambda;
    
    JacobianLocal[5][0] = e_;
    JacobianLocal[5][2] = -lambda;
    JacobianLocal[5][4] = lambda;
    
    JacobianLocal[6][0] = f_;
    JacobianLocal[6][1] = lambda;
    JacobianLocal[6][3] = -lambda;

    JacobianLocal[7][0] = g_;
    JacobianLocal[7][2] = lambda;
    JacobianLocal[7][4] = -lambda;

    JacobianLocal[8][0] = h_;
    JacobianLocal[8][1] = -lambda;
    JacobianLocal[8][3] = lambda;

    return({axisLocal, JacobianLocal, F_Local, dim, localToGlobal});
}

/**
 * Function for Perpendicular constraint. 
 * This function fill local matrix J and vector F.
 * 
 * @param {Constraint} constraint 
 * @returns {Object} Object with axis names, local Jacobian and local vector F
 */
function getDerivativeFunction_Perpendicular(constraint, unknowns, axisGlobal) {
    const dim = 9;

    const axisLocal = [];
    axisLocal.push('lambda_' + constraint.id);
    for (let i = 0; i < 2; i++) {
        axisLocal.push('dx_' + constraint.lines[i][0].id);
        axisLocal.push('dy_' + constraint.lines[i][0].id);
        axisLocal.push('dx_' + constraint.lines[i][1].id);
        axisLocal.push('dy_' + constraint.lines[i][1].id);
    }
    const localToGlobal = new Array(dim);
    for (let i = 0; i < dim; i++) {
        localToGlobal[i] = axisGlobal.indexOf(axisLocal[i]);
    }

    const JacobianLocal = new Array(dim);
    const F_Local = new Array(dim);
    for (let i = 0; i < dim; i++) {
        F_Local[i] = 0;
        JacobianLocal[i] = new Array(dim);
        for (let j = 0; j < dim; j++) {
            JacobianLocal[i][j] = 0;
        }
    }

    const line1 = constraint.lines[0];
    const line2 = constraint.lines[1];
    
    const x1_s = line1[0].x;
    const y1_s = line1[0].y;
    const x1_f = line1[1].x;
    const y1_f = line1[1].y
    const x2_s = line2[0].x;
    const y2_s = line2[0].y;
    const x2_f = line2[1].x;
    const y2_f = line2[1].y;

    const lambda = unknowns[localToGlobal[0]];
    const dx1_s = unknowns[localToGlobal[1]];
    const dy1_s = unknowns[localToGlobal[2]];
    const dx1_f = unknowns[localToGlobal[3]];
    const dy1_f = unknowns[localToGlobal[4]];
    const dx2_s = unknowns[localToGlobal[5]];
    const dy2_s = unknowns[localToGlobal[6]];
    const dx2_f = unknowns[localToGlobal[7]];
    const dy2_f = unknowns[localToGlobal[8]];
    
    const a_ = x2_s + dx2_s - x2_f - dx2_f;
    const b_ = y2_s + dy2_s - y2_f - dy2_f;
    const c_ = -x2_s - dx2_s + x2_f + dx2_f;
    const d_ = -y2_s - dy2_s + y2_f + dy2_f;
    const e_ = x1_s + dx1_s - x1_f - dx1_f;
    const f_ = y1_s + dy1_s - y1_f - dy1_f;
    const g_ = -x1_s - dx1_s + x1_f + dx1_f;
    const h_ = -y1_s - dy1_s + y1_f + dy1_f;

    // X1 * X2 - Y1 * Y2
    F_Local[0] = (x1_f + dx1_f - x1_s - dx1_s)*(x2_f + dx2_f - x2_s - dx2_s) + (y1_f + dy1_f - y1_s - dy1_s)*(y2_f + dy2_f - y2_s - dy2_s);
    F_Local[1] = lambda * a_;
    F_Local[2] = lambda * b_;
    F_Local[3] = lambda * c_;
    F_Local[4] = lambda * d_;
    F_Local[5] = lambda * e_;
    F_Local[6] = lambda * f_;
    F_Local[7] = lambda * g_;
    F_Local[8] = lambda * h_;

    JacobianLocal[0][1] = a_;
    JacobianLocal[0][2] = b_;
    JacobianLocal[0][3] = c_;
    JacobianLocal[0][4] = d_;
    JacobianLocal[0][5] = e_;
    JacobianLocal[0][6] = f_;
    JacobianLocal[0][7] = g_
    JacobianLocal[0][8] = h_;

    JacobianLocal[1][0] = a_;
    JacobianLocal[1][5] = lambda;
    JacobianLocal[1][7] = -lambda;
    
    JacobianLocal[2][0] = b_;
    JacobianLocal[2][6] = lambda;
    JacobianLocal[2][8] = -lambda;

    JacobianLocal[3][0] = c_;
    JacobianLocal[3][5] = -lambda;
    JacobianLocal[3][7] = lambda;
    
    JacobianLocal[4][0] = d_;
    JacobianLocal[4][6] = -lambda;
    JacobianLocal[4][8] = lambda;
    
    JacobianLocal[5][0] = e_;
    JacobianLocal[5][1] = lambda;
    JacobianLocal[5][3] = -lambda;
    
    JacobianLocal[6][0] = f_;
    JacobianLocal[6][2] = lambda;
    JacobianLocal[6][4] = -lambda;

    JacobianLocal[7][0] = g_;
    JacobianLocal[7][1] = -lambda;
    JacobianLocal[7][3] = lambda;

    JacobianLocal[8][0] = h_;
    JacobianLocal[8][2] = -lambda;
    JacobianLocal[8][4] = lambda;

    return({axisLocal, JacobianLocal, F_Local, dim, localToGlobal});
}

/**
 * Function for PointOnLine constraint. 
 * This function fill local matrix J and vector F.
 * 
 * @param {Constraint} constraint 
 * @returns {Object} Object with axis names, local Jacobian and local vector F
 */
function getDerivativeFunction_PointOnLine(constraint, unknowns, axisGlobal) {
    const dim = 7;

    const axisLocal = [];
    axisLocal.push('lambda_' + constraint.id);
    axisLocal.push('dx_' + constraint.lines[0][0].id);
    axisLocal.push('dy_' + constraint.lines[0][0].id);
    axisLocal.push('dx_' + constraint.points[0].id);
    axisLocal.push('dy_' + constraint.points[0].id);
    axisLocal.push('dx_' + constraint.lines[0][1].id);
    axisLocal.push('dy_' + constraint.lines[0][1].id);
    const localToGlobal = new Array(dim);
    for (let i = 0; i < dim; i++) {
        localToGlobal[i] = axisGlobal.indexOf(axisLocal[i]);
    }

    const JacobianLocal = new Array(dim);
    const F_Local = new Array(dim);
    for (let i = 0; i < dim; i++) {
        F_Local[i] = 0;
        JacobianLocal[i] = new Array(dim);
        for (let j = 0; j < dim; j++) {
            JacobianLocal[i][j] = 0;
        }
    }
    
    const x1_s = constraint.lines[0][0].x;
    const y1_s = constraint.lines[0][0].y;
    const xp = constraint.points[0].x;
    const yp = constraint.points[0].y;
    const x2_f = constraint.lines[0][1].x;
    const y2_f = constraint.lines[0][1].y;

    const lambda = unknowns[localToGlobal[0]];
    const dx1_s = unknowns[localToGlobal[1]];
    const dy1_s = unknowns[localToGlobal[2]];
    const dxp = unknowns[localToGlobal[3]];
    const dyp = unknowns[localToGlobal[4]];
    const dx2_f = unknowns[localToGlobal[5]];
    const dy2_f = unknowns[localToGlobal[6]];
    
    const a_ = yp + dyp - y2_f - dy2_f;
    const b_ = -xp - dxp + x2_f + dx2_f;
    const c_ = y2_f + dy2_f - y1_s - dy1_s;
    const d_ = x1_s + dx1_s - x2_f - dx2_f;
    const e_ = y1_s + dy1_s - yp - dyp;
    const f_ = -x1_s - dx1_s + xp + dxp;

    // F_Local[0] = (x2_f + dx2_f - xp - dxp)*(y1_s + dy1_s - yp - dyp) - (yp + dyp - y2_f - dy2_f)*(xp + dxp - x1_s - dx1_s);
    F_Local[0] = (xp + dxp - x1_s - dx1_s)*(y2_f + dy2_f - yp - dyp) - (x2_f + dx2_f - xp - dxp)*(yp + dyp - y1_s - dy1_s);
    F_Local[1] = lambda * a_;
    F_Local[2] = lambda * b_;
    F_Local[3] = lambda * c_;
    F_Local[4] = lambda * d_;
    F_Local[5] = lambda * e_;
    F_Local[6] = lambda * f_;

    JacobianLocal[0][1] = a_;
    JacobianLocal[0][2] = b_;
    JacobianLocal[0][3] = c_;
    JacobianLocal[0][4] = d_;
    JacobianLocal[0][5] = e_;
    JacobianLocal[0][6] = f_;

    JacobianLocal[1][0] = a_;
    JacobianLocal[1][4] = lambda;
    JacobianLocal[1][6] = -lambda;
    
    JacobianLocal[2][0] = b_;
    JacobianLocal[2][3] = -lambda;
    JacobianLocal[2][5] = lambda;

    JacobianLocal[3][0] = c_;
    JacobianLocal[3][2] = -lambda;
    JacobianLocal[3][6] = lambda;
    
    JacobianLocal[4][0] = d_;
    JacobianLocal[4][1] = lambda;
    JacobianLocal[4][5] = -lambda;
    
    JacobianLocal[5][0] = e_;
    JacobianLocal[5][2] = lambda;
    JacobianLocal[5][4] = -lambda;
    
    JacobianLocal[6][0] = f_;
    JacobianLocal[6][1] = -lambda;
    JacobianLocal[6][3] = lambda;

    return({axisLocal, JacobianLocal, F_Local, dim, localToGlobal});
}

/**
 * Function for Angle constraint. 
 * This function fill local matrix J and vector F.
 * 
 * @param {Constraint} constraint 
 * @returns {Object} Object with axis names, local Jacobian and local vector F
 */
function getDerivativeFunction_Angle(constraint, unknowns, axisGlobal) {
    const dim = 9;

    const axisLocal = [];
    axisLocal.push('lambda_' + constraint.id);
    for (let i = 0; i < 2; i++) {
        axisLocal.push('dx_' + constraint.lines[i][0].id);
        axisLocal.push('dy_' + constraint.lines[i][0].id);
        axisLocal.push('dx_' + constraint.lines[i][1].id);
        axisLocal.push('dy_' + constraint.lines[i][1].id);
    }
    const localToGlobal = new Array(dim);
    for (let i = 0; i < dim; i++) {
        localToGlobal[i] = axisGlobal.indexOf(axisLocal[i]);
    }

    const JacobianLocal = new Array(dim);
    const F_Local = new Array(dim);
    for (let i = 0; i < dim; i++) {
        F_Local[i] = 0;
        JacobianLocal[i] = new Array(dim);
        for (let j = 0; j < dim; j++) {
            JacobianLocal[i][j] = 0;
        }
    }

    const line1 = constraint.lines[0];
    const line2 = constraint.lines[1];
    
    const x1_s = line1[0].x;
    const y1_s = line1[0].y;
    const x1_f = line1[1].x;
    const y1_f = line1[1].y
    const x2_s = line2[0].x;
    const y2_s = line2[0].y;
    const x2_f = line2[1].x;
    const y2_f = line2[1].y;

    const lambda = unknowns[localToGlobal[0]];
    const dx1_s = unknowns[localToGlobal[1]];
    const dy1_s = unknowns[localToGlobal[2]];
    const dx1_f = unknowns[localToGlobal[3]];
    const dy1_f = unknowns[localToGlobal[4]];
    const dx2_s = unknowns[localToGlobal[5]];
    const dy2_s = unknowns[localToGlobal[6]];
    const dx2_f = unknowns[localToGlobal[7]];
    const dy2_f = unknowns[localToGlobal[8]];
    
    let angleInRad = constraint.value.val;
    if (constraint.value.mode == 'DEG') {
        angleInRad = constraint.value.val * Math.PI / 180;
    }
    const cosAB = Math.cos(angleInRad);
    const L_X1 = Math.abs(x1_f + dx1_f - x1_s - dx1_s); 
    const L_Y1 = Math.abs(y1_f + dy1_f - y1_s - dy1_s); 
    const L_X2 = Math.abs(x2_f + dx2_f - x2_s - dx2_s); 
    const L_Y2 = Math.abs(y2_f + dy2_f - y2_s - dy2_s); 
    const moduleA = Math.sqrt(L_X1*L_X1 + L_Y1*L_Y1);
    const moduleB = Math.sqrt(L_X2*L_X2 + L_Y2*L_Y2);

    const a_ = (x2_s + dx2_s - x2_f - dx2_f) + cosAB * moduleB * (1/moduleA) * (x1_f + dx1_f - x1_s - dx1_s);
    const b_ = (y2_s + dy2_s - y2_f - dy2_f) + cosAB * moduleB * (1/moduleA) * (y1_f + dy1_f - y1_s - dy1_s);
    const c_ = (-x2_s - dx2_s + x2_f + dx2_f) - cosAB * moduleB * (1/moduleA) * (x1_f + dx1_f - x1_s - dx1_s);
    const d_ = (-y2_s - dy2_s + y2_f + dy2_f) - cosAB * moduleB * (1/moduleA) * (y1_f + dy1_f - y1_s - dy1_s);
    const e_ = (x1_s + dx1_s - x1_f - dx1_f) + cosAB * moduleA * (1/moduleB) * (x2_f + dx2_f - x2_s - dx2_s);
    const f_ = (y1_s + dy1_s - y1_f - dy1_f) + cosAB * moduleA * (1/moduleB) * (y2_f + dy2_f - y2_s - dy2_s);
    const g_ = (-x1_s - dx1_s + x1_f + dx1_f) - cosAB * moduleA * (1/moduleB) * (x2_f + dx2_f - x2_s - dx2_s);
    const h_ = (-y1_s - dy1_s + y1_f + dy1_f) - cosAB * moduleA * (1/moduleB) * (y2_f + dy2_f - y2_s - dy2_s);


    F_Local[0] = (x1_f + dx1_f - x1_s - dx1_s)*(x2_f + dx2_f - x2_s - dx2_s) 
        + (y1_f + dy1_f - y1_s - dy1_s)*(y2_f + dy2_f - y2_s - dy2_s)
        - cosAB * moduleA * moduleB;
    F_Local[1] = lambda * a_;
    F_Local[2] = lambda * b_;
    F_Local[3] = lambda * c_;
    F_Local[4] = lambda * d_;
    F_Local[5] = lambda * e_;
    F_Local[6] = lambda * f_;
    F_Local[7] = lambda * g_;
    F_Local[8] = lambda * h_;

    JacobianLocal[0][1] = a_;
    JacobianLocal[0][2] = b_;
    JacobianLocal[0][3] = c_;
    JacobianLocal[0][4] = d_;
    JacobianLocal[0][5] = e_;
    JacobianLocal[0][6] = f_;
    JacobianLocal[0][7] = g_
    JacobianLocal[0][8] = h_;

    JacobianLocal[1][0] = a_;
    JacobianLocal[1][1] = lambda * (cosAB * moduleB * (-1/Math.pow(moduleA, 3)) * L_X1 * (-1) * L_X1 + cosAB * moduleB * (1/moduleA) * (-1));
    JacobianLocal[1][2] = lambda * (cosAB * moduleB * (-1/Math.pow(moduleA, 3)) * L_Y1 * (-1) * L_X1);
    JacobianLocal[1][3] = lambda * (cosAB * moduleB * (-1/Math.pow(moduleA, 3)) * L_X1 * L_X1 + cosAB * moduleB * (1/moduleA));
    JacobianLocal[1][4] = lambda * (cosAB * moduleB * (-1/Math.pow(moduleA, 3)) * L_Y1 * L_X1);
    JacobianLocal[1][5] = lambda * (1 + cosAB * (1/moduleA) * L_X1 * (1/moduleB) * L_X2 * (-1));
    JacobianLocal[1][6] = lambda * (0 + cosAB * (1/moduleA) * L_X1 * (1/moduleB) * L_Y2 * (-1));
    JacobianLocal[1][7] = lambda * (-1 + cosAB * (1/moduleA) * L_X1 * (1/moduleB) * L_X2);
    JacobianLocal[1][8] = lambda * (0 + cosAB * (1/moduleA) * L_X1 * (1/moduleB) * L_Y2);
    
    JacobianLocal[2][0] = b_;
    JacobianLocal[2][1] = lambda * (cosAB * moduleB * (-1/Math.pow(moduleA, 3)) * L_X1 * (-1) * L_Y1);
    JacobianLocal[2][2] = lambda * (cosAB * moduleB * (-1/Math.pow(moduleA, 3)) * L_Y1 * (-1) * L_Y1 + cosAB * moduleB * (1/moduleA) * (-1));
    JacobianLocal[2][3] = lambda * (cosAB * moduleB * (-1/Math.pow(moduleA, 3)) * L_X1 * L_Y1);
    JacobianLocal[2][4] = lambda * (cosAB * moduleB * (-1/Math.pow(moduleA, 3)) * L_Y1 * L_Y1 + cosAB * moduleB * (1/moduleA));
    JacobianLocal[2][5] = lambda * (0 + cosAB * (1/moduleA) * L_Y1 * (1/moduleB) * L_X2 * (-1));
    JacobianLocal[2][6] = lambda * (1 + cosAB * (1/moduleA) * L_Y1 * (1/moduleB) * L_Y2 * (-1));
    JacobianLocal[2][7] = lambda * (0 + cosAB * (1/moduleA) * L_Y1 * (1/moduleB) * L_X2);
    JacobianLocal[2][8] = lambda * (-1 + cosAB * (1/moduleA) * L_Y1 * (1/moduleB) * L_Y2);

    JacobianLocal[3][0] = c_;
    JacobianLocal[3][1] = lambda * (-cosAB * moduleB * (-1/Math.pow(moduleA, 3)) * L_X1 * (-1) * L_X1 - cosAB * moduleB * (1/moduleA) * (-1));
    JacobianLocal[3][2] = lambda * (-cosAB * moduleB * (-1/Math.pow(moduleA, 3)) * L_Y1 * (-1) * L_X1);
    JacobianLocal[3][3] = lambda * (-cosAB * moduleB * (-1/Math.pow(moduleA, 3)) * L_X1 * L_X1 - cosAB * moduleB * (1/moduleA));
    JacobianLocal[3][4] = lambda * (-cosAB * moduleB * (-1/Math.pow(moduleA, 3)) * L_Y1 * L_X1);
    JacobianLocal[3][5] = lambda * (-1 - cosAB * (1/moduleA) * L_X1 * (1/moduleB) * L_X2 * (-1));
    JacobianLocal[3][6] = lambda * (0 - cosAB * (1/moduleA) * L_X1 * (1/moduleB) * L_Y2 * (-1));;
    JacobianLocal[3][7] = lambda * (1 - cosAB * (1/moduleA) * L_X1 * (1/moduleB) * L_X2);
    JacobianLocal[3][8] = lambda * (0 - cosAB * (1/moduleA) * L_X1 * (1/moduleB) * L_Y2);
    
    JacobianLocal[4][0] = d_;
    JacobianLocal[4][1] = lambda * (-cosAB * moduleB * (-1/Math.pow(moduleA, 3)) * L_X1 * (-1) * L_Y1);
    JacobianLocal[4][2] = lambda * (-cosAB * moduleB * (-1/Math.pow(moduleA, 3)) * L_Y1 * (-1) * L_Y1 - cosAB * moduleB * (1/moduleA) * (-1));
    JacobianLocal[4][3] = lambda * (-cosAB * moduleB * (-1/Math.pow(moduleA, 3)) * L_X1 * L_Y1);
    JacobianLocal[4][4] = lambda * (-cosAB * moduleB * (-1/Math.pow(moduleA, 3)) * L_Y1 * L_Y1 - cosAB * moduleB * (1/moduleA));
    JacobianLocal[4][5] = lambda * (0 - cosAB * (1/moduleA) * L_Y1 * (1/moduleB) * L_X2 * (-1));
    JacobianLocal[4][6] = lambda * (-1 - cosAB * (1/moduleA) * L_Y1 * (1/moduleB) * L_Y2 * (-1));
    JacobianLocal[4][7] = lambda * (0 - cosAB * (1/moduleA) * L_Y1 * (1/moduleB) * L_X2);
    JacobianLocal[4][8] = lambda * (1 - cosAB * (1/moduleA) * L_Y1 * (1/moduleB) * L_Y2);
    
    JacobianLocal[5][0] = e_;
    JacobianLocal[5][1] = lambda * (1 + cosAB * (1/moduleB) * L_X2 * (1/moduleA) * L_X1 * (-1));
    JacobianLocal[5][2] = lambda * (0 + cosAB * (1/moduleB) * L_X2 * (1/moduleA) * L_Y1 * (-1));
    JacobianLocal[5][3] = lambda * (-1 + cosAB * (1/moduleB) * L_X2 * (1/moduleA) * L_X1);
    JacobianLocal[5][4] = lambda * (0 + cosAB * (1/moduleB) * L_X2 * (1/moduleA) * L_Y1);
    JacobianLocal[5][5] = lambda * (cosAB * moduleA * (-1/Math.pow(moduleB, 3)) * L_X2 * (-1) * L_X2 + cosAB * moduleA * (1/moduleB) * (-1));
    JacobianLocal[5][6] = lambda * (cosAB * moduleA * (-1/Math.pow(moduleB, 3)) * L_Y2 * (-1) * L_X2);
    JacobianLocal[5][7] = lambda * (cosAB * moduleA * (-1/Math.pow(moduleB, 3)) * L_X2 * L_X2 + cosAB * moduleA * (1/moduleB));
    JacobianLocal[5][8] = lambda * (cosAB * moduleA * (-1/Math.pow(moduleB, 3)) * L_Y2 * L_X2);
    
    JacobianLocal[6][0] = f_;
    JacobianLocal[6][1] = lambda * (0 + cosAB * (1/moduleB) * L_Y2 * (1/moduleA) * L_X1 * (-1));
    JacobianLocal[6][2] = lambda * (1 + cosAB * (1/moduleB) * L_Y2 * (1/moduleA) * L_Y1 * (-1));
    JacobianLocal[6][3] = lambda * (0 + cosAB * (1/moduleB) * L_Y2 * (1/moduleA) * L_X1);
    JacobianLocal[6][4] = lambda * (-1 + cosAB * (1/moduleB) * L_Y2 * (1/moduleA) * L_Y1);
    JacobianLocal[6][5] = lambda * (cosAB * moduleA * (-1/Math.pow(moduleB, 3)) * L_X2 * (-1) * L_Y2)
    JacobianLocal[6][6] = lambda * (cosAB * moduleA * (-1/Math.pow(moduleB, 3)) * L_Y2 * (-1) * L_Y2 + cosAB * moduleA * (1/moduleB) * (-1));
    JacobianLocal[6][7] = lambda * (cosAB * moduleA * (-1/Math.pow(moduleB, 3)) * L_X2 * L_Y2)
    JacobianLocal[6][8] = lambda * (cosAB * moduleA * (-1/Math.pow(moduleB, 3)) * L_Y2 * L_Y2 + cosAB * moduleA * (1/moduleB));

    JacobianLocal[7][0] = g_;
    JacobianLocal[7][1] = lambda * (-1 - cosAB * (1/moduleB) * L_X2 * (1/moduleA) * L_X1 * (-1));
    JacobianLocal[7][2] = lambda * (0 - cosAB * (1/moduleB) * L_X2 * (1/moduleA) * L_Y1 * (-1));
    JacobianLocal[7][3] = lambda * (1 - cosAB * (1/moduleB) * L_X2 * (1/moduleA) * L_X1);
    JacobianLocal[7][4] = lambda * (0 - cosAB * (1/moduleB) * L_X2 * (1/moduleA) * L_Y1);
    JacobianLocal[7][5] = lambda * (-cosAB * moduleA * (-1/Math.pow(moduleB, 3)) * L_X2 * (-1) * L_X2 - cosAB * moduleA * (1/moduleB) * (-1));
    JacobianLocal[7][6] = lambda * (-cosAB * moduleA * (-1/Math.pow(moduleB, 3)) * L_Y2 * (-1) * L_X2);
    JacobianLocal[7][7] = lambda * (-cosAB * moduleA * (-1/Math.pow(moduleB, 3)) * L_X2 * L_X2 - cosAB * moduleA * (1/moduleB));
    JacobianLocal[7][8] = lambda * (-cosAB * moduleA * (-1/Math.pow(moduleB, 3)) * L_Y2 * L_X2);

    JacobianLocal[8][0] = h_;
    JacobianLocal[8][1] = lambda * (0 - cosAB * (1/moduleB) * L_Y2 * (1/moduleA) * L_X1 * (-1));
    JacobianLocal[8][2] = lambda * (-1 - cosAB * (1/moduleB) * L_Y2 * (1/moduleA) * L_Y1 * (-1));
    JacobianLocal[8][3] = lambda * (0 - cosAB * (1/moduleB) * L_Y2 * (1/moduleA) * L_X1);
    JacobianLocal[8][4] = lambda * (1 - cosAB * (1/moduleB) * L_Y2 * (1/moduleA) * L_Y1);
    JacobianLocal[8][5] = lambda * (-cosAB * moduleA * (-1/Math.pow(moduleB, 3)) * L_X2 * (-1) * L_Y2)
    JacobianLocal[8][6] = lambda * (-cosAB * moduleA * (-1/Math.pow(moduleB, 3)) * L_Y2 * (-1) * L_Y2 - cosAB * moduleA * (1/moduleB) * (-1));
    JacobianLocal[8][7] = lambda * (-cosAB * moduleA * (-1/Math.pow(moduleB, 3)) * L_X2 * L_Y2)
    JacobianLocal[8][8] = lambda * (-cosAB * moduleA * (-1/Math.pow(moduleB, 3)) * L_Y2 * L_Y2 - cosAB * moduleA * (1/moduleB));

    return({axisLocal, JacobianLocal, F_Local, dim, localToGlobal});
}


/**
 * Function for EqualLines constraint. 
 * This function fill local matrix J and vector F.
 * 
 * @param {Constraint} constraint 
 * @returns {Object} Object with axis names, local Jacobian and local vector F
 */
function getDerivativeFunction_EqualLines(constraint, unknowns, axisGlobal) {
    const dim = 9;

    const axisLocal = [];
    axisLocal.push('lambda_' + constraint.id);
    for (let i = 0; i < 2; i++) {
        axisLocal.push('dx_' + constraint.lines[i][0].id);
        axisLocal.push('dy_' + constraint.lines[i][0].id);
        axisLocal.push('dx_' + constraint.lines[i][1].id);
        axisLocal.push('dy_' + constraint.lines[i][1].id);
    }
    const localToGlobal = new Array(dim);
    for (let i = 0; i < dim; i++) {
        localToGlobal[i] = axisGlobal.indexOf(axisLocal[i]);
    }

    const JacobianLocal = new Array(dim);
    const F_Local = new Array(dim);
    for (let i = 0; i < dim; i++) {
        F_Local[i] = 0;
        JacobianLocal[i] = new Array(dim);
        for (let j = 0; j < dim; j++) {
            JacobianLocal[i][j] = 0;
        }
    }

    const line1 = constraint.lines[0];
    const line2 = constraint.lines[1];
    
    const x1_s = line1[0].x;
    const y1_s = line1[0].y;
    const x1_f = line1[1].x;
    const y1_f = line1[1].y
    const x2_s = line2[0].x;
    const y2_s = line2[0].y;
    const x2_f = line2[1].x;
    const y2_f = line2[1].y;
    
    const lambda = unknowns[localToGlobal[0]];
    const dx1_s = unknowns[localToGlobal[1]];
    const dy1_s = unknowns[localToGlobal[2]];
    const dx1_f = unknowns[localToGlobal[3]];
    const dy1_f = unknowns[localToGlobal[4]];
    const dx2_s = unknowns[localToGlobal[5]];
    const dy2_s = unknowns[localToGlobal[6]];
    const dx2_f = unknowns[localToGlobal[7]];
    const dy2_f = unknowns[localToGlobal[8]];
    
    F_Local[0] = Math.pow((x1_f+dx1_f - x1_s-dx1_s), 2) + Math.pow((y1_f+dy1_f - y1_s-dy1_s), 2)
            - Math.pow((x2_f+dx2_f - x2_s-dx2_s), 2) - Math.pow((y2_f+dy2_f - y2_s - dy2_s), 2); 
    F_Local[1] = -2 * lambda * (x1_f+dx1_f - x1_s-dx1_s);
    F_Local[2] = -2 * lambda * (y1_f+dy1_f - y1_s-dy1_s);
    F_Local[3] = 2 * lambda * (x1_f+dx1_f - x1_s-dx1_s);
    F_Local[4] = 2 * lambda * (y1_f+dy1_f - y1_s-dy1_s);
    F_Local[5] = 2 * lambda * (x2_f+dx2_f - x2_s-dx2_s);
    F_Local[6] = 2 * lambda * (y2_f+dy2_f - y2_s - dy2_s);
    F_Local[7] = -2 * lambda * (x2_f+dx2_f - x2_s-dx2_s);
    F_Local[8] = -2 * lambda * (y2_f+dy2_f - y2_s - dy2_s);

    JacobianLocal[0][0] = 0; // 0
    JacobianLocal[0][1] = -2 * (x1_f + dx1_f - x1_s - dx1_s);
    JacobianLocal[0][2] = -2 * (y1_f + dy1_f - y1_s - dy1_s);
    JacobianLocal[0][3] = 2 * (x1_f + dx1_f - x1_s - dx1_s);
    JacobianLocal[0][4] = 2 * (y1_f + dy1_f - y1_s - dy1_s);
    JacobianLocal[0][5] = 2 * (x2_f + dx2_f - x2_s - dx2_s);
    JacobianLocal[0][6] = 2 * (y2_f + dy2_f - y2_s - dy2_s);
    JacobianLocal[0][7] = -2 * (x2_f + dx2_f - x2_s - dx2_s);
    JacobianLocal[0][8] = -2 * (y2_f + dy2_f - y2_s - dy2_s);

    JacobianLocal[1][0] = -2 * (x1_f + dx1_f - x1_s - dx1_s);
    JacobianLocal[1][1] = 2 * lambda;
    JacobianLocal[1][3] = -2 * lambda;

    JacobianLocal[2][0] = -2 * (y1_f + dy1_f - y1_s - dy1_s);
    JacobianLocal[2][2] = 2 * lambda;
    JacobianLocal[2][4] = -2 * lambda;

    JacobianLocal[3][0] = 2 * (x1_f + dx1_f - x1_s - dx1_s);
    JacobianLocal[3][1] = -2 * lambda;
    JacobianLocal[3][3] = 2 * lambda;

    JacobianLocal[4][0] = 2 * (y1_f + dy1_f - y1_s - dy1_s);
    JacobianLocal[4][2] = -2 * lambda;
    JacobianLocal[4][4] = 2 * lambda;

    JacobianLocal[5][0] = 2 * (x2_f + dx2_f - x2_s - dx2_s);
    JacobianLocal[5][5] = -2 * lambda;
    JacobianLocal[5][7] = 2 * lambda;

    JacobianLocal[6][0] = 2 * (y2_f + dy2_f - y2_s - dy2_s);
    JacobianLocal[6][6] = -2 * lambda;
    JacobianLocal[6][8] = 2 * lambda;

    JacobianLocal[7][0] = -2 * (x2_f + dx2_f - x2_s - dx2_s);
    JacobianLocal[7][5] = 2 * lambda;
    JacobianLocal[7][7] = -2 * lambda;

    JacobianLocal[8][0] = -2 * (y2_f + dy2_f - y2_s - dy2_s);
    JacobianLocal[8][6] = 2 * lambda;
    JacobianLocal[8][8] = -2 * lambda;

    return({axisLocal, JacobianLocal, F_Local, dim, localToGlobal});
}

/**
 * Function for ArcLength constraint. 
 * This function fill local matrix J and vector F.
 * 
 * @param {Constraint} constraint 
 * @returns {Object} Object with axis names, local Jacobian and local vector F
 */
function getDerivativeFunction_ArcLength(constraint, unknowns, axisGlobal) {
    const arc = constraint.elements[0];
    const p0 = arc.p0;
    const p1 = arc.p1;
    const p2 = arc.p2;
    
    const dim = 7;
    const axisLocal = [];
    axisLocal.push('lambda_' + constraint.id);
    axisLocal.push('dx_' + p0.id);
    axisLocal.push('dy_' + p0.id);
    axisLocal.push('dx_' + p1.id);
    axisLocal.push('dy_' + p1.id);
    axisLocal.push('dx_' + p2.id);
    axisLocal.push('dy_' + p2.id);

    const localToGlobal = new Array(dim);
    for (let i = 0; i < dim; i++) {
        localToGlobal[i] = axisGlobal.indexOf(axisLocal[i]);
    }

    const JacobianLocal = new Array(dim);
    const F_Local = new Array(dim);
    for (let i = 0; i < dim; i++) {
        F_Local[i] = 0;
        JacobianLocal[i] = new Array(dim);
        for (let j = 0; j < dim; j++) {
            JacobianLocal[i][j] = 0;
        }
    }

    const L = constraint.value

    const x0 = p0.x;
    const y0 = p0.y;
    const x1 = p1.x;
    const y1 = p1.y;
    const x2 = p2.x;
    const y2 = p2.y;

    const lambda = unknowns[localToGlobal[0]];
    const dx0 = unknowns[localToGlobal[1]];
    const dy0 = unknowns[localToGlobal[2]];
    const dx1 = unknowns[localToGlobal[3]];
    const dy1 = unknowns[localToGlobal[4]];
    const dx2 = unknowns[localToGlobal[5]];
    const dy2 = unknowns[localToGlobal[6]];


    const v11 = (y1 + dy1 >= y0 + dy0) ? 0 : (2 * Math.PI);
    const v12 = (y1 + dy1 >= y0 + dy0) ? 1 : -1;
    const v21 = (y2 + dy2 >= y0 + dy0) ? 0 : (2 * Math.PI);
    const v22 = (y2 + dy2 >= y0 + dy0) ? 1 : -1;
    // "fi_i + dfi_i"
    const fi1_dfi1 = v11 + v12 * Math.acos((x1 + dx1 - x0 - dx0)/Math.sqrt(Math.pow((x1 + dx1 - x0 - dx0), 2) + Math.pow((y1 + dy1 - y0 - dy0), 2)));
    const fi2_dfi2 = v21 + v22 * Math.acos((x2 + dx2 - x0 - dx0)/Math.sqrt(Math.pow((x2 + dx2 - x0 - dx0), 2) + Math.pow((y2 + dy2 - y0 - dy0), 2)));
    const v3 = (fi2_dfi2 >= fi1_dfi1) ? 0 : (2 * Math.PI); 

    F_Local[0] = Math.sqrt(Math.pow((x1+dx1-x0-dx0),2)+Math.pow((y1+dy1-y0-dy0),2)) * (v3 + (v21 + v22*Math.acos((x2+dx2-x0-dx0)/Math.sqrt(Math.pow((x2+dx2-x0-dx0),2)+Math.pow((y2+dy2-y0-dy0),2)))) - (v11 + v12*Math.acos((x1+dx1-x0-dx0)/Math.sqrt(Math.pow((x1+dx1-x0-dx0),2)+Math.pow((y1+dy1-y0-dy0),2))))) - L;
    F_Local[1] = -lambda*(((v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2) - (v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2))*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2)))))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)));
    F_Local[2] = lambda*(((v12*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (v22*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) + ((2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2)))))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)));
    F_Local[3] = -lambda*(((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2)))))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)) - (v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)))*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2));
    F_Local[4] = -lambda*(((2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2)))))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)) + (v12*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))));
    F_Local[5] = -(lambda*v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2);
    F_Local[6] = (lambda*v22*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2));

    JacobianLocal[0][0] = 0; // 0
    JacobianLocal[0][1] = ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2)))))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)) - ((v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2) - (v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2))*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2);
    JacobianLocal[0][2] = ((v12*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (v22*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) + ((2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2)))))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2));
    JacobianLocal[0][3] = (v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)))*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2)))))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2));
    JacobianLocal[0][4] = - ((2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2)))))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)) - (v12*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)));
    JacobianLocal[0][5] = -(v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2);
    JacobianLocal[0][6] = (v22*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2));

    JacobianLocal[1][0] = ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2)))))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)) - ((v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2) - (v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2))*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2);
    JacobianLocal[1][1] = lambda*((v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2))))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) + Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*((v12*((2*dx0 - 2*dx1 + 2*x0 - 2*x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2) + (dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2) - (3*Math.pow((2*dx0 - 2*dx1 + 2*x0 - 2*x1),2)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),5/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2) - (v22*((2*dx0 - 2*dx2 + 2*x0 - 2*x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2) + (dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2) - (3*Math.pow((2*dx0 - 2*dx2 + 2*x0 - 2*x2),2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2) - (v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)))*((2*dx0 - 2*dx1 + 2*x0 - 2*x1)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*Math.pow((dx0 - dx1 + x0 - x1),2))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),2)))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)) + (v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*((2*dx0 - 2*dx2 + 2*x0 - 2*x2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*Math.pow((dx0 - dx2 + x0 - x2),2))/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),2)))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2))) - (((v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2) - (v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2))*(2*dx0 - 2*dx1 + 2*x0 - 2*x1))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - (Math.pow((2*dx0 - 2*dx1 + 2*x0 - 2*x1),2)*(v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2)))))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)));
    JacobianLocal[1][2] = lambda*(Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*((v12*((2*dy0 - 2*dy1 + 2*y0 - 2*y1)/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (3*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),5/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2) - (v22*((2*dy0 - 2*dy2 + 2*y0 - 2*y2)/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)) - (3*(2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2) + (v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*Math.pow((dx0 - dx1 + x0 - x1),2))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),2)) - (v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*Math.pow((dx0 - dx2 + x0 - x2),2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),2))) - (((v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2) - (v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)) + (((v12*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (v22*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*(2*dx0 - 2*dx1 + 2*x0 - 2*x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2)))))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)));
    JacobianLocal[1][3] = lambda*((((v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2) - (v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2))*(2*dx0 - 2*dx1 + 2*x0 - 2*x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)) - ((v12*((2*dx0 - 2*dx1 + 2*x0 - 2*x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2) + (dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2) - (3*Math.pow((2*dx0 - 2*dx1 + 2*x0 - 2*x1),2)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),5/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2) - (v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)))*((2*dx0 - 2*dx1 + 2*x0 - 2*x1)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*Math.pow((dx0 - dx1 + x0 - x1),2))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),2)))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)))*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - (v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2))))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) + (Math.pow((2*dx0 - 2*dx1 + 2*x0 - 2*x1),2)*(v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2)))))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) + (v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)))*(2*dx0 - 2*dx1 + 2*x0 - 2*x1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)));
    JacobianLocal[1][4] = -lambda*(((v12*((2*dy0 - 2*dy1 + 2*y0 - 2*y1)/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (3*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),5/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2) + (v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*Math.pow((dx0 - dx1 + x0 - x1),2))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),2)))*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - (((v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2) - (v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2)))))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) + (v12*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),2)));
    JacobianLocal[1][5] = lambda*(((v22*((2*dx0 - 2*dx2 + 2*x0 - 2*x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2) + (dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2) - (3*Math.pow((2*dx0 - 2*dx2 + 2*x0 - 2*x2),2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2) - (v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*((2*dx0 - 2*dx2 + 2*x0 - 2*x2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*Math.pow((dx0 - dx2 + x0 - x2),2))/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),2)))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2)))*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - (v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*(2*dx0 - 2*dx1 + 2*x0 - 2*x1))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)));
    JacobianLocal[1][6] = lambda*(((v22*((2*dy0 - 2*dy2 + 2*y0 - 2*y2)/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)) - (3*(2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2) + (v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*Math.pow((dx0 - dx2 + x0 - x2),2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),2)))*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) + (v22*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)));

    JacobianLocal[2][0] = ((v12*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (v22*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) + ((2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2)))))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2));
    JacobianLocal[2][1] = lambda*(Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*((v12*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (v22*(2*dy0 - 2*dy2 + 2*y0 - 2*y2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)) - (3*v12*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),5/2)) + (3*v22*(2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2)) + (v12*((2*dx0 - 2*dx1 + 2*x0 - 2*x1)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*Math.pow((dx0 - dx1 + x0 - x1),2))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),2))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (v22*((2*dx0 - 2*dx2 + 2*x0 - 2*x2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*Math.pow((dx0 - dx2 + x0 - x2),2))/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),2))*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2))) - (((v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2) - (v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)) + (((v12*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (v22*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*(2*dx0 - 2*dx1 + 2*x0 - 2*x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2)))))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)));
    JacobianLocal[2][2] = lambda*((v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2))))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) + Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*((v12*(dx0 - dx1 + x0 - x1))/(Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (v22*(dx0 - dx2 + x0 - x2))/(Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)) - (3*v12*Math.pow((2*dy0 - 2*dy1 + 2*y0 - 2*y1),2)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),5/2)) + (3*v22*Math.pow((2*dy0 - 2*dy2 + 2*y0 - 2*y2),2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2)) - (v12*Math.pow((2*dy0 - 2*dy1 + 2*y0 - 2*y1),2)*Math.pow((dx0 - dx1 + x0 - x1),3))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),7/2)) + (v22*Math.pow((2*dy0 - 2*dy2 + 2*y0 - 2*y2),2)*Math.pow((dx0 - dx2 + x0 - x2),3))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),7/2))) + (((v12*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (v22*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - (Math.pow((2*dy0 - 2*dy1 + 2*y0 - 2*y1),2)*(v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2)))))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)));
    JacobianLocal[2][3] = -lambda*(Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*((v12*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (3*v12*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),5/2)) + (v12*((2*dx0 - 2*dx1 + 2*x0 - 2*x1)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*Math.pow((dx0 - dx1 + x0 - x1),2))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),2))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2))) + (((v12*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (v22*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*(2*dx0 - 2*dx1 + 2*x0 - 2*x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2)))))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)));
    JacobianLocal[2][4] = -lambda*((v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2))))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*((3*v12*Math.pow((2*dy0 - 2*dy1 + 2*y0 - 2*y1),2)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),5/2)) - (v12*(dx0 - dx1 + x0 - x1))/(Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) + (v12*Math.pow((2*dy0 - 2*dy1 + 2*y0 - 2*y1),2)*Math.pow((dx0 - dx1 + x0 - x1),3))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),7/2))) + (((v12*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (v22*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)) - (Math.pow((2*dy0 - 2*dy1 + 2*y0 - 2*y1),2)*(v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2)))))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) + (v12*Math.pow((2*dy0 - 2*dy1 + 2*y0 - 2*y1),2)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),2)));
    JacobianLocal[2][5] = lambda*(Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*((v22*(2*dy0 - 2*dy2 + 2*y0 - 2*y2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)) - (3*v22*(2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2)) + (v22*((2*dx0 - 2*dx2 + 2*x0 - 2*x2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*Math.pow((dx0 - dx2 + x0 - x2),2))/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),2))*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2))) - (v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)));
    JacobianLocal[2][6] = -lambda*(Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*((3*v22*Math.pow((2*dy0 - 2*dy2 + 2*y0 - 2*y2),2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2)) - (v22*(dx0 - dx2 + x0 - x2))/(Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)) + (v22*Math.pow((2*dy0 - 2*dy2 + 2*y0 - 2*y2),2)*Math.pow((dx0 - dx2 + x0 - x2),3))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),7/2))) - (v22*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)));

    JacobianLocal[3][0] = (v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)))*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2)))))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2));
    JacobianLocal[3][1] = lambda*((((v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2) - (v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2))*(2*dx0 - 2*dx1 + 2*x0 - 2*x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)) - (v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2))))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) + (Math.pow((2*dx0 - 2*dx1 + 2*x0 - 2*x1),2)*(v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2)))))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (v12*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*((2*dx0 - 2*dx1 + 2*x0 - 2*x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2) + (dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2) - (3*Math.pow((2*dx0 - 2*dx1 + 2*x0 - 2*x1),2)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),5/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2) + (v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)))*(2*dx0 - 2*dx1 + 2*x0 - 2*x1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)) + (v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)))*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*((2*dx0 - 2*dx1 + 2*x0 - 2*x1)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*Math.pow((dx0 - dx1 + x0 - x1),2))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),2)))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)));
    JacobianLocal[3][2] = -lambda*((((v12*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (v22*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*(2*dx0 - 2*dx1 + 2*x0 - 2*x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2)))))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) + (v12*((2*dy0 - 2*dy1 + 2*y0 - 2*y1)/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (3*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),5/2)))*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2) - (v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)) + (v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*Math.pow((dx0 - dx1 + x0 - x1),2))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)));
    JacobianLocal[3][3] = -lambda*((Math.pow((2*dx0 - 2*dx1 + 2*x0 - 2*x1),2)*(v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2)))))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2))))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - (v12*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*((2*dx0 - 2*dx1 + 2*x0 - 2*x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2) + (dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2) - (3*Math.pow((2*dx0 - 2*dx1 + 2*x0 - 2*x1),2)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),5/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2) + (v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)))*(2*dx0 - 2*dx1 + 2*x0 - 2*x1))/(Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)) + (v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)))*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*((2*dx0 - 2*dx1 + 2*x0 - 2*x1)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*Math.pow((dx0 - dx1 + x0 - x1),2))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),2)))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)));
    JacobianLocal[3][4] = lambda*((v12*((2*dy0 - 2*dy1 + 2*y0 - 2*y1)/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (3*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),5/2)))*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2)))))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)) + (v12*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),2)) + (v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*Math.pow((dx0 - dx1 + x0 - x1),2))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)));
    JacobianLocal[3][5] = (lambda*v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*(2*dx0 - 2*dx1 + 2*x0 - 2*x1))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2));
    JacobianLocal[3][6] = -(lambda*v22*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2));

    JacobianLocal[4][0] = - ((2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2)))))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)) - (v12*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)));
    JacobianLocal[4][1] = lambda*((((v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2) - (v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)) - (v12*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))) + ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2)))))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) + (v12*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),2)) - (v12*((2*dx0 - 2*dx1 + 2*x0 - 2*x1)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*Math.pow((dx0 - dx1 + x0 - x1),2))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),2))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)*(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))));
    JacobianLocal[4][2] = -lambda*((v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2))))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) + (((v12*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (v22*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)) - (Math.pow((2*dy0 - 2*dy1 + 2*y0 - 2*y1),2)*(v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2)))))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) + (v12*(dx0 - dx1 + x0 - x1))/(Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))) - (v12*Math.pow((2*dy0 - 2*dy1 + 2*y0 - 2*y1),2)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),2)) - (v12*Math.pow((2*dy0 - 2*dy1 + 2*y0 - 2*y1),2)*Math.pow((dx0 - dx1 + x0 - x1),3))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3)));
    JacobianLocal[4][3] = -lambda*(((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2)))))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (v12*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))) + (v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)) + (v12*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),2)) - (v12*((2*dx0 - 2*dx1 + 2*x0 - 2*x1)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*Math.pow((dx0 - dx1 + x0 - x1),2))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),2))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)*(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))));
    JacobianLocal[4][4] = -lambda*((Math.pow((2*dy0 - 2*dy1 + 2*y0 - 2*y1),2)*(v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2)))))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (v3 - v11 + v21 - v12*(Math.PI - Math.acos((dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))) + v22*(Math.PI - Math.acos((dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2))))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - (v12*(dx0 - dx1 + x0 - x1))/(Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))) + (v12*Math.pow((2*dy0 - 2*dy1 + 2*y0 - 2*y1),2)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),2)) + (v12*Math.pow((2*dy0 - 2*dy1 + 2*y0 - 2*y1),2)*Math.pow((dx0 - dx1 + x0 - x1),3))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3)));
    JacobianLocal[4][5] = (lambda*v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2));
    JacobianLocal[4][6] = -(lambda*v22*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2));

    JacobianLocal[5][0] = -(v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2);
    JacobianLocal[5][1] = (lambda*v22*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*((2*dx0 - 2*dx2 + 2*x0 - 2*x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2) + (dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2) - (3*Math.pow((2*dx0 - 2*dx2 + 2*x0 - 2*x2),2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2) - (lambda*v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*(2*dx0 - 2*dx1 + 2*x0 - 2*x1))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)) - (lambda*v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*((2*dx0 - 2*dx2 + 2*x0 - 2*x2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*Math.pow((dx0 - dx2 + x0 - x2),2))/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),2)))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2));
    JacobianLocal[5][2] = (lambda*v22*((2*dy0 - 2*dy2 + 2*y0 - 2*y2)/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)) - (3*(2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2)))*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2) - (lambda*v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)) + (lambda*v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*Math.pow((dx0 - dx2 + x0 - x2),2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),2));
    JacobianLocal[5][3] = (lambda*v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*(2*dx0 - 2*dx1 + 2*x0 - 2*x1))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2));
    JacobianLocal[5][4] = (lambda*v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2));
    JacobianLocal[5][5] = (lambda*v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*((2*dx0 - 2*dx2 + 2*x0 - 2*x2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*Math.pow((dx0 - dx2 + x0 - x2),2))/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),2)))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2)) - (lambda*v22*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*((2*dx0 - 2*dx2 + 2*x0 - 2*x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2) + (dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2) - (3*Math.pow((2*dx0 - 2*dx2 + 2*x0 - 2*x2),2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2);
    JacobianLocal[5][6] = - (lambda*v22*((2*dy0 - 2*dy2 + 2*y0 - 2*y2)/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)) - (3*(2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2)))*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2) - (lambda*v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*Math.pow((dx0 - dx2 + x0 - x2),2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),2));
    
    JacobianLocal[6][0] = (v22*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2));
    JacobianLocal[6][1] = (lambda*v22*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)) + (lambda*v22*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)) - (3*lambda*v22*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2)) + (lambda*v22*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*((2*dx0 - 2*dx2 + 2*x0 - 2*x2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*Math.pow((dx0 - dx2 + x0 - x2),2))/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),2))*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2));
    JacobianLocal[6][2] = (lambda*v22*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(dx0 - dx2 + x0 - x2))/(Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)) - (lambda*v22*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((2*dy0 - 2*dy2 + 2*y0 - 2*y2),2)*Math.pow((dx0 - dx2 + x0 - x2),3))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),7/2)) - (3*lambda*v22*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((2*dy0 - 2*dy2 + 2*y0 - 2*y2),2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2)) + (lambda*v22*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2));
    JacobianLocal[6][3] = -(lambda*v22*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2));
    JacobianLocal[6][4] = -(lambda*v22*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2));
    JacobianLocal[6][5] = (3*lambda*v22*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2)) - (lambda*v22*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)) - (lambda*v22*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*((2*dx0 - 2*dx2 + 2*x0 - 2*x2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*Math.pow((dx0 - dx2 + x0 - x2),2))/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),2))*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2));
    JacobianLocal[6][6] = (lambda*v22*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((2*dy0 - 2*dy2 + 2*y0 - 2*y2),2)*Math.pow((dx0 - dx2 + x0 - x2),3))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),7/2)) - (lambda*v22*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(dx0 - dx2 + x0 - x2))/(Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)) + (3*lambda*v22*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((2*dy0 - 2*dy2 + 2*y0 - 2*y2),2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2));
    
    return({axisLocal, JacobianLocal, F_Local, dim, localToGlobal});
}

/**
 * Function for ArcRadius constraint. 
 * This function fill local matrix J and vector F.
 * 
 * This function set radius as distance between p0 (arc center) and p1 (first point) points.
 * 
 * @param {Constraint} constraint 
 * @returns {Object} Object with axis names, local Jacobian and local vector F
 */
function getDerivativeFunction_ArcRadius(constraint, unknowns, axisGlobal) {
    const p0 = constraint.elements[0].p0;
    const p1 = constraint.elements[0].p1;
    
    const dim = 5;
    const axisLocal = [];
    axisLocal.push('lambda_' + constraint.id);
    axisLocal.push('dx_' + p0.id);
    axisLocal.push('dy_' + p0.id);
    axisLocal.push('dx_' + p1.id);
    axisLocal.push('dy_' + p1.id);

    const localToGlobal = new Array(dim);
    for (let i = 0; i < dim; i++) {
        localToGlobal[i] = axisGlobal.indexOf(axisLocal[i]);
    }

    const JacobianLocal = new Array(dim);
    const F_Local = new Array(dim);
    for (let i = 0; i < dim; i++) {
        F_Local[i] = 0;
        JacobianLocal[i] = new Array(dim);
        for (let j = 0; j < dim; j++) {
            JacobianLocal[i][j] = 0;
        }
    }

    const x1 = p0.x;
    const y1 = p0.y;
    const x2 = p1.x;
    const y2 = p1.y;

    const lambda = unknowns[localToGlobal[0]];
    const dx1 = unknowns[localToGlobal[1]];
    const dy1 = unknowns[localToGlobal[2]];
    const dx2 = unknowns[localToGlobal[3]];
    const dy2 = unknowns[localToGlobal[4]];

    const radius = constraint.value;

    JacobianLocal[0][0] = 0; // 0
    JacobianLocal[0][1] = -2 * (x2 + dx2 - x1 - dx1); // -2(x2+dx2-x1-dx1)
    JacobianLocal[0][2] = -2 * (y2 + dy2 - y1 - dy1); // -2(y2+dy2-y1-dy1)
    JacobianLocal[0][3] = 2 * (x2 + dx2 - x1 - dx1); // 2(x2+dx2-x1-dx1)
    JacobianLocal[0][4] = 2 * (y2 + dy2 - y1 - dy1); // 2(y2+dy2-y1-dy1)

    JacobianLocal[1][0] = -2 * (x2 + dx2 - x1 - dx1); // -2(x2+dx2-x1-dx1)
    JacobianLocal[1][1] = 2 * lambda; // +2 l
    JacobianLocal[1][2] = 0; // 0
    JacobianLocal[1][3] = -2 * lambda; // -2 l
    JacobianLocal[1][4] = 0; // 0

    JacobianLocal[2][0] = -2 * (y2 + dy2 - y1 - dy1); // -2(y2+dy2-y1-dy1)
    JacobianLocal[2][1] = 0; // 0
    JacobianLocal[2][2] = 2 * lambda; // +2 l
    JacobianLocal[2][3] = 0; //0
    JacobianLocal[2][4] = -2 * lambda; // -2 l

    JacobianLocal[3][0] = 2 * (x2 + dx2 - x1 - dx1); // 2(x2+dx2-x1-dx1)
    JacobianLocal[3][1] = -2 * lambda; // -2 l
    JacobianLocal[3][2] = 0; // 0
    JacobianLocal[3][3] = 2 * lambda; // +2 l
    JacobianLocal[3][4] = 0; // 0

    JacobianLocal[4][0] = 2 * (y2 + dy2 - y1 - dy1); // 2(y2+dy2-y1-dy1)
    JacobianLocal[4][1] = 0; // 0
    JacobianLocal[4][2] = -2 * lambda; // -2 l
    JacobianLocal[4][3] = 0; // 0
    JacobianLocal[4][4] = 2 * lambda;// +2 l

    F_Local[0] = Math.pow((x2+dx2 - x1-dx1), 2) + Math.pow((y2+dy2 - y1-dy1), 2) - radius * radius; 
    F_Local[1] = -2 * lambda * (x2+dx2 - x1-dx1);
    F_Local[2] = -2 * lambda * (y2+dy2 - y1-dy1);
    F_Local[3] = 2 * lambda * (x2+dx2 - x1-dx1);
    F_Local[4] = 2 * lambda * (y2+dy2 - y1-dy1);

    return({axisLocal, JacobianLocal, F_Local, dim, localToGlobal});
}

/**
 * Function for ArcAngle constraint. 
 * This function fill local matrix J and vector F.
 * 
 * @param {Constraint} constraint 
 * @returns {Object} Object with axis names, local Jacobian and local vector F
 */
function getDerivativeFunction_ArcAngle(constraint, unknowns, axisGlobal) {
    const arc = constraint.elements[0];
    const p0 = arc.p0;
    const p1 = arc.p1;
    const p2 = arc.p2;
    
    const dim = 7;
    const axisLocal = [];
    axisLocal.push('lambda_' + constraint.id);
    axisLocal.push('dx_' + p0.id);
    axisLocal.push('dy_' + p0.id);
    axisLocal.push('dx_' + p1.id);
    axisLocal.push('dy_' + p1.id);
    axisLocal.push('dx_' + p2.id);
    axisLocal.push('dy_' + p2.id);

    const localToGlobal = new Array(dim);
    for (let i = 0; i < dim; i++) {
        localToGlobal[i] = axisGlobal.indexOf(axisLocal[i]);
    }

    const JacobianLocal = new Array(dim);
    const F_Local = new Array(dim);
    for (let i = 0; i < dim; i++) {
        F_Local[i] = 0;
        JacobianLocal[i] = new Array(dim);
        for (let j = 0; j < dim; j++) {
            JacobianLocal[i][j] = 0;
        }
    }

    let angle = constraint.value
    if (arc.angleMode && arc.angleMode == 'DEG') {
        angle *= Math.PI / 180;
    }
    const alpha = angle;

    const x0 = p0.x;
    const y0 = p0.y;
    const x1 = p1.x;
    const y1 = p1.y;
    const x2 = p2.x;
    const y2 = p2.y;

    const lambda = unknowns[localToGlobal[0]];
    const dx0 = unknowns[localToGlobal[1]];
    const dy0 = unknowns[localToGlobal[2]];
    const dx1 = unknowns[localToGlobal[3]];
    const dy1 = unknowns[localToGlobal[4]];
    const dx2 = unknowns[localToGlobal[5]];
    const dy2 = unknowns[localToGlobal[6]];


    const v11 = (y1 + dy1 >= y0 + dy0) ? 0 : (2 * Math.PI);
    const v12 = (y1 + dy1 >= y0 + dy0) ? 1 : -1;
    const v21 = (y2 + dy2 >= y0 + dy0) ? 0 : (2 * Math.PI);
    const v22 = (y2 + dy2 >= y0 + dy0) ? 1 : -1;
    // "fi_i + dfi_i"
    const fi1_dfi1 = v11 + v12 * Math.acos((x1 + dx1 - x0 - dx0)/Math.sqrt(Math.pow((x1 + dx1 - x0 - dx0), 2) + Math.pow((y1 + dy1 - y0 - dy0), 2)));
    const fi2_dfi2 = v21 + v22 * Math.acos((x2 + dx2 - x0 - dx0)/Math.sqrt(Math.pow((x2 + dx2 - x0 - dx0), 2) + Math.pow((y2 + dy2 - y0 - dy0), 2)));
    const v3 = (fi2_dfi2 >= fi1_dfi1) ? 0 : (2 * Math.PI); 

    F_Local[0] = (v3 + (v21 + v22*Math.acos((x2+dx2-x0-dx0)/Math.sqrt(Math.pow((x2+dx2-x0-dx0), 2)+Math.pow((y2+dy2-y0-dy0), 2)))) - (v11 + v12*Math.acos((x1+dx1-x0-dx0)/Math.sqrt(Math.pow((x1+dx1-x0-dx0),2)+Math.pow((y1+dy1-y0-dy0), 2))))) - alpha;
    F_Local[1] = -lambda*((v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2) - (v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2));
    F_Local[2] = lambda*((v12*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (v22*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)));
    F_Local[3] = (lambda*v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2);
    F_Local[4] = -(lambda*v12*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2));
    F_Local[5] = -(lambda*v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2);
    F_Local[6] = (lambda*v22*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2));

    JacobianLocal[0][0] = 0; // 0
    JacobianLocal[0][1] = (v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2) - (v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2);
    JacobianLocal[0][2] = (v12*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (v22*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2));
    JacobianLocal[0][3] = (v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2);
    JacobianLocal[0][4] = -(v12*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2));
    JacobianLocal[0][5] = -(v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2);
    JacobianLocal[0][6] = (v22*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2));

    JacobianLocal[1][0] = (v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2) - (v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2);
    JacobianLocal[1][1] = lambda*((v12*((2*dx0 - 2*dx1 + 2*x0 - 2*x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2) + (dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2) - (3*Math.pow((2*dx0 - 2*dx1 + 2*x0 - 2*x1),2)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),5/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2) - (v22*((2*dx0 - 2*dx2 + 2*x0 - 2*x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2) + (dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2) - (3*Math.pow((2*dx0 - 2*dx2 + 2*x0 - 2*x2),2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2) - (v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)))*((2*dx0 - 2*dx1 + 2*x0 - 2*x1)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*Math.pow((dx0 - dx1 + x0 - x1),2))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),2)))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)) + (v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*((2*dx0 - 2*dx2 + 2*x0 - 2*x2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*Math.pow((dx0 - dx2 + x0 - x2),2))/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),2)))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2)));
    JacobianLocal[1][2] = lambda*((v12*((2*dy0 - 2*dy1 + 2*y0 - 2*y1)/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (3*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),5/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2) - (v22*((2*dy0 - 2*dy2 + 2*y0 - 2*y2)/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)) - (3*(2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2) + (v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*Math.pow((dx0 - dx1 + x0 - x1),2))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),2)) - (v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*Math.pow((dx0 - dx2 + x0 - x2),2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),2)));
    JacobianLocal[1][3] = -lambda*((v12*((2*dx0 - 2*dx1 + 2*x0 - 2*x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2) + (dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2) - (3*Math.pow((2*dx0 - 2*dx1 + 2*x0 - 2*x1),2)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),5/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2) - (v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)))*((2*dx0 - 2*dx1 + 2*x0 - 2*x1)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*Math.pow((dx0 - dx1 + x0 - x1),2))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),2)))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)));
    JacobianLocal[1][4] = -lambda*((v12*((2*dy0 - 2*dy1 + 2*y0 - 2*y1)/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (3*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),5/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2) + (v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*Math.pow((dx0 - dx1 + x0 - x1),2))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),2)));
    JacobianLocal[1][5] = lambda*((v22*((2*dx0 - 2*dx2 + 2*x0 - 2*x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2) + (dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2) - (3*Math.pow((2*dx0 - 2*dx2 + 2*x0 - 2*x2),2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2) - (v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*((2*dx0 - 2*dx2 + 2*x0 - 2*x2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*Math.pow((dx0 - dx2 + x0 - x2),2))/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),2)))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2)));
    JacobianLocal[1][6] = lambda*((v22*((2*dy0 - 2*dy2 + 2*y0 - 2*y2)/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)) - (3*(2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2) + (v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*Math.pow((dx0 - dx2 + x0 - x2),2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),2)));

    JacobianLocal[2][0] = (v12*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (v22*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2));
    JacobianLocal[2][1] = lambda*((v12*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (v22*(2*dy0 - 2*dy2 + 2*y0 - 2*y2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)) - (3*v12*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),5/2)) + (3*v22*(2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2)) + (v12*((2*dx0 - 2*dx1 + 2*x0 - 2*x1)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*Math.pow((dx0 - dx1 + x0 - x1),2))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),2))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (v22*((2*dx0 - 2*dx2 + 2*x0 - 2*x2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*Math.pow((dx0 - dx2 + x0 - x2),2))/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),2))*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)));
    JacobianLocal[2][2] = lambda*((v12*(dx0 - dx1 + x0 - x1))/(Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (v22*(dx0 - dx2 + x0 - x2))/(Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)) - (3*v12*Math.pow((2*dy0 - 2*dy1 + 2*y0 - 2*y1),2)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),5/2)) + (3*v22*Math.pow((2*dy0 - 2*dy2 + 2*y0 - 2*y2),2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2)) - (v12*Math.pow((2*dy0 - 2*dy1 + 2*y0 - 2*y1),2)*Math.pow((dx0 - dx1 + x0 - x1),3))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),7/2)) + (v22*Math.pow((2*dy0 - 2*dy2 + 2*y0 - 2*y2),2)*Math.pow((dx0 - dx2 + x0 - x2),3))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),7/2)));
    JacobianLocal[2][3] = -lambda*((v12*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (3*v12*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),5/2)) + (v12*((2*dx0 - 2*dx1 + 2*x0 - 2*x1)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*Math.pow((dx0 - dx1 + x0 - x1),2))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),2))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)));
    JacobianLocal[2][4] = lambda*((3*v12*Math.pow((2*dy0 - 2*dy1 + 2*y0 - 2*y1),2)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),5/2)) - (v12*(dx0 - dx1 + x0 - x1))/(Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) + (v12*Math.pow((2*dy0 - 2*dy1 + 2*y0 - 2*y1),2)*Math.pow((dx0 - dx1 + x0 - x1),3))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),7/2)));
    JacobianLocal[2][5] = lambda*((v22*(2*dy0 - 2*dy2 + 2*y0 - 2*y2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)) - (3*v22*(2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2)) + (v22*((2*dx0 - 2*dx2 + 2*x0 - 2*x2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*Math.pow((dx0 - dx2 + x0 - x2),2))/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),2))*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)));
    JacobianLocal[2][6] = -lambda*((3*v22*Math.pow((2*dy0 - 2*dy2 + 2*y0 - 2*y2),2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2)) - (v22*(dx0 - dx2 + x0 - x2))/(Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)) + (v22*Math.pow((2*dy0 - 2*dy2 + 2*y0 - 2*y2),2)*Math.pow((dx0 - dx2 + x0 - x2),3))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),7/2)));

    JacobianLocal[3][0] = (v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2);
    JacobianLocal[3][1] = (lambda*v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)))*((2*dx0 - 2*dx1 + 2*x0 - 2*x1)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*Math.pow((dx0 - dx1 + x0 - x1),2))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),2)))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)) - (lambda*v12*((2*dx0 - 2*dx1 + 2*x0 - 2*x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2) + (dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2) - (3*Math.pow((2*dx0 - 2*dx1 + 2*x0 - 2*x1),2)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),5/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2);
    JacobianLocal[3][2] = - (lambda*v12*((2*dy0 - 2*dy1 + 2*y0 - 2*y1)/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (3*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),5/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2) - (lambda*v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*Math.pow((dx0 - dx1 + x0 - x1),2))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),2));
    JacobianLocal[3][3] = (lambda*v12*((2*dx0 - 2*dx1 + 2*x0 - 2*x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2) + (dx0 - dx1 + x0 - x1)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2) - (3*Math.pow((2*dx0 - 2*dx1 + 2*x0 - 2*x1),2)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),5/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2) - (lambda*v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)))*((2*dx0 - 2*dx1 + 2*x0 - 2*x1)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*Math.pow((dx0 - dx1 + x0 - x1),2))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),2)))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2));
    JacobianLocal[3][4] = (lambda*v12*((2*dy0 - 2*dy1 + 2*y0 - 2*y1)/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (3*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),5/2))))/Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2) + (lambda*v12*(1/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*Math.pow((dx0 - dx1 + x0 - x1),2))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),2));
    JacobianLocal[3][5] = 0;
    JacobianLocal[3][6] = 0;

    JacobianLocal[4][0] = -(v12*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2));
    JacobianLocal[4][1] = (3*lambda*v12*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),5/2)) - (lambda*v12*((2*dx0 - 2*dx1 + 2*x0 - 2*x1)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*Math.pow((dx0 - dx1 + x0 - x1),2))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),2))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (lambda*v12*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2));
    JacobianLocal[4][2] = (lambda*v12*Math.pow((2*dy0 - 2*dy1 + 2*y0 - 2*y1),2)*Math.pow((dx0 - dx1 + x0 - x1),3))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),7/2)) - (lambda*v12*(dx0 - dx1 + x0 - x1))/(Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) + (3*lambda*v12*Math.pow((2*dy0 - 2*dy1 + 2*y0 - 2*y1),2)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),5/2));
    JacobianLocal[4][3] = (lambda*v12*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(2*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) + (lambda*v12*((2*dx0 - 2*dx1 + 2*x0 - 2*x1)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)) - ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*Math.pow((dx0 - dx1 + x0 - x1),2))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),2))*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (3*lambda*v12*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),5/2));
    JacobianLocal[4][4] = (lambda*v12*(dx0 - dx1 + x0 - x1))/(Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (lambda*v12*Math.pow((2*dy0 - 2*dy1 + 2*y0 - 2*y1),2)*Math.pow((dx0 - dx1 + x0 - x1),3))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),3/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),7/2)) - (3*lambda*v12*Math.pow((2*dy0 - 2*dy1 + 2*y0 - 2*y1),2)*(dx0 - dx1 + x0 - x1))/(4*Math.pow((1 - Math.pow((dx0 - dx1 + x0 - x1),2)/(Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2))),1/2)*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),5/2));
    JacobianLocal[4][5] = 0;
    JacobianLocal[4][6] = 0;
    
    JacobianLocal[5][0] = -(v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2);
    JacobianLocal[5][1] = (lambda*v22*((2*dx0 - 2*dx2 + 2*x0 - 2*x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2) + (dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2) - (3*Math.pow((2*dx0 - 2*dx2 + 2*x0 - 2*x2),2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2) - (lambda*v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*((2*dx0 - 2*dx2 + 2*x0 - 2*x2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*Math.pow((dx0 - dx2 + x0 - x2),2))/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),2)))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2));
    JacobianLocal[5][2] = (lambda*v22*((2*dy0 - 2*dy2 + 2*y0 - 2*y2)/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)) - (3*(2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2) + (lambda*v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*Math.pow((dx0 - dx2 + x0 - x2),2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),2));
    JacobianLocal[5][3] = 0;
    JacobianLocal[5][4] = 0;
    JacobianLocal[5][5] = (lambda*v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*((2*dx0 - 2*dx2 + 2*x0 - 2*x2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*Math.pow((dx0 - dx2 + x0 - x2),2))/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),2)))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2)) - (lambda*v22*((2*dx0 - 2*dx2 + 2*x0 - 2*x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2) + (dx0 - dx2 + x0 - x2)/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2) - (3*Math.pow((2*dx0 - 2*dx2 + 2*x0 - 2*x2),2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2);
    JacobianLocal[5][6] = - (lambda*v22*((2*dy0 - 2*dy2 + 2*y0 - 2*y2)/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)) - (3*(2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2))))/Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2) - (lambda*v22*(1/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),1/2) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)))*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*Math.pow((dx0 - dx2 + x0 - x2),2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),2));

    JacobianLocal[6][0] = (v22*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2));
    JacobianLocal[6][1] = (lambda*v22*(2*dy0 - 2*dy2 + 2*y0 - 2*y2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)) + (lambda*v22*((2*dx0 - 2*dx2 + 2*x0 - 2*x2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*Math.pow((dx0 - dx2 + x0 - x2),2))/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),2))*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)) - (3*lambda*v22*(2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2));
    JacobianLocal[6][2] = (lambda*v22*(dx0 - dx2 + x0 - x2))/(Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)) - (lambda*v22*Math.pow((2*dy0 - 2*dy2 + 2*y0 - 2*y2),2)*Math.pow((dx0 - dx2 + x0 - x2),3))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),7/2)) - (3*lambda*v22*Math.pow((2*dy0 - 2*dy2 + 2*y0 - 2*y2),2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2));
    JacobianLocal[6][3] = 0;
    JacobianLocal[6][4] = 0;
    JacobianLocal[6][5] = (3*lambda*v22*(2*dx0 - 2*dx2 + 2*x0 - 2*x2)*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2)) - (lambda*v22*((2*dx0 - 2*dx2 + 2*x0 - 2*x2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)) - ((2*dx0 - 2*dx2 + 2*x0 - 2*x2)*Math.pow((dx0 - dx2 + x0 - x2),2))/Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),2))*(2*dy0 - 2*dy2 + 2*y0 - 2*y2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)) - (lambda*v22*(2*dy0 - 2*dy2 + 2*y0 - 2*y2))/(2*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2));
    JacobianLocal[6][6] = (lambda*v22*Math.pow((2*dy0 - 2*dy2 + 2*y0 - 2*y2),2)*Math.pow((dx0 - dx2 + x0 - x2),3))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),3/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),7/2)) - (lambda*v22*(dx0 - dx2 + x0 - x2))/(Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),3/2)) + (3*lambda*v22*Math.pow((2*dy0 - 2*dy2 + 2*y0 - 2*y2),2)*(dx0 - dx2 + x0 - x2))/(4*Math.pow((1 - Math.pow((dx0 - dx2 + x0 - x2),2)/(Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2))),1/2)*Math.pow((Math.pow((dx0 - dx2 + x0 - x2),2) + Math.pow((dy0 - dy2 + y0 - y2),2)),5/2));

    return({axisLocal, JacobianLocal, F_Local, dim, localToGlobal});
}


/**
 * Function for ArcTangentToArc constraint. 
 * This function fill local matrix J and vector F.
 * 
 * @param {Constraint} constraint 
 * @returns {Object} Object with axis names, local Jacobian and local vector F
 */
function getDerivativeFunction_ArcTangentToArc(constraint, unknowns, axisGlobal) {
    const dim = 9;

    const arc1 = constraint.elements[0];
    const arc2 = constraint.elements[1];

    const axisLocal = [];
    axisLocal.push('lambda_' + constraint.id);
    axisLocal.push('dx_' + arc1.p0.id);
    axisLocal.push('dy_' + arc1.p0.id);
    axisLocal.push('dx_' + arc1.p1.id);
    axisLocal.push('dy_' + arc1.p1.id);
    axisLocal.push('dx_' + arc2.p0.id);
    axisLocal.push('dy_' + arc2.p0.id);
    axisLocal.push('dx_' + arc2.p1.id);
    axisLocal.push('dy_' + arc2.p1.id);

    const localToGlobal = new Array(dim);
    for (let i = 0; i < dim; i++) {
        localToGlobal[i] = axisGlobal.indexOf(axisLocal[i]);
    }

    const JacobianLocal = new Array(dim);
    const F_Local = new Array(dim);
    for (let i = 0; i < dim; i++) {
        F_Local[i] = 0;
        JacobianLocal[i] = new Array(dim);
        for (let j = 0; j < dim; j++) {
            JacobianLocal[i][j] = 0;
        }
    }

    const x01 = arc1.p0.x;
    const y01 = arc1.p0.y;
    const x11 = arc1.p1.x;
    const y11 = arc1.p1.y;
    const x02 = arc2.p0.x;
    const y02 = arc2.p0.y;
    const x12 = arc2.p1.x;
    const y12 = arc2.p1.y;

    const lambda = unknowns[localToGlobal[0]];
    const dx01 = unknowns[localToGlobal[1]];
    const dy01 = unknowns[localToGlobal[2]];
    const dx11 = unknowns[localToGlobal[3]];
    const dy11 = unknowns[localToGlobal[4]];
    const dx02 = unknowns[localToGlobal[5]];
    const dy02 = unknowns[localToGlobal[6]];
    const dx12 = unknowns[localToGlobal[7]];
    const dy12 = unknowns[localToGlobal[8]];

    const modeSign = (constraint.mode === 'IN') ? -1 : 1;

    F_Local[0] = (Math.pow((x02 + dx02 - x01 - dx01),2) + Math.pow((y02 + dy02 - y01 - dy01),2)) - Math.pow((Math.sqrt(Math.pow((x12 + dx12 - x02 - dx02),2) + Math.pow((y12 + dy12 - y02 - dy02),2)) + modeSign*Math.sqrt(Math.pow((x11 + dx11 - x01 - dx01),2) + Math.pow((y11 + dy11 - y01 - dy01),2))),2);
    F_Local[1] = -lambda*(2*dx02 - 2*dx01 - 2*x01 + 2*x02 + (modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dx01 - 2*dx11 + 2*x01 - 2*x11))/Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2));
    F_Local[2] = -lambda*(2*dy02 - 2*dy01 - 2*y01 + 2*y02 + (modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2));
    F_Local[3] = (lambda*modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dx01 - 2*dx11 + 2*x01 - 2*x11))/Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2);
    F_Local[4] = (lambda*modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2);
    F_Local[5] = -lambda*(2*dx01 - 2*dx02 + 2*x01 - 2*x02 + ((Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dx02 - 2*dx12 + 2*x02 - 2*x12))/Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));
    F_Local[6] = -lambda*(2*dy01 - 2*dy02 + 2*y01 - 2*y02 + ((Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));
    F_Local[7] = (lambda*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dx02 - 2*dx12 + 2*x02 - 2*x12))/Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2);
    F_Local[8] = (lambda*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2);

    JacobianLocal[0][0] = 0;
    JacobianLocal[0][1] = 2*dx01 - 2*dx02 + 2*x01 - 2*x02 - (modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dx01 - 2*dx11 + 2*x01 - 2*x11))/Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2);
    JacobianLocal[0][2] = 2*dy01 - 2*dy02 + 2*y01 - 2*y02 - (modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2);
    JacobianLocal[0][3] = (modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dx01 - 2*dx11 + 2*x01 - 2*x11))/Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2);
    JacobianLocal[0][4] = (modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2);
    JacobianLocal[0][5] = 2*dx02 - 2*dx01 - 2*x01 + 2*x02 - ((Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dx02 - 2*dx12 + 2*x02 - 2*x12))/Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2);
    JacobianLocal[0][6] = 2*dy02 - 2*dy01 - 2*y01 + 2*y02 - ((Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2);
    JacobianLocal[0][7] = ((Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dx02 - 2*dx12 + 2*x02 - 2*x12))/Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2);
    JacobianLocal[0][8] = ((Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2);
    
    JacobianLocal[1][0] = 2*dx01 - 2*dx02 + 2*x01 - 2*x02 - (modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dx01 - 2*dx11 + 2*x01 - 2*x11))/Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2);
    JacobianLocal[1][1] = -lambda*((Math.pow(modeSign,2)*Math.pow((2*dx01 - 2*dx11 + 2*x01 - 2*x11),2))/(2*(Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2))) + (2*modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)))/Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2) - (modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*Math.pow((2*dx01 - 2*dx11 + 2*x01 - 2*x11),2))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),3/2)) - 2);
    JacobianLocal[1][2] = -lambda*((Math.pow(modeSign,2)*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/(2*(Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2))) - (modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),3/2)));
    JacobianLocal[1][3] = lambda*((Math.pow(modeSign,2)*Math.pow((2*dx01 - 2*dx11 + 2*x01 - 2*x11),2))/(2*(Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2))) + (2*modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)))/Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2) - (modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*Math.pow((2*dx01 - 2*dx11 + 2*x01 - 2*x11),2))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),3/2)));
    JacobianLocal[1][4] = lambda*((Math.pow(modeSign,2)*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/(2*(Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2))) - (modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),3/2)));
    JacobianLocal[1][5] = -lambda*((modeSign*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dx02 - 2*dx12 + 2*x02 - 2*x12))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2)) + 2);
    JacobianLocal[1][6] = -(lambda*modeSign*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));
    JacobianLocal[1][7] = (lambda*modeSign*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dx02 - 2*dx12 + 2*x02 - 2*x12))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));
    JacobianLocal[1][8] = (lambda*modeSign*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));    
    
    JacobianLocal[2][0] = 2*dy01 - 2*dy02 + 2*y01 - 2*y02 - (modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2);
    JacobianLocal[2][1] = -lambda*((Math.pow(modeSign,2)*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/(2*(Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2))) - (modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),3/2)));
    JacobianLocal[2][2] = -lambda*((Math.pow(modeSign,2)*Math.pow((2*dy01 - 2*dy11 + 2*y01 - 2*y11),2))/(2*(Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2))) + (2*modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)))/Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2) - (modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*Math.pow((2*dy01 - 2*dy11 + 2*y01 - 2*y11),2))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),3/2)) - 2);
    JacobianLocal[2][3] = lambda*((Math.pow(modeSign,2)*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/(2*(Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2))) - (modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),3/2)));
    JacobianLocal[2][4] = lambda*((Math.pow(modeSign,2)*Math.pow((2*dy01 - 2*dy11 + 2*y01 - 2*y11),2))/(2*(Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2))) + (2*modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)))/Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2) - (modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*Math.pow((2*dy01 - 2*dy11 + 2*y01 - 2*y11),2))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),3/2)));
    JacobianLocal[2][5] = -(lambda*modeSign*(2*dx02 - 2*dx12 + 2*x02 - 2*x12)*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));
    JacobianLocal[2][6] = -lambda*((modeSign*(2*dy01 - 2*dy11 + 2*y01 - 2*y11)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2)) + 2);
    JacobianLocal[2][7] = (lambda*modeSign*(2*dx02 - 2*dx12 + 2*x02 - 2*x12)*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));
    JacobianLocal[2][8] = (lambda*modeSign*(2*dy01 - 2*dy11 + 2*y01 - 2*y11)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));
    
    JacobianLocal[3][0] = (modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dx01 - 2*dx11 + 2*x01 - 2*x11))/Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2);
    JacobianLocal[3][1] = (lambda*Math.pow(modeSign,2)*Math.pow((2*dx01 - 2*dx11 + 2*x01 - 2*x11),2))/(2*(Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2))) + (2*lambda*modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)))/Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2) - (lambda*modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*Math.pow((2*dx01 - 2*dx11 + 2*x01 - 2*x11),2))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),3/2));
    JacobianLocal[3][2] = (lambda*Math.pow(modeSign,2)*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/(2*(Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2))) - (lambda*modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),3/2));
    JacobianLocal[3][3] = (lambda*modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*Math.pow((2*dx01 - 2*dx11 + 2*x01 - 2*x11),2))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),3/2)) - (2*lambda*modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)))/Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2) - (lambda*Math.pow(modeSign,2)*Math.pow((2*dx01 - 2*dx11 + 2*x01 - 2*x11),2))/(2*(Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)));
    JacobianLocal[3][4] = (lambda*modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),3/2)) - (lambda*Math.pow(modeSign,2)*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/(2*(Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)));
    JacobianLocal[3][5] = (lambda*modeSign*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dx02 - 2*dx12 + 2*x02 - 2*x12))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));
    JacobianLocal[3][6] = (lambda*modeSign*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));
    JacobianLocal[3][7] = -(lambda*modeSign*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dx02 - 2*dx12 + 2*x02 - 2*x12))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));
    JacobianLocal[3][8] = -(lambda*modeSign*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));
    
    JacobianLocal[4][0] = (modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2);
    JacobianLocal[4][1] = (lambda*Math.pow(modeSign,2)*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/(2*(Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2))) - (lambda*modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),3/2));
    JacobianLocal[4][2] = (lambda*Math.pow(modeSign,2)*Math.pow((2*dy01 - 2*dy11 + 2*y01 - 2*y11),2))/(2*(Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2))) + (2*lambda*modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)))/Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2) - (lambda*modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*Math.pow((2*dy01 - 2*dy11 + 2*y01 - 2*y11),2))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),3/2));
    JacobianLocal[4][3] = (lambda*modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),3/2)) - (lambda*Math.pow(modeSign,2)*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/(2*(Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)));
    JacobianLocal[4][4] = (lambda*modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*Math.pow((2*dy01 - 2*dy11 + 2*y01 - 2*y11),2))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),3/2)) - (2*lambda*modeSign*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)))/Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2) - (lambda*Math.pow(modeSign,2)*Math.pow((2*dy01 - 2*dy11 + 2*y01 - 2*y11),2))/(2*(Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)));
    JacobianLocal[4][5] = (lambda*modeSign*(2*dx02 - 2*dx12 + 2*x02 - 2*x12)*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));
    JacobianLocal[4][6] = (lambda*modeSign*(2*dy01 - 2*dy11 + 2*y01 - 2*y11)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));
    JacobianLocal[4][7] = -(lambda*modeSign*(2*dx02 - 2*dx12 + 2*x02 - 2*x12)*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));
    JacobianLocal[4][8] = -(lambda*modeSign*(2*dy01 - 2*dy11 + 2*y01 - 2*y11)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));

    JacobianLocal[5][0] = 2*dx02 - 2*dx01 - 2*x01 + 2*x02 - ((Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dx02 - 2*dx12 + 2*x02 - 2*x12))/Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2);
    JacobianLocal[5][1] = -lambda*((modeSign*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dx02 - 2*dx12 + 2*x02 - 2*x12))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2)) + 2);
    JacobianLocal[5][2] = -(lambda*modeSign*(2*dx02 - 2*dx12 + 2*x02 - 2*x12)*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));
    JacobianLocal[5][3] = (lambda*modeSign*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dx02 - 2*dx12 + 2*x02 - 2*x12))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));
    JacobianLocal[5][4] = (lambda*modeSign*(2*dx02 - 2*dx12 + 2*x02 - 2*x12)*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));
    JacobianLocal[5][5] = -lambda*((2*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)))/Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + Math.pow((2*dx02 - 2*dx12 + 2*x02 - 2*x12),2)/(2*(Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2))) - ((Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*Math.pow((2*dx02 - 2*dx12 + 2*x02 - 2*x12),2))/(2*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),3/2)) - 2);
    JacobianLocal[5][6] = -lambda*(((2*dx02 - 2*dx12 + 2*x02 - 2*x12)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*(Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2))) - ((Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dx02 - 2*dx12 + 2*x02 - 2*x12)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),3/2)));
    JacobianLocal[5][7] = lambda*((2*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)))/Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + Math.pow((2*dx02 - 2*dx12 + 2*x02 - 2*x12),2)/(2*(Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2))) - ((Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*Math.pow((2*dx02 - 2*dx12 + 2*x02 - 2*x12),2))/(2*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),3/2)));
    JacobianLocal[5][8] = lambda*(((2*dx02 - 2*dx12 + 2*x02 - 2*x12)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*(Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2))) - ((Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dx02 - 2*dx12 + 2*x02 - 2*x12)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),3/2)));
    
    JacobianLocal[6][0] = 2*dy02 - 2*dy01 - 2*y01 + 2*y02 - ((Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2);
    JacobianLocal[6][1] = -(lambda*modeSign*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));
    JacobianLocal[6][2] = -lambda*((modeSign*(2*dy01 - 2*dy11 + 2*y01 - 2*y11)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2)) + 2);
    JacobianLocal[6][3] = (lambda*modeSign*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));
    JacobianLocal[6][4] = (lambda*modeSign*(2*dy01 - 2*dy11 + 2*y01 - 2*y11)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));
    JacobianLocal[6][5] = -lambda*(((2*dx02 - 2*dx12 + 2*x02 - 2*x12)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*(Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2))) - ((Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dx02 - 2*dx12 + 2*x02 - 2*x12)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),3/2)));
    JacobianLocal[6][6] = -lambda*((2*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)))/Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + Math.pow((2*dy02 - 2*dy12 + 2*y02 - 2*y12),2)/(2*(Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2))) - ((Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*Math.pow((2*dy02 - 2*dy12 + 2*y02 - 2*y12),2))/(2*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),3/2)) - 2);
    JacobianLocal[6][7] = lambda*(((2*dx02 - 2*dx12 + 2*x02 - 2*x12)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*(Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2))) - ((Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dx02 - 2*dx12 + 2*x02 - 2*x12)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),3/2)));
    JacobianLocal[6][8] = lambda*((2*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)))/Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + Math.pow((2*dy02 - 2*dy12 + 2*y02 - 2*y12),2)/(2*(Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2))) - ((Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*Math.pow((2*dy02 - 2*dy12 + 2*y02 - 2*y12),2))/(2*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),3/2)));
    
    JacobianLocal[7][0] = ((Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dx02 - 2*dx12 + 2*x02 - 2*x12))/Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2);
    JacobianLocal[7][1] = (lambda*modeSign*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dx02 - 2*dx12 + 2*x02 - 2*x12))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));
    JacobianLocal[7][2] = (lambda*modeSign*(2*dx02 - 2*dx12 + 2*x02 - 2*x12)*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));
    JacobianLocal[7][3] = -(lambda*modeSign*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dx02 - 2*dx12 + 2*x02 - 2*x12))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));
    JacobianLocal[7][4] = -(lambda*modeSign*(2*dx02 - 2*dx12 + 2*x02 - 2*x12)*(2*dy01 - 2*dy11 + 2*y01 - 2*y11))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));
    JacobianLocal[7][5] = (2*lambda*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)))/Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + (lambda*Math.pow((2*dx02 - 2*dx12 + 2*x02 - 2*x12),2))/(2*(Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2))) - (lambda*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*Math.pow((2*dx02 - 2*dx12 + 2*x02 - 2*x12),2))/(2*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),3/2));
    JacobianLocal[7][6] = (lambda*(2*dx02 - 2*dx12 + 2*x02 - 2*x12)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*(Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2))) - (lambda*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dx02 - 2*dx12 + 2*x02 - 2*x12)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),3/2));
    JacobianLocal[7][7] = (lambda*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*Math.pow((2*dx02 - 2*dx12 + 2*x02 - 2*x12),2))/(2*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),3/2)) - (lambda*Math.pow((2*dx02 - 2*dx12 + 2*x02 - 2*x12),2))/(2*(Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2))) - (2*lambda*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)))/Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2);
    JacobianLocal[7][8] = (lambda*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dx02 - 2*dx12 + 2*x02 - 2*x12)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),3/2)) - (lambda*(2*dx02 - 2*dx12 + 2*x02 - 2*x12)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*(Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)));
    
    JacobianLocal[8][0] = ((Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2);
    JacobianLocal[8][1] = (lambda*modeSign*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));
    JacobianLocal[8][2] = (lambda*modeSign*(2*dy01 - 2*dy11 + 2*y01 - 2*y11)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));
    JacobianLocal[8][3] = -(lambda*modeSign*(2*dx01 - 2*dx11 + 2*x01 - 2*x11)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));
    JacobianLocal[8][4] = -(lambda*modeSign*(2*dy01 - 2*dy11 + 2*y01 - 2*y11)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2));
    JacobianLocal[8][5] = (lambda*(2*dx02 - 2*dx12 + 2*x02 - 2*x12)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*(Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2))) - (lambda*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dx02 - 2*dx12 + 2*x02 - 2*x12)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),3/2));
    JacobianLocal[8][6] = (2*lambda*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)))/Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + (lambda*Math.pow((2*dy02 - 2*dy12 + 2*y02 - 2*y12),2))/(2*(Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2))) - (lambda*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*Math.pow((2*dy02 - 2*dy12 + 2*y02 - 2*y12),2))/(2*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),3/2));
    JacobianLocal[8][7] = (lambda*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*(2*dx02 - 2*dx12 + 2*x02 - 2*x12)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),3/2)) - (lambda*(2*dx02 - 2*dx12 + 2*x02 - 2*x12)*(2*dy02 - 2*dy12 + 2*y02 - 2*y12))/(2*(Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)));
    JacobianLocal[8][8] = (lambda*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2))*Math.pow((2*dy02 - 2*dy12 + 2*y02 - 2*y12),2))/(2*Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),3/2)) - (lambda*Math.pow((2*dy02 - 2*dy12 + 2*y02 - 2*y12),2))/(2*(Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2))) - (2*lambda*(Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2) + modeSign*Math.pow((Math.pow((dx01 - dx11 + x01 - x11),2) + Math.pow((dy01 - dy11 + y01 - y11),2)),1/2)))/Math.pow((Math.pow((dx02 - dx12 + x02 - x12),2) + Math.pow((dy02 - dy12 + y02 - y12),2)),1/2);

    return({axisLocal, JacobianLocal, F_Local, dim, localToGlobal});
}

/**
 * Function for ArcTangentToLine constraint. 
 * This function fill local matrix J and vector F.
 * 
 * @param {Constraint} constraint 
 * @returns {Object} Object with axis names, local Jacobian and local vector F
 */
function getDerivativeFunction_ArcTangentToLine(constraint, unknowns, axisGlobal) {
    const dim = 9;

    const arc = constraint.elements[0];
    const line = constraint.lines[0];

    const axisLocal = [];
    axisLocal.push('lambda_' + constraint.id);
    axisLocal.push('dx_' + line[0].id);
    axisLocal.push('dy_' + line[0].id);
    axisLocal.push('dx_' + line[1].id);
    axisLocal.push('dy_' + line[1].id);
    axisLocal.push('dx_' + arc.p0.id);
    axisLocal.push('dy_' + arc.p0.id);
    axisLocal.push('dx_' + arc.p1.id);
    axisLocal.push('dy_' + arc.p1.id);

    const localToGlobal = new Array(dim);
    for (let i = 0; i < dim; i++) {
        localToGlobal[i] = axisGlobal.indexOf(axisLocal[i]);
    }

    const JacobianLocal = new Array(dim);
    const F_Local = new Array(dim);
    for (let i = 0; i < dim; i++) {
        F_Local[i] = 0;
        JacobianLocal[i] = new Array(dim);
        for (let j = 0; j < dim; j++) {
            JacobianLocal[i][j] = 0;
        }
    }

    const xA = line[0].x;
    const yA = line[0].y;
    const xB = line[1].x;
    const yB = line[1].y
    const x0 = arc.p0.x;
    const y0 = arc.p0.y;
    const x1 = arc.p1.x;
    const y1 = arc.p1.y;

    const lambda = unknowns[localToGlobal[0]];
    const dxA = unknowns[localToGlobal[1]];
    const dyA = unknowns[localToGlobal[2]];
    const dxB = unknowns[localToGlobal[3]];
    const dyB = unknowns[localToGlobal[4]];
    const dx0 = unknowns[localToGlobal[5]];
    const dy0 = unknowns[localToGlobal[6]];
    const dx1 = unknowns[localToGlobal[7]];
    const dy1 = unknowns[localToGlobal[8]];

    // TODO calulate 'signum' one time before next code
    F_Local[0] = Math.abs((yB + dyB - yA - dyA)*(x0 + dx0) + (xA + dxA - xB - dxB)*(y0 + dy0) + ((xB + dxB)*(yA + dyA) - (xA + dxA)*(yB +dyB))) - Math.sqrt(Math.pow((x1+dx1-x0-dx0),2) + Math.pow((y1 + dy1 - y0 - dy0),2))*Math.sqrt(Math.pow((xB + dxB - xA - dxA),2) + Math.pow((yB + dyB - yA - dyA),2));
    F_Local[1] = lambda*(Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dy0 - dyB + y0 - yB) - (Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(2*dxA - 2*dxB + 2*xA - 2*xB))/(2*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)));
    F_Local[2] = -lambda*(Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dx0 - dxB + x0 - xB) + (Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(2*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)));
    F_Local[3] = -lambda*(Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dy0 - dyA + y0 - yA) - (Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(2*dxA - 2*dxB + 2*xA - 2*xB))/(2*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)));
    F_Local[4] = lambda*(Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dx0 - dxA + x0 - xA) + (Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(2*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)));
    F_Local[5] = -lambda*(Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dyA - dyB + yA - yB) + (Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)*(2*dx0 - 2*dx1 + 2*x0 - 2*x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)));
    F_Local[6] = lambda*(Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dxA - dxB + xA - xB) - (Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)));
    F_Local[7] = (lambda*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)*(2*dx0 - 2*dx1 + 2*x0 - 2*x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2));
    F_Local[8] = (lambda*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2));

    JacobianLocal[0][0] = 0;
    JacobianLocal[0][1] = Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dy0 - dyB + y0 - yB) - (Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(2*dxA - 2*dxB + 2*xA - 2*xB))/(2*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2));
    JacobianLocal[0][2] = - Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dx0 - dxB + x0 - xB) - (Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(2*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2));
    JacobianLocal[0][3] = (Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(2*dxA - 2*dxB + 2*xA - 2*xB))/(2*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)) - Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dy0 - dyA + y0 - yA);
    JacobianLocal[0][4] = Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dx0 - dxA + x0 - xA) + (Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(2*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2));
    JacobianLocal[0][5] = - Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dyA - dyB + yA - yB) - (Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)*(2*dx0 - 2*dx1 + 2*x0 - 2*x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2));
    JacobianLocal[0][6] = Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dxA - dxB + xA - xB) - (Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2));
    JacobianLocal[0][7] = (Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)*(2*dx0 - 2*dx1 + 2*x0 - 2*x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2));
    JacobianLocal[0][8] = (Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2));

    JacobianLocal[1][0] = Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dy0 - dyB + y0 - yB) - (Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(2*dxA - 2*dxB + 2*xA - 2*xB))/(2*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2));
    JacobianLocal[1][1] = lambda*(2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*Math.pow((dy0 - dyB + y0 - yB),2) - Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)/Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2) + (Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((2*dxA - 2*dxB + 2*xA - 2*xB),2))/(4*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),3/2)));
    JacobianLocal[1][2] = -lambda*(2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dx0 - dxB + x0 - xB)*(dy0 - dyB + y0 - yB) - (Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(2*dxA - 2*dxB + 2*xA - 2*xB)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(4*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),3/2)));
    JacobianLocal[1][3] = -lambda*(2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dy0 - dyA + y0 - yA)*(dy0 - dyB + y0 - yB) - Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)/Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2) + (Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((2*dxA - 2*dxB + 2*xA - 2*xB),2))/(4*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),3/2)));
    JacobianLocal[1][4] = -lambda*(Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA)) - 2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dx0 - dxA + x0 - xA)*(dy0 - dyB + y0 - yB) + (Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(2*dxA - 2*dxB + 2*xA - 2*xB)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(4*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),3/2)));
    JacobianLocal[1][5] = -lambda*(2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dy0 - dyB + y0 - yB)*(dyA - dyB + yA - yB) + ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dxA - 2*dxB + 2*xA - 2*xB))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)));
    JacobianLocal[1][6] = lambda*(Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA)) + 2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dxA - dxB + xA - xB)*(dy0 - dyB + y0 - yB) - ((2*dxA - 2*dxB + 2*xA - 2*xB)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)));
    JacobianLocal[1][7] = (lambda*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dxA - 2*dxB + 2*xA - 2*xB))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2));
    JacobianLocal[1][8] = (lambda*(2*dxA - 2*dxB + 2*xA - 2*xB)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2));    

    JacobianLocal[2][0] = - Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dx0 - dxB + x0 - xB) - (Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(2*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2));
    JacobianLocal[2][1] = -lambda*(2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dx0 - dxB + x0 - xB)*(dy0 - dyB + y0 - yB) - (Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(2*dxA - 2*dxB + 2*xA - 2*xB)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(4*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),3/2)));
    JacobianLocal[2][2] = lambda*(2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*Math.pow((dx0 - dxB + x0 - xB),2) - Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)/Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2) + (Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((2*dyA - 2*dyB + 2*yA - 2*yB),2))/(4*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),3/2)));
    JacobianLocal[2][3] = lambda*(Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA)) + 2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dx0 - dxB + x0 - xB)*(dy0 - dyA + y0 - yA) - (Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(2*dxA - 2*dxB + 2*xA - 2*xB)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(4*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),3/2)));
    JacobianLocal[2][4] = -lambda*(2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dx0 - dxA + x0 - xA)*(dx0 - dxB + x0 - xB) - Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)/Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2) + (Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((2*dyA - 2*dyB + 2*yA - 2*yB),2))/(4*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),3/2)));
    JacobianLocal[2][5] = -lambda*(Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA)) - 2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dx0 - dxB + x0 - xB)*(dyA - dyB + yA - yB) + ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)));
    JacobianLocal[2][6] = -lambda*(2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dx0 - dxB + x0 - xB)*(dxA - dxB + xA - xB) + ((2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)));
    JacobianLocal[2][7] = (lambda*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2));
    JacobianLocal[2][8] = (lambda*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2));

    JacobianLocal[3][0] = (Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(2*dxA - 2*dxB + 2*xA - 2*xB))/(2*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)) - Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dy0 - dyA + y0 - yA);
    JacobianLocal[3][1] = -lambda*(2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dy0 - dyA + y0 - yA)*(dy0 - dyB + y0 - yB) - Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)/Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2) + (Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((2*dxA - 2*dxB + 2*xA - 2*xB),2))/(4*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),3/2)));
    JacobianLocal[3][2] = lambda*(Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA)) + 2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dx0 - dxB + x0 - xB)*(dy0 - dyA + y0 - yA) - (Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(2*dxA - 2*dxB + 2*xA - 2*xB)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(4*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),3/2)));
    JacobianLocal[3][3] = lambda*(2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*Math.pow((dy0 - dyA + y0 - yA),2) - Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)/Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2) + (Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((2*dxA - 2*dxB + 2*xA - 2*xB),2))/(4*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),3/2)));
    JacobianLocal[3][4] = -lambda*(2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dx0 - dxA + x0 - xA)*(dy0 - dyA + y0 - yA) - (Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(2*dxA - 2*dxB + 2*xA - 2*xB)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(4*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),3/2)));
    JacobianLocal[3][5] = lambda*(2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dy0 - dyA + y0 - yA)*(dyA - dyB + yA - yB) + ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dxA - 2*dxB + 2*xA - 2*xB))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)));
    JacobianLocal[3][6] = -lambda*(Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA)) + 2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dxA - dxB + xA - xB)*(dy0 - dyA + y0 - yA) - ((2*dxA - 2*dxB + 2*xA - 2*xB)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)));
    JacobianLocal[3][7] = -(lambda*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dxA - 2*dxB + 2*xA - 2*xB))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2));
    JacobianLocal[3][8] = -(lambda*(2*dxA - 2*dxB + 2*xA - 2*xB)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2));

    JacobianLocal[4][0] = Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dx0 - dxA + x0 - xA) + (Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(2*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2));
    JacobianLocal[4][1] = -lambda*(Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA)) - 2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dx0 - dxA + x0 - xA)*(dy0 - dyB + y0 - yB) + (Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(2*dxA - 2*dxB + 2*xA - 2*xB)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(4*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),3/2)));
    JacobianLocal[4][2] = -lambda*(2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dx0 - dxA + x0 - xA)*(dx0 - dxB + x0 - xB) - Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)/Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2) + (Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((2*dyA - 2*dyB + 2*yA - 2*yB),2))/(4*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),3/2)));
    JacobianLocal[4][3] = -lambda*(2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dx0 - dxA + x0 - xA)*(dy0 - dyA + y0 - yA) - (Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*(2*dxA - 2*dxB + 2*xA - 2*xB)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(4*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),3/2)));
    JacobianLocal[4][4] = lambda*(2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*Math.pow((dx0 - dxA + x0 - xA),2) - Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)/Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2) + (Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((2*dyA - 2*dyB + 2*yA - 2*yB),2))/(4*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),3/2)));
    JacobianLocal[4][5] = lambda*(Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA)) - 2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dx0 - dxA + x0 - xA)*(dyA - dyB + yA - yB) + ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)));
    JacobianLocal[4][6] = lambda*(2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dx0 - dxA + x0 - xA)*(dxA - dxB + xA - xB) + ((2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)));
    JacobianLocal[4][7] = -(lambda*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2));
    JacobianLocal[4][8] = -(lambda*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2));

    JacobianLocal[5][0] = - Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dyA - dyB + yA - yB) - (Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)*(2*dx0 - 2*dx1 + 2*x0 - 2*x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2));
    JacobianLocal[5][1] = -lambda*(2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dy0 - dyB + y0 - yB)*(dyA - dyB + yA - yB) + ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dxA - 2*dxB + 2*xA - 2*xB))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)));
    JacobianLocal[5][2] = -lambda*(Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA)) - 2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dx0 - dxB + x0 - xB)*(dyA - dyB + yA - yB) + ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)));
    JacobianLocal[5][3] = lambda*(2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dy0 - dyA + y0 - yA)*(dyA - dyB + yA - yB) + ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dxA - 2*dxB + 2*xA - 2*xB))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)));
    JacobianLocal[5][4] = lambda*(Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA)) - 2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dx0 - dxA + x0 - xA)*(dyA - dyB + yA - yB) + ((2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)));
    JacobianLocal[5][5] = lambda*(2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*Math.pow((dyA - dyB + yA - yB),2) - Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) + (Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)*Math.pow((2*dx0 - 2*dx1 + 2*x0 - 2*x1),2))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)));
    JacobianLocal[5][6] = -lambda*(2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dxA - dxB + xA - xB)*(dyA - dyB + yA - yB) - (Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)));
    JacobianLocal[5][7] = lambda*(Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - (Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)*Math.pow((2*dx0 - 2*dx1 + 2*x0 - 2*x1),2))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)));
    JacobianLocal[5][8] = -(lambda*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2));

    JacobianLocal[6][0] = Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dxA - dxB + xA - xB) - (Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2));
    JacobianLocal[6][1] = lambda*(Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA)) + 2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dxA - dxB + xA - xB)*(dy0 - dyB + y0 - yB) - ((2*dxA - 2*dxB + 2*xA - 2*xB)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)));
    JacobianLocal[6][2] = -lambda*(2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dx0 - dxB + x0 - xB)*(dxA - dxB + xA - xB) + ((2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)));
    JacobianLocal[6][3] = -lambda*(Math.sign((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA)) + 2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dxA - dxB + xA - xB)*(dy0 - dyA + y0 - yA) - ((2*dxA - 2*dxB + 2*xA - 2*xB)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)));
    JacobianLocal[6][4] = lambda*(2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dx0 - dxA + x0 - xA)*(dxA - dxB + xA - xB) + ((2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)));
    JacobianLocal[6][5] = -lambda*(2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*(dxA - dxB + xA - xB)*(dyA - dyB + yA - yB) - (Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)));
    JacobianLocal[6][6] = lambda*(2*dirac((dy0 + y0)*(dxA - dxB + xA - xB) - (dx0 + x0)*(dyA - dyB + yA - yB) - (dxA + xA)*(dyB + yB) + (dxB + xB)*(dyA + yA))*Math.pow((dxA - dxB + xA - xB),2) - Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) + (Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)*Math.pow((2*dy0 - 2*dy1 + 2*y0 - 2*y1),2))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)));
    JacobianLocal[6][7] = -(lambda*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2));
    JacobianLocal[6][8] = lambda*(Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - (Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)*Math.pow((2*dy0 - 2*dy1 + 2*y0 - 2*y1),2))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)));

    JacobianLocal[7][0] = (Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)*(2*dx0 - 2*dx1 + 2*x0 - 2*x1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2));
    JacobianLocal[7][1] = (lambda*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dxA - 2*dxB + 2*xA - 2*xB))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2));
    JacobianLocal[7][2] = (lambda*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2));
    JacobianLocal[7][3] = -(lambda*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dxA - 2*dxB + 2*xA - 2*xB))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2));
    JacobianLocal[7][4] = -(lambda*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2));
    JacobianLocal[7][5] = (lambda*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - (lambda*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)*Math.pow((2*dx0 - 2*dx1 + 2*x0 - 2*x1),2))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2));
    JacobianLocal[7][6] = -(lambda*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2));
    JacobianLocal[7][7] = (lambda*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)*Math.pow((2*dx0 - 2*dx1 + 2*x0 - 2*x1),2))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (lambda*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2);
    JacobianLocal[7][8] = (lambda*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2));

    JacobianLocal[8][0] = (Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(2*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2));
    JacobianLocal[8][1] = (lambda*(2*dxA - 2*dxB + 2*xA - 2*xB)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2));
    JacobianLocal[8][2] = (lambda*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2));
    JacobianLocal[8][3] = -(lambda*(2*dxA - 2*dxB + 2*xA - 2*xB)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2));
    JacobianLocal[8][4] = -(lambda*(2*dy0 - 2*dy1 + 2*y0 - 2*y1)*(2*dyA - 2*dyB + 2*yA - 2*yB))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2)*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2));
    JacobianLocal[8][5] = -(lambda*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2));
    JacobianLocal[8][6] = (lambda*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2) - (lambda*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)*Math.pow((2*dy0 - 2*dy1 + 2*y0 - 2*y1),2))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2));
    JacobianLocal[8][7] = (lambda*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)*(2*dx0 - 2*dx1 + 2*x0 - 2*x1)*(2*dy0 - 2*dy1 + 2*y0 - 2*y1))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2));
    JacobianLocal[8][8] = (lambda*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2)*Math.pow((2*dy0 - 2*dy1 + 2*y0 - 2*y1),2))/(4*Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),3/2)) - (lambda*Math.pow((Math.pow((dxA - dxB + xA - xB),2) + Math.pow((dyA - dyB + yA - yB),2)),1/2))/Math.pow((Math.pow((dx0 - dx1 + x0 - x1),2) + Math.pow((dy0 - dy1 + y0 - y1),2)),1/2);

    return({axisLocal, JacobianLocal, F_Local, dim, localToGlobal});
}

/**
 * Function for DistancePointLine constraint. 
 * This function fill local matrix J and vector F.
 * 
 * @param {Constraint} constraint 
 * @returns {Object} Object with axis names, local Jacobian and local vector F
 */
function getDerivativeFunction_DistancePointLine(constraint, unknowns, axisGlobal) {
    const dim = 7;

    const axisLocal = [];
    axisLocal.push('lambda_' + constraint.id);
    axisLocal.push('dx_' + constraint.lines[0][0].id);
    axisLocal.push('dy_' + constraint.lines[0][0].id);
    axisLocal.push('dx_' + constraint.lines[0][1].id);
    axisLocal.push('dy_' + constraint.lines[0][1].id);
    axisLocal.push('dx_' + constraint.points[0].id);
    axisLocal.push('dy_' + constraint.points[0].id);

    const localToGlobal = new Array(dim);
    for (let i = 0; i < dim; i++) {
        localToGlobal[i] = axisGlobal.indexOf(axisLocal[i]);
    }

    const JacobianLocal = new Array(dim);
    const F_Local = new Array(dim);
    for (let i = 0; i < dim; i++) {
        F_Local[i] = 0;
        JacobianLocal[i] = new Array(dim);
        for (let j = 0; j < dim; j++) {
            JacobianLocal[i][j] = 0;
        }
    }

    const point = constraint.points[0];
    const line = constraint.lines[0];
    const L = constraint.value;

    const x0 = point.x;
    const y0 = point.y;
    const x1 = line[0].x;
    const y1 = line[0].y;
    const x2 = line[1].x;
    const y2 = line[1].y

    const lambda = unknowns[localToGlobal[0]];
    const dx1 = unknowns[localToGlobal[1]];
    const dy1 = unknowns[localToGlobal[2]];
    const dx2 = unknowns[localToGlobal[3]];
    const dy2 = unknowns[localToGlobal[4]];
    const dx0 = unknowns[localToGlobal[5]];
    const dy0 = unknowns[localToGlobal[6]];

    const x1x2 = x1 + dx1 - x2 - dx2;
    const y1y2 = y1 + dy1 - y2 - dy2;
    const y2y1 = y2 + dy2 - y1 - dy1;
    const xy_ = (x1x2 * x1x2 + y1y2 * y1y2)
    const sqrtXY = Math.sqrt(xy_);
    const xy_32 = Math.pow(xy_, 1.5);
    
    const q2 = y2y1*(x0+dx0) + x1x2*(y0+dy0) + (x2+dx2)*(y1+dy1) - (x1+dx1)*(y2+dy2);
    let signum = Math.sign(q2);

    const a_ = ((y0 + dy0) - (y2 + dy2))*signum - L * x1x2 / sqrtXY;
    const b_ = (-(x0 + dx0) + (x2 + dx2))*signum - L * y1y2 / sqrtXY;
    const c_ = (-(y0 + dy0) + (y1 + dy1))*signum + L * x1x2 / sqrtXY;
    const d_ = ((x0 + dx0) - (x1 + dx1))*signum + L * y1y2 / sqrtXY;
    const e_ = y2y1 * signum;
    const f_ = x1x2 * signum;

    F_Local[0] = Math.abs(y2y1 * (x0 + dx0) + x1x2 * (y0 + dy0) + ((x2 + dx2)*(y1 + dy1) - (x1 + dx1)*(y2 + dy2))) - L * sqrtXY;
    F_Local[1] = lambda * a_;
    F_Local[2] = lambda * b_;
    F_Local[3] = lambda * c_;
    F_Local[4] = lambda * d_;
    F_Local[5] = lambda * e_;
    F_Local[6] = lambda * f_;

    JacobianLocal[0][1] = a_;
    JacobianLocal[0][2] = b_;
    JacobianLocal[0][3] = c_;
    JacobianLocal[0][4] = d_;
    JacobianLocal[0][5] = e_;
    JacobianLocal[0][6] = f_;

    JacobianLocal[1][0] = a_;
    JacobianLocal[1][1] = lambda * (-L*(-1*x1x2*x1x2/xy_32) - L/sqrtXY);
    JacobianLocal[1][2] = lambda * (-L*(-1 * y1y2 * x1x2/xy_32));
    JacobianLocal[1][3] = lambda * (-L*(-1 * x1x2 * -1 * x1x2/xy_32) + L/sqrtXY);
    JacobianLocal[1][4] = lambda * (-1*signum -L*(-1 * y1y2 * -1 * x1x2/xy_32));
    JacobianLocal[1][6] = lambda * signum;
    
    JacobianLocal[2][0] = b_;
    JacobianLocal[2][1] = lambda * (-L*(-1*x1x2*y1y2/xy_32));
    JacobianLocal[2][2] = lambda * (-L * (-1 * y1y2*y1y2/xy_32) - L/sqrtXY);
    JacobianLocal[2][3] = lambda * (1 * signum - L*(-1*x1x2 * -1 * y1y2/xy_32));
    JacobianLocal[2][4] = lambda * (-L*(-1*y1y2 * -1 * y1y2/xy_32) + L/sqrtXY);
    JacobianLocal[2][5] = -lambda * signum;

    JacobianLocal[3][0] = c_;
    JacobianLocal[3][1] = lambda * (L * (-1 * x1x2*x1x2/xy_32) + L/sqrtXY);
    JacobianLocal[3][2] = lambda * (1 * signum + L * (-1 * y1y2*x1x2/xy_32));
    JacobianLocal[3][3] = lambda * (L * (-1 * x1x2 * -1 * x1x2/xy_32) - L/sqrtXY);
    JacobianLocal[3][4] = lambda * (L * (-1 * y1y2 * -1 * x1x2/xy_32));
    JacobianLocal[3][6] = -lambda * signum;
    
    JacobianLocal[4][0] = d_;
    JacobianLocal[4][1] = lambda * (-1 * signum + L*(-1*x1x2*y1y2/xy_32));
    JacobianLocal[4][2] = lambda * (L*(-1*y1y2*y1y2/xy_32) + L/sqrtXY);
    JacobianLocal[4][3] = lambda * (L*(-1* x1x2 * -1 * y1y2/xy_32));
    JacobianLocal[4][4] = lambda * (L*(-1*y1y2 * -1 * y1y2/xy_32) - L/sqrtXY);
    JacobianLocal[4][5] = lambda * signum;
    
    JacobianLocal[5][0] = e_;
    JacobianLocal[5][2] = -lambda * signum;
    JacobianLocal[5][4] = lambda * signum;
    
    JacobianLocal[6][0] = f_;
    JacobianLocal[6][1] = lambda * signum;
    JacobianLocal[6][3] = -lambda * signum;

    return({axisLocal, JacobianLocal, F_Local, dim, localToGlobal});
}

/**
 * Function for ArcPointCoincident constraint. 
 * This function fill local matrix J and vector F.
 * 
 * @param {Constraint} constraint 
 * @returns {Object} Object with axis names, local Jacobian and local vector F
 */
function getDerivativeFunction_ArcPointCoincident(constraint, unknowns, axisGlobal) {
    const dim = 8;
    
    const axisLocal = [];
    axisLocal.push('lambda_' + constraint.id + '_1');
    axisLocal.push('lambda_' + constraint.id + '_2');
    axisLocal.push('dx_' + constraint.points[0].id);
    axisLocal.push('dy_' + constraint.points[0].id);
    axisLocal.push('dx_' + constraint.elements[0].center.id);
    axisLocal.push('dy_' + constraint.elements[0].center.id);
    axisLocal.push('dR_' + constraint.elements[0].id + '_' + constraint.elements[0].type)
    const fiNum = constraint.mode === 2 ? 2 : 1;
    axisLocal.push('dFi' + fiNum + '_' + constraint.elements[0].id + '_' + constraint.elements[0].type)

    const localToGlobal = new Array(dim);
    for (let i = 0; i < dim; i++) {
        localToGlobal[i] = axisGlobal.indexOf(axisLocal[i]);
    }

    const JacobianLocal = new Array(dim);
    const F_Local = new Array(dim);
    for (let i = 0; i < dim; i++) {
        F_Local[i] = 0;
        JacobianLocal[i] = new Array(dim);
        for (let j = 0; j < dim; j++) {
            JacobianLocal[i][j] = 0;
        }
    }

    const arc = constraint.elements[0];

    const x2 = constraint.points[0].x;
    const y2 = constraint.points[0].y;
    const x0 = arc.center.x;
    const y0 = arc.center.y;
    const r = arc.R;
    let fi;
    switch (constraint.mode) {
        case 1:
            fi = arc.fi1;
            break;
        case 2:
            fi = arc.fi2;
            break;
        // case 0:
        //     const minFi = Math.min(arc.fi1, arc.fi2);
        //     fi = minFi + Math.abs(arc.fi2 - arc.fi1) / 2;
        //     break;
        default:
            fi = arc.fi1;
            break;
    }

    if (arc.angleMode && arc.angleMode == 'DEG') {
        fi *= Math.PI / 180;
    }
  

    const lambda1 = unknowns[localToGlobal[0]];
    const lambda2 = unknowns[localToGlobal[1]];
    const dx2 = unknowns[localToGlobal[2]];
    const dy2 = unknowns[localToGlobal[3]];
    const dx0 = unknowns[localToGlobal[4]];
    const dy0 = unknowns[localToGlobal[5]];
    const dr = unknowns[localToGlobal[6]];
    const dFi = unknowns[localToGlobal[7]];

    const sinFi = Math.sin(fi+dFi);
    const cosFi = Math.cos(fi+dFi);

    F_Local[0] = x2 + dx2 - x0 - dx0 - (r+dr)*cosFi;
    F_Local[1] = y2 + dy2 - y0 - dy0 - (r+dr)*sinFi;
    F_Local[2] = lambda1;
    F_Local[3] = lambda2;
    F_Local[4] = -lambda1;
    F_Local[5] = -lambda2;
    F_Local[6] = -lambda1*cosFi - lambda2*sinFi;
    F_Local[7] = lambda1*(r+dr)*sinFi - lambda2*(r+dr)*cosFi;

    JacobianLocal[0][2] = 1;
    JacobianLocal[0][4] = -1;
    JacobianLocal[0][6] = -cosFi;
    JacobianLocal[0][7] = (r+dr)*sinFi;
    JacobianLocal[1][3] = 1;
    JacobianLocal[1][5] = -1;
    JacobianLocal[1][6] = -sinFi;
    JacobianLocal[1][7] = -(r+dr)*cosFi;
    JacobianLocal[2][0] = 1;
    JacobianLocal[3][1] = 1;
    JacobianLocal[4][0] = -1;
    JacobianLocal[5][1] = -1;
    JacobianLocal[6][0] = -cosFi;
    JacobianLocal[6][1] = -sinFi;
    JacobianLocal[6][7] = lambda1*sinFi - lambda2*cosFi;
    JacobianLocal[7][0] = (r+dr)*sinFi;
    JacobianLocal[7][1] = -(r+dr)*cosFi;
    JacobianLocal[7][6] = lambda1*sinFi - lambda2*cosFi;
    JacobianLocal[7][7] = lambda1*(r+dr)*cosFi + lambda2*(r+dr)*sinFi;

    return({axisLocal, JacobianLocal, F_Local, dim, localToGlobal});
}


/**
 * Function for ArcPointFix constraint. 
 * This function fill local matrix J and vector F.
 * 
 * @param {Constraint} constraint 
 * @returns {Object} Object with axis names, local Jacobian and local vector F
 */
function getDerivativeFunction_ArcPointFix(constraint, unknowns, axisGlobal) {
    const dim = 6;
    
    const axisLocal = [];
    axisLocal.push('lambda_' + constraint.id + '_1');
    axisLocal.push('lambda_' + constraint.id + '_2');
    axisLocal.push('dx_' + constraint.elements[0].center.id);
    axisLocal.push('dy_' + constraint.elements[0].center.id);
    axisLocal.push('dR_' + constraint.elements[0].id + '_' + constraint.elements[0].type)
    const fiNum = constraint.mode === 2 ? 2 : 1;
    axisLocal.push('dFi' + fiNum + '_' + constraint.elements[0].id + '_' + constraint.elements[0].type)

    const localToGlobal = new Array(dim);
    for (let i = 0; i < dim; i++) {
        localToGlobal[i] = axisGlobal.indexOf(axisLocal[i]);
    }

    const JacobianLocal = new Array(dim);
    const F_Local = new Array(dim);
    for (let i = 0; i < dim; i++) {
        F_Local[i] = 0;
        JacobianLocal[i] = new Array(dim);
        for (let j = 0; j < dim; j++) {
            JacobianLocal[i][j] = 0;
        }
    }

    const arc = constraint.elements[0];

    const x0 = arc.center.x;
    const y0 = arc.center.y;
    const r = arc.R;
    let fi;
    switch (constraint.mode) {
        case 1:
            fi = arc.fi1;
            break;
        case 2:
            fi = arc.fi2;
            break;
        // case 0:
        //     const minFi = Math.min(arc.fi1, arc.fi2);
        //     fi = minFi + Math.abs(arc.fi2 - arc.fi1) / 2;
        //     break;
        default:
            fi = arc.fi1;
            break;
    }

    if (arc.angleMode && arc.angleMode == 'DEG') {
        fi *= Math.PI / 180;
    }
    
    const lambda1 = unknowns[localToGlobal[0]];
    const lambda2 = unknowns[localToGlobal[1]];
    const dx0 = unknowns[localToGlobal[2]];
    const dy0 = unknowns[localToGlobal[3]];
    const dr = unknowns[localToGlobal[4]];
    const dFi = unknowns[localToGlobal[5]];

    const sinFi = Math.sin(fi+dFi);
    const cosFi = Math.cos(fi+dFi);

    F_Local[0] = x0 + dx0 + (r + dr)*cosFi - x0 - r*Math.cos(fi);
    F_Local[1] = y0 + dy0 + (r + dr)*sinFi - y0 - r*Math.sin(fi);
    F_Local[2] = lambda1;
    F_Local[3] = lambda2;
    F_Local[4] = lambda1*cosFi + lambda2*sinFi;
    F_Local[5] = lambda1 * (r + dr) * (-sinFi) + lambda2 * (r + dr) * cosFi;
    
    JacobianLocal[0][2] = 1;
    JacobianLocal[0][4] = cosFi;
    JacobianLocal[0][5] = (r + dr) * (-sinFi);
    JacobianLocal[1][3] = 1;
    JacobianLocal[1][4] = sinFi;
    JacobianLocal[1][5] = (r + dr) * cosFi;
    JacobianLocal[2][0] = 1;
    JacobianLocal[3][1] = 1;
    JacobianLocal[4][0] = cosFi;
    JacobianLocal[4][1] = sinFi;
    JacobianLocal[4][5] = lambda1 * (-sinFi) + lambda2 * cosFi;
    JacobianLocal[5][0] = (r + dr) * (-sinFi);
    JacobianLocal[5][1] = (r + dr) * cosFi;
    JacobianLocal[5][4] = lambda1 * (-sinFi) + lambda2 * cosFi;
    JacobianLocal[5][5] = lambda1 * (r + dr) * (-cosFi) + lambda2 * (r + dr) * (-sinFi);

    return({axisLocal, JacobianLocal, F_Local, dim, localToGlobal});
}

/**
 * Function for ArcLinePerpendicular constraint. 
 * This function fill local matrix J and vector F.
 * 
 * @param {Constraint} constraint 
 * @returns {Object} Object with axis names, local Jacobian and local vector F
 */
function getDerivativeFunction_ArcLinePerpendicular(constraint, unknowns, axisGlobal) {

    const arc = constraint.elements[0];
    const line = constraint.lines[0];

    let arcRadiusPoint = null;
    if (constraint.mode == 1) {
        arcRadiusPoint = arc.p1;
    } else if (constraint.mode == 2) {
        arcRadiusPoint = arc.p2;
    }
    if (arcRadiusPoint == null) {
        throw new Error("getDerivativeFunction_ArcLinePerpendicular: mode isn't defined")
    }

    const dim = 9;

    const axisLocal = [];
    axisLocal.push('lambda_' + constraint.id);
    axisLocal.push('dx_' + line[0].id);
    axisLocal.push('dy_' + line[0].id);
    axisLocal.push('dx_' + line[1].id);
    axisLocal.push('dy_' + line[1].id);
    axisLocal.push('dx_' + arc.p0.id);
    axisLocal.push('dy_' + arc.p0.id);
    axisLocal.push('dx_' + arcRadiusPoint.id);
    axisLocal.push('dy_' + arcRadiusPoint.id);
    const localToGlobal = new Array(dim);
    for (let i = 0; i < dim; i++) {
        localToGlobal[i] = axisGlobal.indexOf(axisLocal[i]);
    }

    const JacobianLocal = new Array(dim);
    const F_Local = new Array(dim);
    for (let i = 0; i < dim; i++) {
        F_Local[i] = 0;
        JacobianLocal[i] = new Array(dim);
        for (let j = 0; j < dim; j++) {
            JacobianLocal[i][j] = 0;
        }
    }
    
    const x1_s = line[0].x;
    const y1_s = line[0].y;
    const x1_f = line[1].x;
    const y1_f = line[1].y
    const x2_s = arc.p0.x;
    const y2_s = arc.p0.y;
    const x2_f = arcRadiusPoint.x;
    const y2_f = arcRadiusPoint.y;

    const lambda = unknowns[localToGlobal[0]];
    const dx1_s = unknowns[localToGlobal[1]];
    const dy1_s = unknowns[localToGlobal[2]];
    const dx1_f = unknowns[localToGlobal[3]];
    const dy1_f = unknowns[localToGlobal[4]];
    const dx2_s = unknowns[localToGlobal[5]];
    const dy2_s = unknowns[localToGlobal[6]];
    const dx2_f = unknowns[localToGlobal[7]];
    const dy2_f = unknowns[localToGlobal[8]];
    
    const a_ = x2_s + dx2_s - x2_f - dx2_f;
    const b_ = y2_s + dy2_s - y2_f - dy2_f;
    const c_ = -x2_s - dx2_s + x2_f + dx2_f;
    const d_ = -y2_s - dy2_s + y2_f + dy2_f;
    const e_ = x1_s + dx1_s - x1_f - dx1_f;
    const f_ = y1_s + dy1_s - y1_f - dy1_f;
    const g_ = -x1_s - dx1_s + x1_f + dx1_f;
    const h_ = -y1_s - dy1_s + y1_f + dy1_f;

    // X1 * X2 - Y1 * Y2
    F_Local[0] = (x1_f + dx1_f - x1_s - dx1_s)*(x2_f + dx2_f - x2_s - dx2_s) + (y1_f + dy1_f - y1_s - dy1_s)*(y2_f + dy2_f - y2_s - dy2_s);
    F_Local[1] = lambda * a_;
    F_Local[2] = lambda * b_;
    F_Local[3] = lambda * c_;
    F_Local[4] = lambda * d_;
    F_Local[5] = lambda * e_;
    F_Local[6] = lambda * f_;
    F_Local[7] = lambda * g_;
    F_Local[8] = lambda * h_;

    JacobianLocal[0][1] = a_;
    JacobianLocal[0][2] = b_;
    JacobianLocal[0][3] = c_;
    JacobianLocal[0][4] = d_;
    JacobianLocal[0][5] = e_;
    JacobianLocal[0][6] = f_;
    JacobianLocal[0][7] = g_
    JacobianLocal[0][8] = h_;

    JacobianLocal[1][0] = a_;
    JacobianLocal[1][5] = lambda;
    JacobianLocal[1][7] = -lambda;
    
    JacobianLocal[2][0] = b_;
    JacobianLocal[2][6] = lambda;
    JacobianLocal[2][8] = -lambda;

    JacobianLocal[3][0] = c_;
    JacobianLocal[3][5] = -lambda;
    JacobianLocal[3][7] = lambda;
    
    JacobianLocal[4][0] = d_;
    JacobianLocal[4][6] = -lambda;
    JacobianLocal[4][8] = lambda;
    
    JacobianLocal[5][0] = e_;
    JacobianLocal[5][1] = lambda;
    JacobianLocal[5][3] = -lambda;
    
    JacobianLocal[6][0] = f_;
    JacobianLocal[6][2] = lambda;
    JacobianLocal[6][4] = -lambda;

    JacobianLocal[7][0] = g_;
    JacobianLocal[7][1] = -lambda;
    JacobianLocal[7][3] = lambda;

    JacobianLocal[8][0] = h_;
    JacobianLocal[8][2] = -lambda;
    JacobianLocal[8][4] = lambda;

    return({axisLocal, JacobianLocal, F_Local, dim, localToGlobal});
}

export {
    getDerivativeFunction_Horizontal,
    getDerivativeFunction_Length,
    getDerivativeFunction_FixPoint,
    getDerivativeFunction_Vertical,
    getDerivativeFunction_Coincident,
    getDerivativeFunction_Parallel,
    getDerivativeFunction_Perpendicular,
    getDerivativeFunction_PointOnLine,
    getDerivativeFunction_Angle,
    getDerivativeFunction_EqualLines,
    getDerivativeFunction_DistancePointLine,
    getDerivativeFunction_ArcLength,
    getDerivativeFunction_ArcRadius,
    getDerivativeFunction_ArcAngle,
    getDerivativeFunction_ArcTangentToArc,
    getDerivativeFunction_ArcTangentToLine,
    getDerivativeFunction_ArcPointCoincident,
    getDerivativeFunction_ArcPointFix,
    getDerivativeFunction_ArcLinePerpendicular,
};
