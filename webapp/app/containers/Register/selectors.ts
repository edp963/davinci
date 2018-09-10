import { createSelector } from 'reselect'

const selectGlobal = (state) => state.get('register')

const makeSelectSignupLoading = () => createSelector(
  selectGlobal,
  (globalState) => globalState.get('signupLoading')
)

export {
  makeSelectSignupLoading
}
