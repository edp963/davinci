package edp.davinci.dto.logDto;

import com.alibaba.fastjson.annotation.JSONField;
import com.alibaba.fastjson.annotation.JSONType;
import edp.davinci.core.enums.OperateTypeEnum;
import lombok.Data;
import java.util.*;

/**
 * @Author : bogeli
 * @Description :
 * @Date : Created in 2020/4/22
 */
@Data
@JSONType(orders = {"operatorId","operate","operationLogDetails"})
public class OperationLog {

	private Long operatorId;
    private String operate;
    private List<OperationLogDetail> operationLogDetails = new ArrayList<>();

    public OperationLog(OperateTypeEnum operationTypeEnum,Long operatorId ) {
        this.operate = operationTypeEnum.getOperate();
        this.operatorId = operatorId;
    }

    public void addOperationLogDetail(OperationLogDetail operationLogDetail) {
        this.operationLogDetails.add(operationLogDetail);
    }


}