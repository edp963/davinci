
package edp.davinci.controller;

import java.util.Map;

import org.apache.commons.collections4.map.HashedMap;
import org.junit.Before;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.reactive.server.WebTestClient;

import com.alibaba.fastjson.JSON;

/**
 * BaseControllerTest description: ???
 *
 */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
@RunWith(SpringRunner.class)
public class BaseControllerTest {

    @Autowired
    protected WebTestClient webClient;

    protected String token;

    @Before
    public void setUp() throws Exception {

        Map<String, Object> requestMap = new HashedMap<>();
        requestMap.put("username", "longxiao2@creditease.cn");
        requestMap.put("password", "888888");
        
        doPost("/api/v3/login", requestMap);
    }

    protected void doPost(String url, Map<String, Object> requestMap) {
        webClient.post().uri(url).syncBody(requestMap).header("Authorization", token).exchange().expectStatus().isOk().expectBody()
        .consumeWith(consumer -> {
            refreshToken(new String(consumer.getResponseBodyContent()));
        }).jsonPath("$.header.msg").isEqualTo("Success");
    }
    
    protected void doPut(String url, Map<String, Object> requestMap) {
        webClient.put().uri(url).syncBody(requestMap).header("Authorization", token).exchange().expectStatus().isOk().expectBody()
        .consumeWith(consumer -> {
            refreshToken(new String(consumer.getResponseBodyContent()));
        }).jsonPath("$.header.msg").isEqualTo("Success");
    }
    
    protected void refreshToken(String body) {

        token = "Bearer " + (String) ((Map) JSON.parseObject(new String(body), Map.class).get("header")).get("token");
    }
}
