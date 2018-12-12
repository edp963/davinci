package edp.davinci.dao;

import edp.davinci.model.Platform;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Component;

@Component
public interface PlatformMapper {

    @Select("select * from platform where code = #{code}")
    Platform getPlatformByCode(@Param("code") String code);
}