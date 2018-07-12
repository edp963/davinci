#!/bin/bash

#start server

current_dir=`pwd`
script_dir=$(cd `dirname $0`; pwd)
cd $script_dir
java -jar ../davinci-server_2.11-0.2.1-SNAPSHOT.jar edp.davinci.DavinciStarter &
