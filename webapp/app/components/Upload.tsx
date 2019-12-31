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
  useCallback,
  useState,
  RefForwardingComponent,
  PropsWithChildren
} from 'react'
import { Upload as AntUpload, Spin } from 'antd'
import { UploadChangeParam } from 'antd/lib/upload'

interface IUploadProps {
  name: string
  action: string
  onChange?: (path: string) => void
}

const Upload: RefForwardingComponent<
  AntUpload,
  PropsWithChildren<IUploadProps>
> = (props, ref) => {
  const { name, action, onChange } = props
  const [loading, setLoading] = useState(false)
  const headers = {
    authorization: `Bearer ${localStorage.getItem('TOKEN')}`
  }
  const change = useCallback((info: UploadChangeParam) => {
    const { status, response } = info.file
    if (status === 'uploading') {
      setLoading(true)
      return
    }
    if (status === 'done') {
      onChange(response.payload)
    }
    setLoading(false)
  }, [])
  return (
    <AntUpload
      ref={ref}
      showUploadList={false}
      name={name}
      action={action}
      headers={headers}
      onChange={change}
    >
      {loading ? <Spin /> : props.children}
    </AntUpload>
  )
}

export default React.forwardRef(Upload)
