package edp.davinci.data.pojo;

import edp.davinci.commons.util.JSONUtils;
import lombok.Data;

import java.util.List;

@Data
public class Filter {

    public static final String TYPE_FILTER = "filter";
    public static final String TYPE_RELATION = "relation";
    public static final String TYPE_AND = "and";
    public static final String TYPE_OR = "or";

    private String name;

    private String type;

    private Object value;

    private String sqlType;

    private String operator;

    private List<Filter> children;

    public Filter() {

    }

    /**
     * for json deserialization
     *
     * @param filterStr
     */
    public Filter(String filterStr) {
        Filter f = JSONUtils.toObject(filterStr, Filter.class);
        this.name = f.getName();
        this.type = f.getType();
        this.value = f.getValue();
        this.sqlType = f.getSqlType();
        this.operator = f.getOperator();
        this.children = f.getChildren();
    }
}
