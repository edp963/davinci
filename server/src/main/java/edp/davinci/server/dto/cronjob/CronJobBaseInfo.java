/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2020 EDP
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

package edp.davinci.server.dto.cronjob;

import java.io.IOException;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import edp.davinci.commons.util.DateUtils;
import edp.davinci.commons.util.JSONUtils;
import lombok.Data;

@Data
@NotNull(message = "Cronjob info cannot be null")
public class CronJobBaseInfo {

    @NotBlank(message = "Cronjob name cannot be empty")
    private String name;

    @Min(value = 1L, message = "Invalid project Id")
    private Long projectId;

    @NotBlank(message = "Cronjob type cannot be empty")
    private String jobType;

    @NotBlank(message = "Cronjob config cannot be empty")
    @JsonDeserialize(using = ConfigDeserialize.class)
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

    public static class ConfigDeserialize extends JsonDeserializer<Object> {

        @Override
        public Object deserialize(JsonParser p, DeserializationContext ctxt)
                throws IOException, JsonProcessingException {
                Object value = p.readValueAs(Object.class);
                if (value instanceof String) {
                    return value;
                }else{
                    return JSONUtils.toString(value);
                }
        }
    }
}
