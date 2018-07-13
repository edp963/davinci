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

import config, { env, envName } from '../globalConfig'

const { dev, production } = envName

export const apiConfig = {
  login: { env: dev, url: '/login' },
  group: { env: dev, url: '/groups' },
  user: { env: dev, url: '/users' },
  changepwd: { env: dev, url: '/changepwd' },
  source: { env: dev, url: '/sources' },
  bizlogic: { env: dev, url: '/flattables' },
  widget: { env: dev, url: '/widgets' },
  dashboard: { env: dev, url: '/dashboards' },
  share: { env: dev, url: '/share' },
  checkName: { env: dev, url: '/check' },
  uploads: { env: dev, url: '/uploads' },
  schedule: { env: production, url: '/cronjobs' },
  signup: { env: dev, url: '/user' },
  display: { env: dev, url: '/displays' }
}

export default Object.keys(apiConfig).reduce((acc, key) => {
  const { env, url } = apiConfig[key]
  acc[key] = config[env].host + url
  return acc
}, {})
