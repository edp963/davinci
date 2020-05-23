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

if [ -z "$DAVINCI3_HOME" ]; then
  echo "DAVINCI3_HOME not found"
  echo "Please export DAVINCI3_HOME to your environment variable"
  exit
fi

cd $DAVINCI3_HOME
Lib_dir=`ls | grep lib`
if [ -z "$Lib_dir" ]; then
  echo "Invalid DAVINCI3_HOME"
  exit
fi

Server=`ps -ef | grep java | grep edp.DavinciServerApplication | grep -v grep | awk '{print $2}'`
if [[ $Server -gt 0 ]]; then
  echo "[Davinci Server] is already started"
  exit
fi

cd $DAVINCI3_HOME
TODAY=`date "+%Y-%m-%d"`
LOG_PATH=$DAVINCI3_HOME/logs/sys/davinci.$TODAY.log
nohup java -Dfile.encoding=UTF-8 -cp $JAVA_HOME/lib/*:lib/* edp.DavinciServerApplication > $LOG_PATH  2>&1 &

echo "=========================================="
echo "Starting..., press \`CRTL + C\` to exit log"
echo "=========================================="

sleep 3s
tail -f $LOG_PATH