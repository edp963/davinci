package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.DavinciStatisticVisitorOperation;
import edp.davinci.core.dao.entity.DavinciStatisticVisitorOperationExample;
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
public interface DavinciStatisticVisitorOperationMapper {
    @SelectProvider(type=DavinciStatisticVisitorOperationSqlProvider.class, method="countByExample")
    long countByExample(DavinciStatisticVisitorOperationExample example);

    @DeleteProvider(type=DavinciStatisticVisitorOperationSqlProvider.class, method="deleteByExample")
    int deleteByExample(DavinciStatisticVisitorOperationExample example);

    @Delete({
        "delete from davinci_statistic_visitor_operation",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(Long id);

    @Insert({
        "insert into davinci_statistic_visitor_operation (id, user_id, ",
        "email, `action`, org_id, ",
        "project_id, project_name, ",
        "viz_type, viz_id, viz_name, ",
        "sub_viz_id, sub_viz_name, ",
        "widget_id, widget_name, ",
        "`variables`, filters, ",
        "groups, create_time)",
        "values (#{id,jdbcType=BIGINT}, #{userId,jdbcType=BIGINT}, ",
        "#{email,jdbcType=VARCHAR}, #{action,jdbcType=VARCHAR}, #{orgId,jdbcType=BIGINT}, ",
        "#{projectId,jdbcType=BIGINT}, #{projectName,jdbcType=VARCHAR}, ",
        "#{vizType,jdbcType=VARCHAR}, #{vizId,jdbcType=BIGINT}, #{vizName,jdbcType=VARCHAR}, ",
        "#{subVizId,jdbcType=BIGINT}, #{subVizName,jdbcType=VARCHAR}, ",
        "#{widgetId,jdbcType=BIGINT}, #{widgetName,jdbcType=VARCHAR}, ",
        "#{variables,jdbcType=VARCHAR}, #{filters,jdbcType=VARCHAR}, ",
        "#{groups,jdbcType=VARCHAR}, #{createTime,jdbcType=TIMESTAMP})"
    })
    int insert(DavinciStatisticVisitorOperation record);

    @InsertProvider(type=DavinciStatisticVisitorOperationSqlProvider.class, method="insertSelective")
    int insertSelective(DavinciStatisticVisitorOperation record);

    @SelectProvider(type=DavinciStatisticVisitorOperationSqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="user_id", property="userId", jdbcType=JdbcType.BIGINT),
        @Result(column="email", property="email", jdbcType=JdbcType.VARCHAR),
        @Result(column="action", property="action", jdbcType=JdbcType.VARCHAR),
        @Result(column="org_id", property="orgId", jdbcType=JdbcType.BIGINT),
        @Result(column="project_id", property="projectId", jdbcType=JdbcType.BIGINT),
        @Result(column="project_name", property="projectName", jdbcType=JdbcType.VARCHAR),
        @Result(column="viz_type", property="vizType", jdbcType=JdbcType.VARCHAR),
        @Result(column="viz_id", property="vizId", jdbcType=JdbcType.BIGINT),
        @Result(column="viz_name", property="vizName", jdbcType=JdbcType.VARCHAR),
        @Result(column="sub_viz_id", property="subVizId", jdbcType=JdbcType.BIGINT),
        @Result(column="sub_viz_name", property="subVizName", jdbcType=JdbcType.VARCHAR),
        @Result(column="widget_id", property="widgetId", jdbcType=JdbcType.BIGINT),
        @Result(column="widget_name", property="widgetName", jdbcType=JdbcType.VARCHAR),
        @Result(column="variables", property="variables", jdbcType=JdbcType.VARCHAR),
        @Result(column="filters", property="filters", jdbcType=JdbcType.VARCHAR),
        @Result(column="groups", property="groups", jdbcType=JdbcType.VARCHAR),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP)
    })
    List<DavinciStatisticVisitorOperation> selectByExample(DavinciStatisticVisitorOperationExample example);

    @Select({
        "select",
        "id, user_id, email, `action`, org_id, project_id, project_name, viz_type, viz_id, ",
        "viz_name, sub_viz_id, sub_viz_name, widget_id, widget_name, `variables`, filters, ",
        "groups, create_time",
        "from davinci_statistic_visitor_operation",
        "where id = #{id,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="user_id", property="userId", jdbcType=JdbcType.BIGINT),
        @Result(column="email", property="email", jdbcType=JdbcType.VARCHAR),
        @Result(column="action", property="action", jdbcType=JdbcType.VARCHAR),
        @Result(column="org_id", property="orgId", jdbcType=JdbcType.BIGINT),
        @Result(column="project_id", property="projectId", jdbcType=JdbcType.BIGINT),
        @Result(column="project_name", property="projectName", jdbcType=JdbcType.VARCHAR),
        @Result(column="viz_type", property="vizType", jdbcType=JdbcType.VARCHAR),
        @Result(column="viz_id", property="vizId", jdbcType=JdbcType.BIGINT),
        @Result(column="viz_name", property="vizName", jdbcType=JdbcType.VARCHAR),
        @Result(column="sub_viz_id", property="subVizId", jdbcType=JdbcType.BIGINT),
        @Result(column="sub_viz_name", property="subVizName", jdbcType=JdbcType.VARCHAR),
        @Result(column="widget_id", property="widgetId", jdbcType=JdbcType.BIGINT),
        @Result(column="widget_name", property="widgetName", jdbcType=JdbcType.VARCHAR),
        @Result(column="variables", property="variables", jdbcType=JdbcType.VARCHAR),
        @Result(column="filters", property="filters", jdbcType=JdbcType.VARCHAR),
        @Result(column="groups", property="groups", jdbcType=JdbcType.VARCHAR),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP)
    })
    DavinciStatisticVisitorOperation selectByPrimaryKey(Long id);

    @UpdateProvider(type=DavinciStatisticVisitorOperationSqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") DavinciStatisticVisitorOperation record, @Param("example") DavinciStatisticVisitorOperationExample example);

    @UpdateProvider(type=DavinciStatisticVisitorOperationSqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") DavinciStatisticVisitorOperation record, @Param("example") DavinciStatisticVisitorOperationExample example);

    @UpdateProvider(type=DavinciStatisticVisitorOperationSqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(DavinciStatisticVisitorOperation record);

    @Update({
        "update davinci_statistic_visitor_operation",
        "set user_id = #{userId,jdbcType=BIGINT},",
          "email = #{email,jdbcType=VARCHAR},",
          "`action` = #{action,jdbcType=VARCHAR},",
          "org_id = #{orgId,jdbcType=BIGINT},",
          "project_id = #{projectId,jdbcType=BIGINT},",
          "project_name = #{projectName,jdbcType=VARCHAR},",
          "viz_type = #{vizType,jdbcType=VARCHAR},",
          "viz_id = #{vizId,jdbcType=BIGINT},",
          "viz_name = #{vizName,jdbcType=VARCHAR},",
          "sub_viz_id = #{subVizId,jdbcType=BIGINT},",
          "sub_viz_name = #{subVizName,jdbcType=VARCHAR},",
          "widget_id = #{widgetId,jdbcType=BIGINT},",
          "widget_name = #{widgetName,jdbcType=VARCHAR},",
          "`variables` = #{variables,jdbcType=VARCHAR},",
          "filters = #{filters,jdbcType=VARCHAR},",
          "groups = #{groups,jdbcType=VARCHAR},",
          "create_time = #{createTime,jdbcType=TIMESTAMP}",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(DavinciStatisticVisitorOperation record);
}