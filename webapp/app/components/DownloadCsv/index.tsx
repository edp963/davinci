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

import React from 'react'
import { Icon } from 'antd'

export interface IDownloadCsvProps {
  id?: number
  type?: string
  itemId?: number
  shareToken: string
  shareLoading?: boolean
  downloadCsvLoading: boolean
  onDownloadCsv: () => void
}

export function DownloadCsv (props: IDownloadCsvProps) {
  const { shareLoading, downloadCsvLoading } = props
  const iconType = shareLoading || downloadCsvLoading ? 'loading' : 'download'
  return (
    <Icon type={iconType} onClick={getShareToken(props)} />
  )
}

function getShareToken (props) {
  return function () {
    props.onDownloadCsv()
  }
}

export default DownloadCsv
