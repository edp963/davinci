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

import React, { useContext } from 'react'

import { Button, Icon } from 'antd'
const ButtonGroup = Button.Group

import { DisplayToolbarContext } from './util'

interface IShareProps {
  onShare: () => void
}

const Share: React.FC<IShareProps> = (props) => {
  const { size, comment } = useContext(DisplayToolbarContext)

  return (
    <ButtonGroup size={size}>
      <Button type="ghost" onClick={props.onShare}>
        <Icon type="share-alt" />
        {comment && '分享'}
      </Button>
    </ButtonGroup>
  )
}
export default Share
