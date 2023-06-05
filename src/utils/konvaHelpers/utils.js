import editor from "../Editor";

export function promptMMLength(message) {
  const mmAnswer = parseFloat(prompt(message));
  if (isNaN(mmAnswer))
    return [null, null];

  const pxHeight = editor.currentStageLayer.height();
  const pxInMM = pxHeight / 1000;

  return [mmAnswer * pxInMM, mmAnswer];
}

export function promptDegAngle(message) {
  const degAnswer = parseFloat(prompt(message));
  if (isNaN(degAnswer))
    return [null, null];

  return [degAnswer, degAnswer];
}
