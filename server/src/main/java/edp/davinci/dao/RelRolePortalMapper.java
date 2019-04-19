package edp.davinci.dao;

import edp.davinci.model.RelRolePortal;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

public interface RelRolePortalMapper {

    int insert(RelRolePortal record);


    int insertBatch(@Param("list") List<RelRolePortal> relRolePortals);
}