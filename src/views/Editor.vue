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
