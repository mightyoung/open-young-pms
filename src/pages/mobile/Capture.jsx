import { memo, useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, MapPin, Upload, CheckCircle, ArrowLeft, WifiOff, Cloud } from 'lucide-react'
import { compressImage, blobToDataURL } from '../../utils/imageCompress'
import { getLocation, formatCoordinate } from '../../utils/location'
import { enqueue, getPendingItems } from '../../utils/offlineQueue'
import { generateIssueNumber } from '../../utils/issueNumber'
import { measureText } from '../../utils/pretextMeasure'
import CompareView from '../../components/CompareView'

const ISSUE_TYPES = [
  { label: '安全问题',   value: 'safety',     color: 'oklch(65% 0.2 25)' },
  { label: '质量问题',   value: 'quality',     color: 'oklch(80% 0.16 85)' },
  { label: '进度问题',   value: 'progress',   color: 'oklch(65% 0.13 250)' },
  { label: '设备问题',   value: 'equipment',  color: 'oklch(60% 0.15 270)' },
  { label: '环境问题',   value: 'environment', color: 'oklch(70% 0.18 145)' },
  { label: '其他',       value: 'other',       color: 'oklch(42% 0.01 250)' },
]

const STEPS = ['拍照', '选择类型', '填写描述', '提交']
const DRAFT_KEY = 'pms_capture_draft'
const DRAFT_VERSION = 'v3'

