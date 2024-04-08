import type { Buffer } from 'node:buffer'

export type StorageFile = Buffer

export type StorageDriver = {
  getUploadPrice: (bytes: number) => Promise<number>
  upload: (file: StorageFile) => Promise<string>
  uploadAll?: (files: StorageFile[]) => Promise<string[]>
  uploadData: (data: string) => Promise<string>
  download?: (uri: string, options?: StorageDownloadOptions) => Promise<StorageFile>
  getUploadPriceForFiles?: (files: StorageFile[]) => Promise<number>
}

export type StorageDownloadOptions = Omit<RequestInit, 'signal'> & {
  signal?: AbortSignal | null
}
