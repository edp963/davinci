package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.RelRoleProject;
import edp.davinci.core.dao.entity.RelRoleProjectExample.Criteria;
import edp.davinci.core.dao.entity.RelRoleProjectExample.Criterion;
import edp.davinci.core.dao.entity.RelRoleProjectExample;
import java.util.List;
import java.util.Map;
import org.apache.ibatis.jdbc.SQL;

public class RelRoleProjectSqlProvider {

    public String countByExample(RelRoleProjectExample example) {
        SQL sql = new SQL();
        sql.SELECT("count(*)").FROM("rel_role_project");
        applyWhere(sql, example, false);
        return sql.toString();
    }

    public String deleteByExample(RelRoleProjectExample example) {
        SQL sql = new SQL();
        sql.DELETE_FROM("rel_role_project");
        applyWhere(sql, example, false);
        return sql.toString();
    }

    public String insertSelective(RelRoleProject record) {
        SQL sql = new SQL();
        sql.INSERT_INTO("rel_role_project");
        
        if (record.getId() != null) {
            sql.VALUES("id", "#{id,jdbcType=BIGINT}");
        }
        
        if (record.getProjectId() != null) {
            sql.VALUES("project_id", "#{projectId,jdbcType=BIGINT}");
        }
        
        if (record.getRoleId() != null) {
            sql.VALUES("role_id", "#{roleId,jdbcType=BIGINT}");
        }
        
        if (record.getSourcePermission() != null) {
            sql.VALUES("source_permission", "#{sourcePermission,jdbcType=SMALLINT}");
        }
        
        if (record.getViewPermission() != null) {
            sql.VALUES("view_permission", "#{viewPermission,jdbcType=SMALLINT}");
        }
        
        if (record.getWidgetPermission() != null) {
            sql.VALUES("widget_permission", "#{widgetPermission,jdbcType=SMALLINT}");
        }
        
        if (record.getVizPermission() != null) {
            sql.VALUES("viz_permission", "#{vizPermission,jdbcType=SMALLINT}");
        }
        
        if (record.getSchedulePermission() != null) {
            sql.VALUES("schedule_permission", "#{schedulePermission,jdbcType=SMALLINT}");
        }
        
        if (record.getSharePermission() != null) {
            sql.VALUES("share_permission", "#{sharePermission,jdbcType=BIT}");
        }
        
        if (record.getDownloadPermission() != null) {
            sql.VALUES("download_permission", "#{downloadPermission,jdbcType=BIT}");
        }
        
        if (record.getCreateBy() != null) {
            sql.VALUES("create_by", "#{createBy,jdbcType=BIGINT}");
        }
        
        if (record.getCreateTime() != null) {
            sql.VALUES("create_time", "#{createTime,jdbcType=TIMESTAMP}");
        }
        
        if (record.getUpdateBy() != null) {
            sql.VALUES("update_by", "#{updateBy,jdbcType=BIGINT}");
        }
        
        if (record.getUpdateTime() != null) {
            sql.VALUES("update_time", "#{updateTime,jdbcType=TIMESTAMP}");
        }
        
        return sql.toString();
    }

    public String selectByExample(RelRoleProjectExample example) {
        SQL sql = new SQL();
        if (example != null && example.isDistinct()) {
            sql.SELECT_DISTINCT("id");
        } else {
            sql.SELECT("id");
        }
        sql.SELECT("project_id");
        sql.SELECT("role_id");
        sql.SELECT("source_permission");
        sql.SELECT("view_permission");
        sql.SELECT("widget_permission");
        sql.SELECT("viz_permission");
        sql.SELECT("schedule_permission");
        sql.SELECT("share_permission");
        sql.SELECT("download_permission");
        sql.SELECT("create_by");
        sql.SELECT("create_time");
        sql.SELECT("update_by");
        sql.SELECT("update_time");
        sql.FROM("rel_role_project");
        applyWhere(sql, example, false);
        
        if (example != null && example.getOrderByClause() != null) {
            sql.ORDER_BY(example.getOrderByClause());
        }
        
        return sql.toString();
    }

