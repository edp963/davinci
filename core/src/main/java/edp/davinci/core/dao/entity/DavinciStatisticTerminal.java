package edp.davinci.core.dao.entity;

import java.util.Date;
import lombok.Data;

@Data
public class DavinciStatisticTerminal {
    private Long id;

    private Long userId;

    private String email;

    private String browserName;

    private String browserVersion;

    private String engineName;

    private String engineVersion;

    private String osName;

    private String osVersion;

    private String deviceModel;

    private String deviceType;

    private String deviceVendor;

    private String cpuArchitecture;

    private Date createTime;
}