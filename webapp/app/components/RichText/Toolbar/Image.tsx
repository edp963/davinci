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

import React, { useCallback, useContext } from 'react'

import { Icon, Upload, Tooltip } from 'antd'
import { RcCustomRequestOptions } from 'antd/lib/upload/interface'

import { getBase64 } from 'utils/util'
import { EditorContext } from '../context'
import { ElementTypes } from '../Element'

const Image: React.FC = () => {
  const { insertElement } = useContext(EditorContext)
  const handleFile = useCallback(
    (options: RcCustomRequestOptions) => {
      const { file } = options
      getBase64(file, (result: string) => {
        insertElement(ElementTypes.Image, result)
      })
    },
    [insertElement]
  )

  return (
    <Upload
      className="richtext-toolbar-item"
      accept="image/*"
      showUploadList={false}
      customRequest={handleFile}
    >
      <Tooltip title="插入图片">
        <Icon tabIndex={-1} type="picture" />
      </Tooltip>
    </Upload>
  )
}

export default Image
