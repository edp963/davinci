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

package edp.davinci.service;

import edp.davinci.core.enums.DownloadType;
import edp.davinci.dto.viewDto.DownloadViewExecuteParam;
import edp.davinci.model.DownloadRecord;
import edp.davinci.model.User;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 *
 * @Author daemon
 * @Date 19/5/28 09:44
 * To change this template use File | Settings | File Templates.
 */
public interface DownloadService {


    /**
     * 获取下载列表
     *
     * @param userId
     * @return
     */
    List<DownloadRecord> queryDownloadRecordPage(Long userId);


    /**
     * 下载
     *
     * @param id
     * @param token
     * @return
     */
    DownloadRecord downloadById(Long id, String token);


    /**
     * 提交下载任务
     *
     * @param type
     * @param id
     * @param user
     * @param params
     * @return
     */
    Boolean submit(DownloadType type, Long id, User user, List<DownloadViewExecuteParam> params);
}
