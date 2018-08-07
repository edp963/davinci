package edp.davinci.core.common;

import edp.core.consts.Consts;

/**
 * 常量
 */
public class Constants extends Consts {


    /**
     * api基本路径
     */
    public static final String BASE_API_PATH = "/api/v3";

    /**
     * 用户激活 / 重发激活邮件模板
     */
    public static final String USER_ACTIVATE_EMAIL_TEMPLATE = "mail/userActivateEmailTemplate";

    /**
     * 用户激活 / 重发激活邮件主题
     */
    public static final String USER_ACTIVATE_EMAIL_SUBJECT = "[Davinci] 用户激活";

    /**
     * 用户默认Organization描述
     */
    public static final String DEFAULT_ORGANIZATION_DES = "my default organization";

    /**
     * 用户头像上传地址
     */
    public static final String USER_AVATAR_PATH = "/image/user/";

    /**
     * 组织头像上传地址
     */
    public static final String ORG_AVATAR_PATH = "/image/organization/";


    /**
     * display封面图地址
     */
    public static final String DISPLAY_AVATAR_PATH = "/image/display/";


    /**
     * 组织头像上传地址
     */
    public static final String SOURCE_CSV_PATH = "/source/csv/";

    /**
     * 团队头像上传地址
     */
    public static final String TEAM_AVATAR_PATH = "/image/organization/";

    /**
     * 邀请组织成员邮件主题
     * inviter username
     * organization
     */
    public static final String INVITE_ORG_MEMBER_MAIL_SUBJECT = "[Davinci] %s has invited you to join the %s organization";

    /**
     * 邀请组织成员邮件模板
     */
    public static final String INVITE_ORG_MEMBER_MAIL_TEMPLATE = "mail/inviteOrgMemberTemplate";

    /**
     * 分割符号
     */
    public static final String SPLIT_CHAR_STRING = ":-:";

    /**
     * sql ST模板
     */
    public static final String SQL_TEMPLATE = "templates/sql/sqlTemplate.stg";


    /**
     * 定时任务发送邮件模板
     */
    public static final String SCHEDULE_MAIL_TEMPLATE = "mail/scheduleEmaiTemplate";
}
