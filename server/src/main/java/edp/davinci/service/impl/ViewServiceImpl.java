package edp.davinci.service.impl;

import com.alibaba.druid.util.StringUtils;
import com.alibaba.fastjson.JSONObject;
import edp.core.enums.DataTypeEnum;
import edp.core.enums.HttpCodeEnum;
import edp.core.exception.ServerException;
import edp.core.exception.SourceException;
import edp.core.model.QueryColumn;
import edp.core.model.TableInfo;
import edp.core.utils.RedisUtils;
import edp.core.utils.SqlUtils;
import edp.core.utils.TokenUtils;
import edp.davinci.common.service.CommonService;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ResultMap;
import edp.davinci.core.enums.UserOrgRoleEnum;
import edp.davinci.core.enums.UserPermissionEnum;
import edp.davinci.core.enums.UserTeamRoleEnum;
import edp.davinci.core.model.SqlEntity;
import edp.davinci.core.utils.SqlParseUtils;
import edp.davinci.dao.*;
import edp.davinci.dto.sourceDto.SourceBaseInfo;
import edp.davinci.dto.sourceDto.SourceWithProject;
import edp.davinci.dto.viewDto.*;
import edp.davinci.model.*;
import edp.davinci.service.ViewService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.stringtemplate.v4.ST;
import org.stringtemplate.v4.STGroup;
import org.stringtemplate.v4.STGroupFile;

import javax.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service("viewService")
public class ViewServiceImpl extends CommonService<View> implements ViewService {

    @Autowired
    private ViewMapper viewMapper;

    @Autowired
    private ProjectMapper projectMapper;

    @Autowired
    private SourceMapper sourceMapper;

    @Autowired
    private RelUserOrganizationMapper relUserOrganizationMapper;

    @Autowired
    private RelUserTeamMapper relUserTeamMapper;

    @Autowired
    private WidgetMapper widgetMapper;

    @Autowired
    private RelTeamProjectMapper relTeamProjectMapper;

    @Autowired
    private SqlUtils sqlUtils;

    @Autowired
    private TokenUtils tokenUtils;

    @Autowired
    private RedisUtils redisUtils;

    private static final String viewDataCacheKey = "view_data_";

    private static final String viewMetaCacheKey = "view_meta_";

    private static final String viewTeamVarKey = "team";


    @Override
    public boolean isExist(String name, Long id, Long projectId) {
        Long viewId = viewMapper.getByNameWithProjectId(name, projectId);
        if (null != id && null != viewId) {
            return !id.equals(viewId);
        }
        return null != viewId && viewId.longValue() > 0L;
    }

