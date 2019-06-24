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

import { Row, Col, Button, InputNumber, Tooltip } from 'antd'

import Styles from '../View.less'

export interface IEditorBottomProps {
  sqlLimit: number
  loading: boolean
  nextDisabled: boolean
  onSetSqlLimit: (limit: number) => void
  onExecuteSql: () => void
  onStepChange: (stepChange: number) => void
}

const stepChange = (onStepChange: IEditorBottomProps['onStepChange'], step: number) => () => {
  onStepChange(step)
}

export const EditorBottom = (props: IEditorBottomProps) => {
  const { sqlLimit, loading, nextDisabled, onSetSqlLimit, onExecuteSql, onStepChange } = props

  return (
    <Row className={Styles.bottom} type="flex" align="middle" justify="start">
    <Col span={12} className={Styles.previewInput}>
      <span>展示前</span>
      <InputNumber value={sqlLimit} onChange={onSetSqlLimit} />
      <span>条数据</span>
    </Col>
    <Col span={12} className={Styles.toolBtns}>
      <Button onClick={stepChange(onStepChange, -1)}>取消</Button>
      <Button
        type="primary"
        disabled={loading}
        loading={loading}
        icon="caret-right"
        onClick={onExecuteSql}
      >
        执行
      </Button>
      <Tooltip title={nextDisabled ? '执行后下一步可用' : ''}>
        <Button onClick={stepChange(onStepChange, 1)} disabled={nextDisabled}>
          下一步
        </Button>
      </Tooltip>
    </Col>
  </Row>
  )
}

export default EditorBottom
