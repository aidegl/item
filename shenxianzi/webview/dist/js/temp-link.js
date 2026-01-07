window.TEMP_LINK_CONFIG = window.TEMP_LINK_CONFIG || {}

const TempLink = {
  pickFile() {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = () => resolve(input.files[0] || null)
      input.click()
    })
  },
  async upload(file) {
    const cfg = window.TEMP_LINK_CONFIG || {}
    if (cfg.presignEndpoint) {
      const r1 = await fetch(cfg.presignEndpoint, {
        method: 'POST',
        headers: Object.assign({'Content-Type': 'application/json'}, cfg.authToken ? {Authorization: 'Bearer ' + cfg.authToken} : {}),
        body: JSON.stringify({ filename: file.name })
      })
      if (!r1.ok) throw new Error('presign_failed')
      const j = await r1.json()
      const buf = await file.arrayBuffer()
      const r2 = await fetch(j.putUrl, { method: 'PUT', body: buf, headers: { 'Content-Type': file.type || 'application/octet-stream' } })
      if (!r2.ok) throw new Error('upload_failed')
      return j.getUrl || ''
    }
    if (cfg.uploadEndpoint) {
      const fd = new FormData()
      fd.append('file', file)
      const r = await fetch(cfg.uploadEndpoint, {
        method: 'POST',
        headers: cfg.authToken ? { Authorization: 'Bearer ' + cfg.authToken } : {},
        body: fd
      })
      if (!r.ok) throw new Error('upload_failed')
      const j = await r.json().catch(() => ({}))
      return j.url || j.tempUrl || j.link || ''
    }
    return URL.createObjectURL(file)
  }
}

function screenLog(text) {
  const el = document.getElementById('app-logs')
  const time = new Date().toLocaleTimeString()
  if (el) {
    const line = document.createElement('div')
    line.style.marginBottom = '4px'
    line.style.borderBottom = '1px dashed #333'
    line.textContent = `[${time}] [TempLink] ${text}`
    const anchor = el.children.length > 1 ? el.children[1] : null
    el.insertBefore(line, anchor)
  }
  console.log('[TempLink]', text)
}

window.setTempLinkConfig = function(cfg) {
  window.TEMP_LINK_CONFIG = Object.assign({}, window.TEMP_LINK_CONFIG || {}, cfg || {})
}

window.startTempLinkTest = async function() {
  try {
    const file = await TempLink.pickFile()
    if (!file) return
    const url = await TempLink.upload(file)
    screenLog('临时链接: ' + url)
    if (window.wx && window.wx.miniProgram) {
      wx.miniProgram.postMessage({ data: { type: 'temp_link', url } })
    }
  } catch (e) {
    screenLog('错误: ' + (e && e.message ? e.message : String(e)))
  }
}
