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
  useCallback,
  useState,
  ReactElement,
  ReactEventHandler
} from 'react'
import { Form, Input, Radio, Button } from 'antd'
import { throttle } from 'lodash'
import { FormComponentProps } from 'antd/lib/form/Form'
import {
  GetPassWordType,
  getPassWordTypeLocale,
  IGetgetCaptchaParams,
  IOperateStates,
  FindPwStep
} from './types'
import { getCaptchaforResetPassword } from 'containers/App/actions'
import { useDispatch } from 'react-redux'

const styles = require('./index.less')

const GetCaptcha: React.FC<IOperateStates & FormComponentProps> = React.memo(
  ({
    form,
    ticket,
    token,
    type,
    setTicket,
    setToken,
    setType,
    setStep,
    step
  }) => {
    const [submitStatus, setSubmitStatus] = useState<boolean>(false)
    const dispatch = useDispatch()
    const formItemLayout = useMemo(
      () => ({
        labelCol: { span: 0 },
        wrapperCol: { span: 24 }
      }),
      ['nf']
    )

    const buttonItemLayout = useMemo(
      () => ({
        wrapperCol: { span: 24, offset: 0 }
      }),
      ['nf']
    )

    const handleFormLayoutChange = useCallback(
      (event) => {
        const typeValue: GetPassWordType = event.target.value
        setType(typeValue)
        form.setFieldsValue({ ticket: '' })
      },
      [type, setType]
    )

    const handleSubmit = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        form.validateFieldsAndScroll((err, values) => {
          if (!err) {
            const { type, ticket } = values
            setSubmitStatus(true)
            const params: IGetgetCaptchaParams = {
              type,
              ticket,
              resolve: (payload) => {
                if (payload && payload.length) {
                  setToken(payload)
                  setTicket(ticket)
                  setSubmitStatus(false)
                }
              }
            }
            onGetCaptchaforResetPassword(params)
          }
        })
      },
      ['nf']
    )

    const goNext = useCallback(() => {
      if (token && token.length) {
        setStep(FindPwStep.RESET)
      }
    }, [step, setStep, token])

    const Buttons: ReactElement = useMemo(() => {
      return token && token.length ? (
        <Button
          type="primary"
          size="large"
          onClick={goNext}
          className={styles.next}
        >
          下一步
        </Button>
      ) : (
        <Button
          type="primary"
          size="large"
          onClick={handleSubmit}
          disabled={submitStatus}
          loading={submitStatus}
          className={styles.submit}
        >
          确定
        </Button>
      )
    }, [token, submitStatus])

    const Tips: ReactElement = useMemo(
      () =>
        token && token.length ? (
          <>
            一封确认信已经发到
            {type === GetPassWordType.USERNAME ? (
              <>
                <b>{ticket}</b>
                <span> 所关联的邮箱</span>
              </>
            ) : (
              <b>{ticket}</b>
            )}
            ，请前往该邮箱获取验证码，然后点击下一步重置密码。
          </>
        ) : (
          <></>
        ),
      [ticket, type, token]
    )

    const matchTypeInput: ReactElement = useMemo(() => {
      const { getFieldDecorator } = form
      return type === GetPassWordType.USERNAME ? (
        <Form.Item label="" {...formItemLayout}>
          {getFieldDecorator('ticket', {
            rules: [
              {
                required: true,
                message: '请输入用户名'
              }
            ]
          })(<Input placeholder="请输入用户名" size="large" />)}
        </Form.Item>
      ) : (
        <Form.Item label="" {...formItemLayout}>
          {getFieldDecorator('ticket', {
            rules: [
              {
                type: 'email',
                message: '邮箱格式不正确'
              },
              {
                required: true,
                message: '请输入邮箱'
              }
            ]
          })(<Input placeholder="请输入邮箱" size="large" />)}
        </Form.Item>
      )
    }, [type, form])

    const onGetCaptchaforResetPassword = useCallback(
      (params: IGetgetCaptchaParams) => {
        dispatch(getCaptchaforResetPassword(params))
      },
      []
    )

    return (
      <Form className={styles.form}>
        <div className={styles.top}>
          <Form.Item label="" {...formItemLayout}>
            {form.getFieldDecorator('type', {
              initialValue: type,
              rules: [
                {
                  required: true,
                  message: '请选择找回方式'
                }
              ]
            })(
              <Radio.Group onChange={handleFormLayoutChange} size="large">
                <Radio value={`${GetPassWordType.EMAIL}`}>
                  {getPassWordTypeLocale[GetPassWordType.EMAIL]}
                </Radio>
                <Radio value={`${GetPassWordType.USERNAME}`}>
                  {getPassWordTypeLocale[GetPassWordType.USERNAME]}
                </Radio>
              </Radio.Group>
            )}
          </Form.Item>
          {matchTypeInput}
        </div>
        <div className={styles.bottom}>
          <p className={styles.tip}>{Tips}</p>
          <Form.Item {...buttonItemLayout}>{Buttons}</Form.Item>
        </div>
      </Form>
    )
  }
)

export default Form.create<FormComponentProps & IOperateStates>()(GetCaptcha)
