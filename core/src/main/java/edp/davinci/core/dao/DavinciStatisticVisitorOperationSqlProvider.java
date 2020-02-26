package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.DavinciStatisticVisitorOperation;
import edp.davinci.core.dao.entity.DavinciStatisticVisitorOperationExample.Criteria;
import edp.davinci.core.dao.entity.DavinciStatisticVisitorOperationExample.Criterion;
import edp.davinci.core.dao.entity.DavinciStatisticVisitorOperationExample;
import java.util.List;
import java.util.Map;
import org.apache.ibatis.jdbc.SQL;

public class DavinciStatisticVisitorOperationSqlProvider {

    public String countByExample(DavinciStatisticVisitorOperationExample example) {
        SQL sql = new SQL();
        sql.SELECT("count(*)").FROM("davinci_statistic_visitor_operation");
        applyWhere(sql, example, false);
        return sql.toString();
    }

    public String deleteByExample(DavinciStatisticVisitorOperationExample example) {
        SQL sql = new SQL();
        sql.DELETE_FROM("davinci_statistic_visitor_operation");
        applyWhere(sql, example, false);
        return sql.toString();
    }

    public String insertSelective(DavinciStatisticVisitorOperation record) {
        SQL sql = new SQL();
        sql.INSERT_INTO("davinci_statistic_visitor_operation");
        
        if (record.getId() != null) {
            sql.VALUES("id", "#{id,jdbcType=BIGINT}");
        }
        
        if (record.getUserId() != null) {
            sql.VALUES("user_id", "#{userId,jdbcType=BIGINT}");
        }
        
        if (record.getEmail() != null) {
            sql.VALUES("email", "#{email,jdbcType=VARCHAR}");
        }
        
        if (record.getAction() != null) {
            sql.VALUES("`action`", "#{action,jdbcType=VARCHAR}");
        }
        
        if (record.getOrgId() != null) {
            sql.VALUES("org_id", "#{orgId,jdbcType=BIGINT}");
        }
        
        if (record.getProjectId() != null) {
            sql.VALUES("project_id", "#{projectId,jdbcType=BIGINT}");
        }
        
        if (record.getProjectName() != null) {
            sql.VALUES("project_name", "#{projectName,jdbcType=VARCHAR}");
        }
        
        if (record.getVizType() != null) {
            sql.VALUES("viz_type", "#{vizType,jdbcType=VARCHAR}");
        }
        
        if (record.getVizId() != null) {
            sql.VALUES("viz_id", "#{vizId,jdbcType=BIGINT}");
        }
        
        if (record.getVizName() != null) {
            sql.VALUES("viz_name", "#{vizName,jdbcType=VARCHAR}");
        }
        
        if (record.getSubVizId() != null) {
            sql.VALUES("sub_viz_id", "#{subVizId,jdbcType=BIGINT}");
        }
        
        if (record.getSubVizName() != null) {
            sql.VALUES("sub_viz_name", "#{subVizName,jdbcType=VARCHAR}");
        }
        
        if (record.getWidgetId() != null) {
            sql.VALUES("widget_id", "#{widgetId,jdbcType=BIGINT}");
        }
        
        if (record.getWidgetName() != null) {
            sql.VALUES("widget_name", "#{widgetName,jdbcType=VARCHAR}");
        }
        
        if (record.getVariables() != null) {
            sql.VALUES("`variables`", "#{variables,jdbcType=VARCHAR}");
        }
        
        if (record.getFilters() != null) {
            sql.VALUES("filters", "#{filters,jdbcType=VARCHAR}");
        }
        
        if (record.getGroups() != null) {
            sql.VALUES("groups", "#{groups,jdbcType=VARCHAR}");
        }
        
        if (record.getCreateTime() != null) {
            sql.VALUES("create_time", "#{createTime,jdbcType=TIMESTAMP}");
        }
        
        return sql.toString();
    }

