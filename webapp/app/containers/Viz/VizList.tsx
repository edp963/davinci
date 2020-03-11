import React from 'react'
import classnames from 'classnames'
import Helmet from 'react-helmet'
import { Link } from 'react-router-dom'

import { compose } from 'redux'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import { checkNameUniqueAction } from '../App/actions'
import { ProjectActions } from '../Projects/actions'
import { VizActions } from '../Viz/actions'

import { makeSelectCurrentProject } from '../Projects/selectors'
import { makeSelectPortals, makeSelectDisplays } from '../Viz/selectors'

import { Icon, Row, Col, Breadcrumb } from 'antd'
import Box from 'components/Box'
import Container from 'components/Container'
import PortalList from './components/PortalList'
import DisplayList from './components/DisplayList'

import { IProject } from '../Projects/types'
import { IPortal, Display, IDisplayFormed } from './types'

import styles from './Viz.less'
import utilStyles from 'assets/less/util.less'

import { RouteComponentWithParams } from 'utils/types'
import OrganizationActions from '../Organizations/actions'

interface IVizProps {
  currentProject: IProject

  displays: Display[]
  portals: IPortal[]

  onLoadDisplays: (projectId: number) => void
  onAddDisplay: (display: IDisplayFormed, resolve: () => void) => void
  onEditDisplay: (display: IDisplayFormed, resolve: () => void) => void
  onDeleteDisplay: (displayId: number) => void
  onCopyDisplay: (display: IDisplayFormed, resolve: () => void) => void

  onLoadPortals: (projectId: number) => void
  onAddPortal: (portal: IPortal, resolve) => void
  onEditPortal: (portal: IPortal, resolve) => void
  onDeletePortal: (portalId: number) => void

  onCheckUniqueName: (
    pathname: string,
    data: any,
    resolve: () => any,
    reject: (error: string) => any
  ) => any
  onLoadProjectRoles: (projectId: number) => void
  onExcludeRoles: (type: string, id: number, resolve?: any) => any
}

interface IVizStates {
  collapse: { dashboard: boolean; display: boolean }
}

export class VizList extends React.Component<
  IVizProps & RouteComponentWithParams,
  IVizStates
> {
  public state: Readonly<IVizStates> = {
    collapse: {
      dashboard: true,
      display: true
    }
  }

  public componentWillMount() {
    const { match, onLoadDisplays, onLoadPortals, onLoadProjectRoles } = this.props
    const projectId = +match.params.projectId
    onLoadDisplays(projectId)
    onLoadPortals(projectId)
    onLoadProjectRoles(projectId)
  }

  private goToPortal = (portalId: number) => () => {
    const { history, match } = this.props
    history.push(`/project/${match.params.projectId}/portal/${portalId}`)
  }

  private goToDisplay = (displayId: number) => () => {
    const {
      match,
      currentProject: {
        permission: { vizPermission }
      }
    } = this.props
    const projectId = match.params.projectId
    const isToPreview = vizPermission === 1
    const path = `/project/${projectId}/display/${displayId}${
      isToPreview ? '/preview' : ''
    }`
    this.props.history.push(path)
  }

  private onCollapseChange = (key: string) => () => {
    const { collapse } = this.state
    this.setState({
      collapse: {
        ...collapse,
        [key]: !collapse[key]
      }
    })
  }

  public render() {
    const {
      displays,
      match,
      onAddDisplay,
      onEditDisplay,
      onDeleteDisplay,
      onCopyDisplay,
      portals,
      onAddPortal,
      onEditPortal,
      onDeletePortal,
      currentProject,
      onCheckUniqueName
    } = this.props
    const projectId = +match.params.projectId
    const isHideDashboardStyle = classnames({
      [styles.listPadding]: true,
      [utilStyles.hide]: !this.state.collapse.dashboard
    })
    const isHideDisplayStyle = classnames({
      [styles.listPadding]: true,
      [utilStyles.hide]: !this.state.collapse.display
    })
    return (
      <Container>
        <Helmet title="Viz" />
        <Container.Title>
          <Row>
            <Col span={24}>
              <Breadcrumb className={utilStyles.breadcrumb}>
                <Breadcrumb.Item>
                  <Link to="">Viz</Link>
                </Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
        </Container.Title>
        <Container.Body>
          <Box>
            <Box.Header>
              <Box.Title>
                <Row onClick={this.onCollapseChange('dashboard')}>
                  <Col span={20}>
                    <Icon
                      type={`${
                        this.state.collapse.dashboard ? 'down' : 'right'
                      }`}
                    />
                    Dashboard
                  </Col>
                </Row>
              </Box.Title>
            </Box.Header>
            <div className={isHideDashboardStyle}>
              <PortalList
                currentProject={currentProject}
                projectId={projectId}
                portals={portals}
                onPortalClick={this.goToPortal}
                onAdd={onAddPortal}
                onEdit={onEditPortal}
                onDelete={onDeletePortal}
                onCheckUniqueName={onCheckUniqueName}
                onExcludeRoles={this.props.onExcludeRoles}
              />
            </div>
          </Box>
          <div className={styles.spliter16} />
          <Box>
            <Box.Header>
              <Box.Title>
                <Row onClick={this.onCollapseChange('display')}>
                  <Col span={20}>
                    <Icon
                      type={`${this.state.collapse.display ? 'down' : 'right'}`}
                    />
                    Display
                  </Col>
                </Row>
              </Box.Title>
            </Box.Header>
            <div className={isHideDisplayStyle}>
              <DisplayList
                currentProject={currentProject}
                projectId={projectId}
                displays={displays}
                onDisplayClick={this.goToDisplay}
                onAdd={onAddDisplay}
                onEdit={onEditDisplay}
                onCopy={onCopyDisplay}
                onDelete={onDeleteDisplay}
                onCheckName={onCheckUniqueName}
                onExcludeRoles={this.props.onExcludeRoles}
              />
            </div>
          </Box>
        </Container.Body>
      </Container>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  displays: makeSelectDisplays(),
  portals: makeSelectPortals(),
  currentProject: makeSelectCurrentProject()
})

export function mapDispatchToProps(dispatch) {
  return {
    onLoadDisplays: (projectId) => dispatch(VizActions.loadDisplays(projectId)),
    onAddDisplay: (display: IDisplayFormed, resolve) =>
      dispatch(VizActions.addDisplay(display, resolve)),
    onEditDisplay: (display: IDisplayFormed, resolve) =>
      dispatch(VizActions.editDisplay(display, resolve)),
    onDeleteDisplay: (id) => dispatch(VizActions.deleteDisplay(id)),
    onCopyDisplay: (display: IDisplayFormed, resolve) =>
      dispatch(VizActions.copyDisplay(display, resolve)),
    onLoadPortals: (projectId) => dispatch(VizActions.loadPortals(projectId)),
    onAddPortal: (portal, resolve) =>
      dispatch(VizActions.addPortal(portal, resolve)),
    onEditPortal: (portal, resolve) =>
      dispatch(VizActions.editPortal(portal, resolve)),
    onDeletePortal: (id) => dispatch(VizActions.deletePortal(id)),
    onCheckUniqueName: (pathname, data, resolve, reject) =>
      dispatch(checkNameUniqueAction(pathname, data, resolve, reject)),
    onLoadProjectRoles: (projectId) =>
      dispatch(OrganizationActions.loadProjectRoles(projectId)),
    onExcludeRoles: (type, id, resolve) =>
      dispatch(ProjectActions.excludeRoles(type, id, resolve))
  }
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps
)

export default compose(withConnect)(VizList)
