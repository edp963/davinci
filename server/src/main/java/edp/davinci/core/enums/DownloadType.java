/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2019 EDP
 *  ==
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *        http://www.apache.org/licenses/LICENSE-2.0
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *  >>
 *
 */

package edp.davinci.core.enums;

/**
 * Created by IntelliJ IDEA.
 *
 * @Author daemon
 * @Date 19/5/28 10:57
 * To change this template use File | Settings | File Templates.
 */
public enum DownloadType {
    Widget("widget"),
    DashBoard("dashboard"),
    DashBoardFolder("folder");

    private String type;

    private DownloadType(String type){
        this.type=type;
    }

    public static DownloadType getDownloadType(String type){
        for(DownloadType em:DownloadType.values()){
            if(em.type.equalsIgnoreCase(type)){
                return em;
            }
        }
        return null;
    }
}
