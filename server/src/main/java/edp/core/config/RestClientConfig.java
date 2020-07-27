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

package edp.core.config;

import com.alibaba.druid.util.StringUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.HttpException;
import org.apache.http.HttpHost;
import org.apache.http.HttpRequest;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpRequestWrapper;
import org.apache.http.config.RegistryBuilder;
import org.apache.http.conn.socket.ConnectionSocketFactory;
import org.apache.http.conn.socket.PlainConnectionSocketFactory;
import org.apache.http.conn.ssl.NoopHostnameVerifier;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.impl.client.DefaultHttpRequestRetryHandler;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.conn.DefaultProxyRoutePlanner;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.apache.http.protocol.HttpContext;
import org.apache.http.ssl.SSLContextBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.DefaultResponseErrorHandler;
import org.springframework.web.client.RestTemplate;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLContext;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.util.regex.Pattern;

@Slf4j
@Configuration
public class RestClientConfig {

    /**
     * 最大连接数
     */
    private int maxTotalConnect = 500;

    /**
     * 同路由并发数
     */
    private int maxConnectPerRoute = 20;

    /**
     * 客户端和服务器建立连接超时，默认2s
     */
    private int connectTimeout = 2 * 1000;

    /**
     * 指客户端从服务器读取数据包的间隔超时时间, 不是总读取时间，默认30s
     */
    private int readTimeout = 30 * 1000;

    /**
     * 重试次数
     */
    private int retryTimes = 2;

    /**
     * 从连接池获取连接的超时时间, 单位ms
     */
    private int connectionRequestTimout = 200;

    @Value("${spring.rest.proxy-host}")
    private String proxyHost;

    @Value("${spring.rest.proxy-port}")
    private Integer proxyPort;

    @Value("${spring.rest.proxy-ignore}")
    private String proxyIgnore;

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.setRequestFactory(httpComponentsClientHttpRequestFactory());
        restTemplate.setErrorHandler(new DefaultResponseErrorHandler());
        return restTemplate;
    }

    @Bean
    public HttpComponentsClientHttpRequestFactory httpComponentsClientHttpRequestFactory() {
        HttpClientBuilder httpClientBuilder = HttpClientBuilder.create();
        try {
            SSLContext sslContext = new SSLContextBuilder().loadTrustMaterial(null, ((x509Certificates, s) -> true))
                    .build();

            httpClientBuilder.setSSLContext(sslContext);
            HostnameVerifier hostnameVerifier = NoopHostnameVerifier.INSTANCE;

            PoolingHttpClientConnectionManager poolingHttpClientConnectionManager = new PoolingHttpClientConnectionManager(
                    RegistryBuilder.<ConnectionSocketFactory>create()
                            .register("http", PlainConnectionSocketFactory.getSocketFactory())
                            .register("https", new SSLConnectionSocketFactory(sslContext, hostnameVerifier)).build());

            poolingHttpClientConnectionManager.setMaxTotal(maxTotalConnect);
            poolingHttpClientConnectionManager.setDefaultMaxPerRoute(maxConnectPerRoute);
            httpClientBuilder.setConnectionManager(poolingHttpClientConnectionManager);
            httpClientBuilder.setRetryHandler(new DefaultHttpRequestRetryHandler(retryTimes, true));
            
            if (!StringUtils.isEmpty(proxyHost)) {
                HttpHost proxy = new HttpHost(proxyHost, proxyPort);
                httpClientBuilder.setRoutePlanner(new DefaultProxyRoutePlanner(proxy) {
                    @Override
                    public HttpHost determineProxy(HttpHost target, HttpRequest request, HttpContext context)
                            throws HttpException {
                        HttpRequestWrapper wrapper = (HttpRequestWrapper) request;
                        if (StringUtils.isEmpty(proxyIgnore)) {
                            return super.determineProxy(target, request, context);
                        }
                        
                        Pattern pattern = Pattern.compile(proxyIgnore);
                        if (pattern.matcher(wrapper.getURI().getHost()).matches()) {
                            return null;
                        }
                        
                        return super.determineProxy(target, request, context);
                    }
                });
            }
            
            HttpClient httpClient = httpClientBuilder.build();
            HttpComponentsClientHttpRequestFactory clientHttpRequestFactory = new HttpComponentsClientHttpRequestFactory(
                    httpClient);
            clientHttpRequestFactory.setConnectTimeout(connectTimeout);
            clientHttpRequestFactory.setReadTimeout(readTimeout);
            clientHttpRequestFactory.setConnectionRequestTimeout(connectionRequestTimout);
            return clientHttpRequestFactory;
        } catch (NoSuchAlgorithmException | KeyManagementException | KeyStoreException e) {
            log.error("Initializing HTTP connection pool error", e);
        }
        return null;
    }
}