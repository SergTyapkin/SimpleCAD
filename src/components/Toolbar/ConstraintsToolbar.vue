<template>
  <div v-if="constraintsList.length" class="constraints-toolbar">
    <div class="constraints-toolbar__section">
      <div class="constraints-toolbar__items">
        <button v-for="constraint in constraintsList" :key="constraint.id" class="constraints-toolbar__item"
          :class="{ 'constraints-toolbar__item_selected': constraint.id === selectedConstraint?.id }"
          @click="selectItem(constraint)">
          <img :src="itemIcons[`../../assets/toolbarIcons/${CONSTRAINTS_ICONS[constraint.type]}`].default" />
        </button>
      </div>
      <p class="constraints-toolbar__section-name">Наложенные ограничения</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, toRaw, onMounted, onBeforeMount } from 'vue';
import Editor from '../../utils/Editor';
import { CONSTRAINTS_ICONS } from '../../utils/constants';
import editor from '../../utils/Editor';
const itemIcons = import.meta.globEager('../../assets/toolbarIcons/*.svg');

let selectedConstraint = ref(null);
let constraintsList = ref([]);

watch(Editor._selectedObjectForConstraints, (newVal) => {
  console.log('selected object', newVal);
  if (newVal !== null) {
    constraintsList.value = Editor.getObjectConstraints(newVal);
  } else {
    constraintsList.value = [];
  }

  if (selectedConstraint.value !== null) {
    Editor.highlightConstraintObjects(toRaw(selectedConstraint.value), false);
    selectedConstraint.value = null;
  }
});

function selectItem(constraint) {
  if (selectedConstraint.value !== null) {
    Editor.highlightConstraintObjects(toRaw(selectedConstraint.value), false);
  }
  Editor.highlightConstraintObjects(toRaw(constraint), true);
  selectedConstraint.value = constraint;
}

function deleteConstraint(event) {
  if (editor.selectedInstrument === 28 && event.code === 'Delete' && selectedConstraint.value !== null) {
    console.log('deleteConstraint');
    Editor.deleteConstraint(toRaw(selectedConstraint.value));
    Editor.highlightConstraintObjects(toRaw(selectedConstraint.value), false);
    constraintsList.value = Editor.getObjectConstraints(Editor.selectedObjectForConstraints);
  }
}

onMounted(() => {
  document.addEventListener('keydown', deleteConstraint);
})

onBeforeMount(() => {
  document.removeEventListener('keydown', deleteConstraint);
})

</script>

<style lang="scss" scoped>
@use '../../styles/colors';

.constraints-toolbar {
  padding: 5px;
  background-color: colors.$light-gray;
  box-sizing: border-box;
  transition: all 200ms ease;
  z-index: 10;

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