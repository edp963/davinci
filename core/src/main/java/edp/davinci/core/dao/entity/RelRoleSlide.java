package edp.davinci.core.dao.entity;

import java.util.Date;
import lombok.Data;

@Data
public class RelRoleSlide {
    private Long roleId;

    private Long slideId;

    private Boolean visible;

    private Long createBy;

    private Date createTime;

    private Long updateBy;

    private Date updateTime;

	public RelRoleSlide(Long slideId, Long roleId) {
		this.roleId = roleId;
		this.slideId = slideId;
	}

	public RelRoleSlide() {
	}
}