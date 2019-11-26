import { createSelector } from 'reselect'

const selectGlobal = (state) => state.register

const makeSelectSignupLoading = () => createSelector(
  selectGlobal,
  (globalState) => globalState.signupLoading
)

export {
  makeSelectSignupLoading
}
