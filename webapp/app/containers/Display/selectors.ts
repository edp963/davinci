import { createSelector } from 'reselect'

/**
 * Direct selector to the display state domain
 */
const selectDisplayDomain = () => (state) => state.get('display')

/**
 * Other specific selectors
 */

/**
 * Default selector used by Display
 */

const makeSelectDisplay = () => createSelector(
  selectDisplayDomain(),
  (substate) => substate.toJS()
)

export default makeSelectDisplay
export {
  selectDisplayDomain
}
