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
  useEffect
} from 'react'
import { Link } from 'react-router-dom'
import { Form, Input, Button, message } from 'antd'
const FormItem = Form.Item
import { FormComponentProps } from 'antd/lib/form/Form'
import {
  IResetPasswordParams,
  IOperateStates
} from './types'
import {
  resetPasswordUnlogged
} from 'containers/App/actions'
import { useDispatch } from 'react-redux'

const styles = require('./index.less')

const ResetPassword: React.FC<IOperateStates & FormComponentProps> = React.memo(
  ({ form, ticket, token, type }) => {
    const {
      getFieldDecorator,
      isFieldTouched,
      getFieldsError,
      getFieldError
    } = form
    const [resetStatus, setResetStatus] = useState<boolean>(false)
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

    const handleSubmit = useCallback(
      (e) => {
        e.preventDefault()
        form.validateFieldsAndScroll((err, values) => {
          if (!err) {
            const { password, checkCode } = values
            const params: IResetPasswordParams = {
              type,
              ticket,
              password,
              checkCode,
              token,
              resolve: (header) => {
                const { msg, code } = header
                if (code === 200) {
                  message.success(msg)
                  setResetStatus(true)
                }
              }
            }
            onResetPasswordUnlogged(params)
          }
        })
      },
      ['nf']
    )

    const buttonTips: ReactElement = useMemo(() => {
      return !resetStatus ? (
        <>确认修改</>
      ) : (
        <>
          <Link to="/login">返回登录</Link>
        </>
      )
    }, [resetStatus])

    const onResetPasswordUnlogged = useCallback(
      (params: IResetPasswordParams) => {
        dispatch(resetPasswordUnlogged(params))
      },
      []
    )

    useEffect(() => {
      form.validateFields()
    }, [])

    const checkPasswordConfirm = (rule, value, callback) => {
      if (value && value !== form.getFieldValue('password')) {
        callback('两次输入的密码不一致')
      } else {
        callback()
      }
    }

    const forceCheckConfirm = (rule, value, callback) => {
      if (form.getFieldValue('confirmPassword')) {
        form.validateFields(['confirmPassword'], { force: true })
      }
      callback()
    }
    const hasErrors = (fieldsError) => {
      return Object.keys(fieldsError).some((field) => fieldsError[field])
    }

    const newPassError = isFieldTouched('password') && getFieldError('password')

    const confirmPasswordError =
      isFieldTouched('confirmPassword') && getFieldError('confirmPassword')

    const checkCodeError =
      isFieldTouched('checkCode') && getFieldError('checkCode')

    const isSubmit = hasErrors(getFieldsError())

    return (
      <Form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.top}>
          <FormItem
            label="新密码"
            {...formItemLayout}
            validateStatus={newPassError ? 'error' : 'success'}
            help={newPassError || ''}
          >
            {getFieldDecorator('password', {
              rules: [
                {
                  required: true,
                  message: '新密码不能为空'
                },
                {
                  min: 6,
                  max: 20,
                  message: '密码长度为6-20位'
                },
                {
                  validator: forceCheckConfirm
                }
              ]
            })(
              <Input type="password" size="large" placeholder="请输入新密码" />
            )}
          </FormItem>

          <FormItem
            label="确认新密码"
            {...formItemLayout}
            validateStatus={confirmPasswordError ? 'error' : 'success'}
            help={confirmPasswordError || ''}
          >
            {getFieldDecorator('confirmPassword', {
              rules: [
                {
                  required: true,
                  message: '请确认密码'
                },
                {
                  validator: checkPasswordConfirm
                }
              ]
            })(<Input type="password" size="large" placeholder="请确认密码" />)}
          </FormItem>
          <FormItem
            {...formItemLayout}
            validateStatus={checkCodeError ? 'error' : 'success'}
            help={checkCodeError || ''}
          >
            {getFieldDecorator('checkCode', {
              rules: [
                {
                  required: true,
                  message: '验证码不能为空'
                }
              ]
            })(<Input size="large" placeholder="请输入验证码" />)}
          </FormItem>
        </div>
        <div className={styles.bottom}>
          <Button
            {...buttonItemLayout}
            size="large"
            type="primary"
            htmlType="submit"
            disabled={isSubmit}
          >
            {buttonTips}
          </Button>
        </div>
      </Form>
    )
  }
)

export default Form.create<FormComponentProps & IOperateStates>()(ResetPassword)
