package edp.davinci.dao;

import edp.davinci.dto.roleDto.RelRoleMember;
import edp.davinci.model.RelRoleUser;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface RelRoleUserMapper {
    int insert(RelRoleUser relRoleUser);

    int insertBatch(@Param("relRoleUsers") List<RelRoleUser> relRoleUsers);

    @Delete({
            "delete from rel_role_user where id = #{id,jdbcType=BIGINT}"
    })
    int deleteById(Long id);


    @Delete({
            "delete from rel_role_user where role_id = #{roleId,jdbcType=BIGINT}"
    })
    int deleteByRoleId(Long roleId);


    @Select({
            "select",
            "id, user_id, role_id, create_by, create_time, update_by, update_time",
            "from rel_role_user",
            "where id = #{id,jdbcType=BIGINT}"
    })
    RelRoleUser getById(Long id);


    List<RelRoleUser> getByIds(List<Long> ids);


    @Select({
            "SELECT rru.id, u.id as 'user.id', IFNULL(u.`name`, u.username) as 'user.username', u.avatar",
            "FROM rel_role_user rru LEFT JOIN `user` u on u.id = rru.user_id",
            "WHERE rru.role_id = #{id}",
    })
    List<RelRoleMember> getMembersByRoleId(Long id);

    List<Long> getUserIdsByIdAndMembers(@Param("roleId") Long roleId, @Param("userList") List<Long> userList);

    @Select({
            "select user_id from rel_role_user where role_id = #{roleId}"
    })
    List<Long> getUserIdsByRoleId(Long roleId);

    int deleteByRoleIdAndMemberIds(@Param("roleId") Long roleId, @Param("userIds") List<Long> userIds);
}