function loadDraft() {
  try {
    const raw = localStorage.getItem(`${DRAFT_KEY}:${DRAFT_VERSION}`)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}
function saveDraft(data) {
  try { localStorage.setItem(`${DRAFT_KEY}:${DRAFT_VERSION}`, JSON.stringify(data)) } catch {}
}
function clearDraft() {
  try { localStorage.removeItem(`${DRAFT_KEY}:${DRAFT_VERSION}`) } catch {}
}

const StepDot = memo(function StepDot({ index, isDone, isActive }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div
        style={{
          width: isActive ? 22 : 18,
          height: isActive ? 22 : 18,
          borderRadius: '50%',
          background: isDone ? 'oklch(70% 0.18 145)' : isActive ? 'oklch(60% 0.15 250)' : 'oklch(28% 0.01 250 / 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
      >
        {isDone ? <CheckCircle size={10} color="#fff" /> : (
          <span style={{ fontSize: 10, fontWeight: 700, color: isActive ? '#fff' : 'oklch(42% 0.01 250)' }}>{index + 1}</span>
        )}
      </div>
      <span style={{ fontSize: 10, color: isActive ? 'oklch(92% 0.01 250)' : 'oklch(42% 0.01 250)', fontWeight: isActive ? 600 : 400 }}>{STEPS[index]}</span>
    </div>
  )
})

const StepConnector = memo(function StepConnector({ isDone }) {
  return (
    <div style={{ flex: 1, height: 2, background: isDone ? 'oklch(70% 0.18 145)' : 'oklch(28% 0.01 250 / 0.3)', margin: '0 4px', marginBottom: 18, transition: 'background 0.2s ease' }} />
  )
})

export default function Capture() {
  const [step, setStep] = useState(0)
  const [photo, setPhoto] = useState(null)
  const [photoBlob, setPhotoBlob] = useState(null)
  const [issueType, setIssueType] = useState(null)
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [locating, setLocating] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [issueNumber, setIssueNumber] = useState('')
  const [compareView, setCompareView] = useState(false)
  const fileInputRef = useRef(null)

  // Pretext: pre-calculate textarea height based on content
  const textareaMetrics = useMemo(() => {
    const metrics = measureText(description || '请详细描述问题（位置、现象、风险等级等）...', '14px Plus Jakarta Sans, system-ui, sans-serif', 343);
    const minHeight = 108;
    const maxHeight = 240;
    const calculatedHeight = Math.min(maxHeight, Math.max(minHeight, Math.round(metrics.height * 1.5)));
    return {
      ...metrics,
      computedHeight: calculatedHeight,
      lineHeight: 21,
    };
  }, [description]);

  useEffect(() => {
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline) }
  }, [])

  useEffect(() => {
    const draft = loadDraft()
    if (draft) {
      setPhoto(draft.photo)
      setIssueType(draft.issueType)
      setDescription(draft.description || '')
      setLocation(draft.location || null)
      setIssueNumber(draft.issueNumber || '')
      if (draft.photo) setStep(1)
    }
  }, [])

  useEffect(() => {
    if (step >= 2 && !location && !locating) {
      setLocating(true)
      getLocation().then(loc => { setLocation(loc); setLocating(false) })
    }
  }, [step])

  useEffect(() => {
    if (step > 0 && photo) saveDraft({ photo, issueType, description, location, issueNumber })
  }, [photo, issueType, description, location, issueNumber, step])

  const handlePhotoChange = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setPhoto(preview)
    const compressed = await compressImage(file)
    setPhotoBlob(compressed)
    const num = generateIssueNumber()
    setIssueNumber(num)
    setStep(1)
  }, [])

  const handleTypeSelect = useCallback((val) => {
    setIssueType(val)
    setStep(2)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!photo || !issueType) return
    setSubmitting(true)
    const issueData = {
      issueNumber,
      photo: photoBlob,
      issueType,
      description,
      location,
      submittedAt: new Date().toISOString(),
    }

    if (!isOnline) {
      enqueue(issueData)
      clearDraft()
      setSubmitted(true)
      setSubmitting(false)
      return
    }

    try {
      await new Promise(r => setTimeout(r, 1500))
      clearDraft()
      setSubmitted(true)
    } catch {
      enqueue(issueData)
      clearDraft()
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }, [photo, issueType, description, location, isOnline, photoBlob, issueNumber])

  const handleReset = useCallback(() => {
    setPhoto(null); setPhotoBlob(null); setIssueType(null)
    setDescription(''); setLocation(null); setSubmitted(false); setStep(0)
    setIssueNumber(''); setCompareView(false)
    clearDraft()
  }, [])

  const selectedType = ISSUE_TYPES.find(t => t.value === issueType)
  const pendingCount = getPendingItems().length

  if (submitted) {
    return (
      <motion.div
        key="success"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: 24, padding: '24px 24px 80px', textAlign: 'center' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 1, 0.5, 1] }}
          style={{ width: 72, height: 72, borderRadius: '50%', background: 'oklch(70% 0.18 145 / 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <CheckCircle size={36} color="oklch(70% 0.18 145)" />
        </motion.div>
        <div>
          <div style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', fontSize: 20, fontWeight: 700, color: 'oklch(92% 0.01 250)', marginBottom: 8 }}>提交成功</div>
          {issueNumber && <div style={{ fontFamily: '"Outfit", system-ui', fontSize: 13, color: 'oklch(65% 0.13 250)', marginBottom: 6, fontVariantNumeric: 'tabular-nums' }}>{issueNumber}</div>}
          <div style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', fontSize: 14, color: 'oklch(65% 0.01 250)', lineHeight: 1.5 }}>
            {isOnline ? '问题已上报，整改人将在 24 小时内处理' : '已存入离线队列，网络恢复后自动同步'}
          </div>
        </div>
        {pendingCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'oklch(80% 0.16 85)' }}>
            <Cloud size={13} />
            {pendingCount} 条待同步
          </div>
        )}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleReset}
          style={{ padding: '12px 32px', background: 'oklch(60% 0.15 250)', color: '#fff', border: 'none', borderRadius: 10, fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
        >
          继续上报
        </motion.button>
      </motion.div>
    )
  }

  return (
    <div style={{ padding: '0 16px 80px' }}>
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'oklch(80% 0.16 85 / 0.12)', borderRadius: 10, marginBottom: 12, borderLeft: '3px solid oklch(80% 0.16 85)' }}
          >
            <WifiOff size={13} color="oklch(80% 0.16 85)" />
            <span style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', fontSize: 12, color: 'oklch(80% 0.16 85)' }}>离线模式 · 提交后将存入队列</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 0 20px' }}>
        {step > 0 ? (
          <motion.button
            key="back"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => { if (compareView) setCompareView(false); else setStep(s => s - 1) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'oklch(65% 0.01 250)', marginRight: 8 }}
          >
            <ArrowLeft size={20} />
          </motion.button>
        ) : <div style={{ width: 32 }} />}
        {STEPS.map((_, idx) => {
          const isDone = idx < step
          const isActive = idx === step
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', flex: idx < STEPS.length - 1 ? 1 : undefined }}>
              <StepDot index={idx} isDone={isDone} isActive={isActive} />
              {idx < STEPS.length - 1 && <StepConnector isDone={isDone} />}
            </div>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
          >
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{ border: '2px dashed oklch(28% 0.01 250 / 0.5)', borderRadius: 16, minHeight: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer', background: 'oklch(18% 0.01 250)', transition: 'border-color 0.15s ease' }}
            >
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'oklch(22% 0.01 250)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={28} color="oklch(65% 0.01 250)" />
              </div>
              <div style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', fontSize: 16, fontWeight: 600, color: 'oklch(92% 0.01 250)' }}>点击拍照</div>
              <div style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', fontSize: 13, color: 'oklch(42% 0.01 250)' }}>或从相册选择</div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} style={{ display: 'none' }} />
          </motion.div>
        )}

        {step === 1 && photo && !compareView && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <div style={{ borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
              <img src={photo} alt="拍摄照片" style={{ width: '100%', display: 'block', maxHeight: 240, objectFit: 'cover' }} />
              {issueNumber && (
                <div style={{ position: 'absolute', top: 8, right: 8, padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: 'oklch(18% 0.01 250 / 0.85)', color: 'oklch(65% 0.13 250)', fontFamily: '"Outfit", system-ui', fontVariantNumeric: 'tabular-nums' }}>
                  {issueNumber}
                </div>
              )}
            </div>
            <div style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', fontSize: 15, fontWeight: 600, color: 'oklch(92% 0.01 250)', marginBottom: 4 }}>选择问题类型</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {ISSUE_TYPES.map(type => (
                <motion.button
                  key={type.value}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleTypeSelect(type.value)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', background: issueType === type.value ? `${type.color}25` : 'oklch(22% 0.01 250)', border: `1.5px solid ${issueType === type.value ? type.color : 'oklch(28% 0.01 250 / 0.3)'}`, borderRadius: 10, cursor: 'pointer', color: issueType === type.value ? type.color : 'oklch(92% 0.01 250)', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', fontSize: 13, fontWeight: issueType === type.value ? 600 : 400, textAlign: 'left', transition: 'all 0.15s ease' }}
                >
                  <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: type.color, flexShrink: 0 }} />
                  {type.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ borderRadius: 10, overflow: 'hidden', width: 72, height: 72, flexShrink: 0, cursor: 'pointer' }} onClick={() => setCompareView(true)}>
                <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                {selectedType && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: selectedType.color, background: `${selectedType.color}20`, marginBottom: 6 }}>
                    <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: '50%', background: selectedType.color }} />
                    {selectedType.label}
                  </div>
                )}
                {issueNumber && (
                  <div style={{ fontSize: 11, color: 'oklch(65% 0.13 250)', fontFamily: '"Outfit", system-ui', fontVariantNumeric: 'tabular-nums', marginBottom: 4 }}>{issueNumber}</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: location ? 'oklch(65% 0.01 250)' : 'oklch(42% 0.01 250)' }}>
                  {locating ? <span style={{ fontSize: 12 }}>定位中...</span> : <MapPin size={13} color={location ? 'oklch(70% 0.18 145)' : 'oklch(42% 0.01 250)'} />}
                  {location ? formatCoordinate(location.lat, location.lng) : locating ? '' : '定位失败，将以无位置提交'}
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', fontSize: 13, fontWeight: 600, color: 'oklch(65% 0.01 250)', marginBottom: 8 }}>
                问题描述
                {textareaMetrics.lines > 3 && (
                  <span style={{ fontSize: 11, fontWeight: 400, color: 'oklch(42% 0.01 250)', marginLeft: 8 }}>
                    · {textareaMetrics.lines}行
                  </span>
                )}
              </div>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="请详细描述问题（位置、现象、风险等级等）..."
                rows={4}
                style={{ 
                  width: '100%', 
                  background: 'oklch(18% 0.01 250)', 
                  border: '1px solid oklch(28% 0.01 250 / 0.4)', 
                  borderRadius: 10, 
                  padding: '12px 14px', 
                  fontSize: 14, 
                  color: 'oklch(92% 0.01 250)', 
                  resize: 'none', 
                  outline: 'none', 
                  boxSizing: 'border-box', 
                  fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', 
                  lineHeight: 1.5,
                  minHeight: textareaMetrics.computedHeight,
                  transition: 'min-height 0.2s ease',
                }}
              />
            </div>

            <motion.button
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              onClick={handleSubmit}
              disabled={submitting}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 0', background: submitting ? 'oklch(28% 0.01 250)' : 'oklch(60% 0.15 250)', color: '#fff', border: 'none', borderRadius: 10, fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', fontSize: 15, fontWeight: 600, cursor: submitting ? 'default' : 'pointer', marginTop: 4 }}
            >
              {submitting ? <span style={{ opacity: 0.7 }}>提交中...</span> : <><Upload size={16} />{isOnline ? '提交' : '离线提交'}</>}
            </motion.button>
          </motion.div>
        )}

        <AnimatePresence>
          {compareView && (
            <motion.div
              key="compare"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'oklch(13% 0.01 250)', padding: '16px 16px 32px', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', fontSize: 15, fontWeight: 600, color: 'oklch(92% 0.01 250)' }}>照片预览</span>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setCompareView(false)} style={{ padding: '6px 14px', background: 'oklch(22% 0.01 250)', border: '1px solid oklch(28% 0.01 250 / 0.3)', borderRadius: 8, fontSize: 13, color: 'oklch(92% 0.01 250)', cursor: 'pointer', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>关闭</motion.button>
              </div>
              <img src={photo} alt="预览" style={{ width: '100%', borderRadius: 12, display: 'block' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatePresence>
    </div>
  )
}
