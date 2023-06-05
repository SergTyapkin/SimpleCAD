import { PointUsedInConstraints } from './PointUsedInConstraints.js';
import { ElementUsedInConstraints } from './ElementUsedInConstraints.js';
import { 
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
} from './constraintFunctions/ConstraintFunctions.js';
import { getDerivativeFunction_LengthTotal } from './constraintFunctions/LengthTotal.js';
import { ConstraintsTypes } from '../ConstraintsTypes.js';
import { ElementTypes } from '../elements/ElementTypes.js';


/**
 * Kernel of CAD system
 */
class Kernel {
    static _NewtonMaxIterations = 1500;
    static _NewtonTolerance = 1e-8;
    /**
     * main method of Kernel for solving
     * 
     * @throws {Error} Will throw if System cannot be solved
     * @param {Array<Point>} points points which should be modified by constraints 
     * @param {Array<Arc | LINE>} elements elements which should be modified by constraints.
     *                              `points` array must contain points used by element.
     * @param {Array<Constraint>} constraints constraints
     */
    solve(points, elements, constraints) {
        return this._solve(points, elements, constraints)
    }

    _solve(points, elements, constraints) {
        if (constraints.length === 0) {
            return { status: null };
        }
        const pointsUsedInConstraints = [];
        this._pointsUsedInConstraints(pointsUsedInConstraints, constraints);
        const elementsUsedInConstraints = [];
        this._elementsUsedInConstraints(elementsUsedInConstraints, pointsUsedInConstraints, constraints);
        const axisGlobal = [];
        this._fillAxisGlobalArray(axisGlobal, pointsUsedInConstraints, elementsUsedInConstraints, constraints);
        let deltas
        try {
            deltas = this._NewtonMethod(axisGlobal, constraints, Kernel._NewtonMaxIterations, Kernel._NewtonTolerance);
        } catch (e) {
            throw e;
        }

        if (this._isResultCorrect(deltas, axisGlobal, elements)) {
            this._assignDeltasToPointsAndElems(deltas, points, elements, axisGlobal);
            return { status: "OK" };
        } else {
            return { status: "Error" };
        }
    }

    _isResultCorrect(deltas, axisGlobal, elements) {
        for (let i = 0; i < axisGlobal.length; i++) {
            if (isNaN(deltas[i])) {
                throw Error("NaN: " + axisGlobal[i])
            }

            // if (axisGlobal[i].startsWith("dR")) {
            //     let name, idStr, type, idx;
            //     [name, idStr, type] = axisGlobal[i].split('_'); // dx_1, dFi1_2_ARC etc.
            //     idx = elements.findIndex(elem => {
            //         let id = Number.parseInt(idStr);
            //         return (elem.id === id) && (elem.type === type);
            //     })
            //     if (idx != -1) {
            //         if (!(elements[idx].R + deltas[i] > 0)) {
            //             throw Error("new radius <= 0");
            //         }
            //     }
            // }
        }
        return true;
    }

