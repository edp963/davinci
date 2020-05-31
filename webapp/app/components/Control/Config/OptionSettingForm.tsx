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

import React, { PureComponent } from 'react'

import { Form, Input, Modal, Icon } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
const FormItem = Form.Item
const TextArea = Input.TextArea

import styles from '../Control.less'

interface IOptionSettingFormProps {
  visible: boolean
  options: string
  onSave: () => void
  onCancel: () => void
}

export class OptionSettingForm extends PureComponent<IOptionSettingFormProps & FormComponentProps, {}> {

  public componentDidUpdate (prevProps: IOptionSettingFormProps & FormComponentProps) {
    const { form, options } = this.props
    if (options !== prevProps.options) {
      form.setFieldsValue({ options })
    }
  }

  public render () {
    const { form, visible, onSave, onCancel } = this.props
    const { getFieldDecorator } = form
    const placeholder = `请输入选项文本与值，用回车分隔，例如：\n北京 1\n上海 2\n天津 Tianjin\n`
    return (
      <Modal
        title="编辑自定义选项"
        visible={visible}
        wrapClassName={`ant-modal-small ${styles.optionsModal}`}
        onOk={onSave}
        onCancel={onCancel}
      >
        <Form>
          <FormItem className={styles.formItem}>
            {getFieldDecorator('options', {})(
              <TextArea
                placeholder={placeholder}
                autosize={{minRows: 5, maxRows: 10}}
              />
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

export default Form.create<IOptionSettingFormProps & FormComponentProps>()(OptionSettingForm)
