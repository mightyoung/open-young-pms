/**
 * WBS task decomposition and critical path calculation
 */

export function buildDependencyGraph(tasks) {
  const graph = {}
  tasks.forEach(t => {
    graph[t.id] = { ...t, depends: t.depends || [], duration: t.duration || 1 }
  })
  return graph
}

export function calculateCriticalPath(tasks) {
  if (!tasks || tasks.length === 0) return []

  const graph = buildDependencyGraph(tasks)
  const nodes = Object.values(graph)
  const durations = {}
  const predecessors = {}

  nodes.forEach(n => {
    if (!n.depends || n.depends.length === 0) {
      durations[n.id] = 0
      predecessors[n.id] = []
    }
  })

  let changed = true
  while (changed) {
    changed = false
    nodes.forEach(n => {
      if (durations[n.id] === undefined) {
        const allDone = n.depends.every(d => durations[d] !== undefined)
        if (allDone) {
          durations[n.id] = Math.max(...n.depends.map(d => durations[d])) + n.duration
          predecessors[n.id] = n.depends
          changed = true
        }
      }
    })
  }

  const maxEnd = Math.max(...Object.values(durations))
  const criticalNodes = Object.entries(durations)
    .filter(([, v]) => v === maxEnd)
    .map(([k]) => parseInt(k))

  return criticalNodes
}

export function findResourceConflicts(tasks, _resources) {
  const conflicts = []
  const resourceUsage = {}

  tasks.forEach(task => {
    const resource = task.assignee
    if (!resourceUsage[resource]) resourceUsage[resource] = []
    const overlapping = resourceUsage[resource].filter(
      t => t.endDate > task.startDate && t.startDate < task.endDate
    )
    if (overlapping.length > 0) {
      conflicts.push({
        resource,
        task,
        overlapped: overlapping,
      })
    }
    resourceUsage[resource].push(task)
  })

  return conflicts
}

export function wbsToTree(items, parentKey = '0') {
  return items
    .filter(i => i.parentKey === parentKey)
    .map(i => ({
      ...i,
      key: i.id,
      title: i.title,
      children: wbsToTree(items, i.id),
    }))
}
