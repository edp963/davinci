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

/**
 * NotFoundPage
 *
 * This is the page we show when the user visits a url that doesn't have a route
 */

import React from 'react'
import { Button } from 'antd'
import styles from './NoAuthorization.less'

export default function NoAuthorization () {
  return (
    <div className={styles.NoAuthorization}>
      <i className="iconfont icon-found" />
      <h1>您没有权限访问当前页面</h1>
      <Button size="large" style={{marginTop: '16px'}} onClick={() => history.go(-1)}>返回上一页</Button>
    </div>
  )
}
