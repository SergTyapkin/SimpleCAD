
function getAllObjects(drawingPoints) {
  let drawingObjects = new Set();
  for (let point of drawingPoints) {
    drawingObjects.add(point);
    if (point.relatedLine) {
      drawingObjects.add(point.relatedLine);
    }
    if (point.relatedArc) {
      drawingObjects.add(point.relatedArc);
    }
  }

  return [...drawingObjects];
}

export { getAllObjects };