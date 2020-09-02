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

function createInput (text: string) {
  const body = document.body
  const input = document.createElement('input')
  input.style.height = '0px'
  input.value = text

  return {
    init: () => {
      body.appendChild(input)
      return input
    },
    destory: () => body.removeChild(input)
  }
}

function selectCopy(text: string, resolve, reject) {
  const { init, destory } = createInput(text)
  const input = init()

  try {
    input.select()
    const selected = document.execCommand('copy')
    return selected ? resolve() : reject()
  } catch (error) {
    reject(error)
  }

  destory()
}

export function copyTextToClipboard (text: string, resolve, reject) {
  if (!navigator.clipboard) {
    return selectCopy(text, resolve, reject)
  }
  return navigator.clipboard.writeText(text).then(resolve, reject)
}
