package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.Platform;
import edp.davinci.core.dao.entity.PlatformExample.Criteria;
import edp.davinci.core.dao.entity.PlatformExample.Criterion;
import edp.davinci.core.dao.entity.PlatformExample;
import java.util.List;
import java.util.Map;
import org.apache.ibatis.jdbc.SQL;

public class PlatformSqlProvider {

    public String countByExample(PlatformExample example) {
        SQL sql = new SQL();
        sql.SELECT("count(*)").FROM("platform");
        applyWhere(sql, example, false);
        return sql.toString();
    }

    public String deleteByExample(PlatformExample example) {
        SQL sql = new SQL();
        sql.DELETE_FROM("platform");
        applyWhere(sql, example, false);
        return sql.toString();
    }

    public String insertSelective(Platform record) {
        SQL sql = new SQL();
        sql.INSERT_INTO("platform");
        
        if (record.getId() != null) {
            sql.VALUES("id", "#{id,jdbcType=BIGINT}");
        }
        
        if (record.getName() != null) {
            sql.VALUES("`name`", "#{name,jdbcType=VARCHAR}");
        }
        
        if (record.getPlatform() != null) {
            sql.VALUES("platform", "#{platform,jdbcType=VARCHAR}");
        }
        
        if (record.getCode() != null) {
            sql.VALUES("code", "#{code,jdbcType=VARCHAR}");
        }
        
        if (record.getCheckCode() != null) {
            sql.VALUES("checkCode", "#{checkCode,jdbcType=VARCHAR}");
        }
        
        if (record.getCheckSystemToken() != null) {
            sql.VALUES("checkSystemToken", "#{checkSystemToken,jdbcType=VARCHAR}");
        }
        
        if (record.getCheckUrl() != null) {
            sql.VALUES("checkUrl", "#{checkUrl,jdbcType=VARCHAR}");
        }
        
        if (record.getAlternateField1() != null) {
            sql.VALUES("alternateField1", "#{alternateField1,jdbcType=VARCHAR}");
        }
        
        if (record.getAlternateField2() != null) {
            sql.VALUES("alternateField2", "#{alternateField2,jdbcType=VARCHAR}");
        }
        
        if (record.getAlternateField3() != null) {
            sql.VALUES("alternateField3", "#{alternateField3,jdbcType=VARCHAR}");
        }
        
        if (record.getAlternateField4() != null) {
            sql.VALUES("alternateField4", "#{alternateField4,jdbcType=VARCHAR}");
        }
        
        if (record.getAlternateField5() != null) {
            sql.VALUES("alternateField5", "#{alternateField5,jdbcType=VARCHAR}");
        }
        
        return sql.toString();
    }

    public String selectByExample(PlatformExample example) {
        SQL sql = new SQL();
        if (example != null && example.isDistinct()) {
            sql.SELECT_DISTINCT("id");
        } else {
            sql.SELECT("id");
        }
        sql.SELECT("`name`");
        sql.SELECT("platform");
        sql.SELECT("code");
        sql.SELECT("checkCode");
        sql.SELECT("checkSystemToken");
        sql.SELECT("checkUrl");
        sql.SELECT("alternateField1");
        sql.SELECT("alternateField2");
        sql.SELECT("alternateField3");
        sql.SELECT("alternateField4");
        sql.SELECT("alternateField5");
        sql.FROM("platform");
        applyWhere(sql, example, false);
        
        if (example != null && example.getOrderByClause() != null) {
            sql.ORDER_BY(example.getOrderByClause());
        }
        
        return sql.toString();
    }

