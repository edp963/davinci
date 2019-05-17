import produce from 'immer'

import { SET_CONTROL_FORM_VALUES } from './constants'

const initialState = {
  controlForm: null
}

const formReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    const { type, payload } = action

    switch (type) {
      case SET_CONTROL_FORM_VALUES:
        draft.controlForm = payload.formValues
        break
    }
  })

export default formReducer
