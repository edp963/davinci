import * as React from 'react'
import Helmet from 'react-helmet'
import { Link, InjectedRouter } from 'react-router'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import { compose } from 'redux'
import reducer from './reducer'
import reducerWidget from '../Widget/reducer'
import saga from './sagas'
import sagaWidget from '../Widget/sagas'
import injectReducer from '../../utils/injectReducer'
import injectSaga from '../../utils/injectSaga'

import Container from '../../components/Container'
import DisplayForm from './components/DisplayForm'
import { WrappedFormUtils } from 'antd/lib/form/Form'

interface IPreviewProps {
  params: any
}

interface IPreviewStates {

}

export class Preview extends React.Component<IPreviewProps, IPreviewStates> {

  public render () {
    return <div>123</div>
  }
}

const mapStateToProps = createStructuredSelector({
})

export function mapDispatchToProps (dispatch) {
  return {
  }
}

const withReducer = injectReducer({ key: 'display', reducer })
const withReducerWidget = injectReducer({ key: 'widget', reducer: reducerWidget })

const withSaga = injectSaga({ key: 'display', saga })
const withSagaWidget = injectSaga({ key: 'widget', saga: sagaWidget })

const withConnect = connect<{}, {}, IDisplayProps>(mapStateToProps, mapDispatchToProps)

export default compose(
  withReducer,
  withReducerWidget,
  withSaga,
  withSagaWidget,
  withConnect)(Preview)
