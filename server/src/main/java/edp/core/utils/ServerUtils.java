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

package edp.core.utils;

import com.alibaba.druid.util.StringUtils;
import edp.core.consts.Consts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;

import static edp.core.consts.Consts.*;

@Component
public class ServerUtils {
    @Value("${server.protocol:http}")
    private String protocol;

    @Value("${server.address}")
    private String address;

    @Value("${server.port}")
    private String port;

    @Value("${server.servlet.context-path:}")
    private String contextPath;

    @Value("${server.access.address:}")
    private String accessAddress;

    @Value("${server.access.port:}")
    private String accessPort;

    @Value("${file.base-path}")
    private String basePath;

    public String getHost() {

        String pro = protocol.trim().toLowerCase();
        String accAddress = StringUtils.isEmpty(accessAddress) ? address : accessAddress;
        String accPort = StringUtils.isEmpty(accessPort) ? port : accessPort;

        if (pro.equals(HTTP_PROTOCOL) && "80".equals(accPort)) {
            accPort = null;
        }

        if (pro.equals(HTTPS_PROTOCOL) && "443".equals(accPort)) {
            accPort = null;
        }

        StringBuilder sb = new StringBuilder();
        sb.append(pro).append(PROTOCOL_SEPARATOR).append(accAddress);
        if (!StringUtils.isEmpty(accPort)) {
            sb.append(":" + accPort);
        }

        if (!StringUtils.isEmpty(contextPath)) {
            contextPath = contextPath.replaceAll(Consts.SLASH, EMPTY);
            sb.append(Consts.SLASH);
            sb.append(contextPath);
        }

        return sb.toString();
    }

    public String getLocalHost() {
        return protocol + PROTOCOL_SEPARATOR + "localhost:" + port;
    }

    public String getBasePath() {
        return basePath.replaceAll("/", File.separator).replaceAll(File.separator + "{2,}", File.separator);
    }
}
