import { createSelector } from 'reselect'

/**
 * Direct selector to the schedule state domain
 */
const selectScheduleDomain = () => (state) => state.get('schedule')

/**
 * Other specific selectors
 */

/**
 * Default selector used by Schedule
 */

const makeSelectSchedule = () => createSelector(
  selectScheduleDomain(),
  (substate) => substate.get('schedule')
)

export default makeSelectSchedule
export {
  selectScheduleDomain
}
