package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.RelRoleView;
import edp.davinci.core.dao.entity.RelRoleViewExample.Criteria;
import edp.davinci.core.dao.entity.RelRoleViewExample.Criterion;
import edp.davinci.core.dao.entity.RelRoleViewExample;
import java.util.List;
import java.util.Map;
import org.apache.ibatis.jdbc.SQL;

public class RelRoleViewSqlProvider {

    public String countByExample(RelRoleViewExample example) {
        SQL sql = new SQL();
        sql.SELECT("count(*)").FROM("rel_role_view");
        applyWhere(sql, example, false);
        return sql.toString();
    }

    public String deleteByExample(RelRoleViewExample example) {
        SQL sql = new SQL();
        sql.DELETE_FROM("rel_role_view");
        applyWhere(sql, example, false);
        return sql.toString();
    }

    public String insertSelective(RelRoleView record) {
        SQL sql = new SQL();
        sql.INSERT_INTO("rel_role_view");
        
        if (record.getViewId() != null) {
            sql.VALUES("view_id", "#{viewId,jdbcType=BIGINT}");
        }
        
        if (record.getRoleId() != null) {
            sql.VALUES("role_id", "#{roleId,jdbcType=BIGINT}");
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
        
        if (record.getRowAuth() != null) {
            sql.VALUES("row_auth", "#{rowAuth,jdbcType=LONGVARCHAR}");
        }
        
        if (record.getColumnAuth() != null) {
            sql.VALUES("column_auth", "#{columnAuth,jdbcType=LONGVARCHAR}");
        }
        
        return sql.toString();
    }

    public String selectByExampleWithBLOBs(RelRoleViewExample example) {
        SQL sql = new SQL();
        if (example != null && example.isDistinct()) {
            sql.SELECT_DISTINCT("view_id");
        } else {
            sql.SELECT("view_id");
        }
        sql.SELECT("role_id");
        sql.SELECT("create_by");
        sql.SELECT("create_time");
        sql.SELECT("update_by");
        sql.SELECT("update_time");
        sql.SELECT("row_auth");
        sql.SELECT("column_auth");
        sql.FROM("rel_role_view");
        applyWhere(sql, example, false);
        
        if (example != null && example.getOrderByClause() != null) {
            sql.ORDER_BY(example.getOrderByClause());
        }
        
        return sql.toString();
    }

    public String selectByExample(RelRoleViewExample example) {
        SQL sql = new SQL();
        if (example != null && example.isDistinct()) {
            sql.SELECT_DISTINCT("view_id");
        } else {
            sql.SELECT("view_id");
        }
        sql.SELECT("role_id");
        sql.SELECT("create_by");
        sql.SELECT("create_time");
        sql.SELECT("update_by");
        sql.SELECT("update_time");
        sql.FROM("rel_role_view");
        applyWhere(sql, example, false);
        
        if (example != null && example.getOrderByClause() != null) {
            sql.ORDER_BY(example.getOrderByClause());
        }
        
        return sql.toString();
    }

    public String updateByExampleSelective(Map<String, Object> parameter) {
        RelRoleView record = (RelRoleView) parameter.get("record");
        RelRoleViewExample example = (RelRoleViewExample) parameter.get("example");
        
        SQL sql = new SQL();
        sql.UPDATE("rel_role_view");
        
        if (record.getViewId() != null) {
            sql.SET("view_id = #{record.viewId,jdbcType=BIGINT}");
        }
        
        if (record.getRoleId() != null) {
            sql.SET("role_id = #{record.roleId,jdbcType=BIGINT}");
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
        
        if (record.getRowAuth() != null) {
            sql.SET("row_auth = #{record.rowAuth,jdbcType=LONGVARCHAR}");
        }
        
        if (record.getColumnAuth() != null) {
            sql.SET("column_auth = #{record.columnAuth,jdbcType=LONGVARCHAR}");
        }
        
        applyWhere(sql, example, true);
        return sql.toString();
    }

    public String updateByExampleWithBLOBs(Map<String, Object> parameter) {
        SQL sql = new SQL();
        sql.UPDATE("rel_role_view");
        
        sql.SET("view_id = #{record.viewId,jdbcType=BIGINT}");
        sql.SET("role_id = #{record.roleId,jdbcType=BIGINT}");
        sql.SET("create_by = #{record.createBy,jdbcType=BIGINT}");
        sql.SET("create_time = #{record.createTime,jdbcType=TIMESTAMP}");
        sql.SET("update_by = #{record.updateBy,jdbcType=BIGINT}");
        sql.SET("update_time = #{record.updateTime,jdbcType=TIMESTAMP}");
        sql.SET("row_auth = #{record.rowAuth,jdbcType=LONGVARCHAR}");
        sql.SET("column_auth = #{record.columnAuth,jdbcType=LONGVARCHAR}");
        
        RelRoleViewExample example = (RelRoleViewExample) parameter.get("example");
        applyWhere(sql, example, true);
        return sql.toString();
    }

    public String updateByExample(Map<String, Object> parameter) {
        SQL sql = new SQL();
        sql.UPDATE("rel_role_view");
        
        sql.SET("view_id = #{record.viewId,jdbcType=BIGINT}");
        sql.SET("role_id = #{record.roleId,jdbcType=BIGINT}");
        sql.SET("create_by = #{record.createBy,jdbcType=BIGINT}");
        sql.SET("create_time = #{record.createTime,jdbcType=TIMESTAMP}");
        sql.SET("update_by = #{record.updateBy,jdbcType=BIGINT}");
        sql.SET("update_time = #{record.updateTime,jdbcType=TIMESTAMP}");
        
        RelRoleViewExample example = (RelRoleViewExample) parameter.get("example");
        applyWhere(sql, example, true);
        return sql.toString();
    }

    public String updateByPrimaryKeySelective(RelRoleView record) {
        SQL sql = new SQL();
        sql.UPDATE("rel_role_view");
        
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
        
        if (record.getRowAuth() != null) {
            sql.SET("row_auth = #{rowAuth,jdbcType=LONGVARCHAR}");
        }
        
        if (record.getColumnAuth() != null) {
            sql.SET("column_auth = #{columnAuth,jdbcType=LONGVARCHAR}");
        }
        
        sql.WHERE("view_id = #{viewId,jdbcType=BIGINT}");
        sql.WHERE("role_id = #{roleId,jdbcType=BIGINT}");
        
        return sql.toString();
    }

    protected void applyWhere(SQL sql, RelRoleViewExample example, boolean includeExamplePhrase) {
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