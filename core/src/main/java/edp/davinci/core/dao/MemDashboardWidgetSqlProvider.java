package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.MemDashboardWidget;
import edp.davinci.core.dao.entity.MemDashboardWidgetExample.Criteria;
import edp.davinci.core.dao.entity.MemDashboardWidgetExample.Criterion;
import edp.davinci.core.dao.entity.MemDashboardWidgetExample;
import java.util.List;
import java.util.Map;
import org.apache.ibatis.jdbc.SQL;

public class MemDashboardWidgetSqlProvider {

    public String countByExample(MemDashboardWidgetExample example) {
        SQL sql = new SQL();
        sql.SELECT("count(*)").FROM("mem_dashboard_widget");
        applyWhere(sql, example, false);
        return sql.toString();
    }

    public String deleteByExample(MemDashboardWidgetExample example) {
        SQL sql = new SQL();
        sql.DELETE_FROM("mem_dashboard_widget");
        applyWhere(sql, example, false);
        return sql.toString();
    }

    public String insertSelective(MemDashboardWidget record) {
        SQL sql = new SQL();
        sql.INSERT_INTO("mem_dashboard_widget");
        
        if (record.getId() != null) {
            sql.VALUES("id", "#{id,jdbcType=BIGINT}");
        }
        
        if (record.getDashboardId() != null) {
            sql.VALUES("dashboard_id", "#{dashboardId,jdbcType=BIGINT}");
        }
        
        if (record.getWidgetId() != null) {
            sql.VALUES("widget_Id", "#{widgetId,jdbcType=BIGINT}");
        }
        
        if (record.getX() != null) {
            sql.VALUES("x", "#{x,jdbcType=INTEGER}");
        }
        
        if (record.getY() != null) {
            sql.VALUES("y", "#{y,jdbcType=INTEGER}");
        }
        
        if (record.getWidth() != null) {
            sql.VALUES("width", "#{width,jdbcType=INTEGER}");
        }
        
        if (record.getHeight() != null) {
            sql.VALUES("height", "#{height,jdbcType=INTEGER}");
        }
        
        if (record.getPolling() != null) {
            sql.VALUES("polling", "#{polling,jdbcType=BIT}");
        }
        
        if (record.getFrequency() != null) {
            sql.VALUES("frequency", "#{frequency,jdbcType=INTEGER}");
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
        
        if (record.getConfig() != null) {
            sql.VALUES("config", "#{config,jdbcType=LONGVARCHAR}");
        }
        
        return sql.toString();
    }

    public String selectByExampleWithBLOBs(MemDashboardWidgetExample example) {
        SQL sql = new SQL();
        if (example != null && example.isDistinct()) {
            sql.SELECT_DISTINCT("id");
        } else {
            sql.SELECT("id");
        }
        sql.SELECT("dashboard_id");
        sql.SELECT("widget_Id");
        sql.SELECT("x");
        sql.SELECT("y");
        sql.SELECT("width");
        sql.SELECT("height");
        sql.SELECT("polling");
        sql.SELECT("frequency");
        sql.SELECT("create_by");
        sql.SELECT("create_time");
        sql.SELECT("update_by");
        sql.SELECT("update_time");
        sql.SELECT("config");
        sql.FROM("mem_dashboard_widget");
        applyWhere(sql, example, false);
        
        if (example != null && example.getOrderByClause() != null) {
            sql.ORDER_BY(example.getOrderByClause());
        }
        
        return sql.toString();
    }

    public String selectByExample(MemDashboardWidgetExample example) {
        SQL sql = new SQL();
        if (example != null && example.isDistinct()) {
            sql.SELECT_DISTINCT("id");
        } else {
            sql.SELECT("id");
        }
        sql.SELECT("dashboard_id");
        sql.SELECT("widget_Id");
        sql.SELECT("x");
        sql.SELECT("y");
        sql.SELECT("width");
        sql.SELECT("height");
        sql.SELECT("polling");
        sql.SELECT("frequency");
        sql.SELECT("create_by");
        sql.SELECT("create_time");
        sql.SELECT("update_by");
        sql.SELECT("update_time");
        sql.FROM("mem_dashboard_widget");
        applyWhere(sql, example, false);
        
        if (example != null && example.getOrderByClause() != null) {
            sql.ORDER_BY(example.getOrderByClause());
        }
        
        return sql.toString();
    }

    public String updateByExampleSelective(Map<String, Object> parameter) {
        MemDashboardWidget record = (MemDashboardWidget) parameter.get("record");
        MemDashboardWidgetExample example = (MemDashboardWidgetExample) parameter.get("example");
        
        SQL sql = new SQL();
        sql.UPDATE("mem_dashboard_widget");
        
        if (record.getId() != null) {
            sql.SET("id = #{record.id,jdbcType=BIGINT}");
        }
        
        if (record.getDashboardId() != null) {
            sql.SET("dashboard_id = #{record.dashboardId,jdbcType=BIGINT}");
        }
        
        if (record.getWidgetId() != null) {
            sql.SET("widget_Id = #{record.widgetId,jdbcType=BIGINT}");
        }
        
        if (record.getX() != null) {
            sql.SET("x = #{record.x,jdbcType=INTEGER}");
        }
        
        if (record.getY() != null) {
            sql.SET("y = #{record.y,jdbcType=INTEGER}");
        }
        
        if (record.getWidth() != null) {
            sql.SET("width = #{record.width,jdbcType=INTEGER}");
        }
        
        if (record.getHeight() != null) {
            sql.SET("height = #{record.height,jdbcType=INTEGER}");
        }
        
        if (record.getPolling() != null) {
            sql.SET("polling = #{record.polling,jdbcType=BIT}");
        }
        
        if (record.getFrequency() != null) {
            sql.SET("frequency = #{record.frequency,jdbcType=INTEGER}");
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
        
        if (record.getConfig() != null) {
            sql.SET("config = #{record.config,jdbcType=LONGVARCHAR}");
        }
        
        applyWhere(sql, example, true);
        return sql.toString();
    }

    public String updateByExampleWithBLOBs(Map<String, Object> parameter) {
        SQL sql = new SQL();
        sql.UPDATE("mem_dashboard_widget");
        
        sql.SET("id = #{record.id,jdbcType=BIGINT}");
        sql.SET("dashboard_id = #{record.dashboardId,jdbcType=BIGINT}");
        sql.SET("widget_Id = #{record.widgetId,jdbcType=BIGINT}");
        sql.SET("x = #{record.x,jdbcType=INTEGER}");
        sql.SET("y = #{record.y,jdbcType=INTEGER}");
        sql.SET("width = #{record.width,jdbcType=INTEGER}");
        sql.SET("height = #{record.height,jdbcType=INTEGER}");
        sql.SET("polling = #{record.polling,jdbcType=BIT}");
        sql.SET("frequency = #{record.frequency,jdbcType=INTEGER}");
        sql.SET("create_by = #{record.createBy,jdbcType=BIGINT}");
        sql.SET("create_time = #{record.createTime,jdbcType=TIMESTAMP}");
        sql.SET("update_by = #{record.updateBy,jdbcType=BIGINT}");
        sql.SET("update_time = #{record.updateTime,jdbcType=TIMESTAMP}");
        sql.SET("config = #{record.config,jdbcType=LONGVARCHAR}");
        
        MemDashboardWidgetExample example = (MemDashboardWidgetExample) parameter.get("example");
        applyWhere(sql, example, true);
        return sql.toString();
    }

    public String updateByExample(Map<String, Object> parameter) {
        SQL sql = new SQL();
        sql.UPDATE("mem_dashboard_widget");
        
        sql.SET("id = #{record.id,jdbcType=BIGINT}");
        sql.SET("dashboard_id = #{record.dashboardId,jdbcType=BIGINT}");
        sql.SET("widget_Id = #{record.widgetId,jdbcType=BIGINT}");
        sql.SET("x = #{record.x,jdbcType=INTEGER}");
        sql.SET("y = #{record.y,jdbcType=INTEGER}");
        sql.SET("width = #{record.width,jdbcType=INTEGER}");
        sql.SET("height = #{record.height,jdbcType=INTEGER}");
        sql.SET("polling = #{record.polling,jdbcType=BIT}");
        sql.SET("frequency = #{record.frequency,jdbcType=INTEGER}");
        sql.SET("create_by = #{record.createBy,jdbcType=BIGINT}");
        sql.SET("create_time = #{record.createTime,jdbcType=TIMESTAMP}");
        sql.SET("update_by = #{record.updateBy,jdbcType=BIGINT}");
        sql.SET("update_time = #{record.updateTime,jdbcType=TIMESTAMP}");
        
        MemDashboardWidgetExample example = (MemDashboardWidgetExample) parameter.get("example");
        applyWhere(sql, example, true);
        return sql.toString();
    }

    public String updateByPrimaryKeySelective(MemDashboardWidget record) {
        SQL sql = new SQL();
        sql.UPDATE("mem_dashboard_widget");
        
        if (record.getDashboardId() != null) {
            sql.SET("dashboard_id = #{dashboardId,jdbcType=BIGINT}");
        }
        
        if (record.getWidgetId() != null) {
            sql.SET("widget_Id = #{widgetId,jdbcType=BIGINT}");
        }
        
        if (record.getX() != null) {
            sql.SET("x = #{x,jdbcType=INTEGER}");
        }
        
        if (record.getY() != null) {
            sql.SET("y = #{y,jdbcType=INTEGER}");
        }
        
        if (record.getWidth() != null) {
            sql.SET("width = #{width,jdbcType=INTEGER}");
        }
        
        if (record.getHeight() != null) {
            sql.SET("height = #{height,jdbcType=INTEGER}");
        }
        
        if (record.getPolling() != null) {
            sql.SET("polling = #{polling,jdbcType=BIT}");
        }
        
        if (record.getFrequency() != null) {
            sql.SET("frequency = #{frequency,jdbcType=INTEGER}");
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
        
        if (record.getConfig() != null) {
            sql.SET("config = #{config,jdbcType=LONGVARCHAR}");
        }
        
        sql.WHERE("id = #{id,jdbcType=BIGINT}");
        
        return sql.toString();
    }

    protected void applyWhere(SQL sql, MemDashboardWidgetExample example, boolean includeExamplePhrase) {
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