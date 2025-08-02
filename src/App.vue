<script setup lang="ts">
import { ref } from 'vue'

const message = ref('123')
</script>

<template lang="pug">
.editor
  .left
    .preview
      
    h1 {{ message }}
  .right
    h1 right
</template>

<style scoped>
.editor {
  display: flex;
  justify-content: space-between;

  .left {
    width: 50%;
    color: red;
  }
}
</style>
