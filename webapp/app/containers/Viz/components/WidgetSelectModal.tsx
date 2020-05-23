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

import React, { useCallback, useState, useMemo, useRef, useEffect } from 'react'

import { Steps, Modal } from 'antd'
const { Step } = Steps

import { IWidgetFormed } from 'containers/Widget/types'
import WidgetSelector from 'containers/Widget/components/WidgetSelector'
import PollingConfig, { PollingSetting } from './PollingConfig'
import { NativeButtonProps } from 'antd/lib/button/button'
import { WrappedFormUtils } from 'antd/lib/form/Form'

interface IWidgetSelectModalProps {
  visible: boolean
  loading: boolean
  multiple: boolean
  widgets: IWidgetFormed[]
  onOk: (widgets: IWidgetFormed[], pollingSetting: PollingSetting) => void
  onCancel: () => void
}

const WidgetSelectModal: React.FC<IWidgetSelectModalProps> = (props) => {
  const { visible, loading, multiple, widgets, onOk, onCancel } = props

  const [currentStep, setCurrentStep] = useState(0)
  const [selectedWidgets, setSelectedWidgets] = useState([])
  const refPollingConfig = useRef<WrappedFormUtils<PollingSetting>>(null)

  useEffect(() => {
    if (!visible) {
      refPollingConfig.current && refPollingConfig.current.resetFields()
      setSelectedWidgets([])
      setCurrentStep(0)
    }
  }, [visible, refPollingConfig.current])

  const save = useCallback(() => {
    refPollingConfig.current.validateFieldsAndScroll((err, values) => {
      if (err) {
        return
      }
      onOk(selectedWidgets, values)
    })
  }, [refPollingConfig.current, selectedWidgets, onOk])

  const modalButtonProps: [
    [NativeButtonProps, NativeButtonProps],
    [NativeButtonProps, NativeButtonProps]
  ] = useMemo(
    () => [
      [
        { style: { display: 'none' } },
        {
          disabled: !selectedWidgets.length,
          onClick: () => setCurrentStep(1)
        }
      ],
      [{ onClick: () => setCurrentStep(0) }, {}]
    ],
    [selectedWidgets.length]
  )
  const modalButtonTexts = useMemo(() => [['', '下一步'], ['上一步', '']], [])
  const [cancelButtonProps, okButtonProps] = modalButtonProps[currentStep]
  const [cancelText, okText] = modalButtonTexts[currentStep]

  return (
    <Modal
      title="选择 Widget"
      wrapClassName="ant-modal-large"
      visible={visible}
      confirmLoading={loading}
      okButtonProps={okButtonProps}
      cancelButtonProps={cancelButtonProps}
      okText={okText}
      cancelText={cancelText}
      onOk={save}
      onCancel={onCancel}
    >
      <>
        <Steps
          current={currentStep}
          style={{ padding: '0 5%', marginBottom: 24 }}
        >
          <Step title="widget" />
          <Step title="数据更新" />
        </Steps>
        {
          [
            <WidgetSelector
              widgets={widgets}
              multiple={multiple}
              widgetsSelected={selectedWidgets}
              onWidgetsSelect={setSelectedWidgets}
            />,
            <PollingConfig ref={refPollingConfig} />
          ][currentStep]
        }
      </>
    </Modal>
  )
}

export default WidgetSelectModal
