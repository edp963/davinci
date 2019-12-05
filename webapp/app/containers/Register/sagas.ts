import {SIGNUP, SEND_MAIL_AGAIN} from './constants'
import { signupSuccess, signupError, sendMailAgainSuccess, sendMailAgainFail } from './actions'
import request from 'utils/request'
import api from 'utils/api'
import { errorHandler } from 'utils/util'

import { call, put, all, takeLatest } from 'redux-saga/effects'

export function* signup (action): IterableIterator<any> {
  const {username, email, password, resolve} = action.payload
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.signup,
      data: {
        username,
        email,
        password
      }
    })
    const resPayload = asyncData.payload
    yield put(signupSuccess())
    resolve(resPayload)
  } catch (err) {
    yield put(signupError())
    errorHandler(err)
  }
}
export function* sendMailAgain (action): IterableIterator<any> {
  const {email, resolve} = action.payload
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.signup}/sendmail`,
      data: {
        email
      }
    })
    const msg = asyncData.header.msg
    yield put(sendMailAgainSuccess())
    resolve(msg)
  } catch (err) {
    yield put(sendMailAgainFail())
    errorHandler(err)
  }
}



export default function* rootGroupSaga (): IterableIterator<any> {
  yield all([
    takeLatest(SIGNUP, signup as any),
    takeLatest(SEND_MAIL_AGAIN, sendMailAgain as any)
  ])
}
