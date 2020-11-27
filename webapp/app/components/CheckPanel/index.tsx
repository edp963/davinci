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
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Input, Checkbox, Tag, Tooltip } from 'antd'
import { ICheckPanelProps } from './types'
import { getSeparatedContent } from './utils'
import debounce from 'lodash/debounce'
import concat from 'lodash/concat'

import styles from './CheckPanel.less'

const CheckPanel: React.FC<ICheckPanelProps> = (
  {
    dataSource,
    defaultKeys,
    placeholder,
    labelKey,
    valueKey,
    labelInValue,
    closableByTag,
    tokenSeparators,
    onChange,
  }
) => {

  const label = labelKey || 'label'
  const value = valueKey || 'value'

  const [checkedKeys, setCheckedKeys] = useState<any[]>([])
  const [targets, setTargets] = useState<any[]>([])
  const [filterValue, setFilterValue] = useState<string>('')

  useEffect(() => {
    if (defaultKeys && defaultKeys.length) {
      setCheckedKeys(defaultKeys)
      setTargets(dataSource.filter(v => defaultKeys.some(key => key === v[value])))
    }
  }, [])

  const filterDataSource = useMemo(() => {
    if (tokenSeparators && tokenSeparators.length) {
      const separatedContent = getSeparatedContent(filterValue, tokenSeparators)
      const pathLabels = separatedContent && separatedContent.length ? separatedContent : [filterValue]
      return dataSource
        .filter(data => pathLabels.some(key => data[label].includes(key)))
    }

    return dataSource
      .filter((data) => data[label].includes(filterValue))
  }, [filterValue])

  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      setFilterValue(searchValue)
    }, 300),
    []
  )

  const panel = useMemo(() => ({
    indeterminate: !!checkedKeys.length && checkedKeys.length < dataSource.length,
    checkAll: checkedKeys.length === dataSource.length,
  }), [checkedKeys])

  const checkOrNot = useCallback(
    (value) => checkedKeys.some(key => key === value),
    [checkedKeys]
  )

  const handleChange = useCallback((key: string | number, checked: boolean) => {
    const holderKeys = concat([], checkedKeys)
    const holderTargets = concat([], targets)

    if (checked) {
      const index = dataSource.findIndex(item => item[value] === key)
      holderTargets.push(dataSource[index])
      holderKeys.push(key)
    } else {
      holderKeys.splice(holderKeys.findIndex(k => k === key), 1)
      holderTargets.splice(holderTargets.findIndex(tag => tag[value] === key), 1)
    }

    setCheckedKeys(holderKeys)
    setTargets(holderTargets)
    if (onChange) {
      onChange(labelInValue ? holderTargets : holderKeys)
    }
  }, [checkedKeys, targets, onChange])

  const onCheckAllChange = useCallback((checked: boolean) => {
    const keys = dataSource.map(item => item[value])
    const items = [...dataSource]

    setCheckedKeys(checked ? keys : [])
    setTargets(checked ? items : [])
    if (onChange) {
      onChange(labelInValue ? items : keys)
    }
  }, [onChange])

  return (
    <div className={styles.checkPanelWrapper}>
      <div className={styles.leftWrapper}>
        <div className={styles.headWrapper}>
          <Checkbox
            indeterminate={panel.indeterminate}
            checked={panel.checkAll}
            onChange={e => onCheckAllChange(e.target.checked)}
          >{filterDataSource.length} 项</Checkbox>
          <div>列表</div>
        </div>
        <div className={styles.contentWrapper}>
          <Input.Search
            placeholder={placeholder || '请输入关键词'}
            onChange={e => debouncedSearch(e.target.value)}
          />
          {/* <div className={styles.tips}></div> */}
          <div className={styles.optionRow}>
            {filterDataSource.length ? filterDataSource.map((item, index) => (
              <Checkbox
                key={`${item[value]}-${index}`}
                checked={checkOrNot(item[value])}
                value={item[value]}
                onChange={e => handleChange(e.target.value, e.target.checked)}
              >
                <Tooltip title={item[label]}>
                  {item[label]}
                </Tooltip>
              </Checkbox>
            )) : null}
          </div>
        </div>
      </div>
      <div className={styles.rightWrapper}>
        <div className={styles.headWrapper}>
          <div>{targets.length} 项</div>
          <div>已选</div>
        </div>
        <div className={styles.tagWrapper}>
          {
            targets.length ? targets.map((tag, index) => (
              <Tag
                key={`${tag[value]}-${index}`}
                color="#108ee9"
                closable={closableByTag}
                onClose={e => {
                  e.preventDefault()
                  handleChange(tag[value], false)
                }}
              >
                {tag[label]}
              </Tag>
            )) : null
          }
        </div>
      </div>
    </div>
  )
}

export default CheckPanel
