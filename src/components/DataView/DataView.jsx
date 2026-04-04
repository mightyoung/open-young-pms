/**
 * DataView — unified list/card content wrapper with consistent states.
 * States: loading (skeleton) → empty → error → data
 *
 * @example
 * <DataView
 *   loading={loading}
 *   empty={data.length === 0}
 *   emptyType="list"
 *   skeletonType="cards"
 *   error={error}
 *   onRetry={load}
 * >
 *   {data.map(item => <Card key={item.id}>{item.name}</Card>)}
 * </DataView>
 */
import React from 'react'
import { Button } from 'antd'
import EmptyState from '../EmptyState'
import SkeletonContent from '../SkeletonContent'

export default function DataView({
  loading = false,
  empty = false,
  emptyType = 'list',
  skeletonType = 'cards',
  error = null,
  onRetry,
  children,
  style,
  skeletonCount = 4,
}) {
  if (loading) {
    return <SkeletonContent type={skeletonType} count={skeletonCount} style={style} />
  }

  if (error) {
    return (
      <EmptyState
        type="error"
        title="加载失败"
        description={error?.message || '请稍后重试'}
        action={
          onRetry ? (
            <Button onClick={onRetry} size="small">
              重新加载
            </Button>
          ) : undefined
        }
      />
    )
  }

  if (empty) {
    return (
      <EmptyState
        type={emptyType}
        title={emptyType === 'search' ? '未找到结果' : '暂无数据'}
        description={emptyType === 'search' ? '换个关键词试试' : '暂无相关记录'}
      />
    )
  }

  return <>{children}</>
}
