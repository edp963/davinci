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


Server=`ps -ef | grep java | grep edp.DavinciServerApplication | grep -v grep | awk '{print $2}'`
if [[ $Server -gt 0 ]]; then
  kill -9 $Server
else
  echo "[Davinci Server] System did not run."
fi
