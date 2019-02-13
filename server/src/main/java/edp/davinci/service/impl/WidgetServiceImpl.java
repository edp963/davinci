/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2018 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *       http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 * >>
 */

package edp.davinci.service.impl;

import com.alibaba.druid.util.StringUtils;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import edp.core.enums.HttpCodeEnum;
import edp.core.exception.ServerException;
import edp.core.model.Paginate;
import edp.core.model.QueryColumn;
import edp.core.utils.FileUtils;
import edp.core.utils.TokenUtils;
import edp.davinci.common.service.CommonService;
import edp.davinci.core.common.ResultMap;
import edp.davinci.core.enums.FileTypeEnum;
import edp.davinci.core.enums.UserOrgRoleEnum;
import edp.davinci.core.enums.UserPermissionEnum;
import edp.davinci.core.enums.UserTeamRoleEnum;
import edp.davinci.core.utils.CsvUtils;
import edp.davinci.core.utils.ExcelUtils;
import edp.davinci.dao.*;
import edp.davinci.dto.projectDto.ProjectWithOrganization;
import edp.davinci.dto.viewDto.Aggregator;
import edp.davinci.dto.viewDto.Order;
import edp.davinci.dto.viewDto.ViewExecuteParam;
import edp.davinci.dto.viewDto.ViewWithProjectAndSource;
import edp.davinci.dto.widgetDto.WidgetCreate;
import edp.davinci.dto.widgetDto.WidgetUpdate;
import edp.davinci.dto.widgetDto.WidgetWithProjectAndView;
import edp.davinci.model.*;
import edp.davinci.service.ShareService;
import edp.davinci.service.ViewService;
import edp.davinci.service.WidgetService;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.FileOutputStream;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service("widgetService")
@Slf4j
public class WidgetServiceImpl extends CommonService<Widget> implements WidgetService {

    @Autowired
    private WidgetMapper widgetMapper;

    @Autowired
    private TokenUtils tokenUtils;

    @Autowired
    private ProjectMapper projectMapper;

    @Autowired
    private ViewMapper viewMapper;

    @Autowired
    private MemDashboardWidgetMapper memDashboardWidgetMapper;

    @Autowired
    private MemDisplaySlideWidgetMapper memDisplaySlideWidgetMapper;

    @Autowired
    private ShareService shareService;

    @Autowired
    private ViewService viewService;

    @Autowired
    private FileUtils fileUtils;

    @Override
    public synchronized boolean isExist(String name, Long id, Long projectId) {
        Long widgetId = widgetMapper.getByNameWithProjectId(name, projectId);
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
     * @param request
     * @return
     */
    @Override
    public ResultMap getWidgets(Long projectId, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        ProjectWithOrganization projectWithOrganization = projectMapper.getProjectWithOrganization(projectId);

        if (null == projectWithOrganization) {
            log.info("project {} not found", projectId);
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        if (!allowRead(projectWithOrganization, user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED);
        }

        List<Widget> widgets = widgetMapper.getByProject(projectId);

        if (null != widgets && widgets.size() > 0) {

            //获取当前用户在organization的role
            RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), projectWithOrganization.getOrgId());

            //当前用户是project的创建者和organization的owner，直接返回
            if (!isProjectAdmin(projectWithOrganization, user) && (null == orgRel || orgRel.getRole() == UserOrgRoleEnum.MEMBER.getRole())) {
                Integer teamNumOfOrgByUser = relUserTeamMapper.getTeamNumOfOrgByUser(projectWithOrganization.getOrgId(), user.getId());
                if (teamNumOfOrgByUser > 0) {
                    //查询project所属team中当前用户最高角色
                    short maxTeamRole = relUserTeamMapper.getUserMaxRoleWithProjectId(projectId, user.getId());

                    //如果当前用户是team的matainer 全部返回，否则验证 当前用户team对project的权限
                    if (maxTeamRole == UserTeamRoleEnum.MEMBER.getRole()) {

                        short maxVizPermission = relTeamProjectMapper.getMaxVizPermission(projectId, user.getId());
                        //查询当前用户在的 project所属team对project view的最高权限
                        short maxWidgetPermission = relTeamProjectMapper.getMaxWidgetPermission(projectId, user.getId());

                        short permission = (short) Math.max(maxVizPermission, maxWidgetPermission);

                        if (permission == UserPermissionEnum.HIDDEN.getPermission()) {
                            //隐藏
                            widgets = null;
                        } else if (permission == UserPermissionEnum.READ.getPermission()) {
                            //只读, remove未发布的
                            Iterator<Widget> iterator = widgets.iterator();
                            while (iterator.hasNext()) {
                                Widget widget = iterator.next();
                                if (!widget.getPublish()) {
                                    iterator.remove();
                                }
                            }
                        }
                    }
                } else {
                    Organization organization = projectWithOrganization.getOrganization();
                    if (organization.getMemberPermission() < UserPermissionEnum.READ.getPermission()) {
                        widgets = null;
                    }
                }
            }
        }

        return resultMap.successAndRefreshToken(request).payloads(widgets);
    }