    _assignDeltasToPointsAndElems(deltas, points, elements, axisGlobal) {
        let name, idStr, type;
        for (let i = 0; i < axisGlobal.length; i++) {
            [name, idStr, type] = axisGlobal[i].split('_'); // dx_1, dFi1_2_ARC etc.
            if (!isNaN(idStr) && name) {
                let idx;
                switch (name) {
                    case 'dx':
                        idx = points.findIndex(point => {
                                let id = Number.parseInt(idStr);
                                return point.id === id;
                            });
                        if (idx != -1) {
                            points[idx].x += deltas[i];
                        }
                        break;
                    case 'dy':
                        idx = points.findIndex(point => {
                                let id = Number.parseInt(idStr);
                                return point.id === id;
                            });
                        if (idx != -1) {
                            points[idx].y += deltas[i];
                        }
                        break;
                    // case 'dR':
                    //     idx = elements.findIndex(elem => {
                    //         let id = Number.parseInt(idStr);
                    //         return (elem.id === id) && (elem.type === type);
                    //     })
                    //     if (idx != -1) {
                    //         elements[idx].R += deltas[i]
                    //     }
                    //     break;
                    // // TODO -360 <= fi <= 360 !!!
                    // case 'dFi1':
                    //     idx = elements.findIndex(elem => {
                    //         let id = Number.parseInt(idStr);
                    //         return (elem.id === id) && (elem.type === type);
                    //     })
                    //     if (idx != -1) {
                    //         let deltaFi = deltas[i];
                    //         if (elements[idx].angleMode == 'DEG') {
                    //             deltaFi = deltaFi * 180 / Math.PI;
                    //         }
                    //         elements[idx].fi1 += deltaFi;
                    //     }
                    //     break;
                    // case 'dFi2':
                    //     idx = elements.findIndex(elem => {
                    //         let id = Number.parseInt(idStr);
                    //         return (elem.id === id) && (elem.type === type);
                    //     })
                    //     if (idx != -1) {
                    //         let deltaFi = deltas[i];
                    //         if (elements[idx].angleMode == 'DEG') {
                    //             deltaFi = deltaFi * 180 / Math.PI;
                    //         }
                    //         elements[idx].fi2 += deltaFi;
                    //     }
                    //     break;
                    default:
                        break;
                }
            }
        }
    }

    _NewtonMethod(axisGlobal, constraints, maxK, epsilon) {
        let k = 0;
        let S = epsilon + 1;
        
        const arraySize = axisGlobal.length; // size for Jacobian(n x n) and F (n).
        
        // creating Jacobian and F with zeros
        const Jacobian = new Array(arraySize);
        for (let i = 0; i < arraySize; i++) {
            Jacobian[i] = new Array(arraySize);
        }
        const F = new Array(arraySize);
        const X = new Array(arraySize);
        let deltaX = new Array(arraySize);
        this._fillVectorWithNumber(X, arraySize, 0);
        this._fillVectorWithNumber(deltaX, arraySize, 0);
        let prevS = -1;
        
        while (k < maxK && S > epsilon) {
            this._fill2dArrayWithNumber(Jacobian, arraySize, arraySize, 0);
            this._fillVectorWithNumber(F, arraySize, 0);

            this._fillJacobianAndFbyConstraints(Jacobian, F, axisGlobal, constraints, X);

            // F = -F   (J*dX = -F)
            for (let i = 0; i < F.length; i++) {
                F[i] = F[i] * -1;
            }

            // solving equation system
            try {
                deltaX = this._solveSystemOfEquation(Jacobian, F);
            } catch (e) {
                throw new Error(e.message + "\nIteration=" + k);
            }

            // X = X_prev + deltaX
            for (let i = 0; i < X.length; i++) {
                X[i] += deltaX[i];
            }

            prevS = S;
            S = this._calcNorm(deltaX)
            k++;
        }
        
        // check. Why loop has been finished
        if (S > epsilon) {
            throw Error('NewtonMethod: Can\'t solve.' + 
                '\nS > epsilon: epsilon=' + epsilon + ' S='+S + '\nPrevS = ' + prevS + '\nIterations: ' + maxK);
        }

        return X;
    }

    _calcNorm(vector) {
        return this._supremumNorm(vector);
    }

    _supremumNorm(vector) {
        let max = 0;
        for (let i = 0; i < vector.length; i++) {
            const abs = Math.abs(vector[i]);
            if (abs > max) {
                max = abs;
            }
        }
        
        return max;
    }