    public String updateByExampleSelective(Map<String, Object> parameter) {
        RelRoleProject record = (RelRoleProject) parameter.get("record");
        RelRoleProjectExample example = (RelRoleProjectExample) parameter.get("example");
        
        SQL sql = new SQL();
        sql.UPDATE("rel_role_project");
        
        if (record.getId() != null) {
            sql.SET("id = #{record.id,jdbcType=BIGINT}");
        }
        
        if (record.getProjectId() != null) {
            sql.SET("project_id = #{record.projectId,jdbcType=BIGINT}");
        }
        
        if (record.getRoleId() != null) {
            sql.SET("role_id = #{record.roleId,jdbcType=BIGINT}");
        }
        
        if (record.getSourcePermission() != null) {
            sql.SET("source_permission = #{record.sourcePermission,jdbcType=SMALLINT}");
        }
        
        if (record.getViewPermission() != null) {
            sql.SET("view_permission = #{record.viewPermission,jdbcType=SMALLINT}");
        }
        
        if (record.getWidgetPermission() != null) {
            sql.SET("widget_permission = #{record.widgetPermission,jdbcType=SMALLINT}");
        }
        
        if (record.getVizPermission() != null) {
            sql.SET("viz_permission = #{record.vizPermission,jdbcType=SMALLINT}");
        }
        
        if (record.getSchedulePermission() != null) {
            sql.SET("schedule_permission = #{record.schedulePermission,jdbcType=SMALLINT}");
        }
        
        if (record.getSharePermission() != null) {
            sql.SET("share_permission = #{record.sharePermission,jdbcType=BIT}");
        }
        
        if (record.getDownloadPermission() != null) {
            sql.SET("download_permission = #{record.downloadPermission,jdbcType=BIT}");
        }
        
        if (record.getCreateBy() != null) {
            sql.SET("create_by = #{record.createBy,jdbcType=BIGINT}");
        }
        
        if (record.getCreateTime() != null) {
            sql.SET("create_time = #{record.createTime,jdbcType=TIMESTAMP}");
        }
        
        if (record.getUpdateBy() != null) {
            sql.SET("update_by = #{record.updateBy,jdbcType=BIGINT}");
        }
        
        if (record.getUpdateTime() != null) {
            sql.SET("update_time = #{record.updateTime,jdbcType=TIMESTAMP}");
        }
        
        applyWhere(sql, example, true);
        return sql.toString();
    }

    public String updateByExample(Map<String, Object> parameter) {
        SQL sql = new SQL();
        sql.UPDATE("rel_role_project");
        
        sql.SET("id = #{record.id,jdbcType=BIGINT}");
        sql.SET("project_id = #{record.projectId,jdbcType=BIGINT}");
        sql.SET("role_id = #{record.roleId,jdbcType=BIGINT}");
        sql.SET("source_permission = #{record.sourcePermission,jdbcType=SMALLINT}");
        sql.SET("view_permission = #{record.viewPermission,jdbcType=SMALLINT}");
        sql.SET("widget_permission = #{record.widgetPermission,jdbcType=SMALLINT}");
        sql.SET("viz_permission = #{record.vizPermission,jdbcType=SMALLINT}");
        sql.SET("schedule_permission = #{record.schedulePermission,jdbcType=SMALLINT}");
        sql.SET("share_permission = #{record.sharePermission,jdbcType=BIT}");
        sql.SET("download_permission = #{record.downloadPermission,jdbcType=BIT}");
        sql.SET("create_by = #{record.createBy,jdbcType=BIGINT}");
        sql.SET("create_time = #{record.createTime,jdbcType=TIMESTAMP}");
        sql.SET("update_by = #{record.updateBy,jdbcType=BIGINT}");
        sql.SET("update_time = #{record.updateTime,jdbcType=TIMESTAMP}");
        
        RelRoleProjectExample example = (RelRoleProjectExample) parameter.get("example");
        applyWhere(sql, example, true);
        return sql.toString();
    }

    public String updateByPrimaryKeySelective(RelRoleProject record) {
        SQL sql = new SQL();
        sql.UPDATE("rel_role_project");
        
        if (record.getProjectId() != null) {
            sql.SET("project_id = #{projectId,jdbcType=BIGINT}");
        }
        
        if (record.getRoleId() != null) {
            sql.SET("role_id = #{roleId,jdbcType=BIGINT}");
        }
        
        if (record.getSourcePermission() != null) {
            sql.SET("source_permission = #{sourcePermission,jdbcType=SMALLINT}");
        }
        
        if (record.getViewPermission() != null) {
            sql.SET("view_permission = #{viewPermission,jdbcType=SMALLINT}");
        }
        
        if (record.getWidgetPermission() != null) {
            sql.SET("widget_permission = #{widgetPermission,jdbcType=SMALLINT}");
        }
        
        if (record.getVizPermission() != null) {
            sql.SET("viz_permission = #{vizPermission,jdbcType=SMALLINT}");
        }
        
        if (record.getSchedulePermission() != null) {
            sql.SET("schedule_permission = #{schedulePermission,jdbcType=SMALLINT}");
        }
        
        if (record.getSharePermission() != null) {
            sql.SET("share_permission = #{sharePermission,jdbcType=BIT}");
        }
        
        if (record.getDownloadPermission() != null) {
            sql.SET("download_permission = #{downloadPermission,jdbcType=BIT}");
        }
        
        if (record.getCreateBy() != null) {
            sql.SET("create_by = #{createBy,jdbcType=BIGINT}");
        }
        
        if (record.getCreateTime() != null) {
            sql.SET("create_time = #{createTime,jdbcType=TIMESTAMP}");
        }
        
        if (record.getUpdateBy() != null) {
            sql.SET("update_by = #{updateBy,jdbcType=BIGINT}");
        }
        
        if (record.getUpdateTime() != null) {
            sql.SET("update_time = #{updateTime,jdbcType=TIMESTAMP}");
        }
        
        sql.WHERE("id = #{id,jdbcType=BIGINT}");
        
        return sql.toString();
    }

