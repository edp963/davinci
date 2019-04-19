package edp.davinci.dao;

import edp.davinci.model.RelRoleSlide;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

public interface RelRoleSlideMapper {

    int insert(RelRoleSlide relRoleSlide);
}