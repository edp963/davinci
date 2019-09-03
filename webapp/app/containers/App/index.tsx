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

import React from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Route, HashRouter as Router, Switch, Redirect } from 'react-router-dom'

import { compose } from 'redux'
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'

import { makeSelectLogged } from './selectors'

import { Background } from 'containers/Background/Loadable'
import { Activate } from 'containers/Register/Loadable'
import { Main } from 'containers/Main/Loadable'

interface IAppProps {
  logged: boolean
}

export const App: React.FC<IAppProps> = (props) => {
  const { logged } = props

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
        <React.Suspense fallback={null}>
          <Switch>
            {logged ? (
              <Route component={Main} />
            ) : (
              <Route component={Background} />
            )}
            <Route path="/activate" component={Activate} />
          </Switch>
        </React.Suspense>
      </Router>
    </div>
  )
}

const withReducer = injectReducer({ key: 'global', reducer })
const withSaga = injectSaga({ key: 'global', saga })

const mapStateToProps = createStructuredSelector({
  logged: makeSelectLogged()
})

const withConnect = connect(
  mapStateToProps,
  null
)

export default compose(
  withReducer,
  withSaga,
  withConnect
)(App)
