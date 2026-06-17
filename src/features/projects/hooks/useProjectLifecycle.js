import { useCallback, useEffect, useMemo, useState } from 'react'
import { message } from 'antd'
import { projectLifecycleApi } from '../api/projectLifecycleApi'

export function useProjectLifecycle(defaultProjectType = 'integration_engineering') {
  const [projectTypes, setProjectTypes] = useState([])
  const [selectedType, setSelectedType] = useState(defaultProjectType)
  const [templates, setTemplates] = useState([])
  const [lifecycle, setLifecycle] = useState(null)
  const [loading, setLoading] = useState(false)

  const selectedTemplate = useMemo(() => templates[0] || lifecycle?.template || null, [templates, lifecycle])

  const loadLifecycle = useCallback(async (projectType) => {
    setLoading(true)
    try {
      const [typesData, templateData, lifecycleData] = await Promise.all([
        projectLifecycleApi.listProjectTypes(),
        projectLifecycleApi.listTemplates(projectType),
        projectLifecycleApi.getLifecycle('preview', { project_type: projectType }),
      ])
      setProjectTypes(Array.isArray(typesData) ? typesData : [])
      setTemplates(Array.isArray(templateData) ? templateData : [])
      setLifecycle(lifecycleData)
    } catch (error) {
      setProjectTypes([])
      setTemplates([])
      setLifecycle(null)
      message.error(error?.message || '生命周期数据加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLifecycle(selectedType)
  }, [loadLifecycle, selectedType])

  return {
    projectTypes,
    selectedType,
    setSelectedType,
    templates,
    selectedTemplate,
    lifecycle,
    loading,
    reload: () => loadLifecycle(selectedType),
  }
}

export default useProjectLifecycle
