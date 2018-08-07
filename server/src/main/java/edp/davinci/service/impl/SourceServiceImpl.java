package edp.davinci.service.impl;

import com.alibaba.fastjson.JSONObject;
import edp.core.enums.HttpCodeEnum;
import edp.core.exception.ServerException;
import edp.core.exception.SourceException;
import edp.core.model.QueryColumn;
import edp.core.utils.DateUtils;
import edp.core.utils.FileUtils;
import edp.core.utils.SqlUtils;
import edp.core.utils.TokenUtils;
import edp.davinci.common.service.CommonService;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ResultMap;
import edp.davinci.core.enums.*;
import edp.davinci.core.model.CsvEntity;
import edp.davinci.core.utils.CsvUtils;
import edp.davinci.dao.ProjectMapper;
import edp.davinci.dao.SourceMapper;
import edp.davinci.dao.ViewMapper;
import edp.davinci.dto.sourceDto.*;
import edp.davinci.model.*;
import edp.davinci.service.SourceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.stringtemplate.v4.ST;
import org.stringtemplate.v4.STGroup;
import org.stringtemplate.v4.STGroupFile;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;


@Slf4j
@Service("sourceService")
public class SourceServiceImpl extends CommonService<Source> implements SourceService {

    @Autowired
    private TokenUtils tokenUtils;

    @Autowired
    SourceMapper sourceMapper;

    @Autowired
    SqlUtils sqlUtils;

    @Autowired
    ProjectMapper projectMapper;

    @Autowired
    ViewMapper viewMapper;

    @Autowired
    FileUtils fileUtils;

    @Override
    public boolean isExist(String name, Long id, Long projectId) {
        Long sourceId = sourceMapper.getByNameWithProjectId(name, projectId);
        if (null != id && null != sourceId) {
            return !id.equals(sourceId);
        }
        return null != sourceId && sourceId.longValue() > 0L;
    }

