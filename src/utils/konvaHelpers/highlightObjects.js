import { drawingColors } from "../constants";

function highlightObjects(objectsToHighligh, highlighToggle = true) {
  console.log('objectsToHighligh', objectsToHighligh);
  //! костыль: почемуто иногда приходить undefined
  if (!objectsToHighligh) return;
  
  for (let obj of objectsToHighligh) {
    if (highlighToggle) {
      obj.fill(drawingColors.CONSTRAINT_HIGHLIGHT_ELEMENT_COLOR);
      obj.stroke(drawingColors.CONSTRAINT_HIGHLIGHT_ELEMENT_COLOR);
    } else {
      obj.fill(drawingColors.DEFAULT_ELEMENT_COLOR);
      obj.stroke(drawingColors.DEFAULT_ELEMENT_COLOR);
    }
  }
}

export { highlightObjects };
