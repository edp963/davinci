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

import controlMigrationRecorder from './control'
import { IMigrationRecorder } from '.'
import { IDashboardConfig } from 'app/containers/Dashboard/types'
import { ControlQueryMode } from 'app/components/Control/constants'

interface IDashboardConfigMigrationRecorder extends IMigrationRecorder {
  recorders: {
    beta5(config: IDashboardConfig): IDashboardConfig
    beta9(config: IDashboardConfig, options?): IDashboardConfig
  }
}

const dashboardConfigMigrationRecorder: IDashboardConfigMigrationRecorder = {
  versions: ['beta5', 'beta9'],
  recorders: {
    beta5(config) {
      return {
        ...config,
        filters: (config.filters || []).map((control) =>
          controlMigrationRecorder.beta5(control)
        ),
        linkages: config.linkages || [],
        queryMode:
          config.queryMode === void 0
            ? ControlQueryMode.Immediately
            : config.queryMode
      }
    },
    beta9(config, options) {
      return {
        ...config,
        filters: (config.filters || []).map((control) =>
          controlMigrationRecorder.beta9(control, options)
        )
      }
    }
  }
}

export default dashboardConfigMigrationRecorder
