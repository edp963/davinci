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

import notification from 'antd/lib/notification'

/**
 * UUID生成器
 * @param len 长度 number
 * @param radix 随机数基数 number
 * @returns {string}
 */
export const uuid = (len, radix?) => {
  /* tslint:disable:no-bitwise */

  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
  const uuid = []
  let i
  radix = radix || chars.length

  if (len) {
    // Compact form
    for (i = 0; i < len; i++) {
      uuid[i] = chars[0 | Math.random() * radix]
    }
  } else {
    // rfc4122, version 4 form
    let r

    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
    uuid[14] = '4'

    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random() * 16
        uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r]
      }
    }
  }

  /* tslint:enable:no-bitwise */

  return uuid.join('')
}

export function safeAddition (num1, num2) {
  const decimalDigits = Math.max(
    `${num1}`.indexOf('.') >= 0 ? `${num1}`.substr(`${num1}`.indexOf('.') + 1).length : 0,
    `${num2}`.indexOf('.') >= 0 ? `${num2}`.substr(`${num2}`.indexOf('.') + 1).length : 0
  )
  if (decimalDigits) {
    const times = Math.pow(10, decimalDigits)
    return (Math.round(num1 * times) + Math.round(num2 * times)) / times
  } else {
    return num1 + num2
  }
}

/**
 * 异常通知弹窗
 * @param err 异常内容: Error
 * @param title 弹窗标题: string
 */
export function notifyError (err, title) {
  notification.error({
    message: title,
    description: err.toString(),
    duration: null
  })
}

/**
 * sagas 异常通知
 * @param err 异常内容: Error
 * @param prefix sagas名称: string
 */
export function notifySagasError (err, prefix) {
  notifyError(err, `${prefix} sagas or reducer 异常`)
}

export function getBase64 (img, callback) {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result))
  reader.readAsDataURL(img)
}

export enum SecondaryGraphTypes {
  Rectangle = 20,
  Label = 21
}

export enum GraphTypes {
  Slide,
  Chart,
  Secondary
}

export enum OrderDirection {
  Asc,
  Desc
}
