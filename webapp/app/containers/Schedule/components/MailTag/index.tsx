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
  useMemo,
  useState,
  useCallback,
  useEffect,
  useImperativeHandle,
  forwardRef
} from 'react'
import debounce from 'lodash/debounce'

import { Tag, AutoComplete, Input, Icon } from 'antd'
const { Option } = AutoComplete
import { SelectValue } from 'antd/lib/select'
import Avatar from 'components/Avatar'

import { IUserInfo } from '../types'

import Styles from './MailTag.less'

interface IMailTagProps {
  dataSource: IUserInfo[]
  value?: string
  onLoadDataSource: (keyword: string) => void
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
}

const MailTag: React.FC<IMailTagProps> = (props, ref) => {
  const {
    dataSource,
    value,
    onLoadDataSource,
    onChange,
    onFocus,
    onBlur
  } = props
  const options = useMemo(
    () =>
      dataSource.map(({ id, username, email, avatar }) => (
        <Option key={id} value={email}>
          <div className={Styles.mailOption}>
            <Avatar path={avatar} size="small" />
            <span>{username}</span>
            <span>{email}</span>
          </div>
        </Option>
      )),
    [dataSource]
  )
  const [keyword, setKeyword] = useState<SelectValue>('')
  useEffect(
    () => {
      setKeyword('')
    },
    [value]
  )
  const emails = useMemo(() => (value ? value.split(';') : []), [value])

  const removeEmail = useCallback(
    (email) => () => {
      const newValue = emails.filter((val) => val !== email).join(';')
      onChange(newValue)
    },
    [value, onChange]
  )

  const loadDataSource = useCallback(
    debounce((keyword: string) => {
      onLoadDataSource(keyword)
    }, 800),
    [onLoadDataSource]
  )

  const selectEmail = useCallback(
    (email: string) => {
      const newEmails = [...emails]
      const idx = newEmails.indexOf(email)
      if (idx >= 0) {
        newEmails.splice(idx, 1)
      }
      newEmails.push(email)
      onChange(newEmails.join(';'))
    },
    [value, onChange, setKeyword]
  )

  useImperativeHandle(ref, () => ({}))

  return (
    <>
      {emails.map((email) => (
        <Tag closable key={email} color="blue" onClose={removeEmail(email)}>
          {email}
        </Tag>
      ))}
      <AutoComplete
        placeholder="输入邮箱或姓名关键字查找..."
        value={keyword}
        dataSource={options}
        optionLabelProp=""
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={setKeyword}
        onSearch={loadDataSource}
        onSelect={selectEmail}
      >
        <Input suffix={<Icon type="search" />} />
      </AutoComplete>
    </>
  )
}

export default forwardRef(MailTag)
