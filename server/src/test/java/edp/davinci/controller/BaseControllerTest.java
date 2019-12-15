
package edp.davinci.controller;

import java.util.Map;

import org.apache.commons.collections4.map.HashedMap;
import org.junit.Before;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.test.web.reactive.server.WebTestClient.BodyContentSpec;

import com.alibaba.fastjson.JSON;

import edp.davinci.BaseTest;

/**
 * BaseControllerTest description: ???
 *
 */
@AutoConfigureWebTestClient
public class BaseControllerTest extends BaseTest {

    @Autowired
    protected WebTestClient webClient;

    protected String token;

    @Before
    public void setUp() throws Exception {

        super.setUp();

        Map<String, Object> requestMap = new HashedMap<>();
        requestMap.put("username", "junit4@creditease.cn");
        requestMap.put("password", "junit4");

        doPost("/api/v3/login", requestMap).jsonPath("$.header.msg").isEqualTo("Success");
    }

    protected BodyContentSpec doGet(String url) {

        return webClient.get().uri(url).header("Authorization", token).exchange().expectBody().consumeWith(consumer -> {
            refreshToken(new String(consumer.getResponseBodyContent()));
        });
    }

    protected BodyContentSpec doPost(String url, Map<String, Object> requestMap) {

        return webClient.post().uri(url).syncBody(requestMap).header("Authorization", token).exchange().expectBody()
                .consumeWith(consumer -> {
                    refreshToken(new String(consumer.getResponseBodyContent()));
                });
    }

    protected BodyContentSpec doPut(String url, Map<String, Object> requestMap) {

        return webClient.put().uri(url).syncBody(requestMap).header("Authorization", token).exchange().expectBody()
                .consumeWith(consumer -> {
                    refreshToken(new String(consumer.getResponseBodyContent()));
                });
    }

    @SuppressWarnings("unchecked")
    protected void refreshToken(String body) {

        token = "Bearer " + (String) ((Map<String, Object>) JSON.parseObject(new String(body), Map.class).get("header"))
                .get("token");
    }
}
