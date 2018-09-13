// /*
//  * <<
//  * Davinci
//  * ==
//  * Copyright (C) 2016 - 2017 EDP
//  * ==
//  * Licensed under the Apache License, Version 2.0 (the "License");
//  * you may not use this file except in compliance with the License.
//  * You may obtain a copy of the License at
//  *
//  *      http://www.apache.org/licenses/LICENSE-2.0
//  *
//  * Unless required by applicable law or agreed to in writing, software
//  * distributed under the License is distributed on an "AS IS" BASIS,
//  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  * See the License for the specific language governing permissions and
//  * limitations under the License.
//  * >>
//  */

// import conformsTo from 'lodash/conformsTo'
// import isEmpty from 'lodash/isEmpty'
// import isFunction from 'lodash/isFunction'
// import isObject from 'lodash/isObject'
// import isString from 'lodash/isString'
// import invariant from 'invariant'
// import warning from 'warning'

// import createReducer from '../reducers'

// /**
//  * Validate the shape of redux store
//  */
// export function checkStore (store) {
//   const shape = {
//     dispatch: isFunction,
//     subscribe: isFunction,
//     getState: isFunction,
//     replaceReducer: isFunction,
//     runSaga: isFunction,
//     asyncReducers: isObject
//   }
//   invariant(
//     conformsTo(store, shape),
//     '(app/utils...) asyncInjectors: Expected a valid redux store'
//   )
// }

// /**
//  * Inject an asynchronously loaded reducer
//  */
// export function injectAsyncReducer (store, isValid) {
//   return function injectReducer (name, asyncReducer) {
//     if (!isValid) checkStore(store)

//     invariant(
//       isString(name) && !isEmpty(name) && isFunction(asyncReducer),
//       '(app/utils...) injectAsyncReducer: Expected `asyncReducer` to be a reducer function'
//     )

//     if (Reflect.has(store.asyncReducers, name)) return

//     store.asyncReducers[name] = asyncReducer // eslint-disable-line no-param-reassign
//     store.replaceReducer(createReducer(store.asyncReducers))
//   }
// }

// /**
//  * Inject an asynchronously loaded saga
//  */
// export function injectAsyncSagas (store, isValid) {
//   return function injectSagas (sagas) {
//     if (!isValid) checkStore(store)

//     invariant(
//       Array.isArray(sagas),
//       '(app/utils...) injectAsyncSagas: Expected `sagas` to be an array of generator functions'
//     )

//     warning(
//       !isEmpty(sagas),
//       '(app/utils...) injectAsyncSagas: Received an empty `sagas` array'
//     )

//     sagas.map(store.runSaga)
//   }
// }

// /**
//  * Helper for creating injectors
//  */
// export function getAsyncInjectors (store) {
//   checkStore(store)

//   return {
//     injectReducer: injectAsyncReducer(store, true),
//     injectSagas: injectAsyncSagas(store, true)
//   }
// }
