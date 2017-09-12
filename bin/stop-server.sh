#!/bin/bash
echo "[Davinci Server] Starts to shutdown system..."
Server=`ps -ef | grep java | grep edp.davinci.DavinciStarter | grep -v "grep"| awk 'NR==1 {print $2}'`
if [[ $Server -gt 0 ]]; then
  kill -9 $Server
  echo "[Davinci Server] System successed to be killed, bye!!!"
else
  echo "[Davinci Server] System did not run."
fi
