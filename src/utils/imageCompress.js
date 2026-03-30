export async function compressImage(file, { maxWidth = 1280, quality = 0.72, maxSizeKB = 512 } = {}) {
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      let { width, height } = img
      if (width > maxWidth) { height = (height * maxWidth) / width; width = maxWidth }
      canvas.width = width; canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)

      const trySave = (q) => {
        canvas.toBlob(
          blob => {
            if (!blob) { resolve(file); return }
            if (blob.size > maxSizeKB * 1024 && q > 0.3) {
              trySave(q - 0.1)
            } else {
              resolve(blob)
            }
          },
          'image/jpeg',
          q
        )
      }
      trySave(quality)
    }
    img.src = url
  })
}

export function blobToDataURL(blob) {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.readAsDataURL(blob)
  })
}
