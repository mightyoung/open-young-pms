// src/components/ModalConfig.js
// 统一弹窗尺寸规范

export const MODAL_SIZES = {
  small: 480, // 小表单（2-3字段）：通知设置、快速操作
  medium: 640, // 中表单（4-8字段）：论坛发帖、合同新建、风险登记
  large: 720, // 大表单/多步骤：质量检查、资源调度
  xlarge: 900, // 报告撰写、多标签表单
}

export const DRAWER_SIZES = {
  right: 720, // 右侧滑出（质量检查、资源）
  xright: 900, // 全高右侧（报告撰写）
}

// 通用 Modal 配置工厂
export function modalConfig(size = 'medium', title = '') {
  const width = MODAL_SIZES[size] || MODAL_SIZES.medium
  return {
    width,
    title: <span style={{ color: '#e4e4e7', fontWeight: 600 }}>{title}</span>,
    styles: {
      body: { background: '#ffffff', padding: 20 },
      header: { background: '#ffffff', borderBottom: '1px solid #e5e7eb' },
      mask: { background: 'rgba(0,0,0,0.7)' },
    },
    destroyOnClose: true,
  }
}
