import mitt from 'mitt'

const emitter = mitt<any>()

export function useEmitter() {
  return emitter
}
