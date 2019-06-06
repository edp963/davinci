package edp.davinci.service.impl;

import com.alibaba.druid.util.StringUtils;
import com.google.common.collect.Lists;
import edp.core.exception.UnAuthorizedExecption;
import edp.core.utils.CollectionUtils;
import edp.core.utils.TokenUtils;
import edp.davinci.core.enums.ActionEnum;
import edp.davinci.core.enums.DownloadType;
import edp.davinci.dao.*;
import edp.davinci.dto.projectDto.ProjectDetail;
import edp.davinci.dto.projectDto.ProjectPermission;
import edp.davinci.model.*;
import edp.davinci.service.DownloadService;
import edp.davinci.service.ProjectService;
import edp.davinci.service.excel.ExecutorUtil;
import edp.davinci.service.excel.MsgWrapper;
import edp.davinci.service.excel.WidgetContext;
import edp.davinci.service.excel.WorkBookContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;


/**
 * Created by IntelliJ IDEA.
 *
 * @Author daemon
 * @Date 19/5/28 10:04
 * To change this template use File | Settings | File Templates.
 */
@Service
@Slf4j
public class DownloadServiceImpl implements DownloadService {

    @Autowired
    private DownloadRecordMapper downloadRecordMapper;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private WidgetMapper widgetMapper;

    @Autowired
    private MemDashboardWidgetMapper memDashboardWidgetMapper;

    @Autowired
    private DashboardMapper dashboardMapper;

    @Autowired
    private TokenUtils tokenUtils;

    @Autowired
    private UserMapper userMapper;

    @Override
    public List<DownloadRecord> queryDownloadRecordPage(Long userId) {
        return downloadRecordMapper.getDownloadRecordsByUser(userId);
    }

    @Override
    public DownloadRecord downloadById(Long id, String token) throws UnAuthorizedExecption {
        if (StringUtils.isEmpty(token)) {
            throw new UnAuthorizedExecption();
        }

        String username = tokenUtils.getUsername(token);
        if (StringUtils.isEmpty(username)) {
            throw new UnAuthorizedExecption();
        }

        User user = userMapper.selectByUsername(username);
        if (null == user) {
            throw new UnAuthorizedExecption();
        }

        DownloadRecord record = downloadRecordMapper.getById(id);

        if (!record.getUserId().equals(user.getId())) {
            throw new UnAuthorizedExecption();
        }

        record.setLastDownloadTime(new Date());
        downloadRecordMapper.updateById(record);
        return record;
    }

    @Override
    public Boolean submit(DownloadType type, Long id, User user) {
        try {
            List<WidgetContext> widgetList = Lists.newArrayList();
            switch (type) {
                case Widget:
                    Widget widget = widgetMapper.getById(id);
                    if (widget != null) {
                        widgetList.add(new WidgetContext(widget, null, null));
                    }
                    break;
                case DashBoard:
                    List<WidgetContext> widgets = getWidgetContextListByDashBoardId(Lists.newArrayList(id));
                    if (!CollectionUtils.isEmpty(widgets)) {
                        widgetList.addAll(widgets);
                    }
                    break;
                case DashBoardFolder:
                    List<WidgetContext> widgets1 = getWidgetContextListByFolderDashBoardId(id);
                    if (!CollectionUtils.isEmpty(widgets1)) {
                        widgetList.addAll(widgets1);
                    }
                    break;
                default:
                    throw new IllegalArgumentException("unsupported DownloadType=" + type.name());
            }
            if (CollectionUtils.isEmpty(widgetList)) {
                throw new IllegalArgumentException("has no widget to download");
            }
            for (WidgetContext context : widgetList) {
                ProjectDetail projectDetail = projectService.getProjectDetail(context.getWidget().getProjectId(), user, false);
                ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);
                //校验权限
                if (!projectPermission.getDownloadPermission()) {
                    log.info("user {} have not permisson to download the widget {}", user.getUsername(), id);
                    throw new UnAuthorizedExecption("you have not permission to download the widget");
                }
                context.setMaintainer(projectService.isMaintainer(projectDetail, user));
            }
            String fileName;
            switch (type) {
                case Widget:
                    Widget widget = widgetMapper.getById(id);
                    fileName = widget.getName();
                    break;
                case DashBoard:
                case DashBoardFolder:
                    Dashboard dashboard = dashboardMapper.getById(id);
                    fileName = dashboard.getName();
                    break;
                default:
                    throw new IllegalArgumentException("unsupported DownloadType=" + type.name());
            }
            DownloadRecord record = new DownloadRecord();
            record.setName(fileName);
            record.setUserId(user.getId());
            record.setCreateTime(new Date());
            record.setStatus((short) 1);
            downloadRecordMapper.insert(record);
            ExecutorUtil.submitWorkbookTask(WorkBookContext.newWorkBookContext(new MsgWrapper(record, ActionEnum.DOWNLOAD, record.getId()), widgetList, user));
        } catch (Exception e) {
            log.error("submit download task error,e=", e);
            return false;
        }
        return true;
    }


    private List<WidgetContext> getWidgetContextListByDashBoardId(List<Long> dashboardIds) {
        List<WidgetContext> widgetList = Lists.newArrayList();
        if (CollectionUtils.isEmpty(dashboardIds)) {
            return widgetList;
        }
        for (Long dashboardId : dashboardIds) {
            if (dashboardId == null || dashboardId.longValue() <= 0) {
                continue;
            }
            Dashboard dashboard = dashboardMapper.getById(dashboardId);
            if (dashboard == null) {
                continue;
            }
            List<MemDashboardWidget> mdw = memDashboardWidgetMapper.getByDashboardId(dashboardId);
            if (CollectionUtils.isEmpty(mdw)) {
                continue;
            }
            Set<Long> widgetIds = mdw.stream().filter(y -> y != null).map(y -> y.getWidgetId()).collect(Collectors.toSet());
            List<Widget> widgets = widgetMapper.getByIds(widgetIds);
            if (!CollectionUtils.isEmpty(widgets)) {
                Map<Long, MemDashboardWidget> map = mdw.stream().collect(Collectors.toMap(o -> o.getWidgetId(), o -> o));
                widgets.stream().forEach(t -> {
                    widgetList.add(new WidgetContext(t, dashboard, map.get(t.getId())));
                });
            }
        }
        return widgetList;
    }

    private List<WidgetContext> getWidgetContextListByFolderDashBoardId(Long id) {
        List<WidgetContext> widgetList = Lists.newArrayList();
        if (id == null || id.longValue() < 0L) {
            return widgetList;
        }
        List<Dashboard> dashboardList = dashboardMapper.getSubDashboardById(id);
        if (CollectionUtils.isEmpty(dashboardList)) {
            return widgetList;
        }
        List<Long> dashboardIds = dashboardList.stream().filter(x -> x != null).map(x -> x.getId()).collect(Collectors.toList());
        if (CollectionUtils.isEmpty(dashboardIds)) {
            return widgetList;
        }
        return getWidgetContextListByDashBoardId(dashboardIds);
    }


}
