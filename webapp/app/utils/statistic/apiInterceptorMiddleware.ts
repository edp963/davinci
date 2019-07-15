import { statistic, ITerminal } from './statistic.dv'



export const apiInterceptorMiddleware = ({dispatch, getState}) => (next) => (action) => {
    // console.log(`type =${action.type}`)
    const nextAction = next(action)
    return nextAction
}







