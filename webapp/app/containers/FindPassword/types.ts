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
import { Merge } from 'utils/types'

export enum GetPassWordType {
  'EMAIL' = 'email',
  'USERNAME' = 'username'
}

export const getPassWordTypeLocale = {
  [GetPassWordType.EMAIL]: '通过邮件找回',
  [GetPassWordType.USERNAME]: '通过用户名找回'
}

export enum FindPwStep {
  'CAPTCHA' = 'captcha',
  'RESET' = 'reset'
}

export interface IGetgetCaptchaParams {
  type: string
  ticket: string
  resolve: (response: any) => void
}

export interface IResetPasswordParams extends IGetgetCaptchaParams {
  token: string
  checkCode: string
  password: string
}

interface IFPHandler {
  step: FindPwStep
  setStep: (step: FindPwStep) => void
  setType: (type: GetPassWordType) => void
  setTicket: (ticket: string) => void
  setToken: (token: string) => void
}

export type IOperateStates = Merge<
  IFPHandler,
  Merge<
    Pick<IResetPasswordParams, 'token'>,
    Omit<IGetgetCaptchaParams, 'resolve'>
  >
>

export interface IChildOperateStates {
  operate: IOperateStates
}
