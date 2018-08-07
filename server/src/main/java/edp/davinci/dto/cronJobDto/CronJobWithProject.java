/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2018 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *       http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 * >>
 */

package edp.davinci.dto.cronJobDto;

import edp.davinci.model.CronJob;
import edp.davinci.model.Project;
import lombok.Data;

import java.text.SimpleDateFormat;

@Data
public class CronJobWithProject extends CronJob {
    private Project project;


    public CronJobInfo toCrobJobInfo() {
        CronJobInfo cronJobInfo = new CronJobInfo();
        cronJobInfo.setId(this.getId());
        cronJobInfo.setName(this.getName());
        cronJobInfo.setProjectId(this.getProjectId());
        cronJobInfo.setJobStatus(this.getJobStatus());
        cronJobInfo.setJobType(this.getJobType());
        cronJobInfo.setConfig(this.getConfig());
        cronJobInfo.setCronExpression(this.getCronExpression());

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        cronJobInfo.setStartDate(sdf.format(this.getStartDate()));
        cronJobInfo.setEndDate(sdf.format(this.getEndDate()));
        cronJobInfo.setDescription(this.getDescription());

        return cronJobInfo;
    }
}
