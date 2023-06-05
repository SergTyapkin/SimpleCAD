import { ConstraintsTypes } from "../../../ConstraintsTypes";
import { Constraint } from "../../../Constraint";

function cloneConstraints(constraints, drawingObjects, dataObjects, dataLayer, applyTypes=null) {
  constraints.forEach((objectsArr, constraint) => {
    if (Array.isArray(applyTypes) && !applyTypes.includes(constraint.type) || constraint.isInternal) return;

    //! костыль для ограничений, в которых есть элементы проекций
    if (constraint.points) {
      let testProj = false
      testProj = constraint.points.reduce((acc, el) => {
        if (!acc) return acc;
        if (!dataObjects.get(el)) {
          return false;
        }
        return true;
      }, true);
      if (!testProj) return;
    }
    if (constraint.elements) {
      let testProj = false
      testProj = constraint.elements.reduce((acc, el) => {
        if (!acc) return acc;
        if (!dataObjects.get(el)) {
          return false;
        }
        return true;
      }, true);
      if (!testProj) return;
    }

    let newConstrait = new Constraint({type: constraint.type, mode: constraint.mode, value: constraint.value});
    newConstrait.points = constraint.points?.map((el) => dataObjects.get(el)[0]);
    newConstrait.elements = constraint.elements?.map((el) => dataObjects.get(el)[0]);
    console.log('constraint lines!!!!!!', constraint.lines);
    console.log('constraint elements!!!!!!', constraint.elements);
    newConstrait.lines = constraint.lines?.map((el) => {
      return [
        dataObjects.get(el[0])[0],
        dataObjects.get(el[1])[0]
      ];
    });

    console.log('cloning constraint', constraint);
    for (let constraintObject of objectsArr) {
      const newConstraintObject = drawingObjects.get(constraintObject)[0];
      console.log('new constraint object', newConstraintObject);
      // skip fix point constraint if already exist
      if (constraint.type === ConstraintsTypes['FIX_POINT'] && constraintObject.relatedConstraints[constraint.type]) return;
      if (newConstraintObject.relatedConstraints[constraint.type]) {
        newConstraintObject.relatedConstraints[constraint.type].push(newConstrait);
      } else {
        newConstraintObject.relatedConstraints[constraint.type] = [newConstrait];
      }
    }
    console.log('!!!!!!new constraint', newConstrait);
    dataLayer.addConstraint(newConstrait);
  });
}

export { cloneConstraints };