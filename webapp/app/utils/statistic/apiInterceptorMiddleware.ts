import {monitoreAction} from './monitoredAction'

export const apiInterceptorMiddleware = ({dispatch, getState}) => (next) => (action) => {
    monitoreAction(action.type)
    const nextAction = next(action)
    return nextAction
}







