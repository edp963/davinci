/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

import { IMigrationRecorder } from '.'
import {
  IScheduleMailConfig,
  IScheduleWeChatWorkConfig
} from 'app/containers/Schedule/components/types'

interface IScheduleConfigMigrationRecorder extends IMigrationRecorder {
  recorders: {
    beta9(config: IScheduleMailConfig): IScheduleMailConfig
    beta9(config: IScheduleWeChatWorkConfig): IScheduleWeChatWorkConfig
  }
}

const scheduleConfigMigrationRecorder: IScheduleConfigMigrationRecorder = {
  versions: ['beta9'],
  recorders: {
    beta9(config) {
      return {
        ...config,
        content: config.content === void 0 ? '' : config.content,
        setCronExpressionManually:
          config.setCronExpressionManually === void 0
            ? false
            : config.setCronExpressionManually
      }
    }
  }
}

export default scheduleConfigMigrationRecorder
