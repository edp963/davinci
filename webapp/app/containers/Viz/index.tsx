import * as React from 'react'
import * as classnames from 'classnames'
import Helmet from 'react-helmet'
import { Link, RouteComponentProps } from 'react-router'

import { compose } from 'redux'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import displayReducer from '../Display/reducer'
import displaySaga from '../Display/sagas'
import portalSaga from '../Portal/sagas'
import portalReducer from '../Portal/reducer'
import bizlogicReducer from '../Bizlogic/reducer'
import bizlogicSaga from '../Bizlogic/sagas'

import { loadDisplays, addDisplay, editDisplay, deleteDisplay } from '../Display/actions'
import { loadPortals, addPortal, editPortal, deletePortal, loadSelectTeams } from '../Portal/actions'
import { makeSelectDisplays } from '../Display/selectors'
import { makeSelectPortals, makeSelectTeams } from '../Portal/selectors'
import { checkNameUniqueAction } from '../App/actions'
import { loadViewTeam } from '../Bizlogic/actions'

import { Icon, Row, Col, Breadcrumb } from 'antd'
import Box from '../../components/Box'
const styles = require('./Viz.less')
const utilStyles = require('../../assets/less/util.less')
import Container from '../../components/Container'
import PortalList from '../Portal/components/PortalList'
import DisplayList, { IDisplay } from '../Display/components/DisplayList'
import { makeSelectCurrentProject } from '../Organizations/containers/Projects/selectors'
import { makeSelectViewTeam } from '../Bizlogic/selectors'
import ModulePermission from '../Account/components/checkModulePermission'
import { IProject } from '../Organizations/containers/Projects'

interface IParams {
  pid: number
}

interface IVizProps extends RouteComponentProps<{}, IParams> {
  displays: any[]
  portals: any[]
  currentProject: IProject
  viewTeam: any[]
  selectTeams: any[]
  onLoadDisplays: (projectId) => void
  onAddDisplay: (display: IDisplay, resolve: () => void) => void
  onEditDisplay: (display: IDisplay, resolve: () => void) => void
  onDeleteDisplay: (displayId: number) => void
  onLoadPortals: (projectId) => void
  onAddPortal: (portal, resolve) => void
  onEditPortal: (portal, resolve) => void
  onDeletePortal: (portalId: number) => void
  onCheckUniqueName: (pathname: string, data: any, resolve: () => any, reject: (error: string) => any) => any
  onLoadViewTeam: (projectId: number, resolve?: any) => any
  onLoadSelectTeams: (type: string, id: number, resolve?: any) => any
}

interface IVizStates {
  collapse: {dashboard: boolean, display: boolean}
}

export class Viz extends React.Component<IVizProps, IVizStates> {

  constructor (props: IVizProps) {
    super(props)
    this.state = {
      collapse: {
        dashboard: true,
        display: true
      }
    }
  }

  public componentWillMount () {
    const { params, onLoadDisplays, onLoadPortals } = this.props
    const projectId = params.pid
    onLoadDisplays(projectId)
    onLoadPortals(projectId)
  }

  private goToDashboard = (portal?: any) => () => {
    const { params } = this.props
    const { id, name } = portal
    this.props.router.push(`/project/${params.pid}/portal/${id}/portalName/${name}`)
  }

  private goToDisplay = (display?: any) => () => {
    const { params } = this.props
    this.props.router.push(`/project/${params.pid}/display/${display ? display.id : -1}`)
  }

  private onCopy = (display) => {
    console.log('onCopy: ', display)
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

  public render () {
    const {
      displays, params, onAddDisplay, onEditDisplay, onDeleteDisplay,
      portals, onAddPortal, onEditPortal, onDeletePortal, currentProject, onCheckUniqueName,
      onLoadViewTeam, viewTeam, onLoadSelectTeams, selectTeams
    } = this.props
    const projectId = params.pid
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
                    <Icon type={`${this.state.collapse.dashboard ? 'down' : 'right'}`} />Dashboard
                  </Col>
                </Row>
              </Box.Title>
            </Box.Header>
            <div className={isHideDashboardStyle}>
              <PortalList
                currentProject={currentProject}
                projectId={projectId}
                portals={portals}
                onPortalClick={this.goToDashboard}
                onAdd={onAddPortal}
                onEdit={onEditPortal}
                onDelete={onDeletePortal}
                onCheckUniqueName={onCheckUniqueName}
                onLoadViewTeam={onLoadViewTeam}
                onLoadSelectTeams={onLoadSelectTeams}
                viewTeam={viewTeam}
                selectTeams={selectTeams}
              />
            </div>
          </Box>
          <div className={styles.spliter16}/>
          <Box>
            <Box.Header>
              <Box.Title>
                <Row onClick={this.onCollapseChange('display')}>
                  <Col span={20}>
                    <Icon type={`${this.state.collapse.display ? 'down' : 'right'}`} />Display
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
                onCopy={this.onCopy}
                onDelete={onDeleteDisplay}
                onCheckName={onCheckUniqueName}
                onLoadViewTeam={onLoadViewTeam}
                onLoadSelectTeams={onLoadSelectTeams}
                viewTeam={viewTeam}
                selectTeams={selectTeams}
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
  selectTeams: makeSelectTeams(),
  currentProject: makeSelectCurrentProject(),
  viewTeam: makeSelectViewTeam()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadDisplays: (projectId) => dispatch(loadDisplays(projectId)),
    onAddDisplay: (display: IDisplay, resolve) => dispatch(addDisplay(display, resolve)),
    onEditDisplay: (display: IDisplay, resolve) => dispatch(editDisplay(display, resolve)),
    onDeleteDisplay: (id) => dispatch(deleteDisplay(id)),
    onLoadPortals: (projectId) => dispatch(loadPortals(projectId)),
    onAddPortal: (portal, resolve) => dispatch(addPortal(portal, resolve)),
    onEditPortal: (portal, resolve) => dispatch(editPortal(portal, resolve)),
    onDeletePortal: (id) => dispatch(deletePortal(id)),
    onCheckUniqueName: (pathname, data, resolve, reject) => dispatch(checkNameUniqueAction(pathname, data, resolve, reject)),
    onLoadViewTeam: (projectId, resolve) => dispatch(loadViewTeam(projectId, resolve)),
    onLoadSelectTeams: (type, id, resolve) => dispatch(loadSelectTeams(type, id, resolve))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)
const withDisplayReducer = injectReducer({ key: 'display', reducer: displayReducer })
const withDisplaySaga = injectSaga({ key: 'display', saga: displaySaga })
const withPortalReducer = injectReducer({ key: 'portal', reducer: portalReducer })
const withPortalSaga = injectSaga({ key: 'portal', saga: portalSaga })
const withReducerBizlogic = injectReducer({ key: 'bizlogic', reducer: bizlogicReducer })
const withSagaBizlogic = injectSaga({ key: 'bizlogic', saga: bizlogicSaga })

export default compose(
  withDisplayReducer,
  withDisplaySaga,
  withPortalReducer,
  withPortalSaga,
  withReducerBizlogic,
  withSagaBizlogic,
  withConnect
)(Viz)
