import { useStorage } from '@vueuse/core'

export const saveLSKey = 'save_template'
export function saveTemplate({
  snippet,
  id,
  tableName,
  form,
}: {
  snippet: string
  id: string
  tableName: string
  form: any[]
}) {
  try {
    const state = useStorage(saveLSKey, {})
    state.value = {
      ...state.value,
      [snippet]: { snippet, id, tableName, form, updateTimestamp: new Date().valueOf() },
    }
  } catch (e) {
    console.error('saveTemplate error: ', e)
  }
}

export function incrementSerial(str: string) {
  const match = str.match(/(\d+)$/)

  if (match) {
    const digits = match[0]
    const base = str.slice(0, -digits.length)
    const incremented = String(parseInt(digits, 10) + 1).padStart(digits.length, '0')
    return base + incremented
  } else {
    return str + '000'
  }
}

type KeyValue = { key: string; value: string }

export function parseInsertSQL(sql: string): KeyValue[] {
  const columnMatch = sql.match(/\(([^)]+)\)\s*VALUES/i)
  const valueMatch = sql.match(/VALUES\s*\(([\s\S]+)\);?$/i)

  if (!columnMatch || !valueMatch) {
    console.log('columnMatch', columnMatch)
    console.log('valueMatch', valueMatch)
    throw 'Invalid SQL syntax: missing columns or values'
  }

  const columns = columnMatch[1].split(',').map((col) => col.trim())
  const raw = valueMatch[1].trim()

  const values: string[] = []
  let buffer = ''
  let inString = false
  let quoteChar = ''
  let braceDepth = 0
  let prevChar = ''

  for (let i = 0; i < raw.length; i++) {
    const char = raw[i]

    if (inString) {
      buffer += char
      if (char === quoteChar && prevChar !== '\\') {
        inString = false
      }
    } else {
      if ((char === "'" || char === '"') && prevChar !== '\\') {
        inString = true
        quoteChar = char
        buffer += char
      } else if (char === '{') {
        braceDepth++
        buffer += char
      } else if (char === '}') {
        braceDepth--
        buffer += char
      } else if (char === ',' && braceDepth === 0) {
        values.push(buffer.trim())
        buffer = ''
      } else {
        buffer += char
      }
    }

    prevChar = char
  }

  if (buffer.trim()) {
    values.push(buffer.trim())
  }

  if (columns.length !== values.length) {
    throw `Mismatch: ${columns.length} columns vs ${values.length} values`
  }

  return columns.map((col, i) => {
    const rawVal = values[i]
    const cleaned =
      rawVal === 'NULL' || rawVal === 'NOW()' ? rawVal : rawVal.replace(/^['"]|['"]$/g, '') // remove outer quotes
    return { key: col, value: cleaned }
  })
}
