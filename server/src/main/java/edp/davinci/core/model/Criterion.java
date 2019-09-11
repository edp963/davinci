package edp.davinci.core.model;

import lombok.Data;

import java.util.Arrays;
import java.util.List;

@Data
public class Criterion {

    private String column;

    private String operator;

    private Object value;

    private String dataType;

    private Object secondValue;

    private boolean noValue;

    private boolean singleValue;

    private boolean betweenValue;

    private boolean listValue;


    public Criterion(String column, String operator, Object value, String dataType) {
        super();
        this.column = column;
        this.operator = operator;
        this.value = value;
        this.dataType = dataType;
        if (value instanceof List<?>) {
            this.listValue = true;
        } else {
            this.singleValue = true;
        }
    }

    public Criterion(String column, String operator, Object value, Object secondValue, String dataType) {
        super();
        this.column = column;
        this.operator = operator;
        this.value = value;
        this.dataType = dataType;
        this.secondValue = secondValue;
        this.betweenValue = true;
    }

    public boolean isNeedApostrophe(){
        return !Arrays.stream(SqlFilter.NumericDataType.values())
                .filter(value -> this.dataType.equalsIgnoreCase(value.getType())).findFirst()
                .isPresent();
    }


}
