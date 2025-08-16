<script lang="ts" setup>
import { NModal, NInput, NButton, createDiscreteApi } from 'naive-ui'
import { ref, computed } from 'vue'
import { parseInsertSQL } from '@/utils'

const { message } = createDiscreteApi(['message'])
const props = defineProps(['show'])
const emit = defineEmits<{
  (e: 'update:show', show: boolean): void
  (e: 'import', id: string, value: { key: string; value: string }[]): void
}>()

const content = ref('')

const modalShow = computed({
  get: () => {
    return props.show
  },
  set: (val) => {
    emit('update:show', !props.show)
  },
})
const importSQL = () => {
  try {
    const result = parseInsertSQL(content.value.trim())
    const findIDItemIndex = result.findIndex((r) => r.key === 'id')
    let id = ''
    if (findIDItemIndex > -1) {
      const item = result.splice(findIDItemIndex, 1)
      id = item[0].value
    }
    emit('import', id, result)
    content.value = ''
    emit('update:show', false)
  } catch (e) {
    message.error(e)
  }
}
</script>

<template lang="pug">
NModal(v-model:show="modalShow")
  .content
    div paste uof message to import
    NInput(v-model:value="content" type="textarea")
    span
    .button
      NButton(type="primary" @click="importSQL") import

</template>

<style scoped>
.content {
  width: 600px;
  background-color: #1a1a1a;
  padding: 12px 20px;

  .button {
    display: flex;
    justify-content: end;
    padding-top: 12px;
  }
}
</style>
