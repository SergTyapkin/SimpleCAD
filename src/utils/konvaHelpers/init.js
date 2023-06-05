import Konva from 'konva';

function konvaStage(containerId, width, height) {
  return new Konva.Stage({
    container: containerId,
    width,
    height,
  });
}

function konvaLayer(id) {
  return new Konva.Layer({ id })
}

export {
  konvaStage,
  konvaLayer,
};