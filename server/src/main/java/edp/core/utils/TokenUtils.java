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
import edp.core.model.TokenDetail;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.UnsupportedEncodingException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static edp.core.consts.Consts.EMPTY;


@Slf4j
@Component
public class TokenUtils {

    /**
     * 自定义 token 私钥
     */
    @Autowired
    private String TOKEN_SECRET;

    /**
     * 默认 token 超时时间
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
        return intStream.limit(PASSWORD_LEN).mapToObj(i -> PASSWORD_SEEDS[i]).map(String::valueOf).collect(Collectors.joining());
    }


    /**
     * 根据 TokenDetail 实体生成Token
     *
     * @param tokenDetail
     * @return
     */
    public String generateToken(TokenDetail tokenDetail) {
        Map<String, Object> claims = new HashMap<String, Object>();
        claims.put(Consts.TOKEN_USER_NAME, StringUtils.isEmpty(tokenDetail.getUsername()) ? EMPTY : tokenDetail.getUsername());
        claims.put(Consts.TOKEN_USER_PASSWORD, StringUtils.isEmpty(tokenDetail.getPassword()) ? EMPTY : tokenDetail.getPassword());
        claims.put(Consts.TOKEN_CREATE_TIME, System.currentTimeMillis());
        return generate(claims);
    }

    /**
     * 刷新token
     *
     * @param token
     * @return
     */
    public String refreshToken(String token) {
        Claims claims = getClaims(token);
        claims.put(Consts.TOKEN_CREATE_TIME, System.currentTimeMillis());
        return generate(claims);
    }


    /**
     * 根据 TokenDetail 实体和自定义超时时长生成Token
     *
     * @param tokenDetail
     * @param timeOutMillis （毫秒）
     * @return
     */
    public String generateToken(TokenDetail tokenDetail, Long timeOutMillis) {
        Map<String, Object> claims = new HashMap<String, Object>();
        claims.put(Consts.TOKEN_USER_NAME, StringUtils.isEmpty(tokenDetail.getUsername()) ? EMPTY : tokenDetail.getUsername());
        claims.put(Consts.TOKEN_USER_PASSWORD, StringUtils.isEmpty(tokenDetail.getPassword()) ? EMPTY : tokenDetail.getPassword());
        claims.put(Consts.TOKEN_CREATE_TIME, System.currentTimeMillis());

        return toTokenString(timeOutMillis, claims);
    }

    /**
     * 根据 TokenDetail 实体生成永久 Token
     *
     * @param tokenDetail
     * @return
     */
    public String generateContinuousToken(TokenDetail tokenDetail) {
        Map<String, Object> claims = new HashMap<String, Object>();
        claims.put(Consts.TOKEN_USER_NAME, StringUtils.isEmpty(tokenDetail.getUsername()) ? EMPTY : tokenDetail.getUsername());
        claims.put(Consts.TOKEN_USER_PASSWORD, StringUtils.isEmpty(tokenDetail.getPassword()) ? EMPTY : tokenDetail.getPassword());
        claims.put(Consts.TOKEN_CREATE_TIME, System.currentTimeMillis());
        try {
            return Jwts.builder()
                    .setClaims(claims)
                    .setSubject(claims.get(Consts.TOKEN_USER_NAME).toString())
                    .signWith(null != SignatureAlgorithm.valueOf(ALGORITHM) ?
                            SignatureAlgorithm.valueOf(ALGORITHM) :
                            SignatureAlgorithm.HS512, TOKEN_SECRET.getBytes("UTF-8"))
                    .compact();
        } catch (UnsupportedEncodingException ex) {
            log.warn(ex.getMessage());
            return Jwts.builder()
                    .setClaims(claims)
                    .setSubject(claims.get(Consts.TOKEN_USER_NAME).toString())
                    .signWith(null != SignatureAlgorithm.valueOf(ALGORITHM) ?
                            SignatureAlgorithm.valueOf(ALGORITHM) :
                            SignatureAlgorithm.HS512, TOKEN_SECRET)
                    .compact();
        }
    }

