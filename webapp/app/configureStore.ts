/**
 * Create the store with dynamic reducers
 */

import { createStore, applyMiddleware, compose, Store, ReducersMapObject } from 'redux'
import { routerMiddleware } from 'connected-react-router'
import { History } from 'history'
import createSagaMiddleware, { Task, SagaIterator } from 'redux-saga'
import createReducer from './reducers'
import { apiInterceptorMiddleware } from 'utils/statistic/apiInterceptorMiddleware'

export interface IStore<T> extends Store<T> {
  runSaga?: (saga: (...args: any[]) => SagaIterator, ...args: any[]) => Task
  // asyncReducers?: ReducersMapObject,
  injectedReducers?: ReducersMapObject,
  injectedSagas?: ReducersMapObject
}

export interface IWindow extends Window {
  // __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: typeof compose
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any
}
declare const window: IWindow

export default function configureStore<T> (initialState = {}, history: History<any>): IStore<T> {
  let composeEnhancers = compose
  const reduxSagaMonitorOptions = {}

  // If Redux Dev Tools and Saga Dev Tools Extensions are installed, enable them
  /* istanbul ignore next */
  if (process.env.NODE_ENV !== 'production' && typeof window === 'object') {
    /* eslint-disable no-underscore-dangle */
    if (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
      composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    }

    // NOTE: Uncomment the code below to restore support for Redux Saga
    // Dev Tools once it supports redux-saga version 1.x.x
    // if (window.__SAGA_MONITOR_EXTENSION__)
    //   reduxSagaMonitorOptions = {
    //     sagaMonitor: window.__SAGA_MONITOR_EXTENSION__,
    //   }
    /* eslint-enable */
  }

  const sagaMiddleware = createSagaMiddleware(reduxSagaMonitorOptions)

  // Create the store with two middlewares
  // 1. statistics middleware
  // 2. sagaMiddleware: Makes redux-sagas work
  // 3. routerMiddleware: Syncs the location/URL path to the state
  const middlewares = [apiInterceptorMiddleware, sagaMiddleware, routerMiddleware(history)]

  const enhancers = [applyMiddleware(...middlewares)]

  const store: IStore<T> = createStore(
    createReducer(),
    initialState,
    composeEnhancers(...enhancers)
  )

  // Extensions
  store.runSaga = sagaMiddleware.run
  store.injectedReducers = {} // Reducer registry
  store.injectedSagas = {} // Saga registry

  // Make reducers hot reloadable, see http://mxs.is/googmo
  /* istanbul ignore next */
  if (module.hot) {
    module.hot.accept('./reducers', () => {
      store.replaceReducer(createReducer(store.injectedReducers))
    })
  }

  return store
}
