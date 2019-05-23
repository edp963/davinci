import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as hoistNonReactStatics from 'hoist-non-react-statics'
import { IStore } from '../store'

import getInjectors from './sagaInjectors'

/**
 * Dynamically injects a saga, passes component's props as saga arguments
 *
 * @param {string} key A key of the saga
 * @param {function} saga A root saga that will be injected
 * @param {string} [mode] By default (constants.RESTART_ON_REMOUNT) the saga will be started on component mount and
 * cancelled with `task.cancel()` on component un-mount for improved performance. Another two options:
 *   - constants.DAEMON—starts the saga on component mount and never cancels it or starts again,
 *   - constants.ONCE_TILL_UNMOUNT—behaves like 'RESTART_ON_REMOUNT' but never runs it again.
 *
 */

interface IInjectSagaProps {
  store: IStore<{}>
}

export default (descriptor: { key: string, saga: any, mode?: any }) => (WrappedComponent) => {
  const { key, saga, mode } = descriptor
  class InjectSaga extends React.PureComponent<IInjectSagaProps, {}> {
    private static WrappedComponent = WrappedComponent
    private static contextTypes = {
      store: PropTypes.object.isRequired
    }
    private static displayName = `withSaga(${(WrappedComponent.displayName || WrappedComponent.name || 'Component')})`

    public componentWillMount () {
      const { injectSaga } = this.injectors

      injectSaga(key, { saga, mode }, this.props)
    }

    public componentWillUnmount () {
      const { ejectSaga } = this.injectors

      ejectSaga(key)
    }

    private injectors = getInjectors(this.context.store)

    public render () {
      return <WrappedComponent {...this.props} />
    }
  }

  return hoistNonReactStatics(InjectSaga, WrappedComponent)
}
