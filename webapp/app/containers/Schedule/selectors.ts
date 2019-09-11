import { createSelector } from 'reselect'

/**
 * Direct selector to the schedule state domain
 */
const selectSchedule = (state) => state.schedule

/**
 * Other specific selectors
 */

/**
 * Default selector used by Schedule
 */

const makeSelectSchedule = () => createSelector(
  selectSchedule,
  (substate) => substate.schedule
)
const makeSelectDashboards = () => createSelector(
  selectSchedule,
  (substate) => substate.dashboards
)
const makeSelectCurrentDashboard = () => createSelector(
  selectSchedule,
  (substate) => substate.currentDashboard
)
const makeSelectWidgets = () => createSelector(
  selectSchedule,
  (substate) => substate.widgets
)
const makeSelectTableLoading = () => createSelector(
  selectSchedule,
  (substate) => substate.tableLoading
)
const makeSelectFormLoading = () => createSelector(
  selectSchedule,
  (substate) => substate.formLoading
)
const makeSelectVizs = () => createSelector(
  selectSchedule,
  (substate) => substate.vizs
)

export {
  selectSchedule,
  makeSelectWidgets,
  makeSelectSchedule,
  makeSelectDashboards,
  makeSelectCurrentDashboard,
  makeSelectTableLoading,
  makeSelectFormLoading,
  makeSelectVizs
}
