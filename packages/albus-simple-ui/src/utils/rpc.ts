import axios from 'axios'
import { debounceAsync } from '@/utils/async'

export const getJFRpcToken = debounceAsync(async () => {
  const res = await axios('https://jwt.jfactory.workers.dev', {})
  return res.data.access_token
}, 250) as () => Promise<string>
