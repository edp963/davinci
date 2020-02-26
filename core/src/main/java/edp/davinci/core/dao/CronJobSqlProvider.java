package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.CronJob;
import edp.davinci.core.dao.entity.CronJobExample.Criteria;
import edp.davinci.core.dao.entity.CronJobExample.Criterion;
import edp.davinci.core.dao.entity.CronJobExample;
import java.util.List;
import java.util.Map;
import org.apache.ibatis.jdbc.SQL;

public class CronJobSqlProvider {

    public String countByExample(CronJobExample example) {
        SQL sql = new SQL();
        sql.SELECT("count(*)").FROM("cron_job");
        applyWhere(sql, example, false);
        return sql.toString();
    }

    public String deleteByExample(CronJobExample example) {
        SQL sql = new SQL();
        sql.DELETE_FROM("cron_job");
        applyWhere(sql, example, false);
        return sql.toString();
    }

    public String insertSelective(CronJob record) {
        SQL sql = new SQL();
        sql.INSERT_INTO("cron_job");
        
        if (record.getId() != null) {
            sql.VALUES("id", "#{id,jdbcType=BIGINT}");
        }
        
        if (record.getName() != null) {
            sql.VALUES("`name`", "#{name,jdbcType=VARCHAR}");
        }
        
        if (record.getProjectId() != null) {
            sql.VALUES("project_id", "#{projectId,jdbcType=BIGINT}");
        }
        
        if (record.getJobType() != null) {
            sql.VALUES("job_type", "#{jobType,jdbcType=VARCHAR}");
        }
        
        if (record.getJobStatus() != null) {
            sql.VALUES("job_status", "#{jobStatus,jdbcType=VARCHAR}");
        }
        
        if (record.getCronExpression() != null) {
            sql.VALUES("cron_expression", "#{cronExpression,jdbcType=VARCHAR}");
        }
        
        if (record.getStartDate() != null) {
            sql.VALUES("start_date", "#{startDate,jdbcType=TIMESTAMP}");
        }
        
        if (record.getEndDate() != null) {
            sql.VALUES("end_date", "#{endDate,jdbcType=TIMESTAMP}");
        }
        
        if (record.getDescription() != null) {
            sql.VALUES("description", "#{description,jdbcType=VARCHAR}");
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
        
        if (record.getConfig() != null) {
            sql.VALUES("config", "#{config,jdbcType=LONGVARCHAR}");
        }
        
        if (record.getExecLog() != null) {
            sql.VALUES("exec_log", "#{execLog,jdbcType=LONGVARCHAR}");
        }
        
        return sql.toString();
    }

    public String selectByExampleWithBLOBs(CronJobExample example) {
        SQL sql = new SQL();
        if (example != null && example.isDistinct()) {
            sql.SELECT_DISTINCT("id");
        } else {
            sql.SELECT("id");
        }
        sql.SELECT("`name`");
        sql.SELECT("project_id");
        sql.SELECT("job_type");
        sql.SELECT("job_status");
        sql.SELECT("cron_expression");
        sql.SELECT("start_date");
        sql.SELECT("end_date");
        sql.SELECT("description");
        sql.SELECT("create_by");
        sql.SELECT("create_time");
        sql.SELECT("update_by");
        sql.SELECT("update_time");
        sql.SELECT("parent_id");
        sql.SELECT("full_parent_id");
        sql.SELECT("is_folder");
        sql.SELECT("`index`");
        sql.SELECT("config");
        sql.SELECT("exec_log");
        sql.FROM("cron_job");
        applyWhere(sql, example, false);
        
        if (example != null && example.getOrderByClause() != null) {
            sql.ORDER_BY(example.getOrderByClause());
        }
        
        return sql.toString();
    }

    public String selectByExample(CronJobExample example) {
        SQL sql = new SQL();
        if (example != null && example.isDistinct()) {
            sql.SELECT_DISTINCT("id");
        } else {
            sql.SELECT("id");
        }
        sql.SELECT("`name`");
        sql.SELECT("project_id");
        sql.SELECT("job_type");
        sql.SELECT("job_status");
        sql.SELECT("cron_expression");
        sql.SELECT("start_date");
        sql.SELECT("end_date");
        sql.SELECT("description");
        sql.SELECT("create_by");
        sql.SELECT("create_time");
        sql.SELECT("update_by");
        sql.SELECT("update_time");
        sql.SELECT("parent_id");
        sql.SELECT("full_parent_id");
        sql.SELECT("is_folder");
        sql.SELECT("`index`");
        sql.FROM("cron_job");
        applyWhere(sql, example, false);
        
        if (example != null && example.getOrderByClause() != null) {
            sql.ORDER_BY(example.getOrderByClause());
        }
        
        return sql.toString();
    }

    public String updateByExampleSelective(Map<String, Object> parameter) {
        CronJob record = (CronJob) parameter.get("record");
        CronJobExample example = (CronJobExample) parameter.get("example");
        
        SQL sql = new SQL();
        sql.UPDATE("cron_job");
        
        if (record.getId() != null) {
            sql.SET("id = #{record.id,jdbcType=BIGINT}");
        }
        
        if (record.getName() != null) {
            sql.SET("`name` = #{record.name,jdbcType=VARCHAR}");
        }
        
        if (record.getProjectId() != null) {
            sql.SET("project_id = #{record.projectId,jdbcType=BIGINT}");
        }
        
        if (record.getJobType() != null) {
            sql.SET("job_type = #{record.jobType,jdbcType=VARCHAR}");
        }
        
        if (record.getJobStatus() != null) {
            sql.SET("job_status = #{record.jobStatus,jdbcType=VARCHAR}");
        }
        
        if (record.getCronExpression() != null) {
            sql.SET("cron_expression = #{record.cronExpression,jdbcType=VARCHAR}");
        }
        
        if (record.getStartDate() != null) {
            sql.SET("start_date = #{record.startDate,jdbcType=TIMESTAMP}");
        }
        
        if (record.getEndDate() != null) {
            sql.SET("end_date = #{record.endDate,jdbcType=TIMESTAMP}");
        }
        
        if (record.getDescription() != null) {
            sql.SET("description = #{record.description,jdbcType=VARCHAR}");
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
        
        if (record.getConfig() != null) {
            sql.SET("config = #{record.config,jdbcType=LONGVARCHAR}");
        }
        
        if (record.getExecLog() != null) {
            sql.SET("exec_log = #{record.execLog,jdbcType=LONGVARCHAR}");
        }
        
        applyWhere(sql, example, true);
        return sql.toString();
    }

    public String updateByExampleWithBLOBs(Map<String, Object> parameter) {
        SQL sql = new SQL();
        sql.UPDATE("cron_job");
        
        sql.SET("id = #{record.id,jdbcType=BIGINT}");
        sql.SET("`name` = #{record.name,jdbcType=VARCHAR}");
        sql.SET("project_id = #{record.projectId,jdbcType=BIGINT}");
        sql.SET("job_type = #{record.jobType,jdbcType=VARCHAR}");
        sql.SET("job_status = #{record.jobStatus,jdbcType=VARCHAR}");
        sql.SET("cron_expression = #{record.cronExpression,jdbcType=VARCHAR}");
        sql.SET("start_date = #{record.startDate,jdbcType=TIMESTAMP}");
        sql.SET("end_date = #{record.endDate,jdbcType=TIMESTAMP}");
        sql.SET("description = #{record.description,jdbcType=VARCHAR}");
        sql.SET("create_by = #{record.createBy,jdbcType=BIGINT}");
        sql.SET("create_time = #{record.createTime,jdbcType=TIMESTAMP}");
        sql.SET("update_by = #{record.updateBy,jdbcType=BIGINT}");
        sql.SET("update_time = #{record.updateTime,jdbcType=TIMESTAMP}");
        sql.SET("parent_id = #{record.parentId,jdbcType=BIGINT}");
        sql.SET("full_parent_id = #{record.fullParentId,jdbcType=VARCHAR}");
        sql.SET("is_folder = #{record.isFolder,jdbcType=BIT}");
        sql.SET("`index` = #{record.index,jdbcType=INTEGER}");
        sql.SET("config = #{record.config,jdbcType=LONGVARCHAR}");
        sql.SET("exec_log = #{record.execLog,jdbcType=LONGVARCHAR}");
        
        CronJobExample example = (CronJobExample) parameter.get("example");
        applyWhere(sql, example, true);
        return sql.toString();
    }

    public String updateByExample(Map<String, Object> parameter) {
        SQL sql = new SQL();
        sql.UPDATE("cron_job");
        
        sql.SET("id = #{record.id,jdbcType=BIGINT}");
        sql.SET("`name` = #{record.name,jdbcType=VARCHAR}");
        sql.SET("project_id = #{record.projectId,jdbcType=BIGINT}");
        sql.SET("job_type = #{record.jobType,jdbcType=VARCHAR}");
        sql.SET("job_status = #{record.jobStatus,jdbcType=VARCHAR}");
        sql.SET("cron_expression = #{record.cronExpression,jdbcType=VARCHAR}");
        sql.SET("start_date = #{record.startDate,jdbcType=TIMESTAMP}");
        sql.SET("end_date = #{record.endDate,jdbcType=TIMESTAMP}");
        sql.SET("description = #{record.description,jdbcType=VARCHAR}");
        sql.SET("create_by = #{record.createBy,jdbcType=BIGINT}");
        sql.SET("create_time = #{record.createTime,jdbcType=TIMESTAMP}");
        sql.SET("update_by = #{record.updateBy,jdbcType=BIGINT}");
        sql.SET("update_time = #{record.updateTime,jdbcType=TIMESTAMP}");
        sql.SET("parent_id = #{record.parentId,jdbcType=BIGINT}");
        sql.SET("full_parent_id = #{record.fullParentId,jdbcType=VARCHAR}");
        sql.SET("is_folder = #{record.isFolder,jdbcType=BIT}");
        sql.SET("`index` = #{record.index,jdbcType=INTEGER}");
        
        CronJobExample example = (CronJobExample) parameter.get("example");
        applyWhere(sql, example, true);
        return sql.toString();
    }

    public String updateByPrimaryKeySelective(CronJob record) {
        SQL sql = new SQL();
        sql.UPDATE("cron_job");
        
        if (record.getName() != null) {
            sql.SET("`name` = #{name,jdbcType=VARCHAR}");
        }
        
        if (record.getProjectId() != null) {
            sql.SET("project_id = #{projectId,jdbcType=BIGINT}");
        }
        
        if (record.getJobType() != null) {
            sql.SET("job_type = #{jobType,jdbcType=VARCHAR}");
        }
        
        if (record.getJobStatus() != null) {
            sql.SET("job_status = #{jobStatus,jdbcType=VARCHAR}");
        }
        
        if (record.getCronExpression() != null) {
            sql.SET("cron_expression = #{cronExpression,jdbcType=VARCHAR}");
        }
        
        if (record.getStartDate() != null) {
            sql.SET("start_date = #{startDate,jdbcType=TIMESTAMP}");
        }
        
        if (record.getEndDate() != null) {
            sql.SET("end_date = #{endDate,jdbcType=TIMESTAMP}");
        }
        
        if (record.getDescription() != null) {
            sql.SET("description = #{description,jdbcType=VARCHAR}");
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
        
        if (record.getConfig() != null) {
            sql.SET("config = #{config,jdbcType=LONGVARCHAR}");
        }
        
        if (record.getExecLog() != null) {
            sql.SET("exec_log = #{execLog,jdbcType=LONGVARCHAR}");
        }
        
        sql.WHERE("id = #{id,jdbcType=BIGINT}");
        
        return sql.toString();
    }

    protected void applyWhere(SQL sql, CronJobExample example, boolean includeExamplePhrase) {
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