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
  login: { env: production, url: '/login' },
  group: { env: production, url: '/groups' },
  user: { env: production, url: '/users' },
  changepwd: { env: production, url: '/changepwd' },
  source: { env: production, url: '/sources' },
  bizlogic: { env: production, url: '/flattables' },
  widget: { env: production, url: '/widgets' },
  dashboard: { env: production, url: '/dashboards' },
  share: { env: production, url: '/shares' },
  checkName: { env: production, url: '/check/name' },
  uploads: { env: production, url: '/uploads' },
  schedule: { env: production, url: '/cronjobs' },
  signup: { env: dev, url: '/user' },
  display: { env: dev, url: '/displays' }
}

export default Object.keys(apiConfig).reduce((acc, key) => {
  const { env, url } = apiConfig[key]
  acc[key] = config[env].host + url
  return acc
}, {})
