#!/usr/bin/env bash

current_dir=`pwd`
script_dir=$(cd `dirname $0`; pwd)
echo $script_dir
echo $current_dir
cd $script_dir
cd ..
cd $current_dir