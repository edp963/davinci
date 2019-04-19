package edp.davinci.dao;

import edp.davinci.model.RelRoleDisplay;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

public interface RelRoleDisplayMapper {
    int insert(RelRoleDisplay record);
}