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

import React, {
  useContext,
  useMemo,
  useCallback,
  useEffect,
  useState
} from 'react'
import classnames from 'classnames'

import { LayerListContext, LayerContext } from '../util'
import { DraggableProxyContext } from '../Draggable'
import { ContextMenuProxyContext } from '../ContextMenu'

const LayerBox: React.FC = (props) => {
  const { onSelectionChange } = useContext(LayerListContext)
  const {
    layer: { id: layerId, params, index },
    operationInfo
  } = useContext(LayerContext)
  const { style: draggableStyle, ...restDraggableProps } = useContext(
    DraggableProxyContext
  )

  const { className, ...restContextMenuProps } = useContext(
    ContextMenuProxyContext
  )

  const layerStyle = useMemo(() => {
    const {
      width,
      height,
      positionX,
      positionY,
      backgroundImage,
      backgroundRepeat,
      backgroundSize,
      backgroundColor,
      borderWidth,
      borderStyle,
      borderColor,
      borderRadius
    } = params

    const style: React.CSSProperties = {
      position: 'absolute',
      left: positionX,
      top: positionY,
      width: `${width}px`,
      height: `${height}px`,
      zIndex: index,
      ...draggableStyle
    }
    if (borderWidth && borderStyle && borderColor) {
      style.border = `${borderWidth}px ${borderStyle} rgba(${borderColor.join()}`
    }
    if (borderRadius) {
      style.borderRadius = `${borderRadius}px`
    }
    if (backgroundImage) {
      style.background = `url("${backgroundImage}") 0% 0% / ${backgroundSize} ${backgroundRepeat}`
    } else if (backgroundColor) {
      style.backgroundColor = `rgba(${backgroundColor.join()})`
    }
    return style
  }, [params, index, draggableStyle])

  const [lastPosition, setLastPosition] = useState([
    params.positionX,
    params.positionY
  ])

  const selectionChange = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation()
      if (!onSelectionChange || (e.target as HTMLDivElement).nodeName.toLowerCase() === 'span') {
        return
      }

      // to solve the onMouseDown/onMouseUp onClick confliction
      const isSamePos =
        lastPosition[0] === params.positionX &&
        lastPosition[1] === params.positionY
      setLastPosition([params.positionX, params.positionY])
      if (!isSamePos) {
        return
      }

      const { altKey, metaKey } = e
      const exclusive = !altKey && !metaKey
      onSelectionChange(layerId, !operationInfo.selected, exclusive)
    },
    [
      onSelectionChange,
      layerId,
      operationInfo,
      lastPosition,
      params.positionX,
      params.positionY
    ]
  )

  const boxCls = classnames({
    'display-slide-layer': true,
    'display-slide-layer-editing': operationInfo,
    'display-slide-layer-selected': operationInfo && operationInfo.selected,
    [className]: !!className
  })

  return (
    <div
      className={boxCls}
      style={layerStyle}
      {...restContextMenuProps}
      {...restDraggableProps}
      onClick={selectionChange}
    >
      {props.children}
    </div>
  )
}

export default LayerBox
