
import * as React from 'react'
import { RouteComponentProps } from 'react-router'

import { compose } from 'redux'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import displayReducer from '../Display/reducer'
import displaySaga from '../Display/sagas'

import { loadDisplays, addDisplay, editDisplay, deleteDisplay } from '../Display/actions'
import { makeSelectDisplays } from '../Display/selectors'

const Icon = require('antd/lib/icon')
const Collapse = require('antd/lib/collapse')
const Panel = Collapse.Panel
const styles = require('./Viz.less')

import Container from '../../components/Container'
import DisplayList, { IDisplay } from '../Display/components/DisplayList'

interface IParams {
  pid: number
}

interface IVizProps extends RouteComponentProps<{}, IParams> {
  displays: any[]
  onLoadDisplays: (projectId) => void
  onAddDisplay: (display: IDisplay, resolve: () => void) => void
  onEditDisplay: (display: IDisplay, resolve: () => void) => void
  onDeleteDisplay: (displayId: number) => void
}

interface IVizStates {
  collapse: object
}

export class Viz extends React.Component<IVizProps, IVizStates> {

  constructor (props: IVizProps) {
    super(props)
    this.state = {
      collapse: {
        dashboard: false,
        display: false
      }
    }
  }

  public componentWillMount () {
    const { params, onLoadDisplays } = this.props
    const projectId = params.pid
    onLoadDisplays(projectId)
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
    const { displays, params, onAddDisplay, onEditDisplay, onDeleteDisplay } = this.props
    const projectId = params.pid
    return (
      <Container>
        <Container.Body card>
          <div className={styles.spliter11}/>
          <Collapse bordered={false} defaultActiveKey="display" onChange={this.onCollapseChange('display')}>
            <Panel showArrow={false} header={this.renderHeader('Display')} key="display">
              <DisplayList
                rows={2}
                projectId={projectId}
                displays={displays}
                onDisplayClick={this.goToDisplay}
                onAdd={onAddDisplay}
                onEdit={onEditDisplay}
                onCopy={this.onCopy}
                onDelete={onDeleteDisplay}
              />
            </Panel>
          </Collapse>
          <div className={styles.spliter16}/>
        </Container.Body>
      </Container>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  displays: makeSelectDisplays()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadDisplays: (projectId) => dispatch(loadDisplays(projectId)),
    onAddDisplay: (display: IDisplay, resolve) => dispatch(addDisplay(display, resolve)),
    onEditDisplay: (display: IDisplay, resolve) => dispatch(editDisplay(display, resolve)),
    onDeleteDisplay: (id) => dispatch(deleteDisplay(id))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)
const withDisplayReducer = injectReducer({ key: 'display', reducer: displayReducer })
const withDisplaySaga = injectSaga({ key: 'saga', saga: displaySaga })

export default compose(
  withDisplayReducer,
  withDisplaySaga,
  withConnect
)(Viz)
