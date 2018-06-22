import {SIGNUP, SEND_MAIL_AGAIN} from './constants'
import { signupSuccess, signupError, sendMailAgainSuccess, sendMailAgainFail } from './actions'
const message = require('antd/lib/message')
import request from '../../utils/request'
import api from '../../utils/api'
import { readListAdapter } from '../../utils/asyncAdapter'

import {call, put} from 'redux-saga/effects'
import {takeLatest} from 'redux-saga'

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
    const resPayload = readListAdapter(asyncData)
    switch (asyncData.header.code) {
      case 200:
        yield put(signupSuccess())
        resolve(resPayload)
        return null
      default:
        yield put(signupError())
        resolve(resPayload)
    }
  } catch (err) {
    yield put(signupError())
    message.error('注册失败')
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
    switch (asyncData.header.code) {
      case 200:
        yield put(sendMailAgainSuccess())
        resolve(msg)
        return null
      default:
        yield put(sendMailAgainFail())
        message.error(msg)
    }
  } catch (err) {
    yield put(sendMailAgainFail())
    message.error('重发邮件失败')
  }
}



export default function* rootGroupSaga (): IterableIterator<any> {
  yield [
    takeLatest(SIGNUP, signup as any),
    takeLatest(SEND_MAIL_AGAIN, sendMailAgain as any)
  ]
}
