:: <<
:: Davinci
:: ==
:: Copyright (C) 2016 - 2018 EDP
:: ==
:: Licensed under the Apache License, Version 2.0 (the "License");
:: you may not use this file except in compliance with the License.
:: You may obtain a copy of the License at
::       http://www.apache.org/licenses/LICENSE-2.0
::  Unless required by applicable law or agreed to in writing, software
::  distributed under the License is distributed on an "AS IS" BASIS,
::  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
::  See the License for the specific language governing permissions and
::  limitations under the License.
:: >>

@echo off

if "%1" == "start" (
    echo start Davinci Server
    start "Davinci Server" java -cp .;%DAVINCI3_HOME%\lib\*;davinci-server_3.01-0.3.0-SNAPSHOT.jar edp.DavinciServerApplication --spring.config.additional-location=file:%DAVINCI3_HOME%\config\application.yml
) else if "%1" == "stop" (
    echo stop Davinci Server
    taskkill /fi "WINDOWTITLE eq Davinci Server"
) else (
    echo please use "run.bat start" or "run.bat stop"
)

pauses