package edp.davinci.dao;

import edp.davinci.dto.displayDto.DisplayWithProject;
import edp.davinci.model.Display;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface DisplayMapper {

    int insert(Display display);

    @Delete({"delete from display where id = #{id}"})
    int deleteById(@Param("id") Long id);

    @Delete({"delete from display where project_id = #{projectId}"})
    int deleteByProject(@Param("projectId") Long projectId);



    @Select({"select * from display where id = #{id}"})
    Display getById(@Param("id") Long id);


    @Update({
            "update display",
            "set `name` = #{name,jdbcType=VARCHAR},",
            "description = #{description,jdbcType=VARCHAR},",
            "project_id = #{projectId,jdbcType=BIGINT},",
            "avatar = #{avatar,jdbcType=VARCHAR},",
            "publish = #{publish,jdbcType=BIT}",
            "where id = #{id,jdbcType=INTEGER}"
    })
    int update(Display display);


    @Select({
            "SELECT ",
            "	d.*,",
            "	p.id 'project.id',",
            "	p.`name` 'project.name',",
            "	p.description 'project.description',",
            "	p.pic 'project.pic',",
            "	p.org_id 'project.orgId',",
            "	p.user_id 'project.userId',",
            "	p.visibility 'p.visibility'",
            "FROM",
            "	display d ",
            "	LEFT JOIN project p on d.project_id = p.id",
            "WHERE d.id = #{id}",
    })
    DisplayWithProject getDisplayWithProjectById(@Param("id") Long id);

    @Select({"select * from display where project_id = #{projectId}"})
    List<Display> getByProject(@Param("projectId") Long projectId);

    @Select({"select id from display where project_id = #{projectId} and `name` = #{name}"})
    Long getByNameWithProjectId(@Param("name") String name, @Param("projectId") Long projectId);
}