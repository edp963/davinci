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

import { removeToken } from './request'
import {
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_WEIGHT
} from 'app/globalConstants'
import { message } from 'antd'
import { OptionProps } from 'antd/lib/select'

/**
 * UUID生成器
 * @param len 长度 number
 * @param radix 随机数基数 number
 * @returns {string}
 */
export const uuid = (len: number, radix: number = 62) => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(
    ''
  )
  const uuid = []
  let i

  if (len) {
    // Compact form
    for (i = 0; i < len; i++) {
      uuid[i] = chars[Math.floor(Math.random() * radix)]
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
        r = Math.floor(Math.random() * 16)
        uuid[i] = chars[i === 19 ? ((r % 4) % 8) + 8 : r]
      }
    }
  }
  return uuid.join('')
}

export function safeAddition(num1, num2) {
  const decimalDigits = Math.max(
    `${num1}`.indexOf('.') >= 0
      ? `${num1}`.substr(`${num1}`.indexOf('.') + 1).length
      : 0,
    `${num2}`.indexOf('.') >= 0
      ? `${num2}`.substr(`${num2}`.indexOf('.') + 1).length
      : 0
  )
  if (decimalDigits) {
    const times = Math.pow(10, decimalDigits)
    return (Math.round(num1 * times) + Math.round(num2 * times)) / times
  } else {
    return num1 + num2
  }
}

/**
 * 通用saga异常处理
 * @param error 异常内容: Error
 */
export function errorHandler(error) {
  if (error.response) {
    switch (error.response.status) {
      case 403:
        message.error('未登录或会话过期，请重新登录', 1)
        removeToken()
        break
      case 401:
        message.error('您没有权限访问此数据', 2)
        break
      default:
        message.error(
          error.response.data.header
            ? error.response.data.header.msg
            : error.message,
          3
        )
        break
    }
  } else if (error.message) {
    message.error(error.message, 3)
  } else {
    throw error
  }
}

export function getErrorMessage(error) {
  return error.response
    ? error.response.data.header
      ? error.response.data.header.msg
      : error.message
    : error.message
}

export function getBase64(img, callback) {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result))
  reader.readAsDataURL(img)
}

let utilCanvas = null

export const getTextWidth = (
  text: string,
  fontWeight: string = DEFAULT_FONT_WEIGHT,
  fontSize: string = DEFAULT_FONT_SIZE,
  fontFamily: string = DEFAULT_FONT_FAMILY
): number => {
  const canvas = utilCanvas || (utilCanvas = document.createElement('canvas'))
  const context = canvas.getContext('2d')
  context.font = `${fontWeight} ${fontSize} ${fontFamily}`
  const metrics = context.measureText(text)
  return Math.ceil(metrics.width)
}

// ref: https://github.com/segmentio/is-url/blob/master/index.js
const protocolAndDomainReg = /^(?:\w+:)?\/\/(\S+)$/
const localhostDomainReg = /^localhost[\:?\d]*(?:[^\:?\d]\S*)?$/
const nonLocalhostDomainReg = /^[^\s\.]+\.\S{2,}$/
export function isUrl(str: string) {
  if (typeof str !== 'string') {
    return false
  }

  const match = str.match(protocolAndDomainReg)
  if (!match) {
    return false
  }

  const everythingAfterProtocol = match[1]
  if (!everythingAfterProtocol) {
    return false
  }

  if (
    localhostDomainReg.test(everythingAfterProtocol) ||
    nonLocalhostDomainReg.test(everythingAfterProtocol)
  ) {
    return true
  }

  return false
}

const imageReg = /\.(bmp|png|jpg|jpeg|gif)$/
export function isImagePath(pathname: string) {
  if (typeof pathname !== 'string') {
    return false
  }
  return imageReg.test(pathname)
}

export function hasProperty<T extends object, U extends keyof T>(
  obj: T,
  key: U
) {
  return obj[key] ? obj[key] : false
}

export const tuple = <T extends string[]>(...args: T) => args

export const tupleNum = <T extends number[]>(...args: T) => args

export function filterSelectOption(
  input: string,
  option: React.ReactElement<OptionProps>
): boolean {
  const text = option.props.children as string
  return text.toLowerCase().includes(input.toLowerCase())
}

export function filterTreeSelectOption(
  input: string,
  treeNode
): boolean {
  const text = treeNode.props.title
  return text.toLowerCase().includes(input.toLowerCase())
}
