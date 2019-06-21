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

package edp.davinci.core.utils;

import com.alibaba.druid.util.StringUtils;
import edp.core.exception.NotFoundException;
import edp.davinci.core.common.ResultMap;
import edp.davinci.model.DacChannel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static java.util.stream.Collectors.groupingBy;

@Slf4j
@Component
@ConfigurationProperties(prefix = "data-auth-center", ignoreInvalidFields = true)
public class DacChannelUtil {

    public static final Map<String, DacChannel> dacMap = new HashMap<>();

    private List<DacChannel> channels = new ArrayList<>();

    private static final String AUTH_CODE_KEY = "authCode";

    private static final String EMAIL_KEY = "email";

    private static final String PAYLOAD = "payload";

    @Autowired
    private RestTemplate restTemplate;

    public void loadDacMap() {
        if (null != channels) {
            Map<String, List<DacChannel>> map = channels.stream()
                    .filter(c -> !StringUtils.isEmpty(c.getName()) && !StringUtils.isEmpty(c.getBaseUrl()))
                    .collect(groupingBy(DacChannel::getName));

            if (!CollectionUtils.isEmpty(map)) {
                map.forEach((k, v) -> dacMap.put(k.trim(), v.get(v.size() - 1)));
            }
        }
    }

    public List<DacChannel> getChannels() {
        return channels;
    }

    public void setChannels(List<DacChannel> channels) {
        this.channels = channels;
    }

    public List getTenants(String dacName) throws NotFoundException {
        if (!dacMap.containsKey(dacName)) {
            log.error("data-auth-center channel :{} is not found", dacName);
            throw new NotFoundException("Channel " + dacName + " is not found");
        }

        DacChannel channel = dacMap.get(dacName);

        try {
            ResponseEntity<ResultMap> result = restTemplate.getForEntity(UriComponentsBuilder.
                            fromHttpUrl(channel.getBaseUrl())
                            .queryParam(AUTH_CODE_KEY, channel.getAuthCode()).build().toString(),
                    ResultMap.class);
            if (result.getStatusCode().equals(HttpStatus.OK)) {
                ResultMap resultMap = result.getBody();
                return (List) resultMap.get(PAYLOAD);
            }
        } catch (RestClientException e) {
            log.error(e.getMessage());
        }

        return null;
    }

    public List getBizs(String dacName, String tenantId) throws NotFoundException {
        if (!dacMap.containsKey(dacName)) {
            log.error("data-auth-center channel :{} is not found", dacName);
            throw new NotFoundException("Channel " + dacName + " is not found");
        }

        DacChannel channel = dacMap.get(dacName);

        try {
            ResponseEntity<ResultMap> result = restTemplate.getForEntity(UriComponentsBuilder.
                            fromHttpUrl(channel.getBaseUrl() + "/{tenantId}/bizs")
                            .queryParam(AUTH_CODE_KEY, channel.getAuthCode())
                            .build().toString(),
                    ResultMap.class, tenantId);
            if (result.getStatusCode().equals(HttpStatus.OK)) {
                ResultMap resultMap = result.getBody();
                return (List) resultMap.get(PAYLOAD);
            }
        } catch (RestClientException e) {
            log.error(e.getMessage());
        }

        return null;
    }


    public List<Object> getData(String dacName, String bizId, String email) {
        if (dacMap.containsKey(dacName) && !StringUtils.isEmpty(email)) {
            DacChannel channel = dacMap.get(dacName);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add(AUTH_CODE_KEY, channel.getAuthCode());
            params.add(EMAIL_KEY, email);

            try {
                ResponseEntity<ResultMap> result = restTemplate.getForEntity(UriComponentsBuilder.
                                fromHttpUrl(channel.getBaseUrl() + "/bizs/{bizId}/data")
                                .queryParams(params)
                                .build().toString(),
                        ResultMap.class, bizId);

                if (result.getStatusCode().equals(HttpStatus.OK)) {
                    ResultMap resultMap = result.getBody();
                    return (List<Object>) resultMap.get(PAYLOAD);
                }
            } catch (RestClientException e) {
                log.error(e.getMessage());
            }
        }
        return null;
    }
}
