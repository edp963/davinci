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

import edp.core.model.ScheduleJob;
import edp.core.utils.DateUtils;
import edp.davinci.core.enums.CronJobStatusEnum;
import lombok.Data;

import java.util.Date;

@Data
public class CronJob extends ScheduleJob {

    private Long id;

    private String name;

    private Long projectId;

    private String jobType;

    private String config;

    private String jobStatus = CronJobStatusEnum.NEW.getStatus();

    private String execLog;

    private String cronExpression;

    private Date startDate;

    private Date endDate;

    private String description;

    @Override
    public String toString() {
        return "CronJob{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", projectId=" + projectId +
                ", jobType='" + jobType + '\'' +
                ", config='" + config + '\'' +
                ", jobStatus='" + jobStatus + '\'' +
                ", execLog='" + execLog + '\'' +
                ", cronExpression='" + cronExpression + '\'' +
                ", startDate=" + DateUtils.toyyyyMMddHHmmss(startDate) +
                ", endDate=" + DateUtils.toyyyyMMddHHmmss(endDate) +
                ", description='" + description + '\'' +
                '}';
    }
}