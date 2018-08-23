import * as React from 'react'
import { compose } from 'redux'
import injectReducer from '../../utils/injectReducer'
import injectSaga from '../../utils/injectSaga'
import reducer from '../App/reducer'
import saga from '../App/sagas'

import {connect} from 'react-redux'
import {joinOrganization} from '../App/actions'
import {createStructuredSelector} from 'reselect'
import {makeSelectSignupLoading} from './selectors'
import {InjectedRouter} from 'react-router/lib/Router'
const Spin = require('antd/lib/spin')
const styles = require('./register.less')


interface IJoinOrganizationProps {
  onJoinOrganization: (token: string, resolve?: (res?: string) => any, reject?: (err?: string) => any) => any
  router: InjectedRouter
}

export class JoinOrganization extends React.PureComponent <IJoinOrganizationProps, {}> {
  private joinOrganization  = () => {
    const { onJoinOrganization } = this.props
    const token = this.getParamsByLocation('token')
    onJoinOrganization(token, (res) => {
      const path = `${window.location.protocol}//${window.location.host}/#projects`
      location.replace(path)
    }, (err) => {
     const path = `${window.location.protocol}//${window.location.host}/#login`
     location.replace(path)
    })
  }

  private isEmptyOrNull = (str) => str == null || str === undefined || str === '' || str === 'null' || typeof str === 'undefined'

  private getParamsByLocation = (name) => {
    let values = decodeURIComponent((window.location.search.match(RegExp(`[?|&|/]${name}=([^\\&|?&]+)`)) || [void 0, null])[1])
    if (this.isEmptyOrNull(values)) {
      values = decodeURIComponent((window.location.hash.match(RegExp(`[?|&|/]${name}=([^\&|?&]+)`)) || [void 0, null])[1])
    }
    return this.isEmptyOrNull(values) || values === 'null' ? '' : values
  }

  public componentWillMount () {
    this.joinOrganization()
  }

  public render () {
    return (
      <div className={styles.activeWrapper}>
        <Spin size="large"/>
      </div>
    )
  }
}

export function mapDispatchToProps (dispatch) {
  return {
    onJoinOrganization: (token, resolve, reject) => dispatch(joinOrganization(token, resolve, reject))
  }
}

const withConnect = connect<{}, {}, IJoinOrganizationProps>(null, mapDispatchToProps)
const withReducer = injectReducer({ key: 'app', reducer })
const withSaga = injectSaga({ key: 'app', saga })

export default compose(
  withReducer,
  withSaga,
  withConnect
)(JoinOrganization)




