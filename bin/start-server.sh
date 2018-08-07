#!/bin/bash

#start server

Server=`ps -ef | grep java | grep davinci-server-0.3-0.0.1-SNAPSHOT | grep -v grep | awk '{print $2}'`
if [[ $Server -gt 0 ]]; then
  echo "[Davinci Server] is already started"
  exit
fi

script_dir=$(cd `dirname $0`; pwd)
cd $script_dir/../
nohup java -cp lib/*:davinci-server-0.3-0.0.1-SNAPSHOT.jar edp.DavinciServerApplication  >/dev/null  2>&1 &
