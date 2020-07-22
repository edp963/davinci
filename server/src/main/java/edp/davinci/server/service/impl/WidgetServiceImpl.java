/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2020 EDP
 *  ==
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *        http://www.apache.org/licenses/LICENSE-2.0
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *  >>
 *
 */

package edp.davinci.server.service.impl;

import static edp.davinci.commons.Constants.EMPTY;
import static edp.davinci.server.util.ScriptUtils.getWidgetQueryParam;

import java.io.File;
import java.io.FileOutputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edp.davinci.commons.util.CollectionUtils;
import edp.davinci.commons.util.DateUtils;
import edp.davinci.commons.util.JSONUtils;
import edp.davinci.commons.util.StringUtils;
import edp.davinci.core.dao.entity.RelRoleView;
import edp.davinci.core.dao.entity.Source;
import edp.davinci.core.dao.entity.User;
import edp.davinci.core.dao.entity.Widget;
import edp.davinci.data.parser.ParserFactory;
import edp.davinci.data.parser.StatementParser;
import edp.davinci.data.pojo.Param;
import edp.davinci.data.pojo.SqlQueryParam;
import edp.davinci.server.dao.MemDashboardWidgetExtendMapper;
import edp.davinci.server.dao.MemDisplaySlideWidgetExtendMapper;
import edp.davinci.server.dao.RelRoleViewExtendMapper;
import edp.davinci.server.dao.ViewExtendMapper;
import edp.davinci.server.dao.WidgetExtendMapper;
import edp.davinci.server.dto.project.ProjectDetail;
import edp.davinci.server.dto.project.ProjectPermission;
import edp.davinci.server.dto.view.AuthParamValue;
import edp.davinci.server.dto.view.ViewWithProjectAndSource;
import edp.davinci.server.dto.view.ViewWithSource;
import edp.davinci.server.dto.view.WidgetDistinctParam;
import edp.davinci.server.dto.view.WidgetQueryParam;
import edp.davinci.server.dto.widget.WidgetCreate;
import edp.davinci.server.dto.widget.WidgetUpdate;
import edp.davinci.server.enums.CheckEntityEnum;
import edp.davinci.server.enums.FileTypeEnum;
import edp.davinci.server.enums.LogNameEnum;
import edp.davinci.server.enums.SqlVariableTypeEnum;
import edp.davinci.server.enums.SqlVariableValueTypeEnum;
import edp.davinci.server.enums.UserPermissionEnum;
import edp.davinci.server.exception.NotFoundException;
import edp.davinci.server.exception.ServerException;
import edp.davinci.server.exception.UnAuthorizedExecption;
import edp.davinci.server.model.PagingWithQueryColumns;
import edp.davinci.server.model.QueryColumn;
import edp.davinci.server.model.SqlVariable;
import edp.davinci.server.service.ProjectService;
import edp.davinci.server.service.ShareService;
import edp.davinci.server.service.ViewService;
import edp.davinci.server.service.WidgetService;
import edp.davinci.server.util.BaseLock;
import edp.davinci.server.util.CsvUtils;
import edp.davinci.server.util.ExcelUtils;
import edp.davinci.server.util.FileUtils;
import edp.davinci.server.util.ScriptUtils;
import edp.davinci.server.util.ServerUtils;
import lombok.extern.slf4j.Slf4j;