    /**
     * 获取单个widget信息
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap getWidget(Long id, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        WidgetWithProjectAndView widgetWithProjectAndView = widgetMapper.getWidgetWithProjectAndViewById(id);

        if (null == widgetWithProjectAndView) {
            log.info("widget {} not found", id);
            return resultMap.failAndRefreshToken(request).message("widget is not found");
        }

        if (!allowRead(widgetWithProjectAndView.getProject(), user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED);
        }

        Widget widget = new Widget();
        BeanUtils.copyProperties(widgetWithProjectAndView, widget);

        return resultMap.successAndRefreshToken(request).payload(widget);
    }

    /**
     * 创建widget
     *
     * @param widgetCreate
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap createWidget(WidgetCreate widgetCreate, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Project project = projectMapper.getById(widgetCreate.getProjectId());
        if (null == project) {
            log.info("project (:{}) not found", widgetCreate.getProjectId());
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //校验权限
        if (!allowWrite(project, user)) {
            log.info("user {} have not permisson to create widget", user.getUsername());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to create widget");
        }

        if (isExist(widgetCreate.getName(), null, widgetCreate.getProjectId())) {
            log.info("the widget {} name is already taken", widgetCreate.getName());
            return resultMap.failAndRefreshToken(request).message("the widget name is already taken");
        }

        View view = viewMapper.getById(widgetCreate.getViewId());
        if (null == view) {
            log.info("view not found");
            return resultMap.failAndRefreshToken(request).message("view not found");
        }

        Widget widget = new Widget();
        BeanUtils.copyProperties(widgetCreate, widget);

        int insert = widgetMapper.insert(widget);
        if (insert > 0) {
            return resultMap.successAndRefreshToken(request).payload(widget);
        } else {
            return resultMap.failAndRefreshToken(request).message("create widget fail");
        }
    }

    /**
     * 修改widget
     *
     * @param widgetUpdate
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap updateWidget(WidgetUpdate widgetUpdate, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        WidgetWithProjectAndView widgetWithProjectAndView = widgetMapper.getWidgetWithProjectAndViewById(widgetUpdate.getId());
        if (null == widgetWithProjectAndView) {
            return resultMap.failAndRefreshToken(request).message("view not found");
        }

        Project project = widgetWithProjectAndView.getProject();
        if (null == project) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //校验权限
        if (!allowWrite(project, user)) {
            log.info("user {} have not permisson to update widget", user.getUsername());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to update widget");
        }

        if (isExist(widgetUpdate.getName(), widgetUpdate.getId(), project.getId())) {
            log.info("the view {} name is already taken", widgetUpdate.getName());
            return resultMap.failAndRefreshToken(request).message("the widget name is already taken");
        }

        View view = widgetWithProjectAndView.getView();
        if (null == view) {
            log.info("view not found");
            return resultMap.failAndRefreshToken(request).message("view not found");
        }

        Widget widget = new Widget();
        BeanUtils.copyProperties(widgetUpdate, widget);
        widget.setProjectId(project.getId());
        widgetMapper.update(widget);
        return resultMap.successAndRefreshToken(request);
    }

    /**
     * 删除widget
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap deleteWidget(Long id, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        WidgetWithProjectAndView widgetWithProjectAndView = widgetMapper.getWidgetWithProjectAndViewById(id);

        if (null == widgetWithProjectAndView) {
            log.info("widget (:{}) not found", id);
            return resultMap.failAndRefreshToken(request).message("widget not found");
        }

        if (null == widgetWithProjectAndView.getProject()) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //校验权限
        if (!allowDelete(widgetWithProjectAndView.getProject(), user)) {
            log.info("user {} have not permisson to delete the widget {}", user.getUsername(), id);
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to delete the widget");
        }

        //删除引用widget的dashboard
        memDashboardWidgetMapper.deleteByWidget(id);

        //删除引用widget的displayslide
        memDisplaySlideWidgetMapper.deleteByWidget(id);

        widgetMapper.deleteById(id);

        return resultMap.successAndRefreshToken(request);
    }


    /**
     * 共享widget
     *
     * @param id
     * @param user
     * @param username
     * @param request
     * @return
     */
    @Override
    public ResultMap shareWidget(Long id, User user, String username, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        WidgetWithProjectAndView widgetWithProjectAndView = widgetMapper.getWidgetWithProjectAndViewById(id);

        if (null == widgetWithProjectAndView) {
            log.info("widget (:{}) not found", id);
            return resultMap.failAndRefreshToken(request).message("widget not found");
        }

        if (null == widgetWithProjectAndView.getProject()) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //校验权限
        if (!allowShare(widgetWithProjectAndView.getProject(), user)) {
            log.info("user {} have not permisson to share the widget {}", user.getUsername(), id);
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to share the widget");
        }

        try {
            return resultMap.successAndRefreshToken(request).payload(shareService.generateShareToken(id, username, user.getId()));
        } catch (ServerException e) {
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        }
    }


