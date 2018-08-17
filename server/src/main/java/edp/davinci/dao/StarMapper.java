package edp.davinci.dao;

import edp.davinci.dto.projectDto.ProjectWithCreateBy;
import edp.davinci.dto.starDto.StarUser;
import edp.davinci.model.Project;
import edp.davinci.model.Star;
import org.apache.ibatis.annotations.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface StarMapper {

    int insert(Star star);

    @Delete({
        "delete from star",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int deleteById(Long id);

    @Delete({
            "delete from star",
            "where target = #{target} and  target_id = #{targetId} and user_id = #{userId}"
    })
    int delete(@Param("userId") Long userId, @Param("targetId") Long targetId, @Param("target") String target);


    @Select({
            "select * from star",
            "where target = #{target} and target_id = #{targetId} and user_id = #{userId}"
    })
    Star select(@Param("userId") Long userId, @Param("targetId") Long targetId, @Param("target") String target);


    @Select({
            "select p.*, u.id as 'createBy.id', u.username as 'createBy.username', u.avatar as 'createBy.avatar'  from project p left join user u on u.id = p.user_id ",
            "where p.id in (select target_id from star where target = #{target} and user_id = #{userId})"
    })
    List<ProjectWithCreateBy> getStarProjectListByUser(@Param("userId") Long userId, @Param("target") String target);


    @Select({
            "select u.id, u.username, u.avatar, s.starTime from star s left join user u on u.id = s.user_id",
            "where s.target = #{target} and s.target_id = #{targetId}"
    })
    List<StarUser> getStarUserListByTarget(@Param("targetId") Long targetId, @Param("target") String target);
}