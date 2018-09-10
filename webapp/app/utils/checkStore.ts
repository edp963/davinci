import * as conformsTo from 'lodash/conformsTo'
import * as isFunction from 'lodash/isFunction'
import * as isObject from 'lodash/isObject'
import * as invariant from 'invariant'

/**
 * Validate the shape of redux store
 */
export default function checkStore (store) {
  const shape = {
    dispatch: isFunction,
    subscribe: isFunction,
    getState: isFunction,
    replaceReducer: isFunction,
    runSaga: isFunction,
    injectedReducers: isObject,
    injectedSagas: isObject
  }
  invariant(
    conformsTo(store, shape),
    '(app/utils...) injectors: Expected a valid redux store'
  )
}
