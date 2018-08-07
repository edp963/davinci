#!/bin/bash
Server=`ps -ef | grep java | grep davinci-server-0.3-0.0.1-SNAPSHOT | grep -v grep | awk '{print $2}'`
if [[ $Server -gt 0 ]]; then
  kill -9 $Server
else
  echo "[Davinci Server] System did not run."
fi
