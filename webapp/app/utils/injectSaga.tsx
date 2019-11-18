import React from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'
import { ReactReduxContext } from 'react-redux'

import getInjectors from './sagaInjectors'

/**
 * Dynamically injects a saga, passes component's props as saga arguments
 *
 * @param {string} key A key of the saga
 * @param {function} saga A root saga that will be injected
 * @param {string} [mode] By default (constants.DAEMON) the saga will be started
 * on component mount and never canceled or started again. Another two options:
 *   - constants.RESTART_ON_REMOUNT — the saga will be started on component mount and
 *   cancelled with `task.cancel()` on component unmount for improved performance,
 *   - constants.ONCE_TILL_UNMOUNT — behaves like 'RESTART_ON_REMOUNT' but never runs it again.
 *
 */
export default (descriptor: { key: string, saga: any, mode?: string }) => (WrappedComponent) => {
  const { key, saga, mode } = descriptor
  class InjectSaga extends React.Component {
    public static WrappedComponent = WrappedComponent

    public static contextType = ReactReduxContext

    public static displayName = `withSaga(${WrappedComponent.displayName ||
      WrappedComponent.name ||
      'Component'})`

    private injectors = null

    constructor (props, context) {
      super(props, context)

      this.injectors = getInjectors(context.store)

      this.injectors.injectSaga(key, { saga, mode }, this.props)
    }

    public componentWillUnmount () {
      this.injectors.ejectSaga(key)
    }

    public render () {
      return <WrappedComponent {...this.props} />
    }
  }

  return hoistNonReactStatics(InjectSaga, WrappedComponent)
}

const useInjectSaga = (descriptor: { key: string, saga: any, mode?: string }) => {
  const { key, saga, mode } = descriptor
  const context = React.useContext(ReactReduxContext)
  React.useEffect(() => {
    const injectors = getInjectors(context.store)
    injectors.injectSaga(key, { saga, mode })

    return () => {
      injectors.ejectSaga(key)
    }
  }, [])
}

export { useInjectSaga }