    private ViewExecuteParam buildViewExecuteParam(Widget widget) {
        ViewExecuteParam executeParam = null;
        try {
            if (null != widget && !StringUtils.isEmpty(widget.getConfig())) {
                executeParam = new ViewExecuteParam();
                Set<String> groups = new HashSet<>();
                Set<Aggregator> aggregators = new HashSet<>();
                //TODO order暂留
                Set<Order> orders = new HashSet<>();
                Set<String> filters = new HashSet<>();

                JSONObject jsonObject = JSONObject.parseObject(widget.getConfig());
                if (null != jsonObject) {
                    if (jsonObject.containsKey("cols")) {
                        JSONArray cols = jsonObject.getJSONArray("cols");
                        if (null != cols && cols.size() > 0) {
                            for (Object obj : cols) {
                                if (obj instanceof String) {
                                    groups.add(String.valueOf(obj));
                                } else {
                                    JSONObject col = JSONArray.parseObject(String.valueOf(obj));
                                    groups.add(col.getString("name"));
                                }
                            }
                        }
                    }
                    if (jsonObject.containsKey("rows")) {
                        JSONArray rows = jsonObject.getJSONArray("rows");
                        if (null != rows && rows.size() > 0) {
                            for (Object obj : rows) {
                                if (obj instanceof String) {
                                    groups.add(String.valueOf(obj));
                                } else {
                                    JSONObject col = JSONArray.parseObject(String.valueOf(obj));
                                    groups.add(col.getString("name"));
                                }
                            }
                        }
                    }

                    if (jsonObject.containsKey("metrics")) {
                        JSONArray metrics = jsonObject.getJSONArray("metrics");
                        if (null != metrics && metrics.size() > 0) {
                            for (int i = 0; i < metrics.size(); i++) {
                                JSONObject metric = metrics.getJSONObject(i);
                                if (null != metric && metric.containsKey("name") && metric.containsKey("agg")) {
                                    String name = metric.getString("name");
                                    String agg = metric.getString("agg");
                                    String[] split = name.split("@");
                                    if (split.length > 0) {
                                        aggregators.add(new Aggregator(split[0], agg));
                                    }
                                }
                            }
                        }
                    }

                    if (jsonObject.containsKey("filters")) {
                        JSONArray filterArray = jsonObject.getJSONArray("filters");
                        if (null != filterArray && filterArray.size() > 0) {
                            for (int i = 0; i < filterArray.size(); i++) {
                                JSONObject item = filterArray.getJSONObject(i);
                                if (null != item && item.containsKey("config")) {
                                    JSONObject config = item.getJSONObject("config");
                                    if (null != config && config.containsKey("sql")) {
                                        String sql = config.getString("sql");
                                        if (!StringUtils.isEmpty(sql)) {
                                            filters.add(sql);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (jsonObject.containsKey("color")) {
                        JSONObject color = jsonObject.getJSONObject("color");
                        if (null != color && color.containsKey("items")) {
                            JSONArray items = color.getJSONArray("items");
                            if (null != items && items.size() > 0) {
                                for (int i = 0; i < items.size(); i++) {
                                    JSONObject item = items.getJSONObject(i);
                                    if (null != item && item.containsKey("name")) {
                                        groups.add(String.valueOf(item.getString("name")));
                                    }
                                }
                            }
                        }
                    }

                    if (jsonObject.containsKey("label")) {
                        JSONObject label = jsonObject.getJSONObject("label");
                        if (null != label && label.containsKey("items")) {
                            JSONArray items = label.getJSONArray("items");
                            if (null != items && items.size() > 0) {
                                for (int i = 0; i < items.size(); i++) {
                                    JSONObject item = items.getJSONObject(i);
                                    if (null != item && item.containsKey("name")) {
                                        if (item.containsKey("type")) {
                                            String type = item.getString("type");
                                            String name = item.getString("name");
                                            if (!StringUtils.isEmpty(type) && !StringUtils.isEmpty(name)) {
                                                if ("category".equals(type)) {
                                                    groups.add(String.valueOf(item.getString("name")));
                                                } else if ("value".equals(type) && item.containsKey("agg")) {
                                                    String agg = item.getString("agg");
                                                    if (!StringUtils.isEmpty(agg)) {
                                                        aggregators.add(new Aggregator(name, agg));
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (jsonObject.containsKey("xAxis")) {
                        JSONObject xAxis = jsonObject.getJSONObject("xAxis");
                        if (null != xAxis && xAxis.containsKey("items")) {
                            JSONArray items = xAxis.getJSONArray("items");
                            if (null != items && items.size() > 0) {
                                for (int i = 0; i < items.size(); i++) {
                                    JSONObject item = items.getJSONObject(i);
                                    if (null != item && item.containsKey("name")) {
                                        if (item.containsKey("type")) {
                                            String agg = item.getString("agg");
                                            String name = item.getString("name");
                                            if (!StringUtils.isEmpty(agg) && !StringUtils.isEmpty(name)) {
                                                if (!StringUtils.isEmpty(agg)) {
                                                    aggregators.add(new Aggregator(name, agg));
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (jsonObject.containsKey("size")) {
                        JSONObject size = jsonObject.getJSONObject("size");
                        if (null != size && size.containsKey("items")) {
                            JSONArray items = size.getJSONArray("items");
                            if (null != items && items.size() > 0) {
                                for (int i = 0; i < items.size(); i++) {
                                    JSONObject item = items.getJSONObject(i);
                                    if (null != item && item.containsKey("name")) {
                                        if (item.containsKey("type")) {
                                            String agg = item.getString("agg");
                                            String name = item.getString("name");
                                            if (!StringUtils.isEmpty(agg) && !StringUtils.isEmpty(name)) {
                                                if (!StringUtils.isEmpty(agg)) {
                                                    aggregators.add(new Aggregator(name, agg));
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                executeParam.setFilters(filters.toArray(new String[filters.size()]));
                executeParam.setAggregators(Arrays.asList(aggregators.toArray(new Aggregator[aggregators.size()])));
                executeParam.setGroups(groups.toArray(new String[groups.size()]));
                executeParam.setOrders(Arrays.asList(orders.toArray(new Order[orders.size()])));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return executeParam;
    }


    @Override
    public ResultMap generationFile(Long id, ViewExecuteParam executeParam, User user, String type, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        String filePath = null;
        WidgetWithProjectAndView widgetWithProjectAndView = widgetMapper.getWidgetWithProjectAndViewById(id);

        if (null == widgetWithProjectAndView) {
            log.info("widget (:{}) not found", id);
            return resultMap.failAndRefreshToken(request).message("widget not found");
        }

        if (null == widgetWithProjectAndView.getProject()) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        if (!allowDownload(widgetWithProjectAndView.getProject(), user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to download the widget");
        }

        ViewWithProjectAndSource viewWithProjectAndSource = viewMapper.getViewWithProjectAndSourceById(widgetWithProjectAndView.getViewId());

        if (null == viewWithProjectAndSource) {
            return resultMap.failAndRefreshToken(request).message("view not found");
        }

        executeParam.setPageNo(-1);
        executeParam.setPageSize(-1);
        executeParam.setLimit(-1);

        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");

        String rootPath = fileUtils.fileBasePath +
                File.separator +
                "download" +
                File.separator +
                sdf.format(new Date()) +
                File.separator +
                type +
                File.separator;

        try {
            if (type.equals(FileTypeEnum.CSV.getType())) {
                Paginate<Map<String, Object>> paginate = viewService.getResultDataList(viewWithProjectAndSource, executeParam, user);
                List<QueryColumn> columns = viewService.getResultMeta(viewWithProjectAndSource, executeParam, user);
                if (null != columns && columns.size() > 0) {
                    File file = new File(rootPath);
                    if (!file.exists()) {
                        file.mkdirs();
                    }

                    String csvName = viewWithProjectAndSource.getName() + "_" +
                            System.currentTimeMillis() +
                            UUID.randomUUID().toString().replace("-", "") +
                            FileTypeEnum.CSV.getFormat();

                    filePath = CsvUtils.formatCsvWithFirstAsHeader(rootPath, csvName, columns, paginate.getResultList());
                }
            } else if (type.equals(FileTypeEnum.XLSX.getType())) {

                String excelName = widgetWithProjectAndView.getName() + "_" +
                        System.currentTimeMillis() +
                        UUID.randomUUID().toString().replace("-", "") +
                        FileTypeEnum.XLSX.getFormat();


                HashSet<Widget> widgets = new HashSet<>();
                widgets.add(widgetWithProjectAndView);
                Map<Long, ViewExecuteParam> executeParamMap = new HashMap<>();
                executeParamMap.put(widgetWithProjectAndView.getId(), executeParam);

                filePath = rootPath + excelName;
                writeExcel(widgets, executeParamMap, filePath, user, false);
            } else {
                return resultMap.failAndRefreshToken(request).message("unknow file type");
            }
        } catch (Exception e) {
            return resultMap.failAndRefreshToken(request).message("generation " + type + " error!");
        }


        filePath = fileUtils.formatFilePath(filePath);

        return resultMap.successAndRefreshToken(request).payload(getHost() + filePath);
    }


    @Transactional
    public void upgradeWidgetConfig() {
        List<Widget> widgets = widgetMapper.queryUpgrade();
        List<Widget> updateList = null;
        if (null != widgets && widgets.size() > 0) {
            updateList = new ArrayList<>();

            for (Widget widget : widgets) {
                if (StringUtils.isEmpty(widget.getConfig())) {
                    continue;
                }

                JSONObject jsonObject = JSONObject.parseObject(widget.getConfig());
                if (null != jsonObject) {
                    if (jsonObject.containsKey("cols")) {
                        JSONArray cols = jsonObject.getJSONArray("cols");
                        if (null != cols && cols.size() > 0) {
                            Map<Long, List<JSONObject>> map = null;
                            for (Object obj : cols) {
                                if (obj instanceof String) {
                                    if (null == map) {
                                        map = new HashMap<>();
                                    }

                                    List<JSONObject> list = null;
                                    if (map.containsKey(widget.getId())) {
                                        list = map.get(widget.getId());
                                    } else {
                                        list = new ArrayList<>();
                                        map.put(widget.getId(), list);
                                    }
                                    JSONObject col = new JSONObject();
                                    col.put("name", String.valueOf(obj));
                                    list.add(col);
                                }
                            }
                            if (null != map && map.size() > 0) {
                                jsonObject.put("cols", map.get(widget.getId()));
                                widget.setConfig(jsonObject.toJSONString());
                                updateList.add(widget);
                            }
                        }
                    }

                    if (jsonObject.containsKey("rows")) {
                        JSONArray cols = jsonObject.getJSONArray("rows");
                        if (null != cols && cols.size() > 0) {
                            Map<Long, List<JSONObject>> map = null;
                            for (Object obj : cols) {
                                if (obj instanceof String) {
                                    if (null == map) {
                                        map = new HashMap<>();
                                    }

                                    List<JSONObject> list = null;
                                    if (map.containsKey(widget.getId())) {
                                        list = map.get(widget.getId());
                                    } else {
                                        list = new ArrayList<>();
                                        map.put(widget.getId(), list);
                                    }
                                    JSONObject col = new JSONObject();
                                    col.put("name", String.valueOf(obj));
                                    list.add(col);
                                }
                            }
                            if (null != map && map.size() > 0) {
                                jsonObject.put("rows", map.get(widget.getId()));
                                widget.setConfig(jsonObject.toJSONString());
                                updateList.add(widget);
                            }
                        }
                    }
                }
            }
        }

        if (null != updateList && updateList.size() > 0) {
            widgetMapper.updateConfigBatch(updateList);
        }
    }


    /**
     * widget列表数据写入指定excle文件
     *
     * @param widgets
     * @param executeParamMap
     * @param filePath
     * @param user
     * @param containType
     * @return
     * @throws Exception
     */
    public File writeExcel(Set<Widget> widgets,
                           Map<Long, ViewExecuteParam> executeParamMap,
                           String filePath, User user, boolean containType) throws Exception {
        if (StringUtils.isEmpty(filePath)) {
            throw new ServerException("excel file path is empty");
        }
        if (!filePath.trim().toLowerCase().endsWith(FileTypeEnum.XLSX.getFormat())) {
            throw new ServerException("unknow file format");
        }

        XSSFWorkbook wb = new XSSFWorkbook();

        ExecutorService executorService = Executors.newCachedThreadPool();
        CountDownLatch countDownLatch = new CountDownLatch(widgets.size());

        Iterator<Widget> iterator = widgets.iterator();
        int i = 1;
        while (iterator.hasNext()) {
            Widget widget = iterator.next();
            final String sheetName = widgets.size() == 1 ? "Sheet" : "Sheet" + (widgets.size() - (i - 1));
            executorService.execute(() -> {
                XSSFSheet sheet = null;
                try {
                    ViewWithProjectAndSource viewWithProjectAndSource = viewMapper.getViewWithProjectAndSourceById(widget.getViewId());

                    ViewExecuteParam executeParam = null;
                    if (null != executeParamMap && executeParamMap.containsKey(widget.getId())) {
                        executeParam = executeParamMap.get(widget.getId());
                    } else {
                        executeParam = buildViewExecuteParam(widget);
                        executeParam.setPageNo(-1);
                        executeParam.setPageSize(-1);
                        executeParam.setLimit(-1);
                    }

                    List<QueryColumn> columns = viewService.getResultMeta(viewWithProjectAndSource, executeParam, user);

                    Paginate<Map<String, Object>> paginate = viewService.getResultDataList(viewWithProjectAndSource, executeParam, user);

                    sheet = wb.createSheet(sheetName);
                    ExcelUtils.writeSheet(sheet, columns, paginate.getResultList(), wb, containType, widget.getConfig(), executeParam.getParams());
                } catch (ServerException e) {
                    e.printStackTrace();
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

        FileOutputStream out = new FileOutputStream(filePath);
        wb.write(out);
        out.flush();
        out.close();
        return file;
    }
}
