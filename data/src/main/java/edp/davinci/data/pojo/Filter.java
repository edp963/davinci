package edp.davinci.data.pojo;

import java.util.List;

import lombok.Data;

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
}
