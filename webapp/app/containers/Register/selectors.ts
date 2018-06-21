import { createSelector } from 'reselect'

const selectGlobal = (state) => state.get('global')

const makeSelectSignupLoading = () => createSelector(
  selectGlobal,
  (globalState) => globalState.get('signupLoading')
)

export {
  makeSelectSignupLoading
}
