package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.DavinciStatisticTerminal;
import edp.davinci.core.dao.entity.DavinciStatisticTerminalExample.Criteria;
import edp.davinci.core.dao.entity.DavinciStatisticTerminalExample.Criterion;
import edp.davinci.core.dao.entity.DavinciStatisticTerminalExample;
import java.util.List;
import java.util.Map;
import org.apache.ibatis.jdbc.SQL;

public class DavinciStatisticTerminalSqlProvider {

    public String countByExample(DavinciStatisticTerminalExample example) {
        SQL sql = new SQL();
        sql.SELECT("count(*)").FROM("davinci_statistic_terminal");
        applyWhere(sql, example, false);
        return sql.toString();
    }

    public String deleteByExample(DavinciStatisticTerminalExample example) {
        SQL sql = new SQL();
        sql.DELETE_FROM("davinci_statistic_terminal");
        applyWhere(sql, example, false);
        return sql.toString();
    }

    public String insertSelective(DavinciStatisticTerminal record) {
        SQL sql = new SQL();
        sql.INSERT_INTO("davinci_statistic_terminal");
        
        if (record.getId() != null) {
            sql.VALUES("id", "#{id,jdbcType=BIGINT}");
        }
        
        if (record.getUserId() != null) {
            sql.VALUES("user_id", "#{userId,jdbcType=BIGINT}");
        }
        
        if (record.getEmail() != null) {
            sql.VALUES("email", "#{email,jdbcType=VARCHAR}");
        }
        
        if (record.getBrowserName() != null) {
            sql.VALUES("browser_name", "#{browserName,jdbcType=VARCHAR}");
        }
        
        if (record.getBrowserVersion() != null) {
            sql.VALUES("browser_version", "#{browserVersion,jdbcType=VARCHAR}");
        }
        
        if (record.getEngineName() != null) {
            sql.VALUES("engine_name", "#{engineName,jdbcType=VARCHAR}");
        }
        
        if (record.getEngineVersion() != null) {
            sql.VALUES("engine_version", "#{engineVersion,jdbcType=VARCHAR}");
        }
        
        if (record.getOsName() != null) {
            sql.VALUES("os_name", "#{osName,jdbcType=VARCHAR}");
        }
        
        if (record.getOsVersion() != null) {
            sql.VALUES("os_version", "#{osVersion,jdbcType=VARCHAR}");
        }
        
        if (record.getDeviceModel() != null) {
            sql.VALUES("device_model", "#{deviceModel,jdbcType=VARCHAR}");
        }
        
        if (record.getDeviceType() != null) {
            sql.VALUES("device_type", "#{deviceType,jdbcType=VARCHAR}");
        }
        
        if (record.getDeviceVendor() != null) {
            sql.VALUES("device_vendor", "#{deviceVendor,jdbcType=VARCHAR}");
        }
        
        if (record.getCpuArchitecture() != null) {
            sql.VALUES("cpu_architecture", "#{cpuArchitecture,jdbcType=VARCHAR}");
        }
        
        if (record.getCreateTime() != null) {
            sql.VALUES("create_time", "#{createTime,jdbcType=TIMESTAMP}");
        }
        
        return sql.toString();
    }

    public String selectByExample(DavinciStatisticTerminalExample example) {
        SQL sql = new SQL();
        if (example != null && example.isDistinct()) {
            sql.SELECT_DISTINCT("id");
        } else {
            sql.SELECT("id");
        }
        sql.SELECT("user_id");
        sql.SELECT("email");
        sql.SELECT("browser_name");
        sql.SELECT("browser_version");
        sql.SELECT("engine_name");
        sql.SELECT("engine_version");
        sql.SELECT("os_name");
        sql.SELECT("os_version");
        sql.SELECT("device_model");
        sql.SELECT("device_type");
        sql.SELECT("device_vendor");
        sql.SELECT("cpu_architecture");
        sql.SELECT("create_time");
        sql.FROM("davinci_statistic_terminal");
        applyWhere(sql, example, false);
        
        if (example != null && example.getOrderByClause() != null) {
            sql.ORDER_BY(example.getOrderByClause());
        }
        
        return sql.toString();
    }

