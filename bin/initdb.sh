#!/bin/bash
mysql -P 3306 -h 10.143.129.32 -u root -proot test < $DAVINCI_HOME/bin/davinci.sql