    public String updateByExampleSelective(Map<String, Object> parameter) {
        Platform record = (Platform) parameter.get("record");
        PlatformExample example = (PlatformExample) parameter.get("example");
        
        SQL sql = new SQL();
        sql.UPDATE("platform");
        
        if (record.getId() != null) {
            sql.SET("id = #{record.id,jdbcType=BIGINT}");
        }
        
        if (record.getName() != null) {
            sql.SET("`name` = #{record.name,jdbcType=VARCHAR}");
        }
        
        if (record.getPlatform() != null) {
            sql.SET("platform = #{record.platform,jdbcType=VARCHAR}");
        }
        
        if (record.getCode() != null) {
            sql.SET("code = #{record.code,jdbcType=VARCHAR}");
        }
        
        if (record.getCheckCode() != null) {
            sql.SET("checkCode = #{record.checkCode,jdbcType=VARCHAR}");
        }
        
        if (record.getCheckSystemToken() != null) {
            sql.SET("checkSystemToken = #{record.checkSystemToken,jdbcType=VARCHAR}");
        }
        
        if (record.getCheckUrl() != null) {
            sql.SET("checkUrl = #{record.checkUrl,jdbcType=VARCHAR}");
        }
        
        if (record.getAlternateField1() != null) {
            sql.SET("alternateField1 = #{record.alternateField1,jdbcType=VARCHAR}");
        }
        
        if (record.getAlternateField2() != null) {
            sql.SET("alternateField2 = #{record.alternateField2,jdbcType=VARCHAR}");
        }
        
        if (record.getAlternateField3() != null) {
            sql.SET("alternateField3 = #{record.alternateField3,jdbcType=VARCHAR}");
        }
        
        if (record.getAlternateField4() != null) {
            sql.SET("alternateField4 = #{record.alternateField4,jdbcType=VARCHAR}");
        }
        
        if (record.getAlternateField5() != null) {
            sql.SET("alternateField5 = #{record.alternateField5,jdbcType=VARCHAR}");
        }
        
        applyWhere(sql, example, true);
        return sql.toString();
    }

    public String updateByExample(Map<String, Object> parameter) {
        SQL sql = new SQL();
        sql.UPDATE("platform");
        
        sql.SET("id = #{record.id,jdbcType=BIGINT}");
        sql.SET("`name` = #{record.name,jdbcType=VARCHAR}");
        sql.SET("platform = #{record.platform,jdbcType=VARCHAR}");
        sql.SET("code = #{record.code,jdbcType=VARCHAR}");
        sql.SET("checkCode = #{record.checkCode,jdbcType=VARCHAR}");
        sql.SET("checkSystemToken = #{record.checkSystemToken,jdbcType=VARCHAR}");
        sql.SET("checkUrl = #{record.checkUrl,jdbcType=VARCHAR}");
        sql.SET("alternateField1 = #{record.alternateField1,jdbcType=VARCHAR}");
        sql.SET("alternateField2 = #{record.alternateField2,jdbcType=VARCHAR}");
        sql.SET("alternateField3 = #{record.alternateField3,jdbcType=VARCHAR}");
        sql.SET("alternateField4 = #{record.alternateField4,jdbcType=VARCHAR}");
        sql.SET("alternateField5 = #{record.alternateField5,jdbcType=VARCHAR}");
        
        PlatformExample example = (PlatformExample) parameter.get("example");
        applyWhere(sql, example, true);
        return sql.toString();
    }

    public String updateByPrimaryKeySelective(Platform record) {
        SQL sql = new SQL();
        sql.UPDATE("platform");
        
        if (record.getName() != null) {
            sql.SET("`name` = #{name,jdbcType=VARCHAR}");
        }
        
        if (record.getPlatform() != null) {
            sql.SET("platform = #{platform,jdbcType=VARCHAR}");
        }
        
        if (record.getCode() != null) {
            sql.SET("code = #{code,jdbcType=VARCHAR}");
        }
        
        if (record.getCheckCode() != null) {
            sql.SET("checkCode = #{checkCode,jdbcType=VARCHAR}");
        }
        
        if (record.getCheckSystemToken() != null) {
            sql.SET("checkSystemToken = #{checkSystemToken,jdbcType=VARCHAR}");
        }
        
        if (record.getCheckUrl() != null) {
            sql.SET("checkUrl = #{checkUrl,jdbcType=VARCHAR}");
        }
        
        if (record.getAlternateField1() != null) {
            sql.SET("alternateField1 = #{alternateField1,jdbcType=VARCHAR}");
        }
        
        if (record.getAlternateField2() != null) {
            sql.SET("alternateField2 = #{alternateField2,jdbcType=VARCHAR}");
        }
        
        if (record.getAlternateField3() != null) {
            sql.SET("alternateField3 = #{alternateField3,jdbcType=VARCHAR}");
        }
        
        if (record.getAlternateField4() != null) {
            sql.SET("alternateField4 = #{alternateField4,jdbcType=VARCHAR}");
        }
        
        if (record.getAlternateField5() != null) {
            sql.SET("alternateField5 = #{alternateField5,jdbcType=VARCHAR}");
        }
        
        sql.WHERE("id = #{id,jdbcType=BIGINT}");
        
        return sql.toString();
    }

    protected void applyWhere(SQL sql, PlatformExample example, boolean includeExamplePhrase) {
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