    public String updateByExampleSelective(Map<String, Object> parameter) {
        DavinciStatisticTerminal record = (DavinciStatisticTerminal) parameter.get("record");
        DavinciStatisticTerminalExample example = (DavinciStatisticTerminalExample) parameter.get("example");
        
        SQL sql = new SQL();
        sql.UPDATE("davinci_statistic_terminal");
        
        if (record.getId() != null) {
            sql.SET("id = #{record.id,jdbcType=BIGINT}");
        }
        
        if (record.getUserId() != null) {
            sql.SET("user_id = #{record.userId,jdbcType=BIGINT}");
        }
        
        if (record.getEmail() != null) {
            sql.SET("email = #{record.email,jdbcType=VARCHAR}");
        }
        
        if (record.getBrowserName() != null) {
            sql.SET("browser_name = #{record.browserName,jdbcType=VARCHAR}");
        }
        
        if (record.getBrowserVersion() != null) {
            sql.SET("browser_version = #{record.browserVersion,jdbcType=VARCHAR}");
        }
        
        if (record.getEngineName() != null) {
            sql.SET("engine_name = #{record.engineName,jdbcType=VARCHAR}");
        }
        
        if (record.getEngineVersion() != null) {
            sql.SET("engine_version = #{record.engineVersion,jdbcType=VARCHAR}");
        }
        
        if (record.getOsName() != null) {
            sql.SET("os_name = #{record.osName,jdbcType=VARCHAR}");
        }
        
        if (record.getOsVersion() != null) {
            sql.SET("os_version = #{record.osVersion,jdbcType=VARCHAR}");
        }
        
        if (record.getDeviceModel() != null) {
            sql.SET("device_model = #{record.deviceModel,jdbcType=VARCHAR}");
        }
        
        if (record.getDeviceType() != null) {
            sql.SET("device_type = #{record.deviceType,jdbcType=VARCHAR}");
        }
        
        if (record.getDeviceVendor() != null) {
            sql.SET("device_vendor = #{record.deviceVendor,jdbcType=VARCHAR}");
        }
        
        if (record.getCpuArchitecture() != null) {
            sql.SET("cpu_architecture = #{record.cpuArchitecture,jdbcType=VARCHAR}");
        }
        
        if (record.getCreateTime() != null) {
            sql.SET("create_time = #{record.createTime,jdbcType=TIMESTAMP}");
        }
        
        applyWhere(sql, example, true);
        return sql.toString();
    }

    public String updateByExample(Map<String, Object> parameter) {
        SQL sql = new SQL();
        sql.UPDATE("davinci_statistic_terminal");
        
        sql.SET("id = #{record.id,jdbcType=BIGINT}");
        sql.SET("user_id = #{record.userId,jdbcType=BIGINT}");
        sql.SET("email = #{record.email,jdbcType=VARCHAR}");
        sql.SET("browser_name = #{record.browserName,jdbcType=VARCHAR}");
        sql.SET("browser_version = #{record.browserVersion,jdbcType=VARCHAR}");
        sql.SET("engine_name = #{record.engineName,jdbcType=VARCHAR}");
        sql.SET("engine_version = #{record.engineVersion,jdbcType=VARCHAR}");
        sql.SET("os_name = #{record.osName,jdbcType=VARCHAR}");
        sql.SET("os_version = #{record.osVersion,jdbcType=VARCHAR}");
        sql.SET("device_model = #{record.deviceModel,jdbcType=VARCHAR}");
        sql.SET("device_type = #{record.deviceType,jdbcType=VARCHAR}");
        sql.SET("device_vendor = #{record.deviceVendor,jdbcType=VARCHAR}");
        sql.SET("cpu_architecture = #{record.cpuArchitecture,jdbcType=VARCHAR}");
        sql.SET("create_time = #{record.createTime,jdbcType=TIMESTAMP}");
        
        DavinciStatisticTerminalExample example = (DavinciStatisticTerminalExample) parameter.get("example");
        applyWhere(sql, example, true);
        return sql.toString();
    }

    public String updateByPrimaryKeySelective(DavinciStatisticTerminal record) {
        SQL sql = new SQL();
        sql.UPDATE("davinci_statistic_terminal");
        
        if (record.getUserId() != null) {
            sql.SET("user_id = #{userId,jdbcType=BIGINT}");
        }
        
        if (record.getEmail() != null) {
            sql.SET("email = #{email,jdbcType=VARCHAR}");
        }
        
        if (record.getBrowserName() != null) {
            sql.SET("browser_name = #{browserName,jdbcType=VARCHAR}");
        }
        
        if (record.getBrowserVersion() != null) {
            sql.SET("browser_version = #{browserVersion,jdbcType=VARCHAR}");
        }
        
        if (record.getEngineName() != null) {
            sql.SET("engine_name = #{engineName,jdbcType=VARCHAR}");
        }
        
        if (record.getEngineVersion() != null) {
            sql.SET("engine_version = #{engineVersion,jdbcType=VARCHAR}");
        }
        
        if (record.getOsName() != null) {
            sql.SET("os_name = #{osName,jdbcType=VARCHAR}");
        }
        
        if (record.getOsVersion() != null) {
            sql.SET("os_version = #{osVersion,jdbcType=VARCHAR}");
        }
        
        if (record.getDeviceModel() != null) {
            sql.SET("device_model = #{deviceModel,jdbcType=VARCHAR}");
        }
        
        if (record.getDeviceType() != null) {
            sql.SET("device_type = #{deviceType,jdbcType=VARCHAR}");
        }
        
        if (record.getDeviceVendor() != null) {
            sql.SET("device_vendor = #{deviceVendor,jdbcType=VARCHAR}");
        }
        
        if (record.getCpuArchitecture() != null) {
            sql.SET("cpu_architecture = #{cpuArchitecture,jdbcType=VARCHAR}");
        }
        
        if (record.getCreateTime() != null) {
            sql.SET("create_time = #{createTime,jdbcType=TIMESTAMP}");
        }
        
        sql.WHERE("id = #{id,jdbcType=BIGINT}");
        
        return sql.toString();
    }

    protected void applyWhere(SQL sql, DavinciStatisticTerminalExample example, boolean includeExamplePhrase) {
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