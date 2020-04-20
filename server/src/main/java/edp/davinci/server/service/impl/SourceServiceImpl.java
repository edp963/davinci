/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2019 EDP
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

import static edp.davinci.server.commons.Constants.DAVINCI_TOPIC_CHANNEL;
import static edp.davinci.server.commons.Constants.JDBC_DATASOURCE_DEFAULT_VERSION;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.stringtemplate.v4.ST;
import org.stringtemplate.v4.STGroup;
import org.stringtemplate.v4.STGroupFile;

import edp.davinci.commons.util.JSONUtils;
import edp.davinci.commons.util.MD5Utils;
import edp.davinci.core.dao.entity.Source;
import edp.davinci.server.commons.Constants;
import edp.davinci.server.component.jdbc.JdbcDataSource;
import edp.davinci.server.dao.SourceExtendMapper;
import edp.davinci.server.dao.ViewExtendMapper;
import edp.davinci.server.dto.project.ProjectDetail;
import edp.davinci.server.dto.project.ProjectPermission;
import edp.davinci.server.dto.source.DatasourceType;
import edp.davinci.server.dto.source.DbBaseInfo;
import edp.davinci.server.dto.source.SourceConfig;
import edp.davinci.server.dto.source.SourceCreate;
import edp.davinci.server.dto.source.SourceDataUpload;
import edp.davinci.server.dto.source.SourceInfo;
import edp.davinci.server.dto.source.UploadMeta;
import edp.davinci.server.enums.CheckEntityEnum;
import edp.davinci.server.enums.DataTypeEnum;
import edp.davinci.server.enums.FileTypeEnum;
import edp.davinci.server.enums.LogNameEnum;
import edp.davinci.server.enums.SourceTypeEnum;
import edp.davinci.server.enums.UploadModeEnum;
import edp.davinci.server.enums.UserPermissionEnum;
import edp.davinci.server.exception.NotFoundException;
import edp.davinci.server.exception.ServerException;
import edp.davinci.server.exception.SourceException;
import edp.davinci.server.exception.UnAuthorizedExecption;
import edp.davinci.server.model.DBTables;
import edp.davinci.server.model.DataUploadEntity;
import edp.davinci.server.model.JdbcSourceInfo;
import edp.davinci.server.model.QueryColumn;
import edp.davinci.server.model.RedisMessageEntity;
import edp.davinci.server.model.TableInfo;
import edp.davinci.core.dao.entity.User;
import edp.davinci.core.dao.entity.View;
import edp.davinci.server.runner.LoadSupportDataSourceRunner;
import edp.davinci.server.service.ProjectService;
import edp.davinci.server.service.SourceService;
import edp.davinci.server.util.BaseLock;
import edp.davinci.commons.util.CollectionUtils;
import edp.davinci.server.util.CsvUtils;
import edp.davinci.server.util.ExcelUtils;
import edp.davinci.server.util.FileUtils;
import edp.davinci.server.util.RedisUtils;
import edp.davinci.server.util.SourceUtils;
import edp.davinci.server.util.SqlUtils;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service("sourceService")
public class SourceServiceImpl extends BaseEntityService implements SourceService {

