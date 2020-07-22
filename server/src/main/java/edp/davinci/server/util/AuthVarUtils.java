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

package edp.davinci.server.util;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import edp.davinci.commons.util.StringUtils;
import edp.davinci.server.enums.SqlVariableValueTypeEnum;
import edp.davinci.server.model.SqlVariable;
import edp.davinci.server.model.SqlVariableChannel;

@Component
public class AuthVarUtils {

	@Autowired
	private DacChannelUtils dacChannelUtils;

	public List<String> getValue(SqlVariable variable, String email) {
		SqlVariableChannel channel = variable.getChannel();
		if (channel == null) {
			return SqlVariableValueTypeEnum.getValues(variable.getValueType(), variable.getDefaultValues(),
					variable.isUdf());
		}

		if (DacChannelUtils.getDacMap().containsKey(channel.getName())) {

			if (StringUtils.isEmpty(email)) {
				return null;
			}

			List<Object> data = dacChannelUtils.getData(channel.getName(), channel.getBizId().toString(), email);
			return SqlVariableValueTypeEnum.getValues(variable.getValueType(), data, variable.isUdf());
		}

		return new ArrayList<>();
	}
}
