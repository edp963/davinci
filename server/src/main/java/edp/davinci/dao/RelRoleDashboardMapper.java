package edp.davinci.dao;

import edp.davinci.model.RelRoleDashboard;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

public interface RelRoleDashboardMapper {

    int insert(RelRoleDashboard relRoleDashboard);

}