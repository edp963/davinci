import * as React from 'react'
const Button = require('antd/lib/button')
const styles = require('./EditorHeader.less')

interface IEditorHeaderProps {
  name: string
  description: string
  placeholder?: {
    name: string
    description: string
  }
  className: string
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDescriptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSave: () => void
  onCancel: () => void
  loading?: boolean
}

export function EditorHeader (props: IEditorHeaderProps) {
  const {
    name,
    description,
    className,
    onNameChange,
    onDescriptionChange,
    onSave,
    onCancel,
    loading
  } = props

  const placeholder = props.placeholder || {
    name: '请输入名称',
    description: '请输入描述…'
  }

  return (
    <div className={`${styles.editorHeader} ${className}`}>
      <div className={styles.title}>
        <div className={styles.name}>
          <input type="text" placeholder={placeholder.name} value={name} onChange={onNameChange} />
          <span>{name || placeholder.name}</span>
        </div>
        <div className={styles.desc}>
          <input type="text" placeholder={placeholder.description} value={description} onChange={onDescriptionChange} />
          <span>{description || placeholder.description}</span>
        </div>
      </div>
      <div className={styles.actions}>
        <Button
          type="primary"
          loading={loading}
          disabled={loading}
          onClick={onSave}
        >
          保存
        </Button>
        <Button onClick={onCancel}>取消</Button>
      </div>
    </div>
  )
}

export default EditorHeader