    // TODO change solver
    _solveSystemOfEquation(A, B) {
        return this._solveSystemByGauss(A, B);
    }

    
    _solveSystemByGauss(A, B) {
        if (A.length !== B.length || A[0].length !== B.length) {
            throw new Error("Gauss solver: A and B should be same size");
        }
        
        const dim = A.length;

        // Direct step
        for(let i = 0; i < dim; i++) {

            // main element choising and swapping
            let maxAbsIndex = i;
            for (let k = i+1; k < dim; k++) {
                if (Math.abs(A[k][i]) > Math.abs(A[maxAbsIndex][i])) {
                    maxAbsIndex = k;
                }
            }
            if (maxAbsIndex !== i) {
                let tmp = A[i];
                A[i] = A[maxAbsIndex];
                A[maxAbsIndex] = tmp;

                tmp = B[i];
                B[i] = B[maxAbsIndex];
                B[maxAbsIndex] = tmp;
            }
            // end main element choising and swapping

            if (A[i][i] == 0) {
                throw new Error('Gauss: A[' + i + '][' + i + '] = 0');
                // A[i][i] = 1e-18; // TODO something.
            }
            
            for (let j = i+1; j < dim; j++) {
                const coeffA = A[j][i] / A[i][i];
                for (let k = i; k < dim; k++) {
                    A[j][k] = A[j][k] - coeffA * A[i][k];
                }
                B[j] = B[j] - coeffA * B[i];
            }
        }

        // Reverse step
        const X = new Array(dim);

        X[dim-1] = B[dim-1] / A[dim-1][dim-1];
        for (let n = dim - 2; n >= 0; n--) {
            let subSum = 0;
            for (let k = n + 1; k < dim; k++) {
                subSum += A[n][k] * X[k];
            }
            X[n] = (B[n] - subSum) / A[n][n];
        }

        return X;
    }

    _fillJacobianAndFbyConstraints(Jacobian, F, globalAxis, constraints, unknowns) {
        for (let constraint of constraints) {
            let constraintFunction;
            switch (constraint.type) {
                case ConstraintsTypes.HORIZONTAL:
                    constraintFunction = getDerivativeFunction_Horizontal(constraint, unknowns, globalAxis);
                    break;
                case ConstraintsTypes.VERTICAL:
                    constraintFunction = getDerivativeFunction_Vertical(constraint, unknowns, globalAxis);
                    break;
                case ConstraintsTypes.LENGTH:
                    constraintFunction = getDerivativeFunction_Length(constraint, unknowns, globalAxis);
                    break;
                case ConstraintsTypes.FIX_POINT:
                    constraintFunction = getDerivativeFunction_FixPoint(constraint, unknowns, globalAxis);
                    break;
                case ConstraintsTypes.COINCIDENT:
                    constraintFunction = getDerivativeFunction_Coincident(constraint, unknowns, globalAxis);
                    break;
                case ConstraintsTypes.PARALLEL:
                    constraintFunction = getDerivativeFunction_Parallel(constraint, unknowns, globalAxis);
                    break;
                case ConstraintsTypes.PERPENDICULAR:
                    constraintFunction = getDerivativeFunction_Perpendicular(constraint, unknowns, globalAxis);
                    break;
                case ConstraintsTypes.POINT_ON_LINE:
                    constraintFunction = getDerivativeFunction_PointOnLine(constraint, unknowns, globalAxis);
                    break;
                case ConstraintsTypes.ANGLE:
                    constraintFunction = getDerivativeFunction_Angle(constraint, unknowns, globalAxis);
                    break;
                case ConstraintsTypes.EQUAL_LINES:
                    constraintFunction = getDerivativeFunction_EqualLines(constraint, unknowns, globalAxis);
                    break;
                case ConstraintsTypes.DISTANCE_POINT_LINE:
                    constraintFunction = getDerivativeFunction_DistancePointLine(constraint, unknowns, globalAxis);
                    break;
                case ConstraintsTypes.ARC_LENGTH:
                    constraintFunction = getDerivativeFunction_ArcLength(constraint, unknowns, globalAxis);
                    break;
                case ConstraintsTypes.ARC_RADIUS:
                    constraintFunction = getDerivativeFunction_ArcRadius(constraint, unknowns, globalAxis);
                    break;
                case ConstraintsTypes.ARC_ANGLE:
                    constraintFunction = getDerivativeFunction_ArcAngle(constraint, unknowns, globalAxis);
                    break;
                case ConstraintsTypes.ARC_TANGENT_ToArc:
                    constraintFunction = getDerivativeFunction_ArcTangentToArc(constraint, unknowns, globalAxis);
                    break;
                case ConstraintsTypes.ARC_TANGENT_ToLine:
                    constraintFunction = getDerivativeFunction_ArcTangentToLine(constraint, unknowns, globalAxis);
                    break;
                case ConstraintsTypes.ARC_POINT_COINCIDENT:
                    constraintFunction = getDerivativeFunction_ArcPointCoincident(constraint, unknowns, globalAxis);
                    break;
                case ConstraintsTypes.ARC_POINT_FIX:
                    constraintFunction = getDerivativeFunction_ArcPointFix(constraint, unknowns, globalAxis);
                    break;
                case ConstraintsTypes.ARC_LINE_PERPENDICULAR:
                    constraintFunction = getDerivativeFunction_ArcLinePerpendicular(constraint, unknowns, globalAxis);
                    break;
                case ConstraintsTypes.LENGTH_TOTAL:
                    constraintFunction = getDerivativeFunction_LengthTotal(constraint, unknowns, globalAxis);
                    break;

                default:
                    break;
            }
            
            if (constraintFunction) {
                this._fillGlobalByLocal(Jacobian, F, constraintFunction);
            }
        }

        const startDXorDY = globalAxis.findIndex(el => { return (el[0] === 'd') })

        // add +1 for diagonal elements in Jacobian (without lambda)
        for (let k = startDXorDY; k < globalAxis.length; k++) {
            Jacobian[k][k] += 1;
        }
        // add +dx_i and +dy_i in F[i]
        for (let k = startDXorDY; k < globalAxis.length; k++) {
            F[k] += unknowns[k];
        }
    }

