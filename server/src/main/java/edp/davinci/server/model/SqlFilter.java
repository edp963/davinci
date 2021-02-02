package edp.davinci.server.model;

import edp.davinci.server.enums.SqlOperatorEnum;
import lombok.Data;
import org.apache.commons.lang.StringUtils;

import java.util.List;
import java.util.regex.Pattern;

import static edp.davinci.commons.Constants.*;

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
            condition.append(PARENTHESES_START);
            for(int i=0; i<children.size(); i++){
                condition.append(i == 0 ? dealFilter(children.get(i)) : SPACE + filter.getValue().toString() + SPACE + dealFilter(children.get(i)));
            }
            condition.append(PARENTHESES_CLOSE);
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
            List values = (List) value;
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

            whereClause.append(criterion.getColumn() + SPACE + criterion.getOperator() + SPACE);
            if(criterion.isNeedApostrophe() && !Pattern.matches(pattern, value)){
                whereClause.append(SINGLE_QUOTES + value + SINGLE_QUOTES);
            }else{
                whereClause.append(value);
            }

        }else if(criterion.isBetweenValue()){
            // column>='' and column<=''
            String value = criterion.getValue().toString();
            whereClause.append(PARENTHESES_START);
            whereClause.append(criterion.getColumn()+ SPACE + SqlOperatorEnum.GREATERTHANEQUALS.getValue() + SPACE);
            if(criterion.isNeedApostrophe() && !Pattern.matches(pattern, value)){
                whereClause.append(SINGLE_QUOTES + value + SINGLE_QUOTES);
            }else{
                whereClause.append(value);
            }
            whereClause.append(SPACE + SqlFilter.Type.and + SPACE);
            whereClause.append(criterion.getColumn()+ SPACE + SqlOperatorEnum.MINORTHANEQUALS.getValue() + SPACE);
            value = criterion.getSecondValue().toString();
            if(criterion.isNeedApostrophe() && !Pattern.matches(pattern, value)){
                whereClause.append(SINGLE_QUOTES + value + SINGLE_QUOTES);
            }else{
                whereClause.append(value);
            }
            whereClause.append(PARENTHESES_CLOSE);

        }else if(criterion.isListValue()){
            List values = (List) criterion.getValue();
            whereClause.append(criterion.getColumn() + SPACE + criterion.getOperator() + SPACE);
            whereClause.append(PARENTHESES_START);
            if(criterion.isNeedApostrophe() && !Pattern.matches(pattern, values.get(0).toString())){
                whereClause.append(SINGLE_QUOTES +
                        StringUtils.join(values,SINGLE_QUOTES + COMMA + SINGLE_QUOTES) +
                        SINGLE_QUOTES);
            }else{
                whereClause.append(StringUtils.join(values, COMMA));
            }
            whereClause.append(PARENTHESES_CLOSE);
        }
        return whereClause.toString();
    }

}
