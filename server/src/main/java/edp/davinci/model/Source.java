package edp.davinci.model;


import com.alibaba.fastjson.JSONObject;
import edp.core.model.BaseSource;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Data
public class Source extends BaseSource {
    private Long id;

    private String name;

    private String description;

    private String type;

    private Long projectId;

    private String config;

    /**
     * 从config中获取jdbcUrl
     *
     * json key： url
     * @return
     */
    @Override
    public String getJdbcUrl() {
        String url = null;
        if (null == config) {
            return null;
        }
        try {
            JSONObject jsonObject = JSONObject.parseObject(this.config);
            url = jsonObject.getString("url");
        } catch (Exception e) {
            log.error("get jdbc url from source config, {}", e.getMessage());
        }
        return url;
    }

    /**
     * 从config中获取jdbc username
     *
     * json key: user
     * @return
     */
    @Override
    public String getUsername() {
        String username = null;
        if (null == config) {
            return null;
        }
        try {
            JSONObject jsonObject = JSONObject.parseObject(this.config);
            username = jsonObject.getString("username");
        } catch (Exception e) {
            log.error("get jdbc user from source config, {}", e.getMessage());
        }
        return username;
    }

    /**
     * 从config中获取 jdbc password
     *
     * json key: password
     * @return
     */
    @Override
    public String getPassword() {
        String password = null;
        if (null == config) {
            return null;
        }
        try {
            JSONObject jsonObject = JSONObject.parseObject(this.config);
            password = jsonObject.getString("password");
        } catch (Exception e) {
            log.error("get jdbc password from source config, {}", e.getMessage());
        }
        return password;
    }

    private String getConcigParams() {
        String params = null;
        if (null == config) {
            return null;
        }
        try {
            JSONObject jsonObject = JSONObject.parseObject(this.config);
            params = jsonObject.getString("parameters");
        } catch (Exception e) {
            log.error("get jdbc parameters from source config, {}", e.getMessage());
        }
        return params;
    }
}