    /**
     * 根据 clams生成token
     *
     * @param claims
     * @return
     */
    private String generate(Map<String, Object> claims) {
        return toTokenString(TIMEOUT, claims);
    }

    private String toTokenString(Long timeOutMillis, Map<String, Object> claims) {
        Long expiration = Long.parseLong(claims.get(Consts.TOKEN_CREATE_TIME) + EMPTY) + timeOutMillis;

        try {
            return Jwts.builder()
                    .setClaims(claims)
                    .setSubject(claims.get(Consts.TOKEN_USER_NAME).toString())
                    .setExpiration(new Date(expiration))
                    .signWith(null != SignatureAlgorithm.valueOf(ALGORITHM) ?
                            SignatureAlgorithm.valueOf(ALGORITHM) :
                            SignatureAlgorithm.HS512, TOKEN_SECRET.getBytes("UTF-8"))
                    .compact();
        } catch (UnsupportedEncodingException ex) {
            log.warn(ex.getMessage());
            return Jwts.builder()
                    .setClaims(claims)
                    .setSubject(claims.get(Consts.TOKEN_USER_NAME).toString())
                    .setExpiration(new Date(expiration))
                    .signWith(null != SignatureAlgorithm.valueOf(ALGORITHM) ?
                            SignatureAlgorithm.valueOf(ALGORITHM) :
                            SignatureAlgorithm.HS512, TOKEN_SECRET)
                    .compact();
        }
    }

    /**
     * 解析 token 用户名
     *
     * @param token
     * @return
     */
    public String getUsername(String token) {
        String username = null;
        try {
            final Claims claims = getClaims(token);
            username = claims.get(Consts.TOKEN_USER_NAME).toString();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return username;
    }

    /**
     * 解析 token 密码
     *
     * @param token
     * @return
     */
    public String getPassword(String token) {
        String password = null;
        try {
            final Claims claims = getClaims(token);
            password = claims.get(Consts.TOKEN_USER_PASSWORD).toString();
        } catch (Exception e) {
            e.printStackTrace();
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
                    .parseClaimsJws(token.startsWith(Consts.TOKEN_PREFIX) ?
                            token.substring(token.indexOf(Consts.TOKEN_PREFIX) + Consts.TOKEN_PREFIX.length()).trim() :
                            token.trim())
                    .getBody();
        } catch (Exception e) {
            claims = Jwts.parser()
                    .setSigningKey(TOKEN_SECRET)
                    .parseClaimsJws(token.startsWith(Consts.TOKEN_PREFIX) ?
                            token.substring(token.indexOf(Consts.TOKEN_PREFIX) + Consts.TOKEN_PREFIX.length()).trim() :
                            token.trim())
                    .getBody();
        }
        return claims;
    }

    /**
     * 根据 TokenDetail 验证token
     *
     * @param token
     * @param tokenDetail
     * @return
     */
    public boolean validateToken(String token, TokenDetail tokenDetail) {
        TokenDetail user = (TokenDetail) tokenDetail;
        String username = getUsername(token);
        String password = getPassword(token);
        return (username.equals(user.getUsername()) && password.equals(user.getPassword()) && !(isExpired(token)));
    }

    /**
     * 根据 用户名、密码 验证 token
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
     * 解析 token 创建时间
     *
     * @param token
     * @return
     */
    private Date getCreatedDate(String token) {
        Date created = null;
        try {
            final Claims claims = getClaims(token);
            created = new Date((Long) claims.get(Consts.TOKEN_CREATE_TIME));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return created;
    }

    /**
     * 获取 token 超时时间
     *
     * @param token
     * @return
     */
    private Date getExpirationDate(String token) {
        Date expiration = null;
        try {
            final Claims claims = getClaims(token);
            expiration = claims.getExpiration();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return expiration;
    }

    /**
     * token 是否超时
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
