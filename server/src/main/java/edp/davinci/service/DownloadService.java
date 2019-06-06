package edp.davinci.service;

import edp.davinci.core.enums.DownloadType;
import edp.davinci.model.DownloadRecord;
import edp.davinci.model.User;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 *
 * @Author daemon
 * @Date 19/5/28 09:44
 * To change this template use File | Settings | File Templates.
 */
public interface DownloadService {


    /**
     * 获取下载列表
     * @param userId
     * @return
     */
    public List<DownloadRecord> queryDownloadRecordPage(Long userId);


    /**
     * 下载
     * @param id
     * @param token
     * @return
     */
    public DownloadRecord downloadById(Long id, String token);


    /**
     * 提交下载任务
     * @param type
     * @param id
     * @param user
     * @return
     */
    public Boolean submit(DownloadType type, Long id, User user);
}
