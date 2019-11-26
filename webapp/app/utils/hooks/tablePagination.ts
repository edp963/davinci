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

import { useState, useCallback, useEffect } from 'react'

import { PaginationConfig } from 'antd/lib/table'

const defaultSimpleWidth = 768
const basePagination: PaginationConfig = {
  defaultPageSize: 20,
  showSizeChanger: true
}

function useTablePagination(
  simpleWidth: number,
  baseConfig?: PaginationConfig
) {
  const [screenWidth, setScreenWidth] = useState(
    document.documentElement.clientWidth
  )
  const updateScreenWidth = useCallback(() => {
    setScreenWidth(document.documentElement.clientWidth)
  }, [])

  useEffect(() => {
    window.addEventListener('resize', updateScreenWidth, false)

    return function cleanup() {
      window.removeEventListener('resize', updateScreenWidth, false)
    }
  }, [])
  const simple =
    screenWidth <= (simpleWidth <= 0 ? defaultSimpleWidth : simpleWidth)

  const pagination: PaginationConfig = {
    ...basePagination,
    ...baseConfig,
    simple
  }

  return pagination
}

export default useTablePagination
