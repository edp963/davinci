import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as hoistNonReactStatics from 'hoist-non-react-statics'
import { IStore } from '../store'

import getInjectors from './reducerInjectors'

/**
 * Dynamically injects a reducer
 *
 * @param {string} key A key of the reducer
 * @param {function} reducer A reducer that will be injected
 *
 */
interface IReducerInjectorProps {
  store: IStore<{}>
 }

export default ({ key, reducer }) => (WrappedComponent) => {
  class ReducerInjector extends React.PureComponent<IReducerInjectorProps, {}> {
    private static WrappedComponent = WrappedComponent

    private static contextTypes = {
      store: PropTypes.object.isRequired
    }

    private static displayName = `withReducer(${(WrappedComponent.displayName || WrappedComponent.name || 'Component')})`

    public componentWillMount () {
      const { injectReducer } = this.injectors

      injectReducer(key, reducer)
    }

    private injectors = getInjectors(this.context.store)

    public render () {
      return <WrappedComponent {...this.props} />
    }
  }

  return hoistNonReactStatics(ReducerInjector, WrappedComponent)
}
