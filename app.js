const toggleEdit = document.getElementById('toggleEdit')
const reviewTable = document.getElementById('reviewTable')

function setEditable(enabled) {
  document.querySelectorAll('[data-editable]').forEach(el => {
    el.contentEditable = enabled ? 'true' : 'false'
  })
  // inputs/textarea already editable; we ensure table cells are as well
  document.querySelectorAll('#reviewTable td').forEach(td => {
    td.contentEditable = enabled ? 'true' : 'false'
  })
}

toggleEdit.addEventListener('change', e => setEditable(e.target.checked))

// table interactions
let selectedTd = null
reviewTable.addEventListener('click', e => {
  const td = e.target.closest('td')
  if (!td) return
  if (selectedTd) selectedTd.classList.remove('selected')
  selectedTd = td
  selectedTd.classList.add('selected')
})

// 已移除新增/删除按钮，保留选中高亮

// actions
const copyBtn = document.getElementById('copyBtn')
if (copyBtn) copyBtn.addEventListener('click', async () => {
  const data = collectFormData()
  const text = JSON.stringify(data, null, 2)
  await navigator.clipboard.writeText(text)
  alert('已复制表单数据')
})

const urgeBtn = document.getElementById('urgeBtn')
if (urgeBtn) urgeBtn.addEventListener('click', () => {
  alert('已发送催办')
})

const moreBtn = document.getElementById('moreBtn')
if (moreBtn) moreBtn.addEventListener('click', () => {
  alert('更多功能')
})

const forwardBtn = document.getElementById('forwardBtn')
if (forwardBtn) forwardBtn.addEventListener('click', () => {
  alert('已转发')
})

const editTitleBtn = document.getElementById('editTitleBtn')
if (editTitleBtn) editTitleBtn.addEventListener('click', () => {
  const el = document.querySelector('.marquee-text')
  if (!el) return
  const current = el.textContent.trim()
  const next = prompt('修改顶部跑马灯文字：', current)
  if (next !== null) el.textContent = next
})

const saveImageBtn = document.getElementById('saveImageBtn')
if (saveImageBtn) saveImageBtn.addEventListener('click', async () => {
  if (!window.html2canvas) { alert('保存图片功能需要联网'); return }
  const frame = document.querySelector('.phone-frame')
  const editToggle = document.querySelector('.edit-toggle')
  const editTools = document.querySelector('.edit-tools')
  const p1 = editToggle ? editToggle.style.display : ''
  const p2 = editTools ? editTools.style.display : ''
  if (editToggle) editToggle.style.display = 'none'
  if (editTools) editTools.style.display = 'none'
  document.body.classList.add('snapshot')
  const canvas = await html2canvas(frame, {scale: 3})
  document.body.classList.remove('snapshot')
  if (editToggle) editToggle.style.display = p1
  if (editTools) editTools.style.display = p2
  const url = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  const d = new Date()
  const pad = n => String(n).padStart(2, '0')
  a.download = `leave-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.png`
  a.href = url
  a.click()
})

function collectFormData() {
  const fields = {}
  document.querySelectorAll('.grid .field').forEach(f => {
    const label = f.querySelector('.label')?.textContent?.trim() || '字段'
    const input = f.querySelector('input, textarea')
    if (input) {
      if (input.type === 'radio') return
      fields[label] = input.value
    } else {
      // radios
      const checked = f.querySelector('input[type="radio"]:checked')
      if (checked) fields[label] = checked.parentElement.textContent.trim()
    }
  })
  const headers = [...reviewTable.querySelectorAll('thead th')].map(th => th.textContent.replace(/\s+/g,' ').trim())
  const rows = []
  reviewTable.querySelectorAll('tbody tr').forEach(tr => {
    const tds = [...tr.children].map(td => td.textContent.trim())
    const obj = {}
    headers.forEach((h, i) => { obj[h] = tds[i] || '' })
    rows.push(obj)
  })
  const meta = [...document.querySelectorAll('.form-meta span')].map(s => s.textContent.trim())
  return { title: document.querySelector('.form-id').textContent.trim(), meta, fields, reviews: { headers, rows } }
}

// default: editing disabled
setEditable(false)

function ensureTableFits() {
  const fontSizes = [11, 10, 9]
  reviewTable.classList.remove('compact', 'compact2')
  for (let i = 0; i < fontSizes.length; i++) {
    const size = fontSizes[i]
    // apply class based on index 0-> none, 1-> compact, 2-> compact2
    reviewTable.classList.toggle('compact', i === 1)
    reviewTable.classList.toggle('compact2', i === 2)
    const overflow = [...reviewTable.querySelectorAll('tbody td')].some(td => td.scrollWidth > td.clientWidth)
    if (!overflow) break
  }
}

window.addEventListener('resize', ensureTableFits)
reviewTable.addEventListener('input', ensureTableFits)
ensureTableFits()

const toggleWatermarkBtn = document.getElementById('toggleWatermarkBtn')
let wmActivated = false
let watermarkHidden = false
if (toggleWatermarkBtn) toggleWatermarkBtn.addEventListener('click', () => {
  if (!wmActivated) {
    const code = prompt('请输入激活码：')
    if (code !== 'qy520521') { alert('激活码错误'); return }
    wmActivated = true
  }
  const wm = document.querySelector('.watermark')
  if (!wm) return
  watermarkHidden = !watermarkHidden
  wm.style.display = watermarkHidden ? 'none' : ''
  toggleWatermarkBtn.textContent = watermarkHidden ? '开启水印' : '关闭水印'
})