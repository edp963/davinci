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

import { useEffect } from 'react'
import { statistic } from 'utils/statistic/statistic.dv'

import { IProject } from 'containers/Projects/types'
import { IDisplayFormed } from 'containers/Viz/types'

export const useStatistic = (project: IProject, display: IDisplayFormed) => {
  useEffect(() => {
    const beforeUnload = () => {
      statistic.setDurations(
        {
          end_time: statistic.getCurrentDateTime()
        },
        (data) => {
          statistic.setPrevDurationRecord(data, () => {
            statistic.setDurations({
              start_time: statistic.getCurrentDateTime(),
              end_time: ''
            })
          })
        }
      )
      window.addEventListener('beforeunload', beforeUnload, false)

      statistic.setDurations({
        start_time: statistic.getCurrentDateTime()
      })
      statistic.startClock()

      const interact = () => {
        statistic.isTimeout()
      }
      const onVisibilityChanged = (event) => {
        const flag = event.target.webkitHidden
        if (flag) {
          statistic.setDurations(
            {
              end_time: statistic.getCurrentDateTime()
            },
            (data) => {
              statistic.sendDuration([data]).then((res) => {
                statistic.resetClock()
              })
            }
          )
        } else {
          statistic.setDurations(
            {
              start_time: statistic.getCurrentDateTime()
            },
            (data) => {
              statistic.startClock()
            }
          )
        }
      }

      window.addEventListener('mousemove', interact, false)
      window.addEventListener('visibilitychange', onVisibilityChanged, false)
      window.addEventListener('keydown', interact, false)

      statistic.setOperations(
        {
          org_id: project.orgId,
          project_name: project.name,
          project_id: project.id,
          viz_type: 'display',
          viz_id: display.id,
          viz_name: display.name,
          create_time: statistic.getCurrentDateTime()
        },
        (data) => {
          const visitRecord = {
            ...data,
            action: 'visit'
          }
          statistic.sendOperation(visitRecord)
        }
      )

      return () => {
        statistic.setDurations(
          {
            end_time: statistic.getCurrentDateTime()
          },
          (data) => {
            statistic.sendDuration([data])
          }
        )
        window.removeEventListener('mousemove', interact, false)
        window.removeEventListener('keydown', interact, false)
        window.removeEventListener(
          'visibilitychange',
          onVisibilityChanged,
          false
        )
        statistic.resetClock()
      }
    }
  }, [])
}
