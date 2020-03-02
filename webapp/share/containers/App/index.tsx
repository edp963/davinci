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

import React, { useEffect } from 'react'
import Helmet from 'react-helmet'
import { Route, HashRouter as Router, Switch, useHistory } from 'react-router-dom'

import { compose } from 'redux'
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'

import { Display } from 'share/containers/Display/Loadable'
import { Dashboard } from 'share/containers/Dashboard/Loadable'
import { NotFound } from 'containers/NotFoundPage/Loadable'
import { setToken } from 'app/utils/request'

export const App: React.FC = () => {
  const history = useHistory()
  const currentPathname = history.location.pathname + history.location.search
  useEffect(() => {
    const pathname = sessionStorage.getItem('pathname')
    if (pathname && pathname !== currentPathname) {
      history.push(pathname)
      sessionStorage.removeItem('pathname')
    }

    const token = localStorage.getItem('TOKEN')
    if (token) {
      setToken(token)
    }
  }, [])

  return (
    <div>
      <Helmet
        titleTemplate="%s - Davinci"
        defaultTitle="Davinci Web Application"
        meta={[
          {
            name: 'description',
            content: 'Davinci web application built for data visualization'
          }
        ]}
      />
      <Router>
        <Switch>
          <Route exact path="/share/display" component={Display} />
          <Route exact path="/share/dashboard" component={Dashboard} />
          <Route path="*" component={NotFound} />
        </Switch>
      </Router>
    </div>
  )
}

const withReducer = injectReducer({ key: 'global', reducer })
const withSaga = injectSaga({ key: 'global', saga })

export default compose(
  withReducer,
  withSaga
)(App)
