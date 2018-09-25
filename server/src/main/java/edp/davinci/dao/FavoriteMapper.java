package edp.davinci.dao;

import edp.davinci.model.Favorite;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface FavoriteMapper {

    int insert(Favorite favorite);

    @Delete({"delete from favorite where id = #{id,jdbcType=BIGINT}"})
    int deleteById(Long id);

    @Delete({"delete from favorite where id = #{id,jdbcType=BIGINT}"})
    int delete(@Param("userId") Long userId, @Param("projectId") Long projectId);

    @Select({
            "select",
            "id, user_id, project_id, create_time",
            "from favorite",
            "where id = #{id,jdbcType=BIGINT}"
    })
    Favorite selectById(Long id);


    int deleteBatch(@Param("list") List<Long> list, @Param("userId") Long userId);
}