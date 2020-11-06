package edp.davinci.core.model;

import com.alibaba.fastjson.JSONArray;
import edp.core.consts.Consts;
import edp.davinci.core.enums.SqlOperatorEnum;
import lombok.Data;
import org.apache.commons.lang.StringUtils;

import java.util.List;
import java.util.regex.Pattern;

@Data
public class SqlFilter {

    private String name;

    private String type;

    private Object value;

    private String sqlType;

    private String operator;

    private List<SqlFilter> children;

    private static String pattern = "^'.*?'$";

    public static class Type {
        public static final String filter = "filter";
        public static final String relation = "relation";
        public static final String and = "and";
        public static final String or = "or";
    }

    public enum NumericDataType {
        TINYINT("TINYINT"),
        SMALLINT("SMALLINT"),
        MEDIUMINT("MEDIUMINT"),
        INT("INT"),
        INTEGER("INTEGER"),
        BIGINT("BIGINT"),
        FLOAT("FLOAT"),
        DOUBLE("DOUBLE"),
        DECIMAL("DECIMAL"),
        NUMERIC("NUMERIC");

        private String type;

        NumericDataType(String type) {
            this.type = type;
        }

        public String getType() {
            return type;
        }
    }

    public static String dealFilter(SqlFilter filter){
        StringBuilder condition = new StringBuilder();
        String type = filter.getType();

        if(Type.filter.equalsIgnoreCase(type)){
            condition.append(dealOperator(filter));
        }

        if(Type.relation.equalsIgnoreCase(type)){
            List<SqlFilter> children = filter.getChildren();
            condition.append(Consts.PARENTHESES_START);
            for(int i=0; i<children.size(); i++){
                condition.append(i == 0 ? dealFilter(children.get(i)) : Consts.SPACE + filter.getValue().toString() + Consts.SPACE + dealFilter(children.get(i)));
            }
            condition.append(Consts.PARENTHESES_END);
        }

        return condition.toString();
    }

    private static String dealOperator(SqlFilter filter){
        String name     = filter.getName();
        Object value    = filter.getValue();
        String operator = filter.getOperator();
        String sqlType  = filter.getSqlType();

        Criterion criterion;
        if(SqlOperatorEnum.BETWEEN.getValue().equalsIgnoreCase(operator)){
            JSONArray values = (JSONArray) value;
            criterion = new Criterion(name, operator, values.get(0), values.get(1), sqlType);
        }else{
            criterion = new Criterion(name, operator, value, sqlType);
        }

        return generator(criterion);
    }

    private static String generator(Criterion criterion){

        StringBuilder whereClause = new StringBuilder();

        if(criterion.isSingleValue()){
            //column='value'
            String value = criterion.getValue().toString();

            if (SqlOperatorEnum.LIKE.getValue().equalsIgnoreCase(criterion.getOperator()) ||
                    SqlOperatorEnum.NOTLIKE.getValue().equalsIgnoreCase(criterion.getOperator())) {
                value = value.substring(1, value.length() - 1);
                value = "'%" + value + "%'";
            }

            whereClause.append(criterion.getColumn() + Consts.SPACE + criterion.getOperator() + Consts.SPACE);
            if(criterion.isNeedApostrophe() && !Pattern.matches(pattern, value)){
                whereClause.append(Consts.APOSTROPHE + value + Consts.APOSTROPHE);
            }else{
                whereClause.append(value);
            }

        }else if(criterion.isBetweenValue()){
            //column>='' and column<=''
            String value = criterion.getValue().toString();

            whereClause.append(Consts.PARENTHESES_START);
            whereClause.append(criterion.getColumn()+ Consts.SPACE + SqlOperatorEnum.GREATERTHANEQUALS.getValue() + Consts.SPACE);
            if(criterion.isNeedApostrophe() && !Pattern.matches(pattern, value)){
                whereClause.append(Consts.APOSTROPHE + value + Consts.APOSTROPHE);
            }else{
                whereClause.append(value);
            }

            whereClause.append(Consts.SPACE + SqlFilter.Type.and + Consts.SPACE);
            whereClause.append(criterion.getColumn()+ Consts.SPACE + SqlOperatorEnum.MINORTHANEQUALS.getValue() + Consts.SPACE);
            String secondValue = criterion.getSecondValue().toString();
            if(criterion.isNeedApostrophe() && !Pattern.matches(pattern, secondValue)){
                whereClause.append(Consts.APOSTROPHE + secondValue + Consts.APOSTROPHE);
            }else{
                whereClause.append(secondValue);
            }

            whereClause.append(Consts.PARENTHESES_END);

        }else if(criterion.isListValue()){
            List values = (List) criterion.getValue();
            //column in ()
            whereClause.append(criterion.getColumn() + Consts.SPACE + criterion.getOperator() + Consts.SPACE);
            whereClause.append(Consts.PARENTHESES_START);
            if(criterion.isNeedApostrophe() && !Pattern.matches(pattern, values.get(0).toString())){
                whereClause.append(Consts.APOSTROPHE +
                        StringUtils.join(values,Consts.APOSTROPHE + Consts.COMMA + Consts.APOSTROPHE) +
                        Consts.APOSTROPHE);
            }else{
                whereClause.append(StringUtils.join(values, Consts.COMMA));
            }
            whereClause.append(Consts.PARENTHESES_END);
        }

        return whereClause.toString();
    }
}