    // Ансамблирование общей и локальной матиц
    _fillGlobalByLocal(globalJacobian, globalF, constraintFunction) {
        // Получение соответвия локальных и глобальных индексов
        const localToGlobal = constraintFunction.localToGlobal;

        // Jacobian
        for (let i = 0; i < constraintFunction.dim; i++) {
            for (let j = 0; j < constraintFunction.dim; j++) {
                globalJacobian[localToGlobal[i]][localToGlobal[j]] += constraintFunction.JacobianLocal[i][j];
            }
        }

        // vector F
        for (let i = 0; i < constraintFunction.dim; i++) {
            globalF[localToGlobal[i]] += constraintFunction.F_Local[i];
        }
    }

    _fill2dArrayWithNumber(array, dim1, dim2, number) {
        for (let i = 0; i < dim1; i++) {
            for (let j = 0; j < dim2; j++) {
                array[i][j] = number;
            }
        }
    }

    _fillVectorWithNumber(vector, dim, number) {
        for (let i = 0; i < dim; i++) {
            vector[i] = number;
        }
    }

    /**
     * Initialization of Axis array. e.g. ['lambda_1', 'lambda_2', 'dx_1', 'dy_1', 'dx_2', 'dy_2']
     * 
     * @param {Array<String>} axisGlobal 
     * @param {Array<{String, bool, bool}>} pointsUsedInConstraints 
     * @param {Array<Constraint>} constraints 
     */
    _fillAxisGlobalArray(axisGlobal, pointsUsedInConstraints, elementsUsedInConstraints, constraints) {
        for (let constraint of constraints) {
            switch (constraint.type) {
                case ConstraintsTypes.FIX_POINT:
                    axisGlobal.push('lambda_' + constraint.id + '_1');
                    axisGlobal.push('lambda_' + constraint.id + '_2');
                    break;
                case ConstraintsTypes.COINCIDENT:
                    axisGlobal.push('lambda_' + constraint.id + '_1');
                    axisGlobal.push('lambda_' + constraint.id + '_2');
                    break;
                case ConstraintsTypes.ARC_POINT_COINCIDENT:
                    axisGlobal.push('lambda_' + constraint.id + '_1');
                    axisGlobal.push('lambda_' + constraint.id + '_2');
                    break;
                case ConstraintsTypes.ARC_POINT_FIX:
                    axisGlobal.push('lambda_' + constraint.id + '_1');
                    axisGlobal.push('lambda_' + constraint.id + '_2');
                    break;
                default:
                    axisGlobal.push('lambda_' + constraint.id);
                    break;
            }
        }
        for (let point of pointsUsedInConstraints) {
            if (point.dx) {
                axisGlobal.push('dx_' + point.id);
            }
            if (point.dy) {
                axisGlobal.push('dy_' + point.id);
            }
        }
        // for (let element of elementsUsedInConstraints) {
        //     if (element.dR) {
        //         axisGlobal.push('dR_' + element.id + '_' + element.type);
        //     }
        //     if (element.dFi1) {
        //         axisGlobal.push('dFi1_' + element.id + '_' + element.type);
        //     }
        //     if (element.dFi2) {
        //         axisGlobal.push('dFi2_' + element.id + '_' + element.type);
        //     }
        // }
    }

