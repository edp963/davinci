#!/bin/bash
mysql -P 3306 -h localhost -u root -proot test < $DAVINCI_HOME/bin/davinci.sql
