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

import edp.davinci.commons.util.StringUtils;
import edp.davinci.server.commons.Constants;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import static edp.davinci.commons.Constants.*;

import java.io.File;
import java.net.InetAddress;
import java.net.UnknownHostException;

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

        if (pro.equals(Constants.HTTP_PROTOCOL) && "80".equals(accPort)) {
            accPort = null;
        }

        if (pro.equals(Constants.HTTPS_PROTOCOL) && "443".equals(accPort)) {
            accPort = null;
        }

        StringBuilder sb = new StringBuilder();
        sb.append(pro).append(Constants.PROTOCOL_SEPARATOR).append(accAddress);
        if (!StringUtils.isEmpty(accPort)) {
            sb.append(":" + accPort);
        }

        if (!StringUtils.isEmpty(contextPath)) {
            contextPath = contextPath.replaceAll(SLASH, EMPTY);
            sb.append(SLASH);
            sb.append(contextPath);
        }

        return sb.toString();
    }

    public String getLocalHost() {
        String hostName = "localhost";
        try {
            InetAddress ia = InetAddress.getLocalHost();
            hostName = ia.getHostName();
        } catch (UnknownHostException ex) {
            hostName = "localhost";
        }
        return protocol + Constants.PROTOCOL_SEPARATOR + hostName + ":" + port;
    }

    public String getBasePath() {
        return basePath.replaceAll("/", File.separator).replaceAll(File.separator + "{2,}", File.separator);
    }
}
