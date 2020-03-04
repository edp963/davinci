package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.Favorite;
import edp.davinci.core.dao.entity.FavoriteExample;
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
public interface FavoriteMapper {
    @SelectProvider(type=FavoriteSqlProvider.class, method="countByExample")
    long countByExample(FavoriteExample example);

    @DeleteProvider(type=FavoriteSqlProvider.class, method="deleteByExample")
    int deleteByExample(FavoriteExample example);

    @Delete({
        "delete from favorite",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(Long id);

    @Insert({
        "insert into favorite (id, user_id, ",
        "project_id, create_time)",
        "values (#{id,jdbcType=BIGINT}, #{userId,jdbcType=BIGINT}, ",
        "#{projectId,jdbcType=BIGINT}, #{createTime,jdbcType=TIMESTAMP})"
    })
    int insert(Favorite record);

    @InsertProvider(type=FavoriteSqlProvider.class, method="insertSelective")
    int insertSelective(Favorite record);

    @SelectProvider(type=FavoriteSqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="user_id", property="userId", jdbcType=JdbcType.BIGINT),
        @Result(column="project_id", property="projectId", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP)
    })
    List<Favorite> selectByExample(FavoriteExample example);

    @Select({
        "select",
        "id, user_id, project_id, create_time",
        "from favorite",
        "where id = #{id,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="user_id", property="userId", jdbcType=JdbcType.BIGINT),
        @Result(column="project_id", property="projectId", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP)
    })
    Favorite selectByPrimaryKey(Long id);

    @UpdateProvider(type=FavoriteSqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") Favorite record, @Param("example") FavoriteExample example);

    @UpdateProvider(type=FavoriteSqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") Favorite record, @Param("example") FavoriteExample example);

    @UpdateProvider(type=FavoriteSqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(Favorite record);

    @Update({
        "update favorite",
        "set user_id = #{userId,jdbcType=BIGINT},",
          "project_id = #{projectId,jdbcType=BIGINT},",
          "create_time = #{createTime,jdbcType=TIMESTAMP}",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(Favorite record);
}