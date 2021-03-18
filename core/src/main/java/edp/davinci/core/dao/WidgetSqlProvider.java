package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.Widget;
import edp.davinci.core.dao.entity.WidgetExample.Criteria;
import edp.davinci.core.dao.entity.WidgetExample.Criterion;
import edp.davinci.core.dao.entity.WidgetExample;
import java.util.List;
import java.util.Map;
import org.apache.ibatis.jdbc.SQL;

public class WidgetSqlProvider {

    public String countByExample(WidgetExample example) {
        SQL sql = new SQL();
        sql.SELECT("count(*)").FROM("widget");
        applyWhere(sql, example, false);
        return sql.toString();
    }

    public String deleteByExample(WidgetExample example) {
        SQL sql = new SQL();
        sql.DELETE_FROM("widget");
        applyWhere(sql, example, false);
        return sql.toString();
    }

    public String insertSelective(Widget record) {
        SQL sql = new SQL();
        sql.INSERT_INTO("widget");
        
        if (record.getId() != null) {
            sql.VALUES("id", "#{id,jdbcType=BIGINT}");
        }
        
        if (record.getName() != null) {
            sql.VALUES("`name`", "#{name,jdbcType=VARCHAR}");
        }
        
        if (record.getDescription() != null) {
            sql.VALUES("description", "#{description,jdbcType=VARCHAR}");
        }
        
        if (record.getViewId() != null) {
            sql.VALUES("view_id", "#{viewId,jdbcType=BIGINT}");
        }
        
        if (record.getProjectId() != null) {
            sql.VALUES("project_id", "#{projectId,jdbcType=BIGINT}");
        }
        
        if (record.getType() != null) {
            sql.VALUES("`type`", "#{type,jdbcType=BIGINT}");
        }
        
        if (record.getPublish() != null) {
            sql.VALUES("publish", "#{publish,jdbcType=BIT}");
        }
        
        if (record.getConfig() != null) {
            sql.VALUES("config", "#{config,jdbcType=VARCHAR}");
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
        
        if (record.getParentId() != null) {
            sql.VALUES("parent_id", "#{parentId,jdbcType=BIGINT}");
        }
        
        if (record.getFullParentId() != null) {
            sql.VALUES("full_parent_id", "#{fullParentId,jdbcType=VARCHAR}");
        }
        
        if (record.getIsFolder() != null) {
            sql.VALUES("is_folder", "#{isFolder,jdbcType=BIT}");
        }
        
        if (record.getIndex() != null) {
            sql.VALUES("`index`", "#{index,jdbcType=INTEGER}");
        }
        
        return sql.toString();
    }

    public String selectByExample(WidgetExample example) {
        SQL sql = new SQL();
        if (example != null && example.isDistinct()) {
            sql.SELECT_DISTINCT("id");
        } else {
            sql.SELECT("id");
        }
        sql.SELECT("`name`");
        sql.SELECT("description");
        sql.SELECT("view_id");
        sql.SELECT("project_id");
        sql.SELECT("`type`");
        sql.SELECT("publish");
        sql.SELECT("config");
        sql.SELECT("create_by");
        sql.SELECT("create_time");
        sql.SELECT("update_by");
        sql.SELECT("update_time");
        sql.SELECT("parent_id");
        sql.SELECT("full_parent_id");
        sql.SELECT("is_folder");
        sql.SELECT("`index`");
        sql.FROM("widget");
        applyWhere(sql, example, false);
        
        if (example != null && example.getOrderByClause() != null) {
            sql.ORDER_BY(example.getOrderByClause());
        }
        
        return sql.toString();
    }

    public String updateByExampleSelective(Map<String, Object> parameter) {
        Widget record = (Widget) parameter.get("record");
        WidgetExample example = (WidgetExample) parameter.get("example");
        
        SQL sql = new SQL();
        sql.UPDATE("widget");
        
        if (record.getId() != null) {
            sql.SET("id = #{record.id,jdbcType=BIGINT}");
        }
        
        if (record.getName() != null) {
            sql.SET("`name` = #{record.name,jdbcType=VARCHAR}");
        }
        
        if (record.getDescription() != null) {
            sql.SET("description = #{record.description,jdbcType=VARCHAR}");
        }
        
        if (record.getViewId() != null) {
            sql.SET("view_id = #{record.viewId,jdbcType=BIGINT}");
        }
        
        if (record.getProjectId() != null) {
            sql.SET("project_id = #{record.projectId,jdbcType=BIGINT}");
        }
        
        if (record.getType() != null) {
            sql.SET("`type` = #{record.type,jdbcType=BIGINT}");
        }
        
        if (record.getPublish() != null) {
            sql.SET("publish = #{record.publish,jdbcType=BIT}");
        }
        
        if (record.getConfig() != null) {
            sql.SET("config = #{record.config,jdbcType=VARCHAR}");
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
        
        if (record.getParentId() != null) {
            sql.SET("parent_id = #{record.parentId,jdbcType=BIGINT}");
        }
        
        if (record.getFullParentId() != null) {
            sql.SET("full_parent_id = #{record.fullParentId,jdbcType=VARCHAR}");
        }
        
        if (record.getIsFolder() != null) {
            sql.SET("is_folder = #{record.isFolder,jdbcType=BIT}");
        }
        
        if (record.getIndex() != null) {
            sql.SET("`index` = #{record.index,jdbcType=INTEGER}");
        }
        
        applyWhere(sql, example, true);
        return sql.toString();
    }

    public String updateByExample(Map<String, Object> parameter) {
        SQL sql = new SQL();
        sql.UPDATE("widget");
        
        sql.SET("id = #{record.id,jdbcType=BIGINT}");
        sql.SET("`name` = #{record.name,jdbcType=VARCHAR}");
        sql.SET("description = #{record.description,jdbcType=VARCHAR}");
        sql.SET("view_id = #{record.viewId,jdbcType=BIGINT}");
        sql.SET("project_id = #{record.projectId,jdbcType=BIGINT}");
        sql.SET("`type` = #{record.type,jdbcType=BIGINT}");
        sql.SET("publish = #{record.publish,jdbcType=BIT}");
        sql.SET("config = #{record.config,jdbcType=VARCHAR}");
        sql.SET("create_by = #{record.createBy,jdbcType=BIGINT}");
        sql.SET("create_time = #{record.createTime,jdbcType=TIMESTAMP}");
        sql.SET("update_by = #{record.updateBy,jdbcType=BIGINT}");
        sql.SET("update_time = #{record.updateTime,jdbcType=TIMESTAMP}");
        sql.SET("parent_id = #{record.parentId,jdbcType=BIGINT}");
        sql.SET("full_parent_id = #{record.fullParentId,jdbcType=VARCHAR}");
        sql.SET("is_folder = #{record.isFolder,jdbcType=BIT}");
        sql.SET("`index` = #{record.index,jdbcType=INTEGER}");
        
        WidgetExample example = (WidgetExample) parameter.get("example");
        applyWhere(sql, example, true);
        return sql.toString();
    }

    public String updateByPrimaryKeySelective(Widget record) {
        SQL sql = new SQL();
        sql.UPDATE("widget");
        
        if (record.getName() != null) {
            sql.SET("`name` = #{name,jdbcType=VARCHAR}");
        }
        
        if (record.getDescription() != null) {
            sql.SET("description = #{description,jdbcType=VARCHAR}");
        }
        
        if (record.getViewId() != null) {
            sql.SET("view_id = #{viewId,jdbcType=BIGINT}");
        }
        
        if (record.getProjectId() != null) {
            sql.SET("project_id = #{projectId,jdbcType=BIGINT}");
        }
        
        if (record.getType() != null) {
            sql.SET("`type` = #{type,jdbcType=BIGINT}");
        }
        
        if (record.getPublish() != null) {
            sql.SET("publish = #{publish,jdbcType=BIT}");
        }
        
        if (record.getConfig() != null) {
            sql.SET("config = #{config,jdbcType=VARCHAR}");
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
        
        if (record.getParentId() != null) {
            sql.SET("parent_id = #{parentId,jdbcType=BIGINT}");
        }
        
        if (record.getFullParentId() != null) {
            sql.SET("full_parent_id = #{fullParentId,jdbcType=VARCHAR}");
        }
        
        if (record.getIsFolder() != null) {
            sql.SET("is_folder = #{isFolder,jdbcType=BIT}");
        }
        
        if (record.getIndex() != null) {
            sql.SET("`index` = #{index,jdbcType=INTEGER}");
        }
        
        sql.WHERE("id = #{id,jdbcType=BIGINT}");
        
        return sql.toString();
    }

    protected void applyWhere(SQL sql, WidgetExample example, boolean includeExamplePhrase) {
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