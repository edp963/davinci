
import * as React from 'react'
import Helmet from 'react-helmet'
import { Link } from 'react-router'
import { RouteComponentProps } from 'react-router'

import { compose } from 'redux'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import displayReducer from '../Display/reducer'
import displaySaga from '../Display/sagas'
import portalSaga from '../Portal/sagas'
import portalReducer from '../Portal/reducer'

import { loadDisplays, addDisplay, editDisplay, deleteDisplay } from '../Display/actions'
import { loadPortals, addPortal, editPortal, deletePortal } from '../Portal/actions'
import { makeSelectDisplays } from '../Display/selectors'
import { makeSelectPortals } from '../Portal/selectors'

const Icon = require('antd/lib/icon')
const Collapse = require('antd/lib/collapse')
import * as classnames from 'classnames'
import Box from '../../components/Box'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Breadcrumb = require('antd/lib/breadcrumb')
const Panel = Collapse.Panel
const styles = require('./Viz.less')
const utilStyles = require('../../assets/less/util.less')
import Container from '../../components/Container'
import PortalList from '../Portal/components/PortalList'
import DisplayList, { IDisplay } from '../Display/components/DisplayList'
import { Portal } from '../Portal'

interface IParams {
  pid: number
}

interface IVizProps extends RouteComponentProps<{}, IParams> {
  displays: any[]
  portals: any[]
  onLoadDisplays: (projectId) => void
  onAddDisplay: (display: IDisplay, resolve: () => void) => void
  onEditDisplay: (display: IDisplay, resolve: () => void) => void
  onDeleteDisplay: (displayId: number) => void
  onLoadPortals: (projectId) => void
  onAddPortal: (portal, resolve) => void
  onEditPortal: (portal, resolve) => void
  onDeletePortal: (portalId: number) => void
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

  private renderHeader = (headerText: string) => {
    const { collapse } = this.state
    const key = headerText.toLowerCase()
    const isCollapsed = collapse[key]
    return (
      <div className={styles.collapseHeader}>
        <label>{headerText}</label>
        <div className={styles.splitLine}/>
        <Icon type={isCollapsed ? 'up-circle-o' : 'down-circle-o'}/>
      </div>
    )
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
      portals, onAddPortal, onEditPortal, onDeletePortal
    } = this.props
    const projectId = params.pid
    const isHideDashboardStyle = classnames({
      [styles.listPadding]: true,
      [utilStyles.hide]: !this.state.collapse.dashboard
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
          {/*<div className={styles.spliter11}/>*/}
          {/*<Collapse bordered={false} defaultActiveKey="dashboard" onChange={this.onCollapseChange('dashboard')}>*/}
            {/*<Panel showArrow={false} header={this.renderHeader('Dashboard')} key="dashboard">*/}
              {/*<PortalList*/}
                {/*projectId={projectId}*/}
                {/*portals={portals}*/}
                {/*onPortalClick={this.goToDashboard}*/}
                {/*onAdd={onAddPortal}*/}
                {/*onEdit={onEditPortal}*/}
                {/*onDelete={onDeletePortal}*/}
              {/*/>*/}
            {/*</Panel>*/}
          {/*</Collapse>*/}
          <Box>
            <Box.Header>
              <Box.Title>
                <Row>
                  <Col span={20}>
                    <Icon type={`${this.state.collapse.dashboard ? 'down' : 'right'}`} onClick={this.onCollapseChange('dashboard')} />Dashboard
                  </Col>
                </Row>
              </Box.Title>
            </Box.Header>
            <div className={isHideDashboardStyle}>
              <PortalList
                projectId={projectId}
                portals={portals}
                onPortalClick={this.goToDashboard}
                onAdd={onAddPortal}
                onEdit={onEditPortal}
                onDelete={onDeletePortal}
              />
            </div>
          </Box>
          <div className={styles.spliter16}/>
          {/*<Collapse bordered={false} defaultActiveKey="display" onChange={this.onCollapseChange('display')}>*/}
            {/*<Panel showArrow={false} header={this.renderHeader('Display')} key="display">*/}
              {/*<DisplayList*/}
                {/*projectId={projectId}*/}
                {/*displays={displays}*/}
                {/*onDisplayClick={this.goToDisplay}*/}
                {/*onAdd={onAddDisplay}*/}
                {/*onEdit={onEditDisplay}*/}
                {/*onCopy={this.onCopy}*/}
                {/*onDelete={onDeleteDisplay}*/}
              {/*/>*/}
            {/*</Panel>*/}
          {/*</Collapse>*/}
          <Box>
            <Box.Header>
              <Box.Title>
                <Row>
                  <Col span={20}>
                    <Icon type={`${this.state.collapse.display ? 'down' : 'right'}`} onClick={this.onCollapseChange('display')} />Display
                  </Col>
                </Row>
              </Box.Title>
            </Box.Header>
            <div className={isHideDashboardStyle}>
              <DisplayList
                projectId={projectId}
                displays={displays}
                onDisplayClick={this.goToDisplay}
                onAdd={onAddDisplay}
                onEdit={onEditDisplay}
                onCopy={this.onCopy}
                onDelete={onDeleteDisplay}
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
  portals: makeSelectPortals()
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
    onDeletePortal: (id) => dispatch(deletePortal(id))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)
const withDisplayReducer = injectReducer({ key: 'display', reducer: displayReducer })
const withDisplaySaga = injectSaga({ key: 'display', saga: displaySaga })
const withPortalReducer = injectReducer({ key: 'portal', reducer: portalReducer })
const withPortalSaga = injectSaga({ key: 'portal', saga: portalSaga })

export default compose(
  withDisplayReducer,
  withDisplaySaga,
  withPortalReducer,
  withPortalSaga,
  withConnect
)(Viz)