    /**
     * 获取source列表
     *
     * @param projectId
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap getSources(Long projectId, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Project project = projectMapper.getById(projectId);

        if (null == project) {
            log.info("project {} not found", project);
            return resultMap.successAndRefreshToken(request).message("project not found");
        }

        if (!allowRead(project, user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED);
        }

        List<Source> sources = sourceMapper.getByProject(projectId);

        if (null != sources && sources.size() > 0) {

            //获取当前用户在organization的role
            RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), project.getOrgId());

            //当前用户是project的创建者和organization的owner，直接返回
            if (!project.getUserId().equals(user.getId()) && (null == orgRel || orgRel.getRole() == UserOrgRoleEnum.MEMBER.getRole())) {
                //查询project所属team中当前用户最高角色
                short maxTeamRole = relUserTeamMapper.getUserMaxRoleWithProjectId(projectId, user.getId());

                //如果当前用户是team的matainer 全部返回，否则验证 当前用户team对project的权限
                if (maxTeamRole == UserTeamRoleEnum.MEMBER.getRole()) {

                    //查询当前用户在的 project所属team对project source的最高权限
                    short maxSourcePermission = relTeamProjectMapper.getMaxSourcePermission(projectId, user.getId());

                    if (maxSourcePermission == UserPermissionEnum.HIDDEN.getPermission()) {
                        //隐藏
                        sources = null;
                    }
                }
            }
        }


        return resultMap.successAndRefreshToken(request).payloads(sources);
    }

    /**
     * 创建source
     *
     * @param sourceCreate
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap createSource(SourceCreate sourceCreate, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Project project = projectMapper.getById(sourceCreate.getProjectId());

        if (isExist(sourceCreate.getName(), null, sourceCreate.getProjectId())) {
            log.info("the source {} name is already taken", sourceCreate.getName());
            return resultMap.failAndRefreshToken(request).message("the source name is already taken");
        }

        if (null == project) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //校验权限
        if (!allowWrite(project, user)) {
            log.info("user {} have not permisson to create source", user.getUsername());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to create source");
        }

        if (null == SourceTypeEnum.typeOf(sourceCreate.getType())) {
            return resultMap.failAndRefreshToken(request).message("Invalid source type");
        }

        //测试连接
        SourceConfig config = sourceCreate.getConfig();
        boolean testConnection = false;
        try {
            testConnection = sqlUtils.init(config.getUrl(), config.getUsername(), config.getPassword()).testConnection();
        } catch (SourceException e) {
            log.error(e.getMessage());
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        }

        if (testConnection) {
            Source source = new Source();
            source.setName(sourceCreate.getName());
            source.setDescription(sourceCreate.getDescription());
            source.setType(sourceCreate.getType());
            source.setProjectId(sourceCreate.getProjectId());
            source.setConfig(JSONObject.toJSONString(sourceCreate.getConfig()));

            int insert = sourceMapper.insert(source);
            if (insert > 0) {
                return resultMap.successAndRefreshToken(request).payload(source);
            } else {
                return resultMap.failAndRefreshToken(request).message("create source fail");
            }
        } else {
            return resultMap.failAndRefreshToken(request).message("get source connection fail");
        }
    }

    /**
     * 修改source
     *
     * @param sourceInfo
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap updateSource(SourceInfo sourceInfo, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        SourceWithProject sourceWithProject = sourceMapper.getSourceWithProjectById(sourceInfo.getId());

        if (null == sourceWithProject) {
            return resultMap.failAndRefreshToken(request).message("source not found");
        }

        Project project = sourceWithProject.getProject();


        if (isExist(sourceInfo.getName(), sourceInfo.getId(), project.getId())) {
            log.info("the source {} name is already taken", sourceInfo.getName());
            return resultMap.failAndRefreshToken(request).message("the source name is already taken");
        }


        if (null == project) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //校验权限
        if (!allowWrite(project, user)) {
            log.info("user {} have not permisson to update the source {}", user.getUsername(), sourceInfo.getId());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to update the source");
        }

        //测试连接
        SourceConfig config = sourceInfo.getConfig();
        boolean testConnection = false;
        try {
            testConnection = sqlUtils.init(config.getUrl(), config.getUsername(), config.getPassword()).testConnection();
        } catch (SourceException e) {
            log.error(e.getMessage());
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        }

        if (testConnection) {
            Source source = new Source();
            source.setId(sourceInfo.getId());
            source.setName(sourceInfo.getName());
            source.setDescription(sourceInfo.getDescription());
            source.setType(sourceInfo.getType());
            source.setProjectId(project.getId());
            source.setConfig(JSONObject.toJSONString(sourceInfo.getConfig()));

            sourceMapper.update(source);
            return resultMap.successAndRefreshToken(request);
        } else {
            return resultMap.failAndRefreshToken(request).message("get source connection fail");
        }
    }

    /**
     * 删除source
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap deleteSrouce(Long id, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        SourceWithProject sourceWithProject = sourceMapper.getSourceWithProjectById(id);

        if (null == sourceWithProject) {
            log.info("source {} not found", id);
            return resultMap.failAndRefreshToken(request).message("source not found");
        }

        if (null == sourceWithProject.getProject()) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //校验权限
        if (!allowDelete(sourceWithProject.getProject(), user)) {
            log.info("user {} have not permisson to delete the source {}", user.getUsername(), id);
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to delete the source");
        }

        List<View> viewList = viewMapper.getBySourceId(id);
        if (null != viewList && viewList.size() > 0) {
            log.info("There is at least one view using the source({}), it is can not be deleted", id);
            return resultMap.failAndRefreshToken(request).message("There is at least one view using the source, it is can not be deleted");
        }

        sourceMapper.deleteById(id);

        return resultMap.successAndRefreshToken(request);
    }

    /**
     * 测试连接
     *
     * @param sourceTest
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap testSource(SourceTest sourceTest, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        boolean testConnection = false;
        try {
            testConnection = sqlUtils.init(sourceTest.getUrl(), sourceTest.getUsername(), sourceTest.getPassword()).testConnection();
        } catch (SourceException e) {
            log.error(e.getMessage());
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        }
        if (testConnection) {
            return resultMap.successAndRefreshToken(request);
        } else {
            return resultMap.failAndRefreshToken(request).message("get source connection fail");
        }
    }

    /**
     * 生成csv对应的表结构
     *
     * @param sourceId
     * @param csvmeta
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap validCsvmeta(Long sourceId, Csvmeta csvmeta, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Source source = sourceMapper.getById(sourceId);
        if (null == source) {
            log.info("source ({}) not found", sourceId);
            return resultMap.failAndRefreshToken(request).message("source not found");
        }

        Project project = projectMapper.getById(source.getProjectId());

        if (null == project) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("Invalid source");
        }

        //校验权限
        if (!allowWrite(project, user)) {
            log.info("user {} have not permisson to upload csv file in this source {}", user.getUsername(), source.getId());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permisson to upload csv file in this source");
        }

        if (csvmeta.getMode() != CsvmetaModeEnum.REPLACE.getMode()) {
            try {
                boolean tableIsExist = sqlUtils.init(source).tableIsExist(csvmeta.getTableName());
                if (csvmeta.getMode() == CsvmetaModeEnum.NEW.getMode()) {
                    if (tableIsExist) {
                        return resultMap.failAndRefreshToken(request).message("table " + csvmeta.getTableName() + " is already exist");
                    }
                } else {
                    if (!tableIsExist) {
                        return resultMap.failAndRefreshToken(request).message("table " + csvmeta.getTableName() + " is not exist");
                    }
                }
            } catch (SourceException e) {
                log.error(e.getMessage());
                return resultMap.failAndRefreshToken(request).message(e.getMessage());
            }
        }
        return resultMap.successAndRefreshToken(request);
    }

    /**
     * 上传csv文件
     *
     * @param sourceId
     * @param csvUpload
     * @param file
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap uploadCsv(Long sourceId, CsvUpload csvUpload, MultipartFile file, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        //校验文件是否csv文件
        if (!fileUtils.isCsv(file)) {
            return resultMap.failAndRefreshToken(request).message("Please upload csv file");
        }

        Source source = sourceMapper.getById(sourceId);
        if (null == source) {
            log.info("source ({}) not found", sourceId);
            return resultMap.failAndRefreshToken(request).message("source not found");
        }

        Project project = projectMapper.getById(source.getProjectId());

        if (null == project) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("Invalid source");
        }

        //校验权限
        if (!allowWrite(project, user)) {
            log.info("user {} have not permisson to upload csv file in this source {}", user.getUsername(), source.getId());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permisson to upload csv file in this source");
        }

        try {
            //解析csv文件
            CsvEntity csvEntity = CsvUtils.parseCsvWithFirstAsHeader(file, "UTF-8");

            if (null != csvEntity && null != csvEntity.getHeaders() && csvEntity.getHeaders().size() > 0) {
                //建表
                createTable(csvEntity.getHeaders(), csvUpload, source);

                //传输数据
                insertData(csvEntity.getHeaders(), csvEntity.getValues(), csvUpload, source);
            }
        } catch (SourceException e) {
            e.printStackTrace();
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        } catch (ServerException e) {
            e.printStackTrace();
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        }

        return resultMap.successAndRefreshToken(request);
    }


    /**
     * 建表
     *
     * @param fileds
     * @param csvUpload
     * @param source
     * @throws ServerException
     */
    private void createTable(Set<QueryColumn> fileds, CsvUpload csvUpload, Source source) throws ServerException {

        if (null == fileds || fileds.size() <= 0) {
            throw new ServerException("there is have not any fileds");
        }

        SqlUtils sqlUtils = this.sqlUtils.init(source);

        STGroup stg = new STGroupFile(Constants.SQL_TEMPLATE);

        String sql = null;

        if (csvUpload.getMode() == CsvmetaModeEnum.REPLACE.getMode()) {
            ST st = stg.getInstanceOf("createTable");
            st.add("tableName", csvUpload.getTableName());
            st.add("fields", fileds);
            st.add("primaryKeys", StringUtils.isEmpty(csvUpload.getPrimaryKeys()) ? null : csvUpload.getPrimaryKeys().split(","));
            st.add("indexKeys", csvUpload.getIndexList());
            sql = st.render();
            String dropSql = "DROP TABLE IF EXISTS `" + csvUpload.getTableName() + "`";
            sqlUtils.jdbcTemplate().execute(dropSql);
            log.info("drop table sql : {}", dropSql);
        } else {
            boolean tableIsExist = sqlUtils.tableIsExist(csvUpload.getTableName());
            if (csvUpload.getMode() == CsvmetaModeEnum.NEW.getMode()) {
                if (!tableIsExist) {
                    ST st = stg.getInstanceOf("createTable");
                    st.add("tableName", csvUpload.getTableName());
                    st.add("fields", fileds);
                    st.add("primaryKeys", csvUpload.getPrimaryKeys());
                    st.add("indexKeys", csvUpload.getIndexList());

                    sql = st.render();
                } else {
                    throw new ServerException("table " + csvUpload.getTableName() + " is already exist");
                }
            } else {
                if (!tableIsExist) {
                    throw new ServerException("table " + csvUpload.getTableName() + " is not exist");
                }
            }
        }

        log.info("create table sql : {}", sql);
        try {
            if (!StringUtils.isEmpty(sql)) {
                sqlUtils.jdbcTemplate().execute(sql);
            }
        } catch (Exception e) {
            throw new ServerException(e.getMessage());
        }
    }


