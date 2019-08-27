import { IStackConfig } from './types'

const prefixStack = 'stack_'

export function getStackName (metricName: string, stackConfig: IStackConfig) {
  if (!stackConfig || !stackConfig.group) { return prefixStack + metricName }

  let stackName = prefixStack
  stackConfig.group.some((config, idx) => {
    if (config.includes(metricName)) {
      stackName += idx
      return true
    }
  })

  return stackName
}
