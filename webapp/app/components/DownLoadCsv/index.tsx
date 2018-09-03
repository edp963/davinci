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

import * as React from 'react'
const Icon = require('antd/lib/icon')

export interface IDownloadCsvProps {
  id?: number
  type?: string
  itemId?: number
  shareInfo: string
  shareInfoLoading?: boolean
  downloadCsvLoading: boolean
  onLoadDashboardShareLink?: (id: number, authName: string) => void
  onLoadWidgetShareLink?: (id: number, itemId: number, authName: string) => void
  onDownloadCsv: () => void
}

export function DownloadCsv (props: IDownloadCsvProps) {
  const { shareInfoLoading, downloadCsvLoading } = props
  const iconType = shareInfoLoading || downloadCsvLoading ? 'loading' : 'download'
  return (
    <Icon type={iconType} onClick={getShareInfo(props)} />
  )
}

function getShareInfo (props) {
  return function () {
    const {
      id,
      type,
      itemId,
      shareInfo,
      onLoadDashboardShareLink,
      onLoadWidgetShareLink,
      onDownloadCsv
    } = props

    if (!shareInfo) {
      switch (type) {
        case 'dashboard':
          onLoadDashboardShareLink(id, '')
          break
        case 'widget':
          onLoadWidgetShareLink(id, itemId, '', () => {
            onDownloadCsv()
          })
          break
        default:
          break
      }
    } else {
      onDownloadCsv()
    }
  }
}

export default DownloadCsv
