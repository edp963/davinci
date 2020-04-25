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

import React, { useCallback } from 'react'
import { Editor, Transforms, Element, Node } from 'slate'
import { useSlate } from 'slate-react'

import {
  ElementType,
  ElementTypes,
  TextStyles,
  TextProperties
} from './Element'
import { BlockProperties, BlockAlignments } from './Element/constants'

const ListTypes: ElementType[] = [
  ElementTypes.NumberedList,
  ElementTypes.BulletedList
]

export const useEditorContext = () => {
  const editor = useSlate()

  const isElementActive = useCallback(
    (elementType: ElementType) => {
      const [match] = Editor.nodes(editor, {
        match: (n) => n.type === elementType
      })
      return !!match
    },
    [editor]
  )

  const isTextStyleActive = useCallback(
    (textStyle: TextStyles) => {
      const marks = Editor.marks(editor)
      if (!marks) {
        return false
      }
      return !!marks[textStyle]
    },
    [editor]
  )

  const isTextPropertyActive = useCallback(
    (
      textProperty: TextProperties,
      value?: string | number
    ): boolean | string | number => {
      const marks = Editor.marks(editor)
      if (!marks) {
        return false
      }
      if (value !== undefined) {
        return marks[textProperty] === value
      }
      return marks[textProperty]
    },
    [editor]
  )

  const isBlockPropertyActive = useCallback(
    (
      blockProperty: BlockProperties,
      value?: BlockAlignments
    ): boolean | BlockAlignments => {
      const [match] = Editor.nodes(editor, {
        at: editor.selection,
        match: (n) => Editor.isBlock(editor, n),
        mode: 'lowest'
      })
      if (!match) {
        return false
      }
      const node = match[0]
      const active = value ? node[blockProperty] === value : node[blockProperty]
      return active
    },
    [editor]
  )

  const isListElement = useCallback(
    (elementType: ElementType) => {
      return ListTypes.includes(elementType)
    },
    [editor]
  )

  const toggleElement = useCallback(
    (elementType: ElementType) => {
      const isActive = isElementActive(elementType)
      const isList = isListElement(elementType)

      Transforms.unwrapNodes(editor, {
        match: (n) => isListElement(n.type),
        split: true
      })
      Transforms.setNodes(editor, {
        type: isActive
          ? ElementTypes.Paragraph
          : isList
          ? ElementTypes.ListItem
          : elementType
      })

      if (!isActive && isList) {
        const element = { type: elementType, children: [] }
        Transforms.wrapNodes(editor, element)
      }
    },
    [editor]
  )

  const toggleTextStyle = useCallback(
    (textStyle: TextStyles) => {
      const isActive = isTextStyleActive(textStyle)
      isActive
        ? Editor.removeMark(editor, textStyle)
        : Editor.addMark(editor, textStyle, true)
    },
    [editor]
  )

  const clearTextFormat = useCallback(() => {
    Object.values(TextStyles).forEach((style) => {
      Editor.removeMark(editor, style)
    })
    Object.values(TextProperties).forEach((property) => {
      Editor.removeMark(editor, property)
    })
  }, [editor])

  const toggleTextProperty = useCallback(
    (textProperty: TextProperties, value: string | number) => {
      const isActive = isTextPropertyActive(textProperty)

      isActive
        ? Editor.removeMark(editor, textProperty)
        : Editor.addMark(editor, textProperty, value)
      if (value) {
        Editor.addMark(editor, textProperty, value)
      }
    },
    [editor]
  )

  const toggleBlockProperty = useCallback(
    (blockProperty: BlockProperties, value: BlockAlignments) => {
      const [match] = Editor.nodes(editor, {
        at: editor.selection,
        match: (n) => Editor.isBlock(editor, n),
        mode: 'lowest'
      })
      Transforms.setNodes(editor, { [blockProperty]: value })
    },
    [editor]
  )

  const insertElement = useCallback(
    (elementType: ElementType, value: string, children?: Node[]) => {
      const element: Element = {
        type: elementType,
        children: children || [{ text: '' }]
      }
      switch (elementType) {
        case ElementTypes.Image:
        case ElementTypes.Link:
          element.url = value
          break
      }
      Transforms.insertNodes(editor, element)
    },
    [editor]
  )

  return {
    isElementActive,
    isTextStyleActive,
    isTextPropertyActive,
    isBlockPropertyActive,
    isListElement,
    toggleElement,
    toggleTextStyle,
    toggleTextProperty,
    toggleBlockProperty,
    insertElement,
    clearTextFormat
  }
}

export const EditorContext = React.createContext<
  ReturnType<typeof useEditorContext>
>(null)
