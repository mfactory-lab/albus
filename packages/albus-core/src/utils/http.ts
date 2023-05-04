import fs from 'node:fs'
import path from 'node:path'
import fetch from 'node-fetch'

export function downloadFile(url: string, filePath: string) {
  return new Promise((resolve, reject) => {
    filePath = path.resolve(filePath)
    fetch(url, {
      method: 'GET',
    })
      .then((response) => {
        const writer = fs.createWriteStream(filePath)
        if (response.body) {
          response.body.pipe(writer)
          response.body.on('end', resolve)
          response.body.on('error', reject)
        } else {
          throw new Error(
          `Unable to retrieve file - ${response.status}`,
          )
        }
      })
      .catch((err) => {
        throw err
      })
  })
}
