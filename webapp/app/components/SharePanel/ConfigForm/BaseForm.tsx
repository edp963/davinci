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

import React, { memo, useCallback } from 'react'
import moment from 'moment'
import UrlClipboard from './UrlClipboard'
import { Form, Row, Col, DatePicker, Button } from 'antd'
import { WrappedFormUtils } from 'antd/lib/form/Form'
import { TCopyType } from '../types'
import { DEFAULT_DATETIME_FORMAT } from 'app/globalConstants'
import styles from '../SharePanel.less'
const FormItem = Form.Item

interface IBaseFormProps {
  form: WrappedFormUtils
  shareUrl: string
  password?: string
  loading: boolean
  onCopy: (copytype: TCopyType) => () => void
  onGetToken: () => void
}

const BaseForm: React.FC<IBaseFormProps> = ({
  form,
  shareUrl,
  password,
  loading,
  onCopy,
  onGetToken
}) => {
  const { getFieldDecorator } = form
  const itemStyle = { labelCol: { span: 6 }, wrapperCol: { span: 17 } }

  const disabledDate = useCallback(
    (current) => current && current < moment().subtract(1, 'day').endOf('day'),
    []
  )

  return (
    <>
      <Row gutter={8}>
        <Col span={24}>
          <FormItem label="有效期" {...itemStyle}>
            {getFieldDecorator('expired', {
              rules: [{ required: true, message: '有效期不能为空' }]
            })(
              <DatePicker
                showTime
                format={DEFAULT_DATETIME_FORMAT}
                disabledDate={disabledDate}
              />
            )}
          </FormItem>
        </Col>
      </Row>
      <Row gutter={8} type="flex" justify="center">
        <Col>
          <Button
            className={styles.generate}
            disabled={loading}
            loading={loading}
            type="link"
            onClick={onGetToken}
          >
            点击生成链接
          </Button>
        </Col>
      </Row>
      <UrlClipboard shareUrl={shareUrl} password={password} onCopy={onCopy} />
    </>
  )
}

export default memo(BaseForm)
