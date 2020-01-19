import {monitoreAction} from './monitoredAction'

export const apiInterceptorMiddleware = ({dispatch, getState}) => (next) => (action) => {
    monitoreAction(action)
    const nextAction = next(action)
    return nextAction
}







