<script lang="ts" setup>
import { NModal, NInput, NButton, createDiscreteApi } from 'naive-ui'
import { ref, computed, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import { saveLSKey } from '@/utils'

const { message } = createDiscreteApi(['message'])

const props = defineProps(['show', 'preloadSnippet'])
const emit = defineEmits<{
  (e: 'update:show', show: boolean): void
  (e: 'save', snippet: string): void
  (e: 'edit-snippet', { snippet, oldSnippet }: { snippet: string; oldSnippet: string }): void
}>()

const state = useStorage(saveLSKey, {})
const allStateKeys = computed(() => Object.keys(state.value))

const snippet = ref('')

const modalShow = computed({
  get: () => {
    return props.show
  },
  set: () => {
    emit('update:show', !props.show)
  },
})

watch(
  () => modalShow.value,
  (val) => {
    if (val && props.preloadSnippet) {
      snippet.value = props.preloadSnippet
    }
  },
  { immediate: true },
)

const emitSave = () => {
  if (props.preloadSnippet) {
    emit('edit-snippet', { snippet: snippet.value, oldSnippet: props.preloadSnippet })
    modalShow.value = false
    snippet.value = ''
  } else {
    if (allStateKeys.value.includes(snippet.value)) {
      message.error('Avoid using the same snippet name')
      return
    }
    if (snippet.value) {
      emit('save', snippet.value)
      modalShow.value = false
      snippet.value = ''
    }
  }
}
</script>

<template lang="pug">
NModal(v-model:show="modalShow")
  .content
    div type snippet to name save
    div current snippet: {{ allStateKeys.join(', ') }}
    NInput(v-model:value="snippet" type="text" placeholder="enter snippet name")
    .button
      NButton(type="primary" @click="emitSave") save

</template>

<style scoped>
.content {
  width: 400px;
  background-color: #1a1a1a;
  padding: 12px 20px;

  .button {
    display: flex;
    justify-content: end;
    padding-top: 12px;
  }
}
</style>
