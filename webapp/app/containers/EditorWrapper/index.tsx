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
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import { loadOrganizationTeams } from '../Organizations/actions'
import { makeSelectCurrentProject } from '../Projects/selectors'
import { hideNavigator } from '../App/actions'
import {loadProjectDetail} from '../Projects/actions'
import reducer from '../Projects/reducer'
import injectReducer from 'utils/injectReducer'
import saga from '../Projects/sagas'
import injectSaga from 'utils/injectSaga'
import {compose} from 'redux'

interface IEditorWrapperProps {
  route: any
  params: any
  children: any
  onHideNavigator: () => void
  onLoadProjectDetail: (id) => any
  onLoadOrganizationTeams: (projectId: number) => any
}

export class EditorWrapper extends React.Component<IEditorWrapperProps, {}> {
  public componentWillMount () {
    const { pid } = this.props.params
    if (pid) {
      this.props.onLoadProjectDetail(pid)
    }
    this.props.onHideNavigator()
  }

  public componentWillReceiveProps (nextProps) {
    const { currentProject } = nextProps
    const { route, onLoadOrganizationTeams } = this.props

    route.childRoutes.forEach((cr) => {
      if (cr.path.indexOf('bizlogic') > 0) {
        onLoadOrganizationTeams(currentProject.orgId)
      }
    })
  }

  public render () {
    return this.props.children
  }
}

const mapStateToProps = createStructuredSelector({
  currentProject: makeSelectCurrentProject()
})

export function mapDispatchToProps (dispatch) {
  return {
    onHideNavigator: () => dispatch(hideNavigator()),
    onLoadProjectDetail: (id) => dispatch(loadProjectDetail(id)),
    onLoadOrganizationTeams: (id) => dispatch(loadOrganizationTeams(id))
  }
}

const withReducer = injectReducer({ key: 'project', reducer })
const withSaga = injectSaga({ key: 'project', saga })
const withConnect = connect(mapStateToProps, mapDispatchToProps)

export default compose(
  withReducer,
  withSaga,
  withConnect
)(EditorWrapper)
