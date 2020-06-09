package edp.davinci.dto.logDto;

import com.alibaba.fastjson.annotation.JSONField;
import com.alibaba.fastjson.annotation.JSONType;
import lombok.Data;

/**
 * @Author : bogeli
 * @Description :
 * @Date : Created in 2020/5/7
 */
@Data
@JSONType(orders = {"fieldName","oldValue","newValue"})
public class TableField {
    private String fieldName;
	@JSONField(jsonDirect = true)
    private Object oldValue;
	@JSONField(jsonDirect = true)
    private Object newValue;

    public TableField(String fieldName, Object oldValue, Object newValue) {
        this.fieldName = fieldName;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }
}
