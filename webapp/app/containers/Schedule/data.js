const moment = require('moment')
const data = {
  config: {'to': 'test@creditease.cn', 'subject': '测试', 'bcc': '', 'contentList': [{'id': 117, 'type': 'dashboard'}]},
  cron_pattern:
    '0 * * * * ?',
  desc:
    '测试',
  end_date:
    '2018-05-22T11:46:04.100Z',
  job_type:
    'email',
  name:
    '新建定时任务',
  range:
    ['2018-04-11T11:46:04.100Z', '2018-05-22T11:46:04.100Z'],
  start_date:
    '2018-04-11T11:46:04.100Z',
  time_range:
    'Minute'
}

let time = '2018-04-11T11:46:04.100Z'

console.log(moment(time).format('YYYY-MM-DD HH:mm:ss'))
