#!/bin/bash
cd ..
export DAVINCI_HOME=`pwd`
mysql -P 3306 -h localhost -u root -proot davinci0.4 < $DAVINCI_HOME/bin/davinci.sql
