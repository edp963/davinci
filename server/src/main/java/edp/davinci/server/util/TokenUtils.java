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

import static edp.davinci.commons.Constants.EMPTY;
import static edp.davinci.server.commons.Constants.TOKEN_CREATE_TIME;
import static edp.davinci.server.commons.Constants.TOKEN_PREFIX;
import static edp.davinci.server.commons.Constants.TOKEN_USER_NAME;
import static edp.davinci.server.commons.Constants.TOKEN_USER_PASSWORD;

import java.io.UnsupportedEncodingException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import edp.davinci.commons.util.StringUtils;
import edp.davinci.server.model.TokenEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@Component
public class TokenUtils {

    /**
     * 自定义token私钥
     */
    @Autowired
    private String TOKEN_SECRET;

    /**
     * 默认token超时时间
     */
    @Value("${jwtToken.timeout:1800000}")
    private Long TIMEOUT;

    /**
     * 默认 jwt 生成算法
     */
    @Value("${jwtToken.algorithm:HS512}")
    private String ALGORITHM;

    private static final int PASSWORD_LEN = 8;

    private static final char[] PASSWORD_SEEDS = {
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N',
            'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    };


    public static String randomPassword() {
        IntStream intStream = new Random().ints(0, PASSWORD_SEEDS.length);
        return intStream.limit(PASSWORD_LEN).mapToObj(i -> PASSWORD_SEEDS[i]).map(String::valueOf)
                .collect(Collectors.joining());
    }

    /**
     * 根据TokenEntity实体生成Token
     *
     * @param tokenEntity
     * @return
     */
    public String generateToken(TokenEntity tokenEntity) {
        Map<String, Object> claims = new HashMap<String, Object>();
        claims.put(TOKEN_USER_NAME, StringUtils.isEmpty(tokenEntity.getUsername()) ? EMPTY : tokenEntity.getUsername());
        claims.put(TOKEN_USER_PASSWORD, StringUtils.isEmpty(tokenEntity.getPassword()) ? EMPTY : tokenEntity.getPassword());
        claims.put(TOKEN_CREATE_TIME, System.currentTimeMillis());
        return toTokenString(claims, TIMEOUT);
    }

    /**
     * 刷新token
     *
     * @param token
     * @return
     */
    public String refreshToken(String token) {
        Claims claims = getClaims(token);
        claims.put(TOKEN_CREATE_TIME, System.currentTimeMillis());
        return toTokenString(claims, TIMEOUT);
    }


    /**
     * 根据TokenEntity实体和自定义超时时长生成Token
     *
     * @param tokenEntity
     * @param timeOutMillis （毫秒）
     * @return
     */
    public String generateToken(TokenEntity tokenEntity, Long timeOutMillis) {
        Map<String, Object> claims = new HashMap<String, Object>();
        claims.put(TOKEN_USER_NAME, StringUtils.isEmpty(tokenEntity.getUsername()) ? EMPTY : tokenEntity.getUsername());
        claims.put(TOKEN_USER_PASSWORD, StringUtils.isEmpty(tokenEntity.getPassword()) ? EMPTY : tokenEntity.getPassword());
        claims.put(TOKEN_CREATE_TIME, System.currentTimeMillis());
        return toTokenString(claims, timeOutMillis);
    }

    /**
     * 根据TokenEntity实体生成永久Token
     *
     * @param tokenDetail
     * @return
     */
    public String generateContinuousToken(TokenEntity tokenDetail) {
        Map<String, Object> claims = new HashMap<String, Object>();
        claims.put(TOKEN_USER_NAME, StringUtils.isEmpty(tokenDetail.getUsername()) ? EMPTY : tokenDetail.getUsername());
        claims.put(TOKEN_USER_PASSWORD, StringUtils.isEmpty(tokenDetail.getPassword()) ? EMPTY : tokenDetail.getPassword());
        claims.put(TOKEN_CREATE_TIME, System.currentTimeMillis());
        try {
            return Jwts.builder()
                    .setClaims(claims)
                    .setSubject(claims.get(TOKEN_USER_NAME).toString())
                    .signWith(null != SignatureAlgorithm.valueOf(ALGORITHM) ?
                            SignatureAlgorithm.valueOf(ALGORITHM) :
                            SignatureAlgorithm.HS512, TOKEN_SECRET.getBytes("UTF-8"))
                    .compact();
        } catch (UnsupportedEncodingException e) {
            log.warn(e.getMessage(), e);
            return Jwts.builder()
                    .setClaims(claims)
                    .setSubject(claims.get(TOKEN_USER_NAME).toString())
                    .signWith(null != SignatureAlgorithm.valueOf(ALGORITHM) ?
                            SignatureAlgorithm.valueOf(ALGORITHM) :
                            SignatureAlgorithm.HS512, TOKEN_SECRET)
                    .compact();
        }
    }

    /**
     * 根据clams生成token
     *
     * @param claims
     * @param timeOutMillis
     * 
     * @return
     */
    private String toTokenString(Map<String, Object> claims, Long timeOutMillis) {
        Long expiration = Long.parseLong(claims.get(TOKEN_CREATE_TIME) + EMPTY) + timeOutMillis;

        try {
            return Jwts.builder()
                    .setClaims(claims)
                    .setSubject(claims.get(TOKEN_USER_NAME).toString())
                    .setExpiration(new Date(expiration))
                    .signWith(null != SignatureAlgorithm.valueOf(ALGORITHM) ?
                            SignatureAlgorithm.valueOf(ALGORITHM) :
                            SignatureAlgorithm.HS512, TOKEN_SECRET.getBytes("UTF-8"))
                    .compact();
        } catch (UnsupportedEncodingException ex) {
            log.warn(ex.getMessage());
            return Jwts.builder()
                    .setClaims(claims)
                    .setSubject(claims.get(TOKEN_USER_NAME).toString())
                    .setExpiration(new Date(expiration))
                    .signWith(null != SignatureAlgorithm.valueOf(ALGORITHM) ?
                            SignatureAlgorithm.valueOf(ALGORITHM) :
                            SignatureAlgorithm.HS512, TOKEN_SECRET)
                    .compact();
        }
    }

    /**
     * 解析token用户名
     *
     * @param token
     * @return
     */
    public String getUsername(String token) {
        String username = null;
        try {
            final Claims claims = getClaims(token);
            username = claims.get(TOKEN_USER_NAME).toString();
        } catch (Exception e) {

        }
        return username;
    }

    /**
     * 解析token密码
     *
     * @param token
     * @return
     */
    public String getPassword(String token) {
        String password;
        try {
            final Claims claims = getClaims(token);
            password = claims.get(TOKEN_USER_PASSWORD).toString();
        } catch (Exception e) {
            password = null;
        }
        return password;
    }

    /**
     * 获取token claims
     *
     * @param token
     * @return
     */
    private Claims getClaims(String token) {
        Claims claims;
        try {
            claims = Jwts.parser()
                    .setSigningKey(TOKEN_SECRET.getBytes("UTF-8"))
                    .parseClaimsJws(token.startsWith(TOKEN_PREFIX) ?
                            token.substring(token.indexOf(TOKEN_PREFIX) + TOKEN_PREFIX.length()).trim() :
                            token.trim())
                    .getBody();
        } catch (Exception e) {
            log.debug(e.getMessage(), e);
            claims = Jwts.parser()
                    .setSigningKey(TOKEN_SECRET)
                    .parseClaimsJws(token.startsWith(TOKEN_PREFIX) ?
                            token.substring(token.indexOf(TOKEN_PREFIX) + TOKEN_PREFIX.length()).trim() :
                            token.trim())
                    .getBody();
        }
        return claims;
    }

    /**
     * 根据TokenEntity验证token
     *
     * @param token
     * @param tokenEntity
     * @return
     */
    public boolean validateToken(String token, TokenEntity tokenEntity) {
        String username = getUsername(token);
        String password = getPassword(token);
        return (username.equals(tokenEntity.getUsername()) && password.equals(tokenEntity.getPassword()) && !(isExpired(token)));
    }

    /**
     * 根据用户名、密码验证token
     *
     * @param token
     * @param username
     * @param password
     * @return
     */
    public boolean validateToken(String token, String username, String password) {
        String tokenUsername = getUsername(token);
        String tokenPassword = getPassword(token);
        return (username.equals(tokenUsername) && password.equals(tokenPassword) && !(isExpired(token)));
    }

    /**
     * 获取token超时时间
     *
     * @param token
     * @return
     */
    private Date getExpirationDate(String token) {
        Date expiration;
        try {
            final Claims claims = getClaims(token);
            expiration = claims.getExpiration();
        } catch (Exception e) {
            expiration = null;
        }
        return expiration;
    }

    /**
     * token是否超时
     *
     * @param token
     * @return
     */
    private Boolean isExpired(String token) {
        final Date expiration = getExpirationDate(token);
        //超时时间为空则永久有效
        return null == expiration ? false : expiration.before(new Date(System.currentTimeMillis()));
    }

}
