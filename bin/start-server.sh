#!/bin/bash

#  <<
#  Davinci
#  ==
#  Copyright (C) 2016 - 2019 EDP
#  ==
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#        http://www.apache.org/licenses/LICENSE-2.0
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.
#  >>


#start server

server=`ps -ef | grep java | grep edp.davinci.server.DavinciServerApplication | grep -v grep | awk '{print $2}'`
if [[ $server -gt 0 ]]; then
  echo "[Davinci Server] is already started"
  exit
fi

cd ..
export DAVINCI_HOME=`pwd`

TODAY=`date "+%Y-%m-%d"`
LOG_PATH=$DAVINCI_HOME/logs/sys/davinci.$TODAY.log
nohup java -Dfile.encoding=UTF-8 -cp $JAVA_HOME/lib/*:$DAVINCI_HOME/lib/* edp.davinci.server.DavinciServerApplication --spring.config.additional-location=file:$DAVINCI_HOME/config/application.yml > $LOG_PATH  2>&1 &

echo "=========================================="
echo "Starting..., press \`CRTL + C\` to exit log"
echo "=========================================="

sleep 3s
tail -f $LOG_PATH