    /**
     * 获取View列表
     *
     * @param projectId
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap getViews(Long projectId, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Project project = projectMapper.getById(projectId);

        if (null == project) {
            log.info("project {} not found", project);
            return resultMap.successAndRefreshToken(request).message("project not found");
        }

        if (!allowRead(project, user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED);
        }

        List<ViewWithSourceBaseInfo> views = viewMapper.getByProject(projectId);

        if (null != views && views.size() > 0) {

            //获取当前用户在organization的role
            RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), project.getOrgId());

            //当前用户是project的创建者和organization的owner，直接返回
            if (!project.getUserId().equals(user.getId()) && (null == orgRel || orgRel.getRole() == UserOrgRoleEnum.MEMBER.getRole())) {
                //查询project所属team中当前用户最高角色
                short maxTeamRole = relUserTeamMapper.getUserMaxRoleWithProjectId(projectId, user.getId());

                //如果当前用户是team的matainer 全部返回，否则验证 当前用户team对project的权限
                if (maxTeamRole == UserTeamRoleEnum.MEMBER.getRole()) {

                    //查询当前用户在的 project所属team对project view的最高权限
                    short maxSourcePermission = relTeamProjectMapper.getMaxViewPermission(projectId, user.getId());

                    if (maxSourcePermission == UserPermissionEnum.HIDDEN.getPermission()) {
                        //隐藏
                        views = null;
                    }
                }
            }
        }

        return resultMap.successAndRefreshToken(request).payloads(views);
    }

    /**
     * 新建View
     *
     * @param viewCreate
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap createView(ViewCreate viewCreate, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Project project = projectMapper.getById(viewCreate.getProjectId());
        if (null == project) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //校验权限
        if (!allowWrite(project, user)) {
            log.info("user {} have not permisson to create view", user.getUsername());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to create view");
        }

        if (isExist(viewCreate.getName(), null, viewCreate.getProjectId())) {
            log.info("the view {} name is already taken", viewCreate.getName());
            return resultMap.failAndRefreshToken(request).message("the view name is already taken");
        }


        Source source = sourceMapper.getById(viewCreate.getSourceId());
        if (null == source) {
            log.info("source not found");
            return resultMap.failAndRefreshToken(request).message("source not found");
        }

        //测试连接
        boolean testConnection = false;
        try {
            testConnection = sqlUtils.init(source.getJdbcUrl(), source.getUsername(), source.getPassword()).testConnection();
        } catch (SourceException e) {
            log.error(e.getMessage());
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        }

        if (testConnection) {
            View view = new View();
            BeanUtils.copyProperties(viewCreate, view);

            int insert = viewMapper.insert(view);
            if (insert > 0) {
                SourceBaseInfo sourceBaseInfo = new SourceBaseInfo();
                BeanUtils.copyProperties(source, sourceBaseInfo);

                ViewWithSourceBaseInfo viewWithSource = new ViewWithSourceBaseInfo();
                BeanUtils.copyProperties(view, viewWithSource);
                viewWithSource.setSource(sourceBaseInfo);
                return resultMap.successAndRefreshToken(request).payload(viewWithSource);
            } else {
                return resultMap.failAndRefreshToken(request).message("create view fail");
            }
        } else {
            return resultMap.failAndRefreshToken(request).message("get source connection fail");
        }
    }

    /**
     * 更新View
     *
     * @param viewUpdate
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap updateView(ViewUpdate viewUpdate, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        ViewWithProjectAndSource viewWithProjectAndSource = viewMapper.getViewWithProjectAndSourceById(viewUpdate.getId());
        if (null == viewWithProjectAndSource) {
            return resultMap.failAndRefreshToken(request).message("view not found");
        }

        Project project = viewWithProjectAndSource.getProject();
        if (null == project) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //校验权限
        if (!allowWrite(project, user)) {
            log.info("user {} have not permisson to update view", user.getUsername());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to update view");
        }

        if (isExist(viewUpdate.getName(), viewUpdate.getId(), project.getId())) {
            log.info("the view {} name is already taken", viewUpdate.getName());
            return resultMap.failAndRefreshToken(request).message("the view name is already taken");
        }

        Source source = viewWithProjectAndSource.getSource();
        if (null == source) {
            log.info("source not found");
            return resultMap.failAndRefreshToken(request).message("source not found");
        }

        //测试连接
        boolean testConnection = false;
        try {
            testConnection = sqlUtils.init(source.getJdbcUrl(), source.getUsername(), source.getPassword()).testConnection();
        } catch (SourceException e) {
            log.error(e.getMessage());
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        }

        if (testConnection) {
            View view = new View();
            BeanUtils.copyProperties(viewUpdate, view);
            view.setProjectId(project.getId());
            viewMapper.update(view);
            return resultMap.successAndRefreshToken(request);
        } else {
            return resultMap.failAndRefreshToken(request).message("get source connection fail");
        }
    }

    /**
     * 删除View
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap deleteView(Long id, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        ViewWithProjectAndSource viewWithProjectAndSource = viewMapper.getViewWithProjectAndSourceById(id);

        if (null == viewWithProjectAndSource) {
            log.info("view (:{}) not found", id);
            return resultMap.failAndRefreshToken(request).message("view not found");
        }

        if (null == viewWithProjectAndSource.getProject()) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //校验权限
        if (!allowDelete(viewWithProjectAndSource.getProject(), user)) {
            log.info("user {} have not permisson to delete the view {}", user.getUsername(), id);
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to delete the view");
        }

        List<Widget> widgets = widgetMapper.getWidgetsByWiew(id);
        if (null != widgets && widgets.size() > 0) {
            return resultMap.failAndRefreshToken(request).message("The current view has been referenced, please delete the reference and then operate");
        }

        viewMapper.deleteById(id);

        return resultMap.successAndRefreshToken(request);
    }

    /**
     * 获取View对应Source的Schema
     *
     * @param sourceId
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap getSourceSchema(Long sourceId, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        SourceWithProject sourceWithProject = sourceMapper.getSourceWithProjectById(sourceId);
        if (null == sourceWithProject) {
            log.info("source (:{}) not found", sourceId);
            return resultMap.failAndRefreshToken(request).message("source not found");
        }

        Project project = sourceWithProject.getProject();
        if (null == project) {
            log.info("project (:{}) not found", sourceWithProject.getProjectId());
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //获取当前用户在organization的role
        RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), project.getOrgId());

        List<TableInfo> tableList = null;

        try {
            tableList = sqlUtils.init(sourceWithProject.getJdbcUrl(), sourceWithProject.getUsername(), sourceWithProject.getPassword()).getTableList();
        } catch (SourceException e) {
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        }

        if (null != tableList) {
            //当前用户是project的创建者和organization的owner，直接返回
            if (!project.getUserId().equals(user.getId()) && (null == orgRel || orgRel.getRole() == UserOrgRoleEnum.MEMBER.getRole())) {
                //查询project所属team中当前用户最高角色
                short maxTeamRole = relUserTeamMapper.getUserMaxRoleWithProjectId(project.getId(), user.getId());

                //如果当前用户是team的matainer 全部返回，否则验证 当前用户team对project的权限
                if (maxTeamRole == UserTeamRoleEnum.MEMBER.getRole()) {

                    //查询当前用户在的 project所属team对project source的最高权限
                    short maxSourcePermission = relTeamProjectMapper.getMaxSourcePermission(project.getId(), user.getId());

                    if (maxSourcePermission == UserPermissionEnum.HIDDEN.getPermission()) {
                        tableList = null;
                    }
                }
            }
        }

        return resultMap.successAndRefreshToken(request).payloads(tableList);
    }

    /**
     * 执行sql
     *
     * @param executeSql
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap executeSql(ViewExecuteSql executeSql, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        SourceWithProject sourceWithProject = sourceMapper.getSourceWithProjectById(executeSql.getSourceId());
        if (null == sourceWithProject) {
            log.info("source (:{}) not found", executeSql.getSourceId());
            return resultMap.failAndRefreshToken(request).message("source not found");
        }

        Project project = sourceWithProject.getProject();
        if (null == project) {
            log.info("project (:{}) not found", sourceWithProject.getProjectId());
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //获取当前用户在organization的role
        RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), project.getOrgId());

        //当前用户是project的创建者和organization的owner，直接返回
        if (!project.getUserId().equals(user.getId()) && (null == orgRel || orgRel.getRole() == UserOrgRoleEnum.MEMBER.getRole())) {
            //查询project所属team中当前用户最高角色
            short maxTeamRole = relUserTeamMapper.getUserMaxRoleWithProjectId(project.getId(), user.getId());

            //如果当前用户是team的matainer 全部返回，否则验证 当前用户team对project的权限
            if (maxTeamRole == UserTeamRoleEnum.MEMBER.getRole()) {

                //查询当前用户在的 project所属team对project source的最高权限
                short maxSourcePermission = relTeamProjectMapper.getMaxSourcePermission(project.getId(), user.getId());

                if (maxSourcePermission == UserPermissionEnum.HIDDEN.getPermission()) {
                    return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to execute sql in this view");
                }
            }
        }

        //结构化Sql
        List<Map<String, Object>> resultList = null;
        List<QueryColumn> columns = null;
        try {
            SqlEntity sqlEntity = SqlParseUtils.parseSql(executeSql.getSql());
            SqlUtils sqlUtils = this.sqlUtils.init(sourceWithProject.getJdbcUrl(), sourceWithProject.getUsername(), sourceWithProject.getPassword());
            if (null != sqlUtils && null != sqlEntity) {
                //执行sql时 team@var 只运行默认值
                if (null != sqlEntity.getExecuteSql() && sqlEntity.getExecuteSql().size() > 0) {
                    List<String> sqlList = SqlParseUtils.replaceParams(sqlEntity.getExecuteSql(), sqlEntity.getQuaryParams(), sqlEntity.getTeamParams());
                    for (String sql : sqlList) {
                        sqlUtils.execute(sql);
                    }
                }
                if (null != sqlEntity.getQuerySql() && sqlEntity.getQuerySql().size() > 0) {
                    List<String> sqlList = SqlParseUtils.replaceParams(sqlEntity.getQuerySql(), sqlEntity.getQuaryParams(), sqlEntity.getTeamParams());
                    for (String sql : sqlEntity.getQuerySql()) {
                        resultList = sqlUtils.syncQuery4List(sql);
                    }
                    columns = sqlUtils.getColumns(sqlList.get(sqlList.size() - 1));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        }

        return resultMap.successAndRefreshToken(request).payload(new ExecuteSqlResult(columns, resultList));
    }

    /**
     * 返回view源数据集
     *
     * @param id
     * @param executeParam
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap getData(Long id, ViewExecuteParam executeParam, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        List<Map<String, Object>> list = null;

        ViewWithProjectAndSource viewWithProjectAndSource = viewMapper.getViewWithProjectAndSourceById(id);
        if (null == viewWithProjectAndSource) {
            log.info("view (:{}) not found", id);
            return resultMap.failAndRefreshToken(request).message("view not found");
        }

        Project project = viewWithProjectAndSource.getProject();
        if (null == project) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //获取当前用户在organization的role
        RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), project.getOrgId());

        //当前用户是project的创建者和organization的owner，直接返回
        if (!project.getUserId().equals(user.getId()) && (null == orgRel || orgRel.getRole() == UserOrgRoleEnum.MEMBER.getRole())) {
            //查询project所属team中当前用户最高角色
            short maxTeamRole = relUserTeamMapper.getUserMaxRoleWithProjectId(project.getId(), user.getId());

            //如果当前用户是team的matainer 全部返回，否则验证 当前用户team对project的权限
            if (maxTeamRole == UserTeamRoleEnum.MEMBER.getRole()) {

                //查询当前用户在的 project所属team对project source的最高权限
                short maxSourcePermission = relTeamProjectMapper.getMaxSourcePermission(project.getId(), user.getId());

                if (maxSourcePermission == UserPermissionEnum.HIDDEN.getPermission()) {
                    return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to get data");
                }
            }
        }

        try {
            list = getResultDataList(viewWithProjectAndSource, executeParam, user);
        } catch (ServerException e) {
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        }

        return resultMap.successAndRefreshToken(request).payloads(list);
    }


    /**
     * 构造查询语句
     *
     * @param sqlEntity
     * @param executeParam
     * @return
     */
    public void buildQuerySql(SqlEntity sqlEntity, ViewExecuteParam executeParam) {
        if (null != sqlEntity && null != sqlEntity.getQuerySql() && sqlEntity.getQuerySql().size() > 0) {
            if (null != executeParam) {
                //构造参数， 原有的被传入的替换
                if (null != executeParam.getParams() && executeParam.getParams().size() > 0) {
                    for (Param param : executeParam.getParams()) {
                        sqlEntity.getQuaryParams().put(SqlParseUtils.dollarDelimiter + param.getName().trim() + SqlParseUtils.dollarDelimiter, param.getValue());
                    }
                }

                if (null == executeParam.getGroups() || executeParam.getGroups().length < 1) {
                    executeParam.setGroups(null);
                }

                if (null == executeParam.getFilters() || executeParam.getFilters().length < 1) {
                    executeParam.setFilters(null);
                }

                STGroup stg = new STGroupFile(Constants.SQL_TEMPLATE);
                ST st = stg.getInstanceOf("querySql");
                st.add("groups", executeParam.getGroups());
                st.add("aggregators", executeParam.getAggregators());
                st.add("orders", executeParam.getOrders());
                st.add("filters", executeParam.getFilters());
                st.add("sql", sqlEntity.getQuerySql().get(sqlEntity.getQuerySql().size() - 1));

                sqlEntity.getQuerySql().set(sqlEntity.getQuerySql().size() - 1, st.render());
            }
        }
    }


