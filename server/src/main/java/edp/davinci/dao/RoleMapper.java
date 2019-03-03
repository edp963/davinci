package edp.davinci.dao;

import edp.davinci.dto.roleDto.RoleWithOrganization;
import edp.davinci.model.Role;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

public interface RoleMapper {
    int insert(Role record);

    @Delete({
            "delete from role where id = #{id,jdbcType=BIGINT}"
    })
    int deleteById(Long id);

    @Select({
            "select * from role where id = #{id,jdbcType=BIGINT}"
    })
    Role getById(Long id);


    @Select({
            "select r.*,  ",
            "    o.`id` AS 'organization.id',",
            "    o.`name` AS 'organization.name',",
            "    o.`description` AS 'organization.description',",
            "    o.`avatar` AS 'organization.avatar',",
            "    o.`user_id` AS 'organization.userId',",
            "    o.`project_num` AS 'organization.projectNum',",
            "    o.`member_num` AS 'organization.memberNum',",
            "    o.`team_num` AS 'organization.teamNum',",
            "    o.`allow_create_project` AS 'organization.allowCreateProject',",
            "    o.`member_permission` AS 'organization.memberPermission',",
            "    o.`create_time` AS 'organization.createTime',",
            "    o.`create_by` AS 'organization.createBy',",
            "    o.`update_time` AS 'organization.updateTime',",
            "    o.`update_by` AS 'organization.updateBy'",
            "from role r left join organization o on o.id = r.org_id",
            "where r.id = #{id,jdbcType=BIGINT}"
    })
    RoleWithOrganization getRoleWithOrganizationById(Long id);

    @Update({
            "update role",
            "set org_id = #{orgId,jdbcType=BIGINT},",
            "name = #{name,jdbcType=VARCHAR},",
            "description = #{description,jdbcType=VARCHAR},",
            "create_by = #{createBy,jdbcType=BIGINT},",
            "create_time = #{createTime,jdbcType=TIMESTAMP},",
            "update_by = #{updateBy,jdbcType=BIGINT},",
            "update_time = #{updateTime,jdbcType=TIMESTAMP}",
            "where id = #{id,jdbcType=BIGINT}"
    })
    int update(Role record);
}