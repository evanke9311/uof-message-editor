<script lang="ts" setup>
import { NModal, NInput, NButton, NDropdown } from 'naive-ui'
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { saveLSKey, saveSnippet, deleteSnippet } from '@/utils'
import type { StorageState } from '@/utils'
import SaveDialog from '@/components/SaveDialog.vue'
import dayjs from 'dayjs'

const emit = defineEmits<{
  (e: 'load', data: any): void
}>()

const state = useStorage(saveLSKey, {})

const isShowSaveDialog = ref(false)
const preloadSnippet = ref('')

const stateList = computed(() => {
  const list = Object.values(state.value)
  return list.sort((a, b) => a.updateTimestamp - b.updateTimestamp)
})

const updateTime = (ts: number) => {
  if (ts) {
    return dayjs(ts).format('YYYY/MM/DD HH:mm:ss')
  } else {
    return 'N/A'
  }
}

const options = [
  {
    label: 'Load',
    key: 'load',
  },
  {
    label: 'Delete',
    key: 'delete',
  },
  // TODO: edit snippet
  // {
  //   label: 'Edit snippet',
  //   key: 'edit',
  // },
]
const handleSelect = (key: string, item) => {
  switch (key) {
    case 'load':
      emit('load', item)
      break
    case 'delete':
      deleteSnippet(item.snippet)
      break
    case 'edit':
      preloadSnippet.value = item.snippet
      isShowSaveDialog.value = true
      break
  }
}
const onEditSnippet = ({ snippet, oldSnippet }: { snippet: string; oldSnippet: string }) => {
  console.log('snippet', snippet)
  console.log('oldSnippet', oldSnippet)
  // TODO: edit snippet
}
</script>

<template lang="pug">
.snippet-list(v-if="stateList.length")
  .card(v-for="(item) in stateList")
    NDropdown(trigger="hover" overlap placement="right" :options="options" @select="handleSelect($event, item)")
      div
        div.snippet-name snippet name: {{ item.snippet }}
        div table name: {{ item.tableName }}
        div update time: {{ updateTime(item.updateTimestamp) }}

  SaveDialog(
    v-model:show="isShowSaveDialog"
    :preloadSnippet="preloadSnippet"
    @edit-snippet="onEditSnippet"
  )
</template>

<style scoped>
.snippet-list {
  /* preview 300px button(+margin) 50px left container paading 32px = 398px */
  height: calc(100vh - 398px);
  overflow: scroll;
  outline: 1px solid #aaa;

  .card {
    outline: 1px solid #aaa;
    padding: 12px;
    &:hover {
      background-color: rgba(127, 231, 196, 0.1);
    }

    .snippet-name {
      color: #eee;
      font-weight: 500;
    }
  }
}
</style>
