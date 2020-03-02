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

package edp.davinci.service.impl;

import com.alibaba.druid.util.StringUtils;
import edp.core.utils.TokenUtils;
import edp.davinci.core.common.ResultMap;
import edp.davinci.core.enums.CheckEntityEnum;
import edp.davinci.core.service.CheckEntityService;
import edp.davinci.service.CheckService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;

@Slf4j
@Service
public class CheckServiceImpl implements CheckService {

    @Autowired
    private BeanFactory beanFactory;

    @Autowired
    private TokenUtils tokenUtils;

    @Override
    public ResultMap checkSource(String name, Long id, CheckEntityEnum checkEntityEnum, Long scopeId, HttpServletRequest request) {

    	ResultMap resultMap = new ResultMap(tokenUtils);

        if (StringUtils.isEmpty(name)) {
            log.info("the name of entity({}) is EMPTY", checkEntityEnum.getClazz());
            if (checkEntityEnum.equals(CheckEntityEnum.USER)) {
                return resultMap.fail().message("name is EMPTY");
            }
            return resultMap.failAndRefreshToken(request).message("name is EMPTY");
        }

        try {
            String clazz = Class.forName(checkEntityEnum.getClazz()).getTypeName();
            if (StringUtils.isEmpty(clazz)) {
                log.info("not found entity type : {}", checkEntityEnum.getClazz());
                if (checkEntityEnum.equals(CheckEntityEnum.USER)) {
                    return resultMap.fail().message("not supported entity type");
                }
                return resultMap.failAndRefreshToken(request).message("not supported entity type");
            }
        } catch (ClassNotFoundException e) {
            log.error("not supported entity type : {}", checkEntityEnum.getClazz());
            if (checkEntityEnum.equals(CheckEntityEnum.USER)) {
                resultMap.fail().message("not supported entity type");
            }
            return resultMap.failAndRefreshToken(request).message("not supported entity type");
        }

        CheckEntityService checkEntityService = (CheckEntityService) beanFactory.getBean(checkEntityEnum.getService());
        if (checkEntityService.isExist(name, id, scopeId)) {
            if (checkEntityEnum.equals(CheckEntityEnum.USER)) {
                return resultMap.fail().message("the current " + checkEntityEnum.getSource() + " name is already taken");
            }
			return resultMap.failAndRefreshToken(request)
					.message("the current " + checkEntityEnum.getSource() + " name is already taken");
        } else {
            if (checkEntityEnum == CheckEntityEnum.USER) {
                return resultMap.success();
            }
            return resultMap.successAndRefreshToken(request);
        }
    }
}
