#!/bin/bash
script_dir=$(cd `dirname $0`; pwd)
cd $script_dir/

./stop-server.sh
./start-server.sh
