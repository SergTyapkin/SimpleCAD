<template>
  <div :style="{ transform: translateVal }" class="layers-sidebar" ref="sidebarRef">
    <div
      ref="pulltabRef"
      class="layers-sidebar__pulltab"
      :class="{ 'layers-sidebar__pulltab_closed': !isOpened }"
      @click="toggleSidebar"
    >
      <button>
        <arrow-up />
      </button>
    </div>
    <div class="layers-sidebar__content">
      <p class="layers-sidebar__title">Слои</p>
      <div class="layers-sidebar__layers">
        <!-- v-for="(_, index) in editorStore.stageLayers" -->
        <!-- :class="{ 'layer_active': editorStore.currentLayerIndex === index }" -->
        <div
          v-for="layer in editor.stageLayersList.value"
          :key="layer.id"
          class="layer"
          :class="{ 'layer_active': editor.currentLayerIndex === layer.index }"
          @click="switchLayer(layer.index)"
        >
          <div class="layer__content">
            <span class="layer__name">{{ `слой ${layer.index + 1}` }}</span>
          </div>
          <div class="layer__actions">
            <!-- <button v-if="editorStore.currentLayerIndex === index" class="layer__action" @click="addLayer">+</button> -->
            <button v-if="editor.currentLayerIndex === layer.index" class="layer__action" @click.stop="addLayer(false)">+</button>
            <button v-if="editor.currentLayerIndex === layer.index" class="layer__action" @click.stop="addLayer(true)">++</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useEditor } from '../stores/editor';
import ArrowUp from '../assets/uiIcons/ArrowUp.vue';
import editor from '../utils/Editor';

// const editorStore = useEditor();
let isOpened = ref(true);
let sidebarRef = ref(null);
let pulltabRef = ref(null);

const translateVal = computed(() => {
  return `translateX(${(sidebarRef.value?.offsetWidth - pulltabRef.value?.offsetWidth) * !isOpened.value}px)`
});

function toggleSidebar() {
  isOpened.value = !isOpened.value;
}

function addLayer(isFullCopy) {
  // editorStore.addLayer(true);
  editor.addLayer(true, isFullCopy);
}

function switchLayer(index) {
  if (editor.currentLayerIndex === index) return;
  console.log(`switching to layer ${index}`);
  editor.switchLayer(index);
}

</script>

<style lang="scss" scoped>
@use '../styles/colors';
.layers-sidebar {
  position: fixed;
  bottom: 50px;
  right: 0;
  display: flex;
  width: 250px;
  height: 300px;
  background-color: colors.$light-gray;
  z-index: 10;
  box-sizing: border-box;
  transition: all 200ms ease;

  &__pulltab {
    display: flex;
    flex-direction: column-reverse;
    width: 15px;
    cursor: pointer;

    & > button {
      padding: 0;
      width: 100%;
      height: 60px;
      border: none;
      background-color: colors.$accent;
      cursor: pointer;
      & svg {
        width: 12px;
        transform: rotate(90deg);
        fill: colors.$text-inversed;
        transition: transform 200ms ease;
      }
    }

    &_closed > button svg {
      transform: rotate(270deg);
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 100%;
    padding: 0 5px 5px;
  }

  &__title {
    margin: 0;
    padding-top: 10px;
    font-size: 16px;
    font-weight: bold;
  }

  &__layers {
    display: flex;
    flex-direction: column;
    gap: 5px;
    overflow: auto;
  }
}

.layer {
  position: relative;
  display: flex;
  gap: 5px;
  background-color: darken(colors.$light-gray, 5%);
  padding: 10px 5px;
  box-sizing: border-box;
  cursor: pointer;

  &_active::after {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 2px;
    height: 100%;
    background-color: colors.$accent;
  }

  &__name {
    font-size: 14px;
  }

  &__content {
    flex-shrink: 0;
  }

  &__actions {
    display: flex;
    flex-direction: row-reverse;
    gap: 5px;
    flex-grow: 1;
  }

  &__action {
    padding: 0;
    border: none;
    background-color: transparent;
    // width: 20px;
    min-width: 20px;
    height: 20px;
    cursor: pointer;
    border: 1px solid darken(colors.$light-gray, 20%);
    transition: all 200ms ease;

    &:hover {
      background-color: colors.$accent;
      color: colors.$text-inversed;
      border: 1px solid colors.$accent;
    }
  }
}
</style>