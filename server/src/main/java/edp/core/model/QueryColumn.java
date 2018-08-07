package edp.core.model;

import lombok.Data;

@Data
public class QueryColumn {
    private String name;
    private String type;

    public QueryColumn(String name, String type) {
        this.name = name;
        this.type = type;
    }
}
