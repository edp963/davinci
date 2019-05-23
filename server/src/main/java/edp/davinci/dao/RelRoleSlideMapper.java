package edp.davinci.dao;

import edp.davinci.model.RelRoleSlide;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface RelRoleSlideMapper {

    int insert(RelRoleSlide relRoleSlide);

    int insertBatch(List<RelRoleSlide> list);

    @Delete("delete from rel_role_slide where slide_id = #{slideId}")
    int deleteBySlideId(Long slideId);

    @Select({
            "select rrs.slide_id",
            "from rel_role_slide rrs",
            "inner join rel_role_user rru on rru.role_id = rrs.role_id",
            "inner join display_slide s on s.id = rrs.slide_id",
            "inner join display d on d.id = s.display_id",
            "where rru.user_id = #{userId} and rrs.visible = 0 and d.project_id = #{projectId}"
    })
    List<Long> getDisableSlides(@Param("userId") Long userId, @Param("projectId") Long projectId);

    @Select({
            "select role_id from rel_role_slide where slide_id = #{slideId} and visible = 0"
    })
    List<Long> getById(Long slideId);

    @Select({
            "select rrs.slide_id",
            "from rel_role_slide rrs",
            "inner join display_slide s on s.id = rrs.slide_id",
            "INNER JOIN display d on d.id = s.display_id",
            "where rrs.role_id = #{id} and rrs.visible = 0 and d.project_id = #{projectId}"
    })
    List<Long> getExecludeSlides(@Param("id") Long id, @Param("projectId") Long projectId);

    @Delete({"delete from rel_role_slide where slide_id = #{slideId} and role_id = #{roleId}"})
    int delete(@Param("slideId") Long slideId, @Param("roleId") Long roleId);

    @Delete({"delete from rel_role_slide where role_id = #{roleId}"})
    int deleteByRoleId(Long roleId);
}