    /**
     * defining elements that are in constraints
     * 
     * @param {Array<{String, bool, bool}>} elementsUsedInConstraints
     * @param {Array<Constraint>} constraints 
     */
    _elementsUsedInConstraints(elementsUsedInConstraints, pointsUsedInConstraints, constraints) {
        for (let constraint of constraints) {
            const elementsInConstraint = constraint.elements;
            if (elementsInConstraint) {
                for (let element of elementsInConstraint) {
                    let elementUsedInConstraints = elementsUsedInConstraints.find(
                        elem => (elem.id == element.id) && (elem.type == element.type));
                    if (!elementUsedInConstraints) {
                        elementUsedInConstraints = new ElementUsedInConstraints(element.type, element.id);
                        elementsUsedInConstraints.push(elementUsedInConstraints);
                    }
                    switch (constraint.type) {
                        case ConstraintsTypes.ARC_POINT_COINCIDENT:
                            elementUsedInConstraints.dR = true;
                            if (constraint.mode === 2) {
                                elementUsedInConstraints.dFi2 = true;
                            } else {
                                elementUsedInConstraints.dFi1 = true
                            }
                            break;
                        case ConstraintsTypes.ARC_POINT_FIX:
                            elementUsedInConstraints.dR = true;
                            if (constraint.mode === 2) {
                                elementUsedInConstraints.dFi2 = true;
                            } else {
                                elementUsedInConstraints.dFi1 = true
                            }
                            break;
                        // case ConstraintsTypes.ARC_LINE_PERPENDICULAR:
                        //     if (constraint.mode === 2) {
                        //         elementUsedInConstraints.dFi2 = true;
                        //     } else {
                        //         elementUsedInConstraints.dFi1 = true
                        //     }
                        //     break;
                    }
                }

                // add dx_i and dy_i to axisGlobal
                const pointsInConstraint = [];
                switch (constraint.type) {
                    case ConstraintsTypes.ARC_RADIUS:
                        pointsInConstraint.push(constraint.elements[0].p0);
                        pointsInConstraint.push(constraint.elements[0].p1);
                        break;
                    case ConstraintsTypes.ARC_ANGLE:
                        pointsInConstraint.push(constraint.elements[0].p0);
                        pointsInConstraint.push(constraint.elements[0].p1);
                        pointsInConstraint.push(constraint.elements[0].p2);
                        break;
                    case ConstraintsTypes.ARC_LENGTH:
                        pointsInConstraint.push(constraint.elements[0].p0);
                        pointsInConstraint.push(constraint.elements[0].p1);
                        pointsInConstraint.push(constraint.elements[0].p2);
                        break;
                    case ConstraintsTypes.ARC_TANGENT_ToLine:
                        pointsInConstraint.push(constraint.elements[0].p0);
                        pointsInConstraint.push(constraint.elements[0].p1);
                        break;
                    case ConstraintsTypes.ARC_TANGENT_ToArc:
                        pointsInConstraint.push(constraint.elements[0].p0);
                        pointsInConstraint.push(constraint.elements[0].p1);
                        pointsInConstraint.push(constraint.elements[1].p0);
                        pointsInConstraint.push(constraint.elements[1].p1);
                        break;
                    case ConstraintsTypes.ARC_LINE_PERPENDICULAR:
                        let arcRadiusPoint = null;
                        if (constraint.mode == 1) {
                            arcRadiusPoint = constraint.elements[0].p1;
                        } else if (constraint.mode == 2) {
                            arcRadiusPoint = constraint.elements[0].p2;
                        }
                        if (arcRadiusPoint == null) {
                            throw new Error("_elementsUsedInConstraints: mode isn't defined")
                        }
                        pointsInConstraint.push(constraint.elements[0].p0);
                        pointsInConstraint.push(arcRadiusPoint);
                        break;
                    case ConstraintsTypes.ARC_POINT_COINCIDENT:
                        pointsInConstraint.push(constraint.elements[0].center);
                        break;
                    case ConstraintsTypes.ARC_POINT_FIX:
                        pointsInConstraint.push(constraint.elements[0].center);
                        break;
                    case ConstraintsTypes.LENGTH_TOTAL:
                        for (const element of elementsInConstraint) {
                            if (element.type == ElementTypes.LINE) {
                                pointsInConstraint.push(element.p1);
                                pointsInConstraint.push(element.p2);
                            } else if (element.type == ElementTypes.ARC) {
                                pointsInConstraint.push(element.p0);
                                pointsInConstraint.push(element.p1);
                                pointsInConstraint.push(element.p2);
                            }
                        }
                        break;
                }
                for (let point of pointsInConstraint) {
                    let pointUsedInConstraints = pointsUsedInConstraints.find(elem => elem.id == point.id);
                    if (!pointUsedInConstraints) {
                        pointUsedInConstraints = new PointUsedInConstraints(point.id);
                        pointsUsedInConstraints.push(pointUsedInConstraints);
                    }
                    switch (constraint.type) {
                        case ConstraintsTypes.ARC_RADIUS:
                            pointUsedInConstraints.dx = true;
                            pointUsedInConstraints.dy = true;
                            break;
                        case ConstraintsTypes.ARC_ANGLE:
                            pointUsedInConstraints.dx = true;
                            pointUsedInConstraints.dy = true;
                            break;
                        case ConstraintsTypes.ARC_LENGTH:
                            pointUsedInConstraints.dx = true;
                            pointUsedInConstraints.dy = true;
                            break;
                        case ConstraintsTypes.ARC_TANGENT_ToArc:
                            pointUsedInConstraints.dx = true;
                            pointUsedInConstraints.dy = true;
                            break;
                        case ConstraintsTypes.ARC_LINE_PERPENDICULAR:
                            pointUsedInConstraints.dx = true;
                            pointUsedInConstraints.dy = true;
                            break;
                        case ConstraintsTypes.ARC_TANGENT_ToLine:
                            pointUsedInConstraints.dx = true;
                            pointUsedInConstraints.dy = true;
                            break;
                        case ConstraintsTypes.ARC_POINT_COINCIDENT:
                            pointUsedInConstraints.dx = true;
                            pointUsedInConstraints.dy = true;
                            break;
                        case ConstraintsTypes.ARC_POINT_FIX:
                            pointUsedInConstraints.dx = true;
                            pointUsedInConstraints.dy = true;
                            break;
                        case ConstraintsTypes.LENGTH_TOTAL:
                            pointUsedInConstraints.dx = true;
                            pointUsedInConstraints.dy = true;
                            break;
                    }
                }
            }
        }
    }
    
