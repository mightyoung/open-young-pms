export function normalizeApiResponse(payload) {
  if (payload == null) {
    return { ok: true, data: payload, message: '', code: null, raw: payload }
  }

  if (typeof payload.code === 'string') {
    return {
      ok: payload.code === 'A0000',
      data: payload.data !== undefined ? payload.data : payload,
      message: payload.message || '',
      code: payload.code,
      raw: payload,
    }
  }

  if (typeof payload.success === 'boolean') {
    return {
      ok: payload.success,
      data: payload.data !== undefined ? payload.data : payload,
      message: payload.message || '',
      code: payload.code || null,
      raw: payload,
    }
  }

  return {
    ok: true,
    data: payload.data !== undefined ? payload.data : payload,
    message: payload.message || '',
    code: payload.code || null,
    raw: payload,
  }
}