    /**
     * 插入数据
     *
     * @param headers
     * @param values
     * @param csvUpload
     * @param source
     */
    private void insertData(Set<QueryColumn> headers, List<Map<String, Object>> values, CsvUpload csvUpload, Source source) throws ServerException {
        if (null == values || values.size() <= 0) {
            return;
        }

        SqlUtils sqlUtils = this.sqlUtils.init(source);

        try {
            if (csvUpload.getMode() == CsvmetaModeEnum.REPLACE.getMode()) {
                //清空表
                sqlUtils.jdbcTemplate().execute("Truncate table `" + csvUpload.getTableName() + "`");
                //插入数据
                executeInsert(csvUpload.getTableName(), headers, values, sqlUtils);
            } else {
                boolean tableIsExist = sqlUtils.tableIsExist(csvUpload.getTableName());
                if (tableIsExist) {
                    executeInsert(csvUpload.getTableName(), headers, values, sqlUtils);
                } else {
                    throw new ServerException("table " + csvUpload.getTableName() + " is not exist");
                }
            }
        } catch (ServerException e) {
            e.printStackTrace();
            throw new ServerException(e.getMessage());
        }

    }


    /**
     * 多线程执行插入数据
     *
     * @param tableName
     * @param headers
     * @param values
     * @param sqlUtils
     * @throws ServerException
     */
    private void executeInsert(String tableName, Set<QueryColumn> headers, List<Map<String, Object>> values, SqlUtils sqlUtils) throws ServerException {
        if (null != values && values.size() > 0) {
            int len = 1000;
            int totalSize = values.size();
            int pageSize = len;
            int totalPage = totalSize / pageSize;
            if (totalSize % pageSize != 0) {
                totalPage += 1;
                if (totalSize < pageSize) {
                    pageSize = values.size();
                }
            }

            ExecutorService executorService = Executors.newCachedThreadPool();

            STGroup stg = new STGroupFile(Constants.SQL_TEMPLATE);
            ST st = stg.getInstanceOf("insertData");
            st.add("tableName", tableName);
            st.add("columns", headers);
            String sql = st.render();
            log.info("sql : {}", st.render());
            Future future = null;

            //分页批量插入
            long startTime = System.currentTimeMillis();
            log.info("execute insert start ----  {}", DateUtils.toyyyyMMddHHmmss(startTime));
            for (int pageNum = 1; pageNum < totalPage + 1; pageNum++) {
                int localPageNum = pageNum;
                int localPageSize = pageSize;
                future = executorService.submit(() -> {
                    int starNum = (localPageNum - 1) * localPageSize;
                    int endNum = localPageNum * localPageSize > totalSize ? (totalSize) : localPageNum * localPageSize;
                    log.info("executeInsert thread-{} : start:{}, end: {}", localPageNum, starNum, endNum);
                    sqlUtils.executeBatch(sql, headers, values.subList(starNum, endNum));
                });
            }

            try {
                future.get();

                long endTime = System.currentTimeMillis();
                log.info("execute insert end ----  {}", DateUtils.toyyyyMMddHHmmss(endTime));
                log.info("execution time {} second", (endTime - startTime) / 1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
                throw new ServerException(e.getMessage());
            } catch (ExecutionException e) {
                e.printStackTrace();
                throw new ServerException(e.getMessage());
            } finally {
                executorService.shutdown();
            }
        }
    }
}
