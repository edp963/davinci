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

package edp.davinci.model;


import lombok.Data;

@Data
public class Platform {
    private Long id;

    /**
     * 平台名称
     */
    private String name;

    /**
     * 平台描述（接口前缀）
     */
    private String platform;

    /**
     * 平台代码，dv颁发的授权
     */
    private String code;

    /**
     * 校验代码，对应平台颁发授权码
     */
    private String checkCode;

    /**
     * 校验token， 对应平台授信token
     */
    private String checkSystemToken;


    /**
     * 授信检测url
     */
    private String checkUrl;


    /**
     * 备用字段
     */
    private String alternateField1;

    private String alternateField2;

    private String alternateField3;

    private String alternateField4;

    private String alternateField5;

}