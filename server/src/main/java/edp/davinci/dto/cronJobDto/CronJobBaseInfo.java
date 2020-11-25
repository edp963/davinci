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

package edp.davinci.dto.cronJobDto;

import edp.core.utils.DateUtils;
import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;

@Data
@NotNull(message = "Cron job info cannot be null")
public class CronJobBaseInfo {

    @NotBlank(message = "Cron job name cannot be empty")
    private String name;

    @Min(value = 1L, message = "Invalid project id")
    private Long projectId;

    @NotBlank(message = "Cron job type cannot be empty")
    private String jobType;

    @NotBlank(message = "Cron job config cannot be empty")
    private String config;

    @NotBlank(message = "Invalid cron pattern")
    private String cronExpression;

    @NotBlank(message = "Start time cannot be empty")
    @Pattern(regexp = DateUtils.DATE_HMS_REGEX, message = "Unparseable start date format")
    private String startDate;

    @NotBlank(message = "End time cannot be empty")
    @Pattern(regexp = DateUtils.DATE_HMS_REGEX, message = "Unparseable end date format")
    private String endDate;

    private String description;
}
