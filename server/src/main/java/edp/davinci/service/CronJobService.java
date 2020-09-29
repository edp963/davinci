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

import edp.core.exception.NotFoundException;
import edp.core.exception.ServerException;
import edp.core.exception.UnAuthorizedException;
import edp.davinci.core.service.CheckEntityService;
import edp.davinci.dto.cronJobDto.CronJobBaseInfo;
import edp.davinci.dto.cronJobDto.CronJobInfo;
import edp.davinci.dto.cronJobDto.CronJobUpdate;
import edp.davinci.model.CronJob;
import edp.davinci.model.User;

import java.util.List;

public interface CronJobService extends CheckEntityService {
    List<CronJob> getCronJobs(Long projectId, User user);

    CronJob getCronJob(Long id, User user) throws NotFoundException, UnAuthorizedException, ServerException;

    CronJobInfo createCronJob(CronJobBaseInfo cronJobBaseInfo, User user) throws NotFoundException, UnAuthorizedException, ServerException;

    boolean updateCronJob(CronJobUpdate cronJobUpdate, User user) throws NotFoundException, UnAuthorizedException, ServerException;

    boolean deleteCronJob(Long id, User user) throws NotFoundException, UnAuthorizedException, ServerException;

    CronJob startCronJob(Long id, User user) throws NotFoundException, UnAuthorizedException, ServerException;

    CronJob stopCronJob(Long id, User user) throws NotFoundException, UnAuthorizedException, ServerException;

    void startAllJobs();

    boolean executeCronJob(Long id, User user) throws NotFoundException, UnAuthorizedException, ServerException;
}
