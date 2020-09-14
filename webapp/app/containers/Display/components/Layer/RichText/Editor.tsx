/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

import React, { useMemo, useImperativeHandle, useCallback } from 'react'
import classnames from 'classnames'
import { Editable, withReact, Slate, RenderLeafProps } from 'slate-react'
import { createEditor, Node } from 'slate'
import { withHistory } from 'slate-history'
import { withHtml } from 'components/RichText/decorators'
import { parseHtml } from 'components/RichText/util'

import Toolbar from 'components/RichText/Toolbar'
import { Element, withElements } from 'components/RichText/Element'
import { Leaf } from 'components/RichText/Leaf'

interface IEditorProps {
  value?: Node[] | string
  className?: string
  readOnly?: boolean
  toolbar?: React.ReactNode
  onFormatText?: (text: string) => string
  onChange?: (newVal: Node[]) => void
}

interface IEditorProps {
  value?: Node[] | string
  className?: string
  readOnly?: boolean
  toolbar?: React.ReactNode
  styles?: React.CSSProperties
  onFormatText?: (text: string) => string
  onChange?: (newVal: Node[]) => void
}

const Editor: React.FC<IEditorProps> = (props, ref) => {
  const {
    value,
    className,
    readOnly,
    toolbar,
    onFormatText,
    onChange,
    styles
  } = props

  const initialValue = useMemo(() => {
    let parsedValue: Node[]
    if (typeof value === 'string') {
      try {
        parsedValue = JSON.parse(value)
      } catch {
        parsedValue = parseHtml(value)
      }
      if (!parsedValue.length) {
        parsedValue.push({ text: '' })
      }
    } else {
      parsedValue = value
    }
    return parsedValue
  }, [value])

  const editor = useMemo(
    () => withElements(withHtml(withReact(withHistory(createEditor())))),
    []
  )
  const renderLeaf = useCallback(
    (props: RenderLeafProps) => {
      return <Leaf {...props} onFormatText={onFormatText} />
    },
    [onFormatText]
  )

  const cls = useMemo(
    () =>
      classnames({
        'richtext': true,
        'display-slide-layer-editor': true,
        [className]: !!className
      }),
    []
  )
  useImperativeHandle(ref, () => ({}))

  return (
    <div className={cls}>
      <Slate editor={editor} value={initialValue} onChange={onChange}>
        {toolbar === false ? null : toolbar || <Toolbar.Toolbar />}
        <Editable
          style={styles}
          renderElement={Element}
          renderLeaf={renderLeaf}
          readOnly={readOnly}
          spellCheck
          autoFocus={!!toolbar}
        />
      </Slate>
    </div>
  )
}

export default React.forwardRef(Editor)
