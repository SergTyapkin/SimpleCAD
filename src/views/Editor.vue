<template>
  <div class="editor">
    <toolbar/>
    <layers-sidebar/>
    <div ref="containerRef" id="container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useEditor } from '../stores/editor';
import setContainerEvents from '../utils/containerEventHandlers';
import editor from '../utils/Editor';

// components
import Toolbar from '../components/Toolbar/Toolbar.vue'
import LayersSidebar from '../components/LayersSidebar.vue'
import {line, point} from "../utils/konvaHelpers/draw";
import {drawingColors} from "../utils/constants";

// const editorStore = useEditor();
const containerRef = ref(null);

onMounted(() => {
  // editorStore.initStage('container', containerRef.value.offsetWidth, containerRef.value.offsetHeight);
  // editorStore.addLayer();
  // const container = editorStore.stageContainer;
  // container.tabIndex = 1;
  // container.focus();
  // setContainerEvents(editorStore, container);

  editor.initStage('container', containerRef.value.offsetWidth, containerRef.value.offsetHeight);
  editor.addLayer();
  const w = editor.currentStageLayer.width();
  const h = editor.currentStageLayer.height();
  const lines = [
    line([5, 0, 5, h], false, drawingColors.AXIS_COLOR, 1),
    line([0, h - 5, w, h - 5], false, drawingColors.AXIS_COLOR, 1),
  ]
  const mm100inPx = h / 10;
  for (let i = 0; i < h; i += mm100inPx) {
    lines.push(line([0, i, 10, i], false, drawingColors.AXIS_COLOR, 1))
  }
  for (let i = 0; i < w; i += mm100inPx) {
    lines.push(line([i, h, i, h - 10], false, drawingColors.AXIS_COLOR, 1))
  }
  lines.forEach(line => {
    line.draggable(false);
    line.listening(false);
    editor.currentStageLayer.add(line);
  });
  console.log(editor)
  const container = editor.stageContainer;
  container.tabIndex = 1;
  container.focus();
  setContainerEvents(editor, container);
})

</script>

<style lang="scss">
.editor {
  height: 100%;
}

#container {
  width: 100%;
  height: 100%;
}
</style>
