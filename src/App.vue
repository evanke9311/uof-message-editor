<script lang="ts" setup>
import { ref, computed, unref } from 'vue'
import {
  NConfigProvider,
  NDialogProvider,
  NIcon,
  NInput,
  NButton,
  NButtonGroup,
  NCheckbox,
  createDiscreteApi,
  darkTheme,
  NCode,
} from 'naive-ui'
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ArrowUp as ArrowUpIcon,
  ArrowDown as ArrowDownIcon,
} from '@vicons/ionicons5'
import { incrementSerial, saveSnippet } from '@/utils'
import SaveDialog from '@/components/SaveDialog.vue'
import ImportDialog from '@/components/ImportDialog.vue'
import SnippetList from '@/components/SnippetList.vue'

type FormItem = {
  key: string
  value: string
}

const { message } = createDiscreteApi(['message'])

const autoUpdate = ref(true)
const isShowSaveDialog = ref(false)
const showImportDialog = ref(false)
const isShowFormOperationButton = ref(false)

// main edit fileds
const tableName = ref('afbet_facts.t_facts_sporty_uof_messages')
const idValue = ref('')
const form = ref<FormItem[]>([])

const formKeys = computed(() => form.value.map((f) => f.key).join(', '))
const formValues = computed(() => form.value.map((f) => f.value).join(', '))
const uofMessage = computed(() => {
  return `INSERT INTO ${tableName.value} (id, ${formKeys.value}) VALUES ("${idValue.value}", ${formValues.value});`
})

const addForm = () => {
  form.value.push({ key: '', value: '' })
}
const onCopy = () => {
  if (autoUpdate.value) {
    idValue.value = incrementSerial(idValue.value)
  }
  navigator.clipboard
    .writeText(uofMessage.value)
    .then(() => {
      message.success('success')
    })
    .catch(() => {
      message.error('failed')
    })
}
const showSaveDialog = () => {
  isShowSaveDialog.value = !isShowSaveDialog.value
}
const onSave = (snippet: string) => {
  saveSnippet({
    snippet,
    id: unref(idValue),
    tableName: unref(tableName),
    form: unref(form),
  })
}
const onImport = (id: string, importForm: FormItem[]) => {
  idValue.value = id
  form.value = importForm
}
const moveRow = (index: number, dir: 'up' | 'down') => {
  const temp = { ...form.value[index] }
  form.value.splice(index, 1)
  const move = dir === 'up' ? index - 1 : index + 1
  form.value.splice(move, 0, temp)
}
const insertRow = (index: number) => {
  form.value.splice(index + 1, 0, { key: '', value: '' })
}
const deleteRow = (index: number) => {
  form.value.splice(index, 1)
}
const openImportDialog = () => {
  showImportDialog.value = !showImportDialog.value
}
const loadFromSavedSnippet = (data: { id?: string; form?: FormItem[]; tableName?: string }) => {
  try {
    idValue.value = data?.id || ''
    form.value = data?.form || []
    tableName.value = data?.tableName || ''
    if (idValue.value && form.value && tableName.value) {
      message.success('Load successful')
    } else {
      message.success('Load successful but missing some fields')
    }
  } catch (e) {
    message.error('Load failed')
  }
}

const clearForm = () => {
  form.value = []
}
const editForm = () => {
  isShowFormOperationButton.value = !isShowFormOperationButton.value
}
</script>

<template lang="pug">
NConfigProvider(:theme="darkTheme")
  .editor.flex.space-between
    .left
      .preview
        span {{ uofMessage }}
      .button-area.flex
        NButton(type="primary" @click="onCopy") copy
        NButton(type="primary" ghost @click="showSaveDialog") save
        NButton(ghost @click="openImportDialog") import SQL
        NButton(ghost :disabled="!form.length" @click="clearForm") clear
      SnippetList(@load="loadFromSavedSnippet")
    .right
      .row
        span.tableName Table
        NInput(v-model:value="tableName" type="text" placeholder="Table name")
      .row.flex
        .key-col
          NInput(:value="'id'" disabled type="text")
        .value-col
          NInput(v-model:value="idValue" type="text" placeholder="enter ID")
      .row.flex.space-between
        NCheckbox(
          v-model:checked="autoUpdate"
          size="small"
          label="When checked, clicking copy will auto-increment the ID"
        )
        template(v-if="form.length")
          NButton(type="primary" ghost @click="editForm") edit form
        template(v-else)
          NButton(dashed @click="insertRow(-1)")
            NIcon
              AddIcon
            span create
          
      .form.flex.col(v-if="form.length")
        .row.flex(v-for="(item, index) of form")
          .key-col
            NInput(v-model:value="item.key" type="text" placeholder="enter KEYS")
          .value-col
            NInput(v-model:value="item.value" type="text" placeholder="enter VALUES")
          .button-col(v-if="isShowFormOperationButton")
            NButtonGroup
              NButton(ghost :disabled="index === 0" @click="moveRow(index, 'up')")
                NIcon
                  ArrowUpIcon
              NButton(ghost :disabled="(index + 1) === form.length" @click="moveRow(index, 'down')")
                NIcon
                  ArrowDownIcon
              NButton(ghost @click="insertRow(index)")
                NIcon
                  AddIcon
              NButton(ghost @click="deleteRow(index)")
                NIcon
                  RemoveIcon
    SaveDialog(v-model:show="isShowSaveDialog" @save="onSave")
    ImportDialog(v-model:show="showImportDialog" @import="onImport")

</template>

<style scoped>
.flex {
  display: flex;
  &.col {
    flex-direction: column;
  }
  &.space-between {
    justify-content: space-between;
  }
}
.editor {
  .left,
  .right {
    padding: 16px;
    width: 50%;
  }
  .preview {
    height: 300px;
    width: 100%;
    border: 1px solid #ccc;
    padding: 16px;
    box-sizing: border-box;
    overflow-y: auto;
    font-size: 16px;
    user-select: text;
    font-family: Menlo, Monaco;
    word-break: break-word;
  }
  .button-area {
    gap: 8px;
    margin: 16px 0;
  }

  .right {
    height: 100vh;
    overflow: auto;

    .form {
      margin: 12px 0;
      overflow: scroll;
      height: 70%;
    }
    .tableName {
      flex: 0 0 auto;
      padding-right: 6px;
    }
    .row {
      align-items: center;
      & + .row {
        padding-top: 8px;
      }
      .key-col {
        width: 30%;
        padding-right: 8px;
      }
      .value-col {
        width: 70%;
      }
      .button-col {
        padding-left: 8px;
      }
    }
  }
}
</style>
