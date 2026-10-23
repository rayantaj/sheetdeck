import type { Sheet } from './types'

export function parseFile(file: File): Promise<Sheet[]> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../workers/parse.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (e) => {
      worker.terminate()
      if (e.data.error) reject(new Error(e.data.error))
      else resolve(e.data.sheets)
    }
    worker.onerror = (e) => {
      worker.terminate()
      reject(new Error(e.message))
    }
    worker.postMessage(file)
  })
}