    /**
     * defining points that are in constraints
     * 
     * @param {Array<{String, bool, bool}>} pointsUsedInConstraints
     * @param {Array<Constraint>} constraints 
     */
    _pointsUsedInConstraints(pointsUsedInConstraints, constraints) {
        for (let constraint of constraints) {
            const pointsInConstraint = constraint.points;
            const linesInConstraints = constraint.lines;
            if (linesInConstraints) {
                for (let linePoints of linesInConstraints) {
                    for (let point of linePoints) {
                        let pointUsedInConstraints = pointsUsedInConstraints.find(elem => elem.id == point.id);
                        if (!pointUsedInConstraints) {
                            pointUsedInConstraints = new PointUsedInConstraints(point.id);
                            pointsUsedInConstraints.push(pointUsedInConstraints);
                        }
                        switch (constraint.type) {
                            case ConstraintsTypes.PARALLEL:
                                pointUsedInConstraints.dx = true;
                                pointUsedInConstraints.dy = true;
                                break;
                            case ConstraintsTypes.PERPENDICULAR:
                                pointUsedInConstraints.dx = true;
                                pointUsedInConstraints.dy = true;
                                break;
                            case ConstraintsTypes.POINT_ON_LINE:
                                pointUsedInConstraints.dx = true;
                                pointUsedInConstraints.dy = true;
                                break;
                            case ConstraintsTypes.ANGLE:
                                pointUsedInConstraints.dx = true;
                                pointUsedInConstraints.dy = true;
                                break;
                            case ConstraintsTypes.EQUAL_LINES:
                                pointUsedInConstraints.dx = true;
                                pointUsedInConstraints.dy = true;
                                break;
                            case ConstraintsTypes.ARC_TANGENT_ToLine:
                                pointUsedInConstraints.dx = true;
                                pointUsedInConstraints.dy = true;
                                break;
                            case ConstraintsTypes.DISTANCE_POINT_LINE:
                                pointUsedInConstraints.dx = true;
                                pointUsedInConstraints.dy = true;
                                break;
                            case ConstraintsTypes.ARC_LINE_PERPENDICULAR:
                                pointUsedInConstraints.dx = true;
                                pointUsedInConstraints.dy = true;
                                break;
                        }
                    }
                }
            }
            if (pointsInConstraint) {
                for (let point of pointsInConstraint) {
                    let pointUsedInConstraints = pointsUsedInConstraints.find(elem => elem.id == point.id);
                    if (!pointUsedInConstraints) {
                        pointUsedInConstraints = new PointUsedInConstraints(point.id);
                        pointsUsedInConstraints.push(pointUsedInConstraints);
                    }
                    switch (constraint.type) {
                        case ConstraintsTypes.HORIZONTAL:
                            pointUsedInConstraints.dy = true;
                            break;
                        case ConstraintsTypes.VERTICAL:
                            pointUsedInConstraints.dx = true;
                            break;
                        case ConstraintsTypes.LENGTH:
                            pointUsedInConstraints.dx = true;
                            pointUsedInConstraints.dy = true;
                            break;
                        case ConstraintsTypes.FIX_POINT:
                            pointUsedInConstraints.dx = true;
                            pointUsedInConstraints.dy = true;
                            break;
                        case ConstraintsTypes.COINCIDENT:
                            pointUsedInConstraints.dx = true;
                            pointUsedInConstraints.dy = true;
                            break;
                        case ConstraintsTypes.POINT_ON_LINE:
                            pointUsedInConstraints.dx = true;
                            pointUsedInConstraints.dy = true;
                            break;
                        case ConstraintsTypes.DISTANCE_POINT_LINE:
                            pointUsedInConstraints.dx = true;
                            pointUsedInConstraints.dy = true;
                            break;
                        case ConstraintsTypes.ARC_POINT_COINCIDENT:
                            pointUsedInConstraints.dx = true;
                            pointUsedInConstraints.dy = true;
                            break;
                    }
                }
            }
        }
    }
}

export { Kernel };
