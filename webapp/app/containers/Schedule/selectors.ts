import { createSelector } from 'reselect'

/**
 * Direct selector to the schedule state domain
 */
const selectSchedule = (state) => state.get('schedule')

/**
 * Other specific selectors
 */

/**
 * Default selector used by Schedule
 */

const makeSelectSchedule = () => createSelector(
  selectSchedule,
  (substate) => substate.get('schedule')
)
const makeSelectDashboards = () => createSelector(
  selectSchedule,
  (substate) => substate.get('dashboards')
)
const makeSelectCurrentDashboard = () => createSelector(
  selectSchedule,
  (substate) => substate.get('currentDashboard')
)
const makeSelectWidgets = () => createSelector(
  selectSchedule,
  (substate) => substate.get('widgets')
)

export {
  selectSchedule,
  makeSelectWidgets,
  makeSelectSchedule,
  makeSelectDashboards,
  makeSelectCurrentDashboard
}