    public String selectByExample(DavinciStatisticVisitorOperationExample example) {
        SQL sql = new SQL();
        if (example != null && example.isDistinct()) {
            sql.SELECT_DISTINCT("id");
        } else {
            sql.SELECT("id");
        }
        sql.SELECT("user_id");
        sql.SELECT("email");
        sql.SELECT("`action`");
        sql.SELECT("org_id");
        sql.SELECT("project_id");
        sql.SELECT("project_name");
        sql.SELECT("viz_type");
        sql.SELECT("viz_id");
        sql.SELECT("viz_name");
        sql.SELECT("sub_viz_id");
        sql.SELECT("sub_viz_name");
        sql.SELECT("widget_id");
        sql.SELECT("widget_name");
        sql.SELECT("`variables`");
        sql.SELECT("filters");
        sql.SELECT("groups");
        sql.SELECT("create_time");
        sql.FROM("davinci_statistic_visitor_operation");
        applyWhere(sql, example, false);
        
        if (example != null && example.getOrderByClause() != null) {
            sql.ORDER_BY(example.getOrderByClause());
        }
        
        return sql.toString();
    }

    public String updateByExampleSelective(Map<String, Object> parameter) {
        DavinciStatisticVisitorOperation record = (DavinciStatisticVisitorOperation) parameter.get("record");
        DavinciStatisticVisitorOperationExample example = (DavinciStatisticVisitorOperationExample) parameter.get("example");
        
        SQL sql = new SQL();
        sql.UPDATE("davinci_statistic_visitor_operation");
        
        if (record.getId() != null) {
            sql.SET("id = #{record.id,jdbcType=BIGINT}");
        }
        
        if (record.getUserId() != null) {
            sql.SET("user_id = #{record.userId,jdbcType=BIGINT}");
        }
        
        if (record.getEmail() != null) {
            sql.SET("email = #{record.email,jdbcType=VARCHAR}");
        }
        
        if (record.getAction() != null) {
            sql.SET("`action` = #{record.action,jdbcType=VARCHAR}");
        }
        
        if (record.getOrgId() != null) {
            sql.SET("org_id = #{record.orgId,jdbcType=BIGINT}");
        }
        
        if (record.getProjectId() != null) {
            sql.SET("project_id = #{record.projectId,jdbcType=BIGINT}");
        }
        
        if (record.getProjectName() != null) {
            sql.SET("project_name = #{record.projectName,jdbcType=VARCHAR}");
        }
        
        if (record.getVizType() != null) {
            sql.SET("viz_type = #{record.vizType,jdbcType=VARCHAR}");
        }
        
        if (record.getVizId() != null) {
            sql.SET("viz_id = #{record.vizId,jdbcType=BIGINT}");
        }
        
        if (record.getVizName() != null) {
            sql.SET("viz_name = #{record.vizName,jdbcType=VARCHAR}");
        }
        
        if (record.getSubVizId() != null) {
            sql.SET("sub_viz_id = #{record.subVizId,jdbcType=BIGINT}");
        }
        
        if (record.getSubVizName() != null) {
            sql.SET("sub_viz_name = #{record.subVizName,jdbcType=VARCHAR}");
        }
        
        if (record.getWidgetId() != null) {
            sql.SET("widget_id = #{record.widgetId,jdbcType=BIGINT}");
        }
        
        if (record.getWidgetName() != null) {
            sql.SET("widget_name = #{record.widgetName,jdbcType=VARCHAR}");
        }
        
        if (record.getVariables() != null) {
            sql.SET("`variables` = #{record.variables,jdbcType=VARCHAR}");
        }
        
        if (record.getFilters() != null) {
            sql.SET("filters = #{record.filters,jdbcType=VARCHAR}");
        }
        
        if (record.getGroups() != null) {
            sql.SET("groups = #{record.groups,jdbcType=VARCHAR}");
        }
        
        if (record.getCreateTime() != null) {
            sql.SET("create_time = #{record.createTime,jdbcType=TIMESTAMP}");
        }
        
        applyWhere(sql, example, true);
        return sql.toString();
    }

