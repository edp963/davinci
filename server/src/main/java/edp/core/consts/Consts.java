package edp.core.consts;

public class Consts {
    /**
     * 当前用户
     */
    public static final String CURRENT_USER = "CURRENT_USER";

    /**
     * Token 前缀
     */
    public static final String TOKEN_PREFIX = "Bearer";

    /**
     * Token header名称
     */
    public static final String TOKEN_HEADER_STRING = "Authorization";

    /**
     * Token 用户名
     */
    public static final String TOKEN_USER_NAME = "token_user_name";

    /**
     * Token 密码
     */
    public static final String TOKEN_USER_PASSWORD = "token_user_password";

    /**
     * Token 创建时间
     */
    public static final String TOKEN_CREATE_TIME = "token_create_time";

    /**
     * 常用图片格式
     */
    public static final String REG_IMG_FORMAT = "^.+(.JPEG|.jpeg|.JPG|.jpg|.PNG|.png|.GIF|.gif)$";

    /**
     * 邮箱格式
     */
    public static final String REG_EMAIL_FORMAT = "^[a-z_0-9.-]{1,64}@([a-z0-9-]{1,200}.){1,5}[a-z]{1,6}$";

    /**
     * 敏感sql操作
     */
    public static final String REG_SENSITIVE_SQL = "drop\\s|alert\\s|grant\\s|delete\\s|update\\s|remove\\s";


    /**
     * 匹配多行sql注解正则
     */
    public static final String REG_SQL_ANNOTATE = "(?ms)('(?:''|[^'])*')|--.*?$|/\\*.*?\\*/";

}