    /**
     * 获取结果集
     *
     * @param viewWithProjectAndSource
     * @param executeParam
     * @param user
     * @return
     * @throws ServerException
     */
    @Override
    public List<Map<String, Object>> getResultDataList(ViewWithProjectAndSource viewWithProjectAndSource, ViewExecuteParam executeParam, User user) throws ServerException {
        List<Map<String, Object>> list = null;

        try {

            Object object = redisUtils.get(String.valueOf(viewDataCacheKey + viewWithProjectAndSource.getId()));

            if (null != object) {
                list = (List<Map<String, Object>>) object;
                return list;
            }

            if (!StringUtils.isEmpty(viewWithProjectAndSource.getSql())) {
                SqlEntity sqlEntity = SqlParseUtils.parseSql(viewWithProjectAndSource.getSql());

                Source source = viewWithProjectAndSource.getSource();
                if (null == viewWithProjectAndSource) {
                    throw new ServerException("source not found");
                }
                SqlUtils sqlUtils = this.sqlUtils.init(source);
                if (null != sqlUtils && null != sqlEntity) {

                    //解析team@var查询参数
                    Map<String, List<String>> teamParams = parseTeamParams(sqlEntity.getTeamParams(), viewWithProjectAndSource, user);

                    if (null != sqlEntity.getExecuteSql() && sqlEntity.getExecuteSql().size() > 0) {
                        List<String> sqlList = SqlParseUtils.replaceParams(sqlEntity.getExecuteSql(), sqlEntity.getQuaryParams(), teamParams);
                        for (String sql : sqlList) {
                            sqlUtils.execute(sql);
                        }
                    }
                    if (null != sqlEntity.getQuerySql() && sqlEntity.getQuerySql().size() > 0) {
                        list = new ArrayList<>();
                        buildQuerySql(sqlEntity, executeParam);
                        List<String> sqlList = SqlParseUtils.replaceParams(sqlEntity.getQuerySql(), sqlEntity.getQuaryParams(), teamParams);
                        for (String sql : sqlList) {
                            list = sqlUtils.syncQuery4List(sql);
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServerException(e.getMessage());
        }

        if (null != executeParam
                && null != executeParam.getCache()
                && executeParam.getCache()
                && executeParam.getExpired() > 0L
                && null != list && list.size() > 0) {
            redisUtils.set(viewDataCacheKey + viewWithProjectAndSource.getId(), list, executeParam.getExpired(), TimeUnit.SECONDS);
        }

        return list;
    }

    /**
     * 获取查询meta
     *
     * @param viewWithProjectAndSource
     * @param executeParam
     * @param user
     * @return
     * @throws ServerException
     */
    @Override
    public List<QueryColumn> getResultMeta(ViewWithProjectAndSource viewWithProjectAndSource, ViewExecuteParam executeParam, User user) throws ServerException {
        List<QueryColumn> columns = null;

        try {

            Object object = redisUtils.get(String.valueOf(viewMetaCacheKey + viewWithProjectAndSource.getId()));

            if (null != object) {
                columns = (List<QueryColumn>) object;
                return columns;
            }


            if (!StringUtils.isEmpty(viewWithProjectAndSource.getSql())) {
                SqlEntity sqlEntity = SqlParseUtils.parseSql(viewWithProjectAndSource.getSql());

                Source source = viewWithProjectAndSource.getSource();
                if (null == viewWithProjectAndSource) {
                    throw new ServerException("source not found");
                }
                SqlUtils sqlUtils = this.sqlUtils.init(source);
                if (null != sqlUtils && null != sqlEntity) {

                    //解析team@var查询参数
                    Map<String, List<String>> teamParams = parseTeamParams(sqlEntity.getTeamParams(), viewWithProjectAndSource, user);

                    if (null != sqlEntity.getExecuteSql() && sqlEntity.getExecuteSql().size() > 0) {
                        List<String> sqlList = SqlParseUtils.replaceParams(sqlEntity.getExecuteSql(), sqlEntity.getQuaryParams(), teamParams);
                        for (String sql : sqlList) {
                            sqlUtils.execute(sql);
                        }
                    }
                    if (null != sqlEntity.getQuerySql() && sqlEntity.getQuerySql().size() > 0) {
                        buildQuerySql(sqlEntity, executeParam);
                        List<String> sqlList = SqlParseUtils.replaceParams(sqlEntity.getQuerySql(), sqlEntity.getQuaryParams(), teamParams);
                        //逐条查询的目的是为了执行用户sql中的变量定义
                        for (String sql : sqlList) {
                            sqlUtils.syncQuery4List(sql);
                        }
                        //只返回最后一条sql的结果
                        columns = sqlUtils.getColumns(sqlList.get(sqlList.size() - 1));
                    }
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            throw new ServerException(e.getMessage());
        }

        if (null != executeParam
                && null != executeParam.getCache()
                && executeParam.getCache()
                && executeParam.getExpired() > 0L
                && null != columns && columns.size() > 0) {
            redisUtils.set(viewMetaCacheKey + viewWithProjectAndSource.getId(), columns, executeParam.getExpired(), TimeUnit.SECONDS);
        }

        return columns;
    }


    private Map<String, List<String>> parseTeamParams(Map<String, List<String>> paramMap, View view, User user) {
        if (null != view && !StringUtils.isEmpty(view.getConfig())) {
            JSONObject jsonObject = JSONObject.parseObject(view.getConfig());
            if (null != jsonObject && jsonObject.containsKey(viewTeamVarKey)) {
                String teamVarString = jsonObject.getString(viewTeamVarKey);
                if (!StringUtils.isEmpty(teamVarString)) {
                    List<TeamVar> varList = JSONObject.parseArray(teamVarString, TeamVar.class);
                    if (null != varList && varList.size() > 0) {
                        Set<Long> tIds = relUserTeamMapper.getUserTeamId(user.getId());
                        for (String key : paramMap.keySet()) {
                            List<String> params = new ArrayList<>();
                            for (TeamVar teamVar : varList) {
                                if (tIds.contains(teamVar.getId())) {
                                    for (TeamParam teamParam : teamVar.getParams()) {
                                        String k = key.replace(String.valueOf(SqlParseUtils.dollarDelimiter), "");
                                        if (teamParam.getK().equals(k)) {
                                            params.add(teamParam.getV());
                                        }
                                    }
                                }
                            }

                            if (params.size() > 0) {
                                paramMap.put(key, params);
                            }
                        }
                    }
                }
            }
        }
        return paramMap;
    }

    @Override
    public ResultMap getDistinctValue(Long id, DistinctParam param, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Map<String, Object> map = null;

        ViewWithProjectAndSource viewWithProjectAndSource = viewMapper.getViewWithProjectAndSourceById(id);
        if (null == viewWithProjectAndSource) {
            log.info("view (:{}) not found", id);
            return resultMap.failAndRefreshToken(request).message("view not found");
        }

        Project project = viewWithProjectAndSource.getProject();
        if (null == project) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //获取当前用户在organization的role
        RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), project.getOrgId());

        //当前用户是project的创建者和organization的owner，直接返回
        if (!project.getUserId().equals(user.getId()) && (null == orgRel || orgRel.getRole() == UserOrgRoleEnum.MEMBER.getRole())) {
            short maxTeamRole = relUserTeamMapper.getUserMaxRoleWithProjectId(project.getId(), user.getId());
            if (maxTeamRole == UserTeamRoleEnum.MEMBER.getRole()) {
                short maxSourcePermission = relTeamProjectMapper.getMaxSourcePermission(project.getId(), user.getId());
                if (maxSourcePermission == UserPermissionEnum.HIDDEN.getPermission()) {
                    return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to get data");
                }
            }
        }

        try {
            map = getDistinctValueData(viewWithProjectAndSource, param, user);
        } catch (ServerException e) {
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        }

        return resultMap.successAndRefreshToken(request).payload(map);
    }


    private Map<String, Object> getDistinctValueData(ViewWithProjectAndSource viewWithProjectAndSource, DistinctParam param, User user) throws ServerException {
        Map<String, Object> map = null;
        try {
            if (!StringUtils.isEmpty(viewWithProjectAndSource.getSql())) {
                SqlEntity sqlEntity = SqlParseUtils.parseSql(viewWithProjectAndSource.getSql());
                Source source = viewWithProjectAndSource.getSource();
                if (null == viewWithProjectAndSource) {
                    throw new ServerException("source not found");
                }
                SqlUtils sqlUtils = this.sqlUtils.init(source);
                if (null != sqlUtils && null != sqlEntity) {
                    //解析team@var查询参数
                    Map<String, List<String>> teamParams = parseTeamParams(sqlEntity.getTeamParams(), viewWithProjectAndSource, user);

                    if (null != sqlEntity.getExecuteSql() && sqlEntity.getExecuteSql().size() > 0) {
                        List<String> sqlList = SqlParseUtils.replaceParams(sqlEntity.getExecuteSql(), sqlEntity.getQuaryParams(), teamParams);
                        for (String sql : sqlList) {
                            sqlUtils.execute(sql);
                        }
                    }
                    if (null != sqlEntity.getQuerySql() && sqlEntity.getQuerySql().size() > 0) {
                        if (null != sqlEntity && null != sqlEntity.getQuerySql() && sqlEntity.getQuerySql().size() > 0) {
                            if (null != param) {

                                String keywordChar = null;
                                DataTypeEnum dataTypeEnum = DataTypeEnum.urlOf(source.getJdbcUrl());
                                if (null != dataTypeEnum) {
                                    keywordChar = dataTypeEnum.getKewordChar();
                                }
                                STGroup stg = new STGroupFile(Constants.SQL_TEMPLATE);
                                ST st = stg.getInstanceOf("queryDistinctSql");
                                st.add("column", param.getColumn());
                                st.add("params", param.getParents());
                                st.add("sql", sqlEntity.getQuerySql().get(sqlEntity.getQuerySql().size() - 1));
                                st.add("keywordChar", keywordChar);

                                sqlEntity.getQuerySql().set(sqlEntity.getQuerySql().size() - 1, st.render());
                            }
                        }
                        List<String> sqlList = SqlParseUtils.replaceParams(sqlEntity.getQuerySql(), sqlEntity.getQuaryParams(), teamParams);
                        List<Map<String, Object>> list = null;
                        for (String sql : sqlList) {
                            list = sqlUtils.query4List(sql);
                        }
                        if (null != list && list.size() > 0) {
                            List<Object> objects = new ArrayList<>();
                            for (Map<String, Object> objMap : list) {
                                if (null != objMap.get(param.getColumn())) {
                                    objects.add(objMap.get(param.getColumn()));
                                }
                            }
                            if (null != objects) {
                                map = new HashMap<>();
                                map.put(param.getColumn(), objects);
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServerException(e.getMessage());
        }

        return map;
    }
}

