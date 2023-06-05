<template>
  <div :style="{ transform: translateVal }" class="toolbar">
    <div class="toolbar__wrapper" ref="toolbarRef">
      <div class="toolbar__sections">
        <div class="toolbar__section">
          <div class="toolbar__groups">
            <div v-for="group in config.tools" class="toolbar__items">
              <!-- :class="{ 'toolbar__item_selected': tool.id === editorStore.selectedInstrument }" -->
              <button v-for="tool in group.items" :key="tool.id" :title="tool.name" class="toolbar__item"
                :class="{ 'toolbar__item_selected': tool.id === editor.selectedInstrument }"
                @click="selectItem(tool.id)">
                <img :src="itemIcons[`../../assets/toolbarIcons/${tool.icon}`].default" />
              </button>
            </div>
          </div>
          <p class="toolbar__section-name">Инструменты</p>
        </div>
        <div class="toolbar__section">
          <div class="toolbar__groups">
            <div v-for="group in config.constraints" class="toolbar__items">
              <!-- :class="{ 'toolbar__item_selected': tool.id === editorStore.selectedInstrument }" -->
              <button v-for="tool in group.items" :key="tool.id" :title="tool.name" class="toolbar__item"
                :class="{ 'toolbar__item_selected': tool.id === editor.selectedInstrument }"
                @click="selectItem(tool.id)">
                <img :src="itemIcons[`../../assets/toolbarIcons/${tool.icon}`].default" />
              </button>
            </div>
          </div>
          <p class="toolbar__section-name">Ограничения</p>
        </div>
      </div>
      <div ref="pulltabRef" class="toolbar__pulltab" :class="{ 'toolbar__pulltab_closed': !isOpened }"
        @click="toggleSidebar">
        <button>
          <arrow-up />
        </button>
      </div>
    </div>
    <div class="toolbar__toolbars">
      <object-info-toolbar/>
      <constraints-toolbar/>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useEditor } from '../../stores/editor';
import config from './toolbar-config';
import ArrowUp from '../../assets/uiIcons/ArrowUp.vue';
import ConstraintsToolbar from './ConstraintsToolbar.vue';
import editor from '../../utils/Editor';
import ObjectInfoToolbar from './ObjectInfoToolbar.vue';
const itemIcons = import.meta.globEager('../../assets/toolbarIcons/*.svg');

// const editorStore = useEditor();

let isOpened = ref(true);
const toolbarRef = ref(null);
const pulltabRef = ref(null);

const translateVal = computed(() => {
  return `translateY(${-(toolbarRef.value?.offsetHeight - pulltabRef.value?.offsetHeight) * !isOpened.value}px)`
})

function toggleSidebar() {
  isOpened.value = !isOpened.value;
}

function selectItem(id) {
  editor.selectedInstrument = id;
  // если инструмент - проекция объекта, то сохранить индекс текущего слоя
  if (id === 30) {
    editor.tmpLayerIndex = editor.currentLayerIndex;
  }
  console.log(editor);
}

</script>

<style lang="scss" scoped>
@use '../../styles/colors';

.toolbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  box-sizing: border-box;
  transition: all 200ms ease;
  z-index: 10;

  &__toolbars {
    display: flex;
    gap: 10px;
    margin-top: 5px;
    overflow-x: auto;
  }

  &__wrapper {
    background-color: colors.$light-gray;
  }

  &__sections {
    display: flex;
    padding: 5px 5px 0;
    overflow-x: auto;
  }

  &__groups {
    display: flex;
    gap: 10px;
  }

  &__pulltab {
    display: flex;
    justify-content: flex-end;
    height: 15px;
    cursor: pointer;

    &_closed>button svg {
      transform: rotate(180deg);
    }

    &>button {
      width: 60px;
      border: none;
      background-color: colors.$accent;
      cursor: pointer;

      & svg {
        width: 12px;
        fill: colors.$text-inversed;
        transition: transform 200ms ease;
      }
    }
  }

  &__section {
    display: flex;
    flex-direction: column;
    height: 100%;

    &:not(:last-of-type) {
      margin-right: 50px;
    }

    &:not(:first-of-type) {
      flex-grow: 1;
    }
  }

  &__items {
    display: grid;
    grid-auto-flow: column;
    grid-template-rows: 30px;
    grid-auto-columns: 30px;
    gap: 5px;

    &:not(:last-of-type) {
      padding-right: 10px;
      border-right: 1px solid colors.$accent;
    }
  }

  &__item {
    border: none;
    padding: 0;
    background-color: darken(colors.$light-gray, 5%);
    cursor: pointer;
    box-sizing: border-box;
    transition: background 200ms ease;

    &:hover {
      background-color: darken(colors.$light-gray, 10%);
    }

    &_selected {
      border: 2px solid colors.$accent;
    }

    &>img {
      width: 20px;
      height: 20px;
    }
  }

  &__section-name {
    margin: 0;
    padding: 5px 0;
    font-size: 14px;
    font-weight: bold;
  }
}
</style>