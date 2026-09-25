import api from './client'

/**
 * Opens a file that needs the signed-in user's token (private documents are not public URLs).
 * The tab is opened synchronously so mobile browsers don't block it as a pop-up, then pointed at
 * a blob of the downloaded file.
 */
export async function openProtectedFile(path: string): Promise<void> {
  const tab = typeof window !== 'undefined' ? window.open('', '_blank') : null
  try {
    const response = await api.get(path, { responseType: 'blob' })
    const url = URL.createObjectURL(response.data as Blob)
    if (tab) tab.location.href = url
    else window.location.assign(url)
    // Give the tab time to load it before releasing the memory.
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch (err) {
    tab?.close()
    throw err
  }
}
