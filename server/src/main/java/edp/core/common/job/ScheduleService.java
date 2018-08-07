package edp.core.common.job;


/**
 * 通用schedule调度接口，业务层必须实现
 *    命名格式为{jobType}ScheduleService
 *      如： emailScheduleService
 */
public interface ScheduleService {

    void execute(long jobId) throws Exception;
}