@Service("widgetService")
@Slf4j
public class WidgetServiceImpl extends BaseEntityService implements WidgetService {
    private static final Logger optLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_OPERATION.getName());

    @Autowired
    private WidgetExtendMapper widgetExtendMapper;

    @Autowired
    private ViewExtendMapper viewExtendMapper;

    @Autowired
    private MemDashboardWidgetExtendMapper memDashboardWidgetExtendMapper;

    @Autowired
    private MemDisplaySlideWidgetExtendMapper memDisplaySlideWidgetExtendMapper;

    @Autowired
    private RelRoleViewExtendMapper relRoleViewExtendMapper;

    @Autowired
    private ShareService shareService;

    @Autowired
    private ViewService viewService;

    @Autowired
    private FileUtils fileUtils;

    @Autowired
    private ServerUtils serverUtils;

    @Autowired
    private ProjectService projectService;
    
    private static final CheckEntityEnum entity = CheckEntityEnum.WIDGET; 

    @Override
    public boolean isExist(String name, Long id, Long projectId) {
        Long widgetId = widgetExtendMapper.getByNameWithProjectId(name, projectId);
        if (null != id && null != widgetId) {
            return !id.equals(widgetId);
        }
        return null != widgetId && widgetId.longValue() > 0L;
    }

    /**
     * 获取widgets列表
     *
     * @param projectId
     * @param user
     * @return
     */
    @Override
    public List<Widget> getWidgets(Long projectId, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

        ProjectDetail projectDetail = null;
        try {
            projectDetail = projectService.getProjectDetail(projectId, user, false);
        } catch (UnAuthorizedExecption e) {
            return null;
        }

        List<Widget> widgets = widgetExtendMapper.getByProject(projectId);

        if (null != widgets) {
            ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);
            if (projectPermission.getVizPermission() == UserPermissionEnum.HIDDEN.getPermission() &&
                    projectPermission.getWidgetPermission() == UserPermissionEnum.HIDDEN.getPermission()) {
                return null;
            }
        }

        return widgets;
    }


    /**
     * 获取单个widget信息
     *
     * @param id
     * @param user
     * @return
     */
    @Override
    public Widget getWidget(Long id, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

        Widget widget = widgetExtendMapper.selectByPrimaryKey(id);

        if (null == widget) {
            log.error("Widget({}) is not found", id);
            throw new NotFoundException("Widget is not found");
        }

        ProjectDetail projectDetail = projectService.getProjectDetail(widget.getProjectId(), user, false);
        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);
        if (projectPermission.getWidgetPermission() < UserPermissionEnum.READ.getPermission()) {
            throw new UnAuthorizedExecption();
        }

        return widget;
    }

    /**
     * 创建widget
     *
     * @param widgetCreate
     * @param user
     * @return
     */
    @Override
    @Transactional
    public Widget createWidget(WidgetCreate widgetCreate, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

        Long projectId = widgetCreate.getProjectId();
        checkWritePermission(entity, projectId, user, "create");

        String name = widgetCreate.getName();
        if (isExist(name, null, projectId)) {
            alertNameTaken(entity, name);
        }

        checkView(widgetCreate.getViewId());

        BaseLock lock = getLock(entity, name, projectId);

        if (lock != null && !lock.getLock()) {
            alertNameTaken(entity, name);
        }

        try {
            Widget widget = new Widget();
            widget.setPublish(false);
            widget.setCreateBy(user.getId());
            widget.setCreateTime(new Date());
            BeanUtils.copyProperties(widgetCreate, widget);

            insertWidget(widget);
            optLogger.info("Widget({}) is create by user({})", widget.getId(), user.getId());

            return widget;
        } finally {
            releaseLock(lock);
        }
    }
    
    @Transactional
	private void insertWidget(Widget widget) {
		if (widgetExtendMapper.insert(widget) <= 0) {
			throw new ServerException("Create widget fail");
		}
	}
    
    private void checkView(Long id) {
        if (null == viewExtendMapper.selectByPrimaryKey(id)) {
            log.error("View({}) is not found", id);
            throw new NotFoundException("View not found");
        }
    }

    /**
     * 修改widget
     *
     * @param widgetUpdate
     * @param user
     * @return
     */
    @Override
    @Transactional
    public boolean updateWidget(WidgetUpdate widgetUpdate, User user)
            throws NotFoundException, UnAuthorizedExecption, ServerException {

        Long id = widgetUpdate.getId();
        Widget widget = getWidget(id);

        Long projectId = widget.getProjectId();
        checkWritePermission(entity, projectId, user, "update");

        String name = widgetUpdate.getName();
        if (isExist(name, id, projectId)) {
            alertNameTaken(entity, name);
        }

        checkView(widget.getViewId());

        BaseLock lock = getLock(entity, name, projectId);

        if (lock != null && !lock.getLock()) {
            alertNameTaken(entity, name);
        }

        try {
            String originStr = widget.toString();
            BeanUtils.copyProperties(widgetUpdate, widget);
            widget.setUpdateBy(user.getId());
            widget.setUpdateTime(new Date());

            updateWidget(widget);
            optLogger.info("Widget({}) is updated by user({}), origin:{}", widget.getId(), user.getId(), originStr);

            return true;
        } finally {
            releaseLock(lock);
        }
    }
    
    @Transactional
	private void updateWidget(Widget widget) {
		if (widgetExtendMapper.update(widget) <= 0) {
			throw new ServerException("Update widget fail");
		}
	}

    private Widget getWidget(Long id) {
        Widget widget = widgetExtendMapper.selectByPrimaryKey(id);
        if (null == widget) {
            log.error("Widget({}) is not found", id);
            throw new NotFoundException("Widget is not found");
        }
        return widget;
    }

    /**
     * 删除widget
     *
     * @param id
     * @param user
     * @return
     */
    @Override
    @Transactional
    public boolean deleteWidget(Long id, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

        Widget widget = getWidget(id);

        checkDeletePermission(entity, widget.getProjectId(), user);

        memDashboardWidgetExtendMapper.deleteByWidget(id);
        memDisplaySlideWidgetExtendMapper.deleteByWidget(id);
        widgetExtendMapper.deleteByPrimaryKey(id);

        optLogger.info("Widget({}) is delete by user({})", widget.getId(), user.getId());
        return true;
    }


    /**
     * 共享widget
     *
     * @param id
     * @param user
     * @param username
     * @return
     */
    @Override
    public String shareWidget(Long id, User user, String username) throws NotFoundException, UnAuthorizedExecption, ServerException {
        
    	Widget widget = getWidget(id);
        checkSharePermission(entity, widget.getProjectId(), user);
        return shareService.generateShareToken(id, username, user.getId());
    }


    @Override
    public String generationFile(Long id, WidgetQueryParam executeParam, User user, String type) throws NotFoundException, ServerException, UnAuthorizedExecption {

        Widget widget = getWidget(id);

        ProjectDetail projectDetail = projectService.getProjectDetail(widget.getProjectId(), user, false);
        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);
        // 校验权限
        if (!projectPermission.getDownloadPermission()) {
            alertUnAuthorized(entity, user, "download");
        }

        executeParam.setPageNo(-1);
        executeParam.setPageSize(-1);
        executeParam.setLimit(-1);

        String rootPath = fileUtils.fileBasePath + File.separator + "download" + File.separator
                + DateUtils.dateFormat(new Date(), "yyyyMMdd") + File.separator + type + File.separator;

        String filePath = null;
        try {
            if (type.equals(FileTypeEnum.CSV.getType())) {
                ViewWithSource viewWithSource = viewExtendMapper.getViewWithSource(widget.getViewId());
                boolean maintainer = projectService.isMaintainer(projectDetail, user);
                PagingWithQueryColumns paging = viewService.getDataWithQueryColumns(maintainer, viewWithSource,
                        executeParam, user);
                List<QueryColumn> columns = paging.getColumns();
                if (!CollectionUtils.isEmpty(columns)) {
                    File file = new File(rootPath);
                    if (!file.exists()) {
                        file.mkdirs();
                    }

                    String csvName = widget.getName() + "_" + System.currentTimeMillis()
                            + UUID.randomUUID().toString().replace("-", EMPTY) + FileTypeEnum.CSV.getFormat();

                    filePath = CsvUtils.formatCsvWithFirstAsHeader(rootPath, csvName, columns, paging.getResultList());
                }
            } else if (type.equals(FileTypeEnum.XLSX.getType())) {

                String excelName = widget.getName() + "_" + System.currentTimeMillis()
                        + UUID.randomUUID().toString().replace("-", EMPTY) + FileTypeEnum.XLSX.getFormat();

                HashSet<Widget> widgets = new HashSet<>();
                widgets.add(widget);
                Map<Long, WidgetQueryParam> executeParamMap = new HashMap<>();
                executeParamMap.put(widget.getId(), executeParam);

                filePath = rootPath + excelName;
                writeExcel(widgets, projectDetail, executeParamMap, filePath, user, false);

            } else {
                throw new ServerException("Unknow file type");
            }
        } catch (Exception e) {
            throw new ServerException("Generation " + type + " error");
        }

        return serverUtils.getHost() + fileUtils.formatFilePath(filePath);
    }


    /**
     * widget列表数据写入指定excle文件
     *
     * @param widgets
     * @param projectDetail
     * @param queryParamMap
     * @param filePath
     * @param user
     * @param containType
     * @return
     * @throws Exception
     */
    public File writeExcel(Set<Widget> widgets,
                           ProjectDetail projectDetail, Map<Long, WidgetQueryParam> queryParamMap,
                           String filePath, User user, boolean containType) throws Exception {
 
        if (StringUtils.isEmpty(filePath)) {
            throw new ServerException("Excel file path is empty");
        }

        if (!filePath.trim().toLowerCase().endsWith(FileTypeEnum.XLSX.getFormat())) {
            throw new ServerException("Unknow file format");
        }

        SXSSFWorkbook wb = new SXSSFWorkbook(1000);
        ExecutorService executorService = Executors.newFixedThreadPool(Math.min(widgets.size(), 8));
        CountDownLatch countDownLatch = new CountDownLatch(widgets.size());
        int i = 1;
        boolean maintainer = projectService.isMaintainer(projectDetail, user);
        Iterator<Widget> iterator = widgets.iterator();
        while (iterator.hasNext()) {
            Widget widget = iterator.next();
            final String sheetName = widgets.size() == 1 ? "Sheet" : "Sheet" + (widgets.size() - (i - 1));
            executorService.execute(() -> {
                Sheet sheet = null;
                try {
                    ViewWithProjectAndSource viewWithProjectAndSource = viewExtendMapper
                            .getViewWithProjectAndSourceById(widget.getViewId());

                    WidgetQueryParam queryParam = null;
                    if (null != queryParamMap && queryParamMap.containsKey(widget.getId())) {
                        queryParam = queryParamMap.get(widget.getId());
                    } else {
                        queryParam = getWidgetQueryParam(null, widget.getConfig(), null);
                    }

                    PagingWithQueryColumns paging = viewService.getDataWithQueryColumns(maintainer,
                            viewWithProjectAndSource, queryParam, user);

                    sheet = wb.createSheet(sheetName);
                    ExcelUtils.writeSheet(sheet, paging.getColumns(), paging.getResultList(), wb, containType,
                            widget.getConfig(), queryParam.getParams());
                } catch (Exception e) {
                    log.error(e.getMessage(), e);
                } finally {
                    sheet = null;
                    countDownLatch.countDown();
                }
            });

            i++;
        }

        countDownLatch.await();
        executorService.shutdown();

        File file = new File(filePath);
        File dir = new File(file.getParent());
        if (!dir.exists()) {
            dir.mkdirs();
        }

        try (FileOutputStream out = new FileOutputStream(filePath);) {
            wb.write(out);
            out.flush();
        } catch (Exception e) {
            // ignore
        }
        return file;
    }
}
