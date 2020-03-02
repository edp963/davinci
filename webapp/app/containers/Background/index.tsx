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

import * as React from 'react'
import Canvas from './Canvas'
import { Route, Switch, Redirect } from 'react-router-dom'

import Login from 'containers/Login'
import Register from 'containers/Register'
import JoinOrganization from 'containers/Register/JoinOrganization'

const styles = require('./Background.less')

export function Background () {
  return (
    <div className={styles.container}>
      <Canvas />
      <img className={styles.logo} src={require('assets/images/logo_light.svg')} />
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/joinOrganization" component={JoinOrganization} />
        <Redirect to="/login" />
      </Switch>
    </div>
  )
}

export default Background