    protected void applyWhere(SQL sql, RelRoleProjectExample example, boolean includeExamplePhrase) {
        if (example == null) {
            return;
        }
        
        String parmPhrase1;
        String parmPhrase1_th;
        String parmPhrase2;
        String parmPhrase2_th;
        String parmPhrase3;
        String parmPhrase3_th;
        if (includeExamplePhrase) {
            parmPhrase1 = "%s #{example.oredCriteria[%d].allCriteria[%d].value}";
            parmPhrase1_th = "%s #{example.oredCriteria[%d].allCriteria[%d].value,typeHandler=%s}";
            parmPhrase2 = "%s #{example.oredCriteria[%d].allCriteria[%d].value} and #{example.oredCriteria[%d].criteria[%d].secondValue}";
            parmPhrase2_th = "%s #{example.oredCriteria[%d].allCriteria[%d].value,typeHandler=%s} and #{example.oredCriteria[%d].criteria[%d].secondValue,typeHandler=%s}";
            parmPhrase3 = "#{example.oredCriteria[%d].allCriteria[%d].value[%d]}";
            parmPhrase3_th = "#{example.oredCriteria[%d].allCriteria[%d].value[%d],typeHandler=%s}";
        } else {
            parmPhrase1 = "%s #{oredCriteria[%d].allCriteria[%d].value}";
            parmPhrase1_th = "%s #{oredCriteria[%d].allCriteria[%d].value,typeHandler=%s}";
            parmPhrase2 = "%s #{oredCriteria[%d].allCriteria[%d].value} and #{oredCriteria[%d].criteria[%d].secondValue}";
            parmPhrase2_th = "%s #{oredCriteria[%d].allCriteria[%d].value,typeHandler=%s} and #{oredCriteria[%d].criteria[%d].secondValue,typeHandler=%s}";
            parmPhrase3 = "#{oredCriteria[%d].allCriteria[%d].value[%d]}";
            parmPhrase3_th = "#{oredCriteria[%d].allCriteria[%d].value[%d],typeHandler=%s}";
        }
        
        StringBuilder sb = new StringBuilder();
        List<Criteria> oredCriteria = example.getOredCriteria();
        boolean firstCriteria = true;
        for (int i = 0; i < oredCriteria.size(); i++) {
            Criteria criteria = oredCriteria.get(i);
            if (criteria.isValid()) {
                if (firstCriteria) {
                    firstCriteria = false;
                } else {
                    sb.append(" or ");
                }
                
                sb.append('(');
                List<Criterion> criterions = criteria.getAllCriteria();
                boolean firstCriterion = true;
                for (int j = 0; j < criterions.size(); j++) {
                    Criterion criterion = criterions.get(j);
                    if (firstCriterion) {
                        firstCriterion = false;
                    } else {
                        sb.append(" and ");
                    }
                    
                    if (criterion.isNoValue()) {
                        sb.append(criterion.getCondition());
                    } else if (criterion.isSingleValue()) {
                        if (criterion.getTypeHandler() == null) {
                            sb.append(String.format(parmPhrase1, criterion.getCondition(), i, j));
                        } else {
                            sb.append(String.format(parmPhrase1_th, criterion.getCondition(), i, j,criterion.getTypeHandler()));
                        }
                    } else if (criterion.isBetweenValue()) {
                        if (criterion.getTypeHandler() == null) {
                            sb.append(String.format(parmPhrase2, criterion.getCondition(), i, j, i, j));
                        } else {
                            sb.append(String.format(parmPhrase2_th, criterion.getCondition(), i, j, criterion.getTypeHandler(), i, j, criterion.getTypeHandler()));
                        }
                    } else if (criterion.isListValue()) {
                        sb.append(criterion.getCondition());
                        sb.append(" (");
                        List<?> listItems = (List<?>) criterion.getValue();
                        boolean comma = false;
                        for (int k = 0; k < listItems.size(); k++) {
                            if (comma) {
                                sb.append(", ");
                            } else {
                                comma = true;
                            }
                            if (criterion.getTypeHandler() == null) {
                                sb.append(String.format(parmPhrase3, i, j, k));
                            } else {
                                sb.append(String.format(parmPhrase3_th, i, j, k, criterion.getTypeHandler()));
                            }
                        }
                        sb.append(')');
                    }
                }
                sb.append(')');
            }
        }
        
        if (sb.length() > 0) {
            sql.WHERE(sb.toString());
        }
    }
}