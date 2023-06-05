<template>
  <div v-if="infoToDisplay" class="info-toolbar">
    <div class="info-toolbar__section">
      <div class="info-toolbar__items">
        <p
          v-for="(item, index) of infoToDisplay"
          :key="index"
          class="info-toolbar__item"
        >
          <span>{{ item.key }}</span>
          {{ item.value }}
        </p>
      </div>
      <p class="info-toolbar__section-name">Информация о элементе</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, toRaw, onMounted, onBeforeMount } from 'vue';
import Editor from '../../utils/Editor';

let infoToDisplay = ref(null);
watch(Editor._selectedObjectInfo, (value) => {
  console.log('new val!!!!', value);
  infoToDisplay.value = value
})
</script>

<style lang="scss" scoped>
@use '../../styles/colors';

.info-toolbar {
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
    display: flex;
    gap: 10px;
    flex-grow: 1;
  }

  &__item {
    font-size: 12px;
    padding: 0;
    margin: 0;
    vertical-align: middle;

    & > span {
      font-weight: bold;
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