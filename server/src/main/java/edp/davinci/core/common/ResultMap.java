package edp.davinci.core.common;

import edp.core.enums.HttpCodeEnum;
import edp.core.utils.TokenUtils;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;

public class ResultMap extends HashMap<String, Object> {

    private HashMap<String, Object> header;

    private int code = HttpCodeEnum.OK.getCode();

    private TokenUtils tokenUtils;

    public ResultMap(TokenUtils tokenUtils) {
        this.tokenUtils = tokenUtils;
    }

    public ResultMap() {
    }

    public ResultMap success() {
        this.code = HttpCodeEnum.OK.getCode();
        this.header = new HashMap<>();
        this.header.put("code", this.code);
        this.header.put("msg", "Success");
        this.put("header", header);
        this.put("payload", "");
        return this;
    }

    public ResultMap success(String token) {
        this.code = HttpCodeEnum.OK.getCode();
        this.header = new HashMap<>();
        this.header.put("code", this.code);
        this.header.put("msg", "Success");
        this.header.put("token", token);
        this.put("header", header);
        this.put("payload", "");
        return this;
    }

    public ResultMap successAndRefreshToken(HttpServletRequest request) {
        String token = request.getHeader(Constants.TOKEN_HEADER_STRING);
        this.code = HttpCodeEnum.OK.getCode();
        this.header = new HashMap<>();
        this.header.put("code", this.code);
        this.header.put("msg", "Success");
        this.header.put("token", this.tokenUtils.refreshToken(token));
        this.put("header", header);
        this.put("payload", "");
        return this;
    }


    public ResultMap fail() {
        this.code = HttpCodeEnum.FAIL.getCode();
        this.header = new HashMap<>();
        this.header.put("code", code);
        this.put("header", header);
        this.put("payload", "");
        return this;
    }

    public ResultMap fail(int code) {
        this.code = code;
        this.header = new HashMap<>();
        this.header.put("code", code);
        this.put("header", header);
        this.put("payload", "");
        return this;
    }


    public ResultMap failWithToken(String token) {
        this.code = HttpCodeEnum.FAIL.getCode();
        this.header = new HashMap<>();
        this.header.put("code", code);
        this.header.put("msg", HttpCodeEnum.FAIL.getMessage());
        this.header.put("token", tokenUtils.refreshToken(token));
        this.put("header", header);
        this.put("payload", "");
        return this;
    }


    public ResultMap failAndRefreshToken(HttpServletRequest request) {
        String token = request.getHeader(Constants.TOKEN_HEADER_STRING);
        this.code = HttpCodeEnum.FAIL.getCode();
        this.header = new HashMap<>();
        this.header.put("code", code);
        this.header.put("msg", HttpCodeEnum.FAIL.getMessage());
        this.header.put("token", this.tokenUtils.refreshToken(token));
        this.put("header", header);
        this.put("payload", "");
        return this;
    }

    public ResultMap failAndRefreshToken(HttpServletRequest request, HttpCodeEnum httpCodeEnum) {
        String token = request.getHeader(Constants.TOKEN_HEADER_STRING);
        this.code = httpCodeEnum.getCode();
        this.header = new HashMap<>();
        this.header.put("code", code);
        this.header.put("msg", httpCodeEnum.getMessage());
        this.header.put("token", this.tokenUtils.refreshToken(token));
        this.put("header", header);
        this.put("payload", "");
        return this;
    }

    public ResultMap message(String message) {
        this.header.put("msg", message);
        this.put("header", header);
        this.put("payload", "");
        return this;
    }

    public ResultMap payload(Object object) {
        this.put("payload", null == object ? "" : object);
        return this;
    }

    public ResultMap payloads(Collection list) {
        this.put("payload", null == list ? new ArrayList() : list);
        return this;
    }

    public int getCode() {
        return code;
    }
}