    public String updateByExample(Map<String, Object> parameter) {
        SQL sql = new SQL();
        sql.UPDATE("davinci_statistic_visitor_operation");
        
        sql.SET("id = #{record.id,jdbcType=BIGINT}");
        sql.SET("user_id = #{record.userId,jdbcType=BIGINT}");
        sql.SET("email = #{record.email,jdbcType=VARCHAR}");
        sql.SET("`action` = #{record.action,jdbcType=VARCHAR}");
        sql.SET("org_id = #{record.orgId,jdbcType=BIGINT}");
        sql.SET("project_id = #{record.projectId,jdbcType=BIGINT}");
        sql.SET("project_name = #{record.projectName,jdbcType=VARCHAR}");
        sql.SET("viz_type = #{record.vizType,jdbcType=VARCHAR}");
        sql.SET("viz_id = #{record.vizId,jdbcType=BIGINT}");
        sql.SET("viz_name = #{record.vizName,jdbcType=VARCHAR}");
        sql.SET("sub_viz_id = #{record.subVizId,jdbcType=BIGINT}");
        sql.SET("sub_viz_name = #{record.subVizName,jdbcType=VARCHAR}");
        sql.SET("widget_id = #{record.widgetId,jdbcType=BIGINT}");
        sql.SET("widget_name = #{record.widgetName,jdbcType=VARCHAR}");
        sql.SET("`variables` = #{record.variables,jdbcType=VARCHAR}");
        sql.SET("filters = #{record.filters,jdbcType=VARCHAR}");
        sql.SET("groups = #{record.groups,jdbcType=VARCHAR}");
        sql.SET("create_time = #{record.createTime,jdbcType=TIMESTAMP}");
        
        DavinciStatisticVisitorOperationExample example = (DavinciStatisticVisitorOperationExample) parameter.get("example");
        applyWhere(sql, example, true);
        return sql.toString();
    }

    public String updateByPrimaryKeySelective(DavinciStatisticVisitorOperation record) {
        SQL sql = new SQL();
        sql.UPDATE("davinci_statistic_visitor_operation");
        
        if (record.getUserId() != null) {
            sql.SET("user_id = #{userId,jdbcType=BIGINT}");
        }
        
        if (record.getEmail() != null) {
            sql.SET("email = #{email,jdbcType=VARCHAR}");
        }
        
        if (record.getAction() != null) {
            sql.SET("`action` = #{action,jdbcType=VARCHAR}");
        }
        
        if (record.getOrgId() != null) {
            sql.SET("org_id = #{orgId,jdbcType=BIGINT}");
        }
        
        if (record.getProjectId() != null) {
            sql.SET("project_id = #{projectId,jdbcType=BIGINT}");
        }
        
        if (record.getProjectName() != null) {
            sql.SET("project_name = #{projectName,jdbcType=VARCHAR}");
        }
        
        if (record.getVizType() != null) {
            sql.SET("viz_type = #{vizType,jdbcType=VARCHAR}");
        }
        
        if (record.getVizId() != null) {
            sql.SET("viz_id = #{vizId,jdbcType=BIGINT}");
        }
        
        if (record.getVizName() != null) {
            sql.SET("viz_name = #{vizName,jdbcType=VARCHAR}");
        }
        
        if (record.getSubVizId() != null) {
            sql.SET("sub_viz_id = #{subVizId,jdbcType=BIGINT}");
        }
        
        if (record.getSubVizName() != null) {
            sql.SET("sub_viz_name = #{subVizName,jdbcType=VARCHAR}");
        }
        
        if (record.getWidgetId() != null) {
            sql.SET("widget_id = #{widgetId,jdbcType=BIGINT}");
        }
        
        if (record.getWidgetName() != null) {
            sql.SET("widget_name = #{widgetName,jdbcType=VARCHAR}");
        }
        
        if (record.getVariables() != null) {
            sql.SET("`variables` = #{variables,jdbcType=VARCHAR}");
        }
        
        if (record.getFilters() != null) {
            sql.SET("filters = #{filters,jdbcType=VARCHAR}");
        }
        
        if (record.getGroups() != null) {
            sql.SET("groups = #{groups,jdbcType=VARCHAR}");
        }
        
        if (record.getCreateTime() != null) {
            sql.SET("create_time = #{createTime,jdbcType=TIMESTAMP}");
        }
        
        sql.WHERE("id = #{id,jdbcType=BIGINT}");
        
        return sql.toString();
    }

    protected void applyWhere(SQL sql, DavinciStatisticVisitorOperationExample example, boolean includeExamplePhrase) {
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