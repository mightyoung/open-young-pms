import React, { useState, useEffect, useRef, useCallback } from 'react'
import { colors } from '../styles/theme'
import { message, Upload } from 'antd'
import { Upload as UploadIcon, MapPin, X, Camera, Save, Send, AlertTriangle } from 'lucide-react'
import { api } from '../api'

const D = {
  bg: '#f5f7fa',
  surface: '#f5f7fa',
  card: '#ffffff',
  elevated: '#ffffff',
  border: '#e5e7eb',
  accent: colors.accent,
  accent2: colors.accentHover,
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
  text: colors.text.primary,
  textSec: colors.text.secondary,
  textMuted: colors.text.disabled,
}

const HAZARD_TYPES = [
  { value: 'safety', label: '安全生产', color: colors.danger },
  { value: 'quality', label: '质量缺陷', color: colors.warning },
  { value: 'environment', label: '环境问题', color: colors.success },
]

const URGENCY_OPTIONS = [
  { value: 'urgent', label: '紧急', color: colors.danger },
  { value: 'important', label: '重要', color: colors.warning },
  { value: 'normal', label: '一般', color: colors.success },
]

const EMPTY_FORM = {
  title: '',
  description: '',
  location: '',
  hazard_type: 'safety',
  urgency: 'normal',
  photos: [],
  latitude: null,
  longitude: null,
}

