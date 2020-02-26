package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.RelUserOrganization;
import edp.davinci.core.dao.entity.RelUserOrganizationExample;
import java.util.List;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.DeleteProvider;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.InsertProvider;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.SelectProvider;
import org.apache.ibatis.annotations.Update;
import org.apache.ibatis.annotations.UpdateProvider;
import org.apache.ibatis.type.JdbcType;

@Mapper
public interface RelUserOrganizationMapper {
    @SelectProvider(type=RelUserOrganizationSqlProvider.class, method="countByExample")
    long countByExample(RelUserOrganizationExample example);

    @DeleteProvider(type=RelUserOrganizationSqlProvider.class, method="deleteByExample")
    int deleteByExample(RelUserOrganizationExample example);

    @Delete({
        "delete from rel_user_organization",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(Long id);

    @Insert({
        "insert into rel_user_organization (id, org_id, ",
        "user_id, `role`)",
        "values (#{id,jdbcType=BIGINT}, #{orgId,jdbcType=BIGINT}, ",
        "#{userId,jdbcType=BIGINT}, #{role,jdbcType=SMALLINT})"
    })
    int insert(RelUserOrganization record);

    @InsertProvider(type=RelUserOrganizationSqlProvider.class, method="insertSelective")
    int insertSelective(RelUserOrganization record);

    @SelectProvider(type=RelUserOrganizationSqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="org_id", property="orgId", jdbcType=JdbcType.BIGINT),
        @Result(column="user_id", property="userId", jdbcType=JdbcType.BIGINT),
        @Result(column="role", property="role", jdbcType=JdbcType.SMALLINT)
    })
    List<RelUserOrganization> selectByExample(RelUserOrganizationExample example);

    @Select({
        "select",
        "id, org_id, user_id, `role`",
        "from rel_user_organization",
        "where id = #{id,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="org_id", property="orgId", jdbcType=JdbcType.BIGINT),
        @Result(column="user_id", property="userId", jdbcType=JdbcType.BIGINT),
        @Result(column="role", property="role", jdbcType=JdbcType.SMALLINT)
    })
    RelUserOrganization selectByPrimaryKey(Long id);

    @UpdateProvider(type=RelUserOrganizationSqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") RelUserOrganization record, @Param("example") RelUserOrganizationExample example);

    @UpdateProvider(type=RelUserOrganizationSqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") RelUserOrganization record, @Param("example") RelUserOrganizationExample example);

    @UpdateProvider(type=RelUserOrganizationSqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(RelUserOrganization record);

    @Update({
        "update rel_user_organization",
        "set org_id = #{orgId,jdbcType=BIGINT},",
          "user_id = #{userId,jdbcType=BIGINT},",
          "`role` = #{role,jdbcType=SMALLINT}",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(RelUserOrganization record);
}