	private static final Logger optLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_OPERATION.getName());

	@Autowired
	private SourceExtendMapper sourceExtendMapper;

	@Autowired
	private SqlUtils sqlUtils;

	@Autowired
	private ViewExtendMapper viewMapper;

	@Autowired
	private ProjectService projectService;

	@Autowired
	private JdbcDataSource jdbcDataSource;

	@Autowired
	private RedisUtils redisUtils;
	
	private static final CheckEntityEnum entity = CheckEntityEnum.SOURCE;

	@Override
	public boolean isExist(String name, Long id, Long projectId) {
		Long sourceId = sourceExtendMapper.getByNameWithProject(name, projectId);
		if (null != id && null != sourceId) {
			return !id.equals(sourceId);
		}
		return null != sourceId && sourceId.longValue() > 0L;
	}
	
	private void checkIsExist(String name, Long id, Long projectId) {
		if (isExist(name, id, projectId)) {
			alertNameTaken(entity, name);
		}
	}
	
	/**
	 * 获取source列表
	 *
	 * @param projectId
	 * @param user
	 * @return
	 */
	@Override
	public List<Source> getSources(Long projectId, User user)
			throws NotFoundException, UnAuthorizedExecption, ServerException {

		ProjectDetail projectDetail = null;
		try {
			projectDetail = projectService.getProjectDetail(projectId, user, false);
		} catch (NotFoundException e) {
			throw e;
		} catch (UnAuthorizedExecption e) {
			return null;
		}

		List<Source> sources = sourceExtendMapper.getByProject(projectId);

		if (!CollectionUtils.isEmpty(sources)) {
			ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);
			if (projectPermission.getSourcePermission() == UserPermissionEnum.HIDDEN.getPermission()) {
				sources = null;
			}
		}

		return sources;
	}

	@Override
	public Source getSourceDetail(Long id, User user)
			throws NotFoundException, UnAuthorizedExecption, ServerException {

		Source source = getSource(id);

		ProjectPermission projectPermission = getProjectPermission(source.getProjectId(), user);

		if (projectPermission.getSourcePermission() == UserPermissionEnum.HIDDEN.getPermission()) {
			throw new UnAuthorizedExecption();
		}

		if (projectPermission.getSourcePermission() == UserPermissionEnum.READ.getPermission()) {
			source.setConfig(null);
		}

		return source;
	}

	/**
	 * 创建source
	 *
	 * @param sourceCreate
	 * @param user
	 * @return
	 */
	@Override
	@Transactional
	public Source createSource(SourceCreate sourceCreate, User user)
			throws NotFoundException, UnAuthorizedExecption, ServerException {
		
		Long projectId = sourceCreate.getProjectId();
		checkWritePermission(entity, projectId, user, "create");

		String name = sourceCreate.getName();
		checkIsExist(name, null, projectId);

		if (null == SourceTypeEnum.typeOf(sourceCreate.getType())) {
			throw new ServerException("Invalid source type");
		}

		BaseLock lock = getLock(entity, name, projectId);
		if (lock != null && !lock.getLock()) {
			alertNameTaken(entity, name);
		}
		
		try{

			SourceConfig config = sourceCreate.getConfig();
			
			// 测试连接
			if (!testConnection(config)) {
				throw new ServerException("Test source connection fail");
			}
			
			Source source = new Source();
			source.setCreateBy(user.getId());
			source.setCreateTime(new Date());
			BeanUtils.copyProperties(sourceCreate, source);
			source.setConfig(JSONUtils.toString(config));
			insertSource(source);

			optLogger.info("Source({}) is create by user({})", source.getId(), user.getId());
			return source;
		}finally {
			releaseLock(lock);
		}
	}
	
	@Transactional
	private void insertSource(Source source) {
		if (sourceExtendMapper.insert(source) != 1) {
			log.error("Create source({}) fail", source);
			throw new ServerException("Create source fail");
		}
	}
	
	private Source getSource(Long id) {

		Source source = sourceExtendMapper.selectByPrimaryKey(id);

		if (null == source) {
			log.error("Source({}) is not found", id);
			throw new NotFoundException("Source is not found");
		}

		return source;
	}

	private boolean testConnection(SourceConfig config) {
		return sqlUtils.init(
                        config.getUrl(),
                        config.getUsername(),
                        config.getPassword(),
                        config.getVersion(),
                        config.getProperties(),
                        config.isExt(),
                        null
                ).testConnection();
	}

	/**
	 * 修改source
	 *
	 * @param sourceInfo
	 * @param user
	 * @return
	 */
	@Override
	@Transactional
	public Source updateSource(SourceInfo sourceInfo, User user)
			throws NotFoundException, UnAuthorizedExecption, ServerException {
		
		Source source = getSource(sourceInfo.getId());
		checkWritePermission(entity, source.getProjectId(), user, "update");
		
		String name = sourceInfo.getName();
		Long projectId = source.getProjectId();
		checkIsExist(name, source.getId(), projectId);
		
        BaseLock lock = getLock(entity, name, projectId);
        if (!lock.getLock()) {
        	alertNameTaken(entity, name);
        }

		try {
			
			SourceConfig config = sourceInfo.getConfig();

			// 失效的数据源
			Source sourceCopy = new Source();
			BeanUtils.copyProperties(source, sourceCopy);

			String sourceCopyConfig = sourceCopy.getConfig();
			
			// 释放失效数据源
			String copyKey = SourceUtils.getSourceKey(
					source.getName(),
					SourceUtils.getJdbcUrl(sourceCopyConfig), 
					SourceUtils.getUsername(sourceCopyConfig),
					SourceUtils.getPassword(sourceCopyConfig), 
					SourceUtils.getDbVersion(sourceCopyConfig), 
					SourceUtils.isExt(sourceCopyConfig));
			
			String newKey = SourceUtils.getSourceKey(
					sourceInfo.getName(),
					config.getUrl(), 
					config.getUsername(), 
					config.getPassword(),
					config.getVersion(), 
					config.isExt());
			
			if (!newKey.equals(copyKey)) {
				releaseSource(sourceCopy);
				// 测试连接
				if (!testConnection(config)) {
					throw new ServerException("Test source connection fail");
				}
			}
			
			BeanUtils.copyProperties(sourceInfo, source);
			source.setUpdateBy(user.getId());
			source.setUpdateTime(new Date());
			source.setConfig(JSONUtils.toString(sourceInfo.getConfig()));
			updateSource(source);

			optLogger.info("Source({}) is update by user({})", source.getId(), user.getId());
			return source;
			
		} finally {
			releaseLock(lock);
		}
	}
	
	@Transactional
	private void updateSource(Source source) {
		if (sourceExtendMapper.update(source) != 1) {
			log.error("Update source({}) fail", source.getId());
			throw new ServerException("Update source fail");
		}
	}

	/**
	 * 删除source
	 *
	 * @param id
	 * @param user
	 * @return
	 */
	@Override
	@Transactional
	public boolean deleteSrouce(Long id, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

		Source source = getSource(id);

		checkWritePermission(entity, source.getProjectId(), user, "delete");

		List<View> viewList = viewMapper.getBySourceId(id);
		if (!CollectionUtils.isEmpty(viewList)) {
			log.error("There is at least one view using the source({}), it is can not be deleted", id);
			throw new ServerException("There is at least one view using the source, it is can not be deleted");
		}

		if (sourceExtendMapper.deleteByPrimaryKey(id) == 1) {
			optLogger.info("Source({}) is delete by user({})", source.toString(), user.getId());
			releaseSource(source);
			return true;
		}

		return false;
	}

	/**
	 * 测试连接
	 *
	 * @param sourceTest
	 * @return
	 */
	@Override
	public boolean testSource(SourceConfig config) throws ServerException {

		boolean testConnection = false;
		
		try {

			if (!config.isExt()) {
				config.setVersion(null);
			}

			if (StringUtils.isEmpty(config.getVersion())
					|| JDBC_DATASOURCE_DEFAULT_VERSION.equals(config.getVersion())) {
				config.setVersion(null);
				config.setExt(false);
			}

            testConnection = testConnection(config);

		} catch (SourceException e) {
			log.error(e.getMessage(), e);
			throw new ServerException(e.getMessage());
		}

		if (!testConnection) {
			throw new ServerException("Test source connection fail");
		}

		return true;
	}

	/**
	 * 生成csv对应的表结构
	 *
	 * @param sourceId
	 * @param uploadMeta
	 * @param user
	 * @return
	 */
	@Override
	public void validCsvmeta(Long sourceId, UploadMeta uploadMeta, User user)
			throws NotFoundException, UnAuthorizedExecption, ServerException {

		Source source = getSource(sourceId);

		checkWritePermission(entity, source.getProjectId(), user, "upload csv file in");

		if (uploadMeta.getMode() == UploadModeEnum.REPLACE.getMode()) {
			return;
		}

		try {
			boolean tableIsExist = sqlUtils.init(source).tableIsExist(uploadMeta.getTableName());
			if (uploadMeta.getMode() == UploadModeEnum.NEW.getMode()) {
				if (tableIsExist) {
					throw new ServerException("Table " + uploadMeta.getTableName() + " is already exist");
				}
			} else {
				if (!tableIsExist) {
					throw new ServerException("Table " + uploadMeta.getTableName() + " is not exist");
				}
			}
		} catch (SourceException e) {
			log.error(e.getMessage(), e);
			throw new ServerException(e.getMessage());
		}
	}

	/**
	 * 上传csv文件
	 *
	 * @param sourceId
	 * @param sourceDataUpload
	 * @param file
	 * @param user
	 * @param type
	 * @return
	 */
	@Override
	@Transactional
	public Boolean dataUpload(Long sourceId, SourceDataUpload sourceDataUpload, MultipartFile file, User user,
			String type) throws NotFoundException, UnAuthorizedExecption, ServerException {

		Source source = getSource(sourceId);

		checkWritePermission(entity, source.getProjectId(), user, "upload data in");

		if (!type.equals(FileTypeEnum.CSV.getType()) && !type.equals(FileTypeEnum.XLSX.getType())
				&& !type.equals(FileTypeEnum.XLS.getType())) {
			throw new ServerException("Unsupported file format");
		}

		// 校验文件是否csv文件
		if (type.equals(FileTypeEnum.CSV.getType()) && !FileUtils.isCsv(file)) {
			throw new ServerException("Please upload csv file");
		}

		if (type.equals(FileTypeEnum.XLSX.getType()) && !FileUtils.isExcel(file)) {
			throw new ServerException("Please upload excel file");
		}

		String config = source.getConfig();
		String url = SourceUtils.getJdbcUrl(config);
		DataTypeEnum dataTypeEnum = DataTypeEnum.urlOf(url);
		if (dataTypeEnum != DataTypeEnum.MYSQL) {
			log.error("Unsupported data source, url:{}", url);
			throw new ServerException("Unsupported data source, url:" + url);
		}

		try {
			DataUploadEntity dataUploadEntity = null;
			if (type.equals(FileTypeEnum.CSV.getType())) {
				// 解析csv文件
				dataUploadEntity = CsvUtils.parseCsvWithFirstAsHeader(file, "UTF-8");
			} else {
				// 解析excel文件
				dataUploadEntity = ExcelUtils.parseExcelWithFirstAsHeader(file);
			}

			if (null != dataUploadEntity && !CollectionUtils.isEmpty(dataUploadEntity.getHeaders())) {
				// 建表
				createTable(dataUploadEntity.getHeaders(), sourceDataUpload, source);
				// 传输数据
				insertData(dataUploadEntity.getHeaders(), dataUploadEntity.getValues(), sourceDataUpload, source);
			}
		} catch (Exception e) {
			throw new ServerException(e.getMessage());
		}

		return true;
	}
	
	private <T> T handleHiddenPermission(T obj, ProjectDetail projectDetail, User user, Long sourceId,
			String operation) {
		ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);
		if (projectPermission.getSourcePermission() != UserPermissionEnum.HIDDEN.getPermission()) {
			return obj;
		}
		
		log.info("User({}) have not permission to get {} from source({}", user.getId(), operation, sourceId);
		return null;
	}
	
	/**
	 * 获取Source 的 db
	 *
	 * @param id
	 * @param user
	 * @return
	 * @throws NotFoundException
	 * @throws ServerException
	 */
	@Override
	public List<String> getSourceDatabases(Long id, User user) throws NotFoundException, ServerException {

		Source source = getSource(id);

		ProjectDetail projectDetail = projectService.getProjectDetail(source.getProjectId(), user, false);

		List<String> dbList = null;

		try {
			dbList = sqlUtils.init(source).getDatabases();
		} catch (SourceException e) {
			throw new ServerException(e.getMessage());
		}

		if (null != dbList) {
			dbList = handleHiddenPermission(dbList, projectDetail, user, source.getId(), "databases");
		}

		return dbList;
	}

	/**
	 * 获取Source的data tables
	 *
	 * @param id
	 * @param user
	 * @return
	 */
	@Override
	public DBTables getSourceTables(Long id, String dbName, User user) throws NotFoundException {

		DBTables dbTable = new DBTables(dbName);

		Source source = getSource(id);

		ProjectDetail projectDetail = projectService.getProjectDetail(source.getProjectId(), user, false);

		List<QueryColumn> tableList = null;
		try {
			tableList = sqlUtils.init(source).getTableList(dbName);
		} catch (SourceException e) {
			throw new ServerException(e.getMessage());
		}

		if (null != tableList) {
			handleHiddenPermission(tableList, projectDetail, user, source.getId(), "tables");
		}

		if (null != tableList) {
			dbTable.setTables(tableList);
		}

		return dbTable;
	}

	/**
	 * 获取Source的data tables
	 *
	 * @param id
	 * @param user
	 * @return
	 */
	@Override
	public TableInfo getTableInfo(Long id, String dbName, String tableName, User user) throws NotFoundException {

		Source source = getSource(id);

		ProjectDetail projectDetail = projectService.getProjectDetail(source.getProjectId(), user, false);

		TableInfo tableInfo = null;
		try {
			tableInfo = sqlUtils.init(source).getTableInfo(dbName, tableName);
		} catch (SourceException e) {
			e.printStackTrace();
			throw new ServerException(e.getMessage());
		}

		if (null != tableInfo) {
			handleHiddenPermission(tableInfo, projectDetail, user, source.getId(), "table columns");
		}

		return tableInfo;
	}

	@Override
	public List<DatasourceType> getSupportDatasources() {

		return LoadSupportDataSourceRunner.getSupportDatasourceList();
	}

	@Override
	public boolean reconnect(Long id, DbBaseInfo dbBaseInfo, User user)
			throws NotFoundException, UnAuthorizedExecption, ServerException {

		Source source = getSource(id);

		checkWritePermission(entity, source.getProjectId(), user, "reconnect");

		String config = source.getConfig();
		if (!(dbBaseInfo.getDbUser().equals(SourceUtils.getUsername(config))
				&& dbBaseInfo.getDbPassword().equals(SourceUtils.getPassword(config)))) {
			log.error("Reconnect source({}) error, username or password is wrong", id);
			throw new ServerException("username or password is wrong");
		}

		releaseSource(source);

		return sqlUtils.init(source).testConnection();
	}

	/**
	 * 释放失效数据源
	 * 
	 * @param source
	 */
	private void releaseSource(Source source) {
		
		String config = source.getConfig();
		
		SourceUtils sourceUtils = new SourceUtils(jdbcDataSource);
		String url = SourceUtils.getJdbcUrl(config);
		JdbcSourceInfo jdbcSourceInfo = JdbcSourceInfo
				 .builder()
				.jdbcUrl(url)
				.username(SourceUtils.getUsername(config))
				.password(SourceUtils.getPassword(config))
				.database(SourceUtils.getDataSourceName(url))
				.dbVersion(SourceUtils.getDbVersion(config))
				.properties(SourceUtils.getProperties(config))
				.ext(SourceUtils.isExt(config))
				.sourceName(SourceUtils.getSourceName(source.getName(), source.getProjectId()))
				.build();

		if (redisUtils.isRedisEnable()) {
			publishReconnect(JSONUtils.toString(jdbcSourceInfo));
		} else {
			sourceUtils.releaseDataSource(jdbcSourceInfo);
		}
	}

	/**
	 * 向redis发布reconnect消息
	 * 
	 * @param id
	 */
	private void publishReconnect(String message) {

		//	String flag = MD5Utils.getMD5(UUID.randomUUID().toString() + id, true, 32);
		// the flag is deprecated
		String flag = "-1";
		redisUtils.convertAndSend(DAVINCI_TOPIC_CHANNEL, new RedisMessageEntity(SourceMessageHandler.class,  message, flag));
	}

	/**
	 * 建表
	 *
	 * @param fileds
	 * @param sourceDataUpload
	 * @param source
	 * @throws ServerException
	 */
	private void createTable(Set<QueryColumn> fileds, SourceDataUpload sourceDataUpload, Source source)
			throws ServerException {

		if (CollectionUtils.isEmpty(fileds)) {
			throw new ServerException("There is have not any fileds");
		}

		SqlUtils sqlUtils = this.sqlUtils.init(source);

		STGroup stg = new STGroupFile(Constants.SQL_TEMPLATE);

		String sql = null;

		if (sourceDataUpload.getMode() == UploadModeEnum.REPLACE.getMode()) {
			ST st = stg.getInstanceOf("createTable");
			st.add("tableName", sourceDataUpload.getTableName());
			st.add("fields", fileds);
			st.add("primaryKeys", StringUtils.isEmpty(sourceDataUpload.getPrimaryKeys()) ? null
					: sourceDataUpload.getPrimaryKeys().split(","));
			st.add("indexKeys", sourceDataUpload.getIndexList());
			sql = st.render();
			String dropSql = "drop table if exists `" + sourceDataUpload.getTableName() + "`";
			sqlUtils.jdbcTemplate().execute(dropSql);
			log.info("Drop table sql:{}", SqlUtils.formatSql(dropSql));
		
		} else {
			boolean tableIsExist = sqlUtils.tableIsExist(sourceDataUpload.getTableName());
			if (sourceDataUpload.getMode() == UploadModeEnum.NEW.getMode()) {
				if (!tableIsExist) {
					ST st = stg.getInstanceOf("createTable");
					st.add("tableName", sourceDataUpload.getTableName());
					st.add("fields", fileds);
					st.add("primaryKeys", sourceDataUpload.getPrimaryKeys());
					st.add("indexKeys", sourceDataUpload.getIndexList());

					sql = st.render();
				} else {
					throw new ServerException("Table " + sourceDataUpload.getTableName() + " is already exist");
				}
			} else {
				if (!tableIsExist) {
					throw new ServerException("Table " + sourceDataUpload.getTableName() + " is not exist");
				}
			}
		}

		log.info("Create table sql:{}", SqlUtils.formatSql(sql));
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
	 * @param sourceDataUpload
	 * @param source
	 */
	private void insertData(Set<QueryColumn> headers, List<Map<String, Object>> values,
			SourceDataUpload sourceDataUpload, Source source) throws ServerException {

		if (CollectionUtils.isEmpty(values)) {
			return;
		}

		SqlUtils sqlUtils = this.sqlUtils.init(source);

		try {
			if (sourceDataUpload.getMode() == UploadModeEnum.REPLACE.getMode()) {
				// 清空表
				sqlUtils.jdbcTemplate().execute("Truncate table `" + sourceDataUpload.getTableName() + "`");
				// 插入数据
				executeInsert(sourceDataUpload.getTableName(), headers, values, sqlUtils);
			} else {
				boolean tableIsExist = sqlUtils.tableIsExist(sourceDataUpload.getTableName());
				if (tableIsExist) {
					executeInsert(sourceDataUpload.getTableName(), headers, values, sqlUtils);
				} else {
					throw new ServerException("Table " + sourceDataUpload.getTableName() + " is not exist");
				}
			}
		} catch (ServerException e) {
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
	private void executeInsert(String tableName, Set<QueryColumn> headers, List<Map<String, Object>> values,
			SqlUtils sqlUtils) throws ServerException {

		if (!CollectionUtils.isEmpty(values)) {
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

			ExecutorService executorService = Executors.newFixedThreadPool(totalPage > 8 ? 8 : totalPage);

			STGroup stg = new STGroupFile(Constants.SQL_TEMPLATE);
			ST st = stg.getInstanceOf("insertData");
			st.add("tableName", tableName);
			st.add("columns", headers);
			String sql = st.render();
			String md5 = MD5Utils.getMD5(sql, true, 16);
			log.info("Execute insert start md5:{} sql:{}", md5, SqlUtils.formatSql(sql));
			
			List<Future> futures = new ArrayList<>();
			// 分页批量插入
			long startTime = System.currentTimeMillis();
			for (int pageNum = 1; pageNum < totalPage + 1; pageNum++) {
				int localPageNum = pageNum;
				int localPageSize = pageSize;
				Future future = executorService.submit(() -> {
					int starNum = (localPageNum - 1) * localPageSize;
					int endNum = localPageNum * localPageSize > totalSize ? (totalSize) : localPageNum * localPageSize;
					log.info("Execute insert thread-{} : start:{}, end:{}, md5:{}", localPageNum, starNum, endNum, md5);
					sqlUtils.executeBatch(sql, headers, values.subList(starNum, endNum));
				});
				futures.add(future);
			}

			try {
				for (Future future : futures) {
					future.get();
				}
				long endTime = System.currentTimeMillis();
				log.info("Execute insert end md5:{}, cost:{} ms", md5, endTime - startTime);
			} catch (InterruptedException | ExecutionException e) {
				throw new ServerException(e.getMessage());
			} finally {
				executorService.shutdown();
			}
		}
	}

}