export default function HazardReport({ onSuccess, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [draftId, setDraftId] = useState(null)
  const [gpsStatus, setGpsStatus] = useState('idle') // idle / loading / done / error
  const autoSaveTimer = useRef(null)
  const draftSavedTimer = useRef(null)

  // ── GPS 获取 ───────────────────────────────────────────
  const getLocation = () => {
    if (!navigator.geolocation) {
      message.warning('浏览器不支持定位功能')
      return
    }
    setGpsStatus('loading')
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(f => ({
          ...f,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }))
        setGpsStatus('done')
        message.success(`已获取位置：${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`)
      },
      err => {
        setGpsStatus('error')
        message.error('获取定位失败：' + err.message)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // ── 图片上传 ───────────────────────────────────────────
  const handleImageUpload = useCallback(async files => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const uploaded = await api.upload.images(files)
      setForm(f => ({
        ...f,
        photos: [...f.photos, ...(Array.isArray(uploaded) ? uploaded : [])],
      }))
    } catch (e) {
      message.error('图片上传失败：' + e.message)
    } finally {
      setUploading(false)
    }
  }, [])

  const handleFileInput = e => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) handleImageUpload(files)
    e.target.value = ''
  }

  const removePhoto = idx => {
    setForm(f => ({ ...f, photos: f.photos.filter((_, i) => i !== idx) }))
  }

  // ── 自动保存草稿 ───────────────────────────────────────
  const saveDraft = useCallback(async (data = form) => {
    try {
      const result = await api.hazards.saveDraft(data)
      if (result?.id) setDraftId(result.id)
      // 显示草稿保存提示（debounced）
      if (draftSavedTimer.current) clearTimeout(draftSavedTimer.current)
      draftSavedTimer.current = setTimeout(() => {
        // 静默保存，不打扰用户
      }, 2000)
    } catch (e) {
      console.error('草稿保存失败', e)
    }
  }, [form])

  // 初始加载草稿
  useEffect(() => {
    api.hazards.drafts()
      .then(drafts => {
        if (drafts?.items?.length > 0) {
          const latest = drafts.items[0]
          if (latest && window.confirm('发现未提交草稿，是否恢复？')) {
            setDraftId(latest.id)
            setForm({
              title: latest.title || '',
              description: latest.description || '',
              location: latest.location || '',
              hazard_type: latest.hazard_type || 'safety',
              urgency: latest.urgency || 'normal',
              photos: latest.photos || [],
              latitude: latest.latitude || null,
              longitude: latest.longitude || null,
            })
          }
        }
      })
      .catch(() => {})
  }, [])

  // 每30秒自动保存草稿
  useEffect(() => {
    if (form.title || form.description) {
      autoSaveTimer.current = setInterval(() => {
        saveDraft()
      }, 30000)
    }
    return () => {
      if (autoSaveTimer.current) clearInterval(autoSaveTimer.current)
    }
  }, [form, saveDraft])

  // 离开页面时保存草稿
  useEffect(() => {
    return () => {
      if (form.title || form.description) {
        saveDraft()
      }
    }
  }, [])

  // ── 提交 ──────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.title.trim()) {
      message.warning('请填写标题')
      return
    }
    if (!form.description.trim()) {
      message.warning('请填写问题描述')
      return
    }
    if (!form.location.trim()) {
      message.warning('请填写位置信息')
      return
    }

    // 重复检测提示（基于标题相似度，这里简化处理）
    if (form.title.length < 10) {
      const confirmed = window.confirm(
        '标题较短，可能与已有问题重复。是否继续提交？\n\n点击"确定"继续提交，点击"取消"修改标题。'
      )
      if (!confirmed) return
    }

    setSubmitting(true)
    try {
      await api.hazards.create(form)
      // 删除草稿
      if (draftId) {
        api.hazards.deleteDraft(draftId).catch(() => {})
      }
      message.success('隐患上报成功！')
      onSuccess && onSuccess()
    } catch (e) {
      message.error('上报失败：' + (e.message || '未知错误'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveDraft = async () => {
    await saveDraft()
    message.success('草稿已保存')
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 0 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ color: colors.text.primary, margin: 0, fontSize: 18, fontWeight: 600 }}>
          上报隐患
        </h2>
        <button
          onClick={onCancel}
          style={{ background: 'none', border: 'none', color: colors.text.secondary, cursor: 'pointer', fontSize: 20 }}
        >
          <X size={20} />
        </button>
      </div>

      {/* 标题 */}
      <FieldCard label="标题 *" required>
        <input
          type="text"
          placeholder="简要描述发现的问题..."
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          maxLength={300}
          style={{
            width: '100%', background: colors.bg.page, border: `1px solid ${colors.bg.border}`,
            borderRadius: 8, padding: '10px 12px', color: colors.text.primary, fontSize: 14,
            outline: 'none', boxSizing: 'border-box',
          }}
        />
        <div style={{ color: colors.text.muted, fontSize: 12, marginTop: 4, textAlign: 'right' }}>
          {form.title.length}/300
        </div>
      </FieldCard>

      {/* 隐患类型 + 紧急程度 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <FieldCard label="隐患类型">
          <div style={{ display: 'flex', gap: 8 }}>
            {HAZARD_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setForm(f => ({ ...f, hazard_type: t.value }))}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 500,
                  background: form.hazard_type === t.value ? t.color + '20' : colors.bg.page,
                  color: form.hazard_type === t.value ? t.color : colors.text.secondary,
                  borderBottom: form.hazard_type === t.value ? `2px solid ${t.color}` : `2px solid transparent`,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </FieldCard>

        <FieldCard label="紧急程度">
          <div style={{ display: 'flex', gap: 8 }}>
            {URGENCY_OPTIONS.map(u => (
              <button
                key={u.value}
                onClick={() => setForm(f => ({ ...f, urgency: u.value }))}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 500,
                  background: form.urgency === u.value ? u.color + '20' : colors.bg.page,
                  color: form.urgency === u.value ? u.color : colors.text.secondary,
                  borderBottom: form.urgency === u.value ? `2px solid ${u.color}` : `2px solid transparent`,
                }}
              >
                {u.label}
              </button>
            ))}
          </div>
        </FieldCard>
      </div>

      {/* 描述 */}
      <FieldCard label="问题描述 *" required>
        <textarea
          placeholder="详细描述问题，包括发现时间、具体情况等..."
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={4}
          style={{
            width: '100%', background: colors.bg.page, border: `1px solid ${colors.bg.border}`,
            borderRadius: 8, padding: '10px 12px', color: colors.text.primary, fontSize: 14,
            outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />
      </FieldCard>

      {/* 位置 */}
      <FieldCard label="位置信息 *" required>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="如：3号楼地下车库入口"
            value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            style={{
              flex: 1, background: colors.bg.page, border: `1px solid ${colors.bg.border}`,
              borderRadius: 8, padding: '10px 12px', color: colors.text.primary, fontSize: 14,
              outline: 'none', boxSizing: 'border-box',
            }}
          />
          <button
            onClick={getLocation}
            disabled={gpsStatus === 'loading'}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 13, whiteSpace: 'nowrap',
              background: gpsStatus === 'done' ? colors.success + '20' : colors.bg.page,
              color: gpsStatus === 'done' ? colors.success : colors.text.secondary,
            }}
          >
            <MapPin size={14} />
            {gpsStatus === 'loading' ? '定位中...' : gpsStatus === 'done' ? '已定位' : 'GPS'}
          </button>
        </div>
        {form.latitude && form.longitude && (
          <div style={{ color: colors.text.muted, fontSize: 12, marginTop: 4 }}>
            坐标：{form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}
          </div>
        )}
      </FieldCard>

      {/* 图片上传 */}
      <FieldCard label="现场照片（最多9张）">
        {/* 已有图片预览 */}
        {form.photos.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            {form.photos.map((url, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <img
                  src={url.startsWith('/') ? url : '/' + url}
                  alt=""
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                  onError={e => { e.target.style.display = 'none' }}
                />
                <button
                  onClick={() => removePhoto(idx)}
                  style={{
                    position: 'absolute', top: -6, right: -6,
                    width: 20, height: 20, borderRadius: '50%',
                    background: colors.danger, border: 'none', cursor: 'pointer',
                    color: '#fff', fontSize: 12, lineHeight: '20px', textAlign: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 上传按钮 */}
        {form.photos.length < 9 && (
          <label style={{ cursor: 'pointer' }}>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
            <div style={{
              width: '100%', height: 80, borderRadius: 8,
              border: `1px dashed ${colors.bg.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, color: colors.text.muted, fontSize: 13,
              background: colors.bg.page,
            }}>
              {uploading ? (
                <span style={{ color: colors.accent }}>上传中...</span>
              ) : (
                <>
                  <Camera size={18} />
                  <span>点击添加照片（{form.photos.length}/9）</span>
                </>
              )}
            </div>
          </label>
        )}
      </FieldCard>

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button
          onClick={handleSaveDraft}
          style={{
            flex: 1, padding: '12px', borderRadius: 8, border: `1px solid ${colors.bg.border}`,
            background: colors.bg.page, color: colors.text.secondary, cursor: 'pointer', fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <Save size={16} />
          保存草稿
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            flex: 2, padding: '12px', borderRadius: 8, border: 'none',
            background: colors.accent, color: '#fff', cursor: 'pointer', fontSize: 14,
            fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            opacity: submitting ? 0.7 : 1,
          }}
        >
          <Send size={16} />
          {submitting ? '提交中...' : '立即上报'}
        </button>
      </div>

      {/* 提示 */}
      <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 8, background: colors.bg.page, border: `1px solid ${colors.bg.border}` }}>
        <div style={{ color: colors.warning, fontSize: 13, fontWeight: 500, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
          <AlertTriangle size={14} />
          温馨提示
        </div>
        <ul style={{ color: colors.text.muted, fontSize: 12, margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
          <li>标题尽量详细（10字以上），便于快速识别</li>
          <li>上传现场照片可大幅提升处理效率</li>
          <li>开启 GPS 可精确定位问题位置</li>
          <li>紧急隐患会自动优先处理</li>
          <li>草稿每30秒自动保存，关闭页面不会丢失</li>
        </ul>
      </div>
    </div>
  )
}

function FieldCard({ label, required, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ color: colors.text.secondary, fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
        {label}
        {required && <span style={{ color: colors.danger, marginLeft: 4 }}>*</span>}
      </div>
      {children}
    </div>
  )
}
