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

import edp.davinci.commons.util.CollectionUtils;
import edp.davinci.commons.util.JSONUtils;
import edp.davinci.commons.util.StringUtils;
import edp.davinci.core.dao.entity.Source;
import edp.davinci.core.dao.entity.User;
import edp.davinci.core.dao.entity.View;
import edp.davinci.data.enums.DatabaseTypeEnum;
import edp.davinci.data.pojo.DatabaseType;
import edp.davinci.data.pojo.SourceConfig;
import edp.davinci.data.provider.DataProviderFactory;
import edp.davinci.data.runner.LoadSupportDatabaseRunner;
import edp.davinci.data.source.JdbcDataSource;
import edp.davinci.data.util.JdbcSourceUtils;
import edp.davinci.server.commons.Constants;
import edp.davinci.server.dao.SourceExtendMapper;
import edp.davinci.server.dao.ViewExtendMapper;
import edp.davinci.server.dto.project.ProjectDetail;
import edp.davinci.server.dto.project.ProjectPermission;
import edp.davinci.server.dto.source.*;
import edp.davinci.server.enums.*;
import edp.davinci.server.exception.NotFoundException;
import edp.davinci.server.exception.ServerException;
import edp.davinci.server.exception.SourceException;
import edp.davinci.server.exception.UnAuthorizedExecption;
import edp.davinci.server.model.*;
import edp.davinci.server.service.ProjectService;
import edp.davinci.server.service.SourceService;
import edp.davinci.server.util.*;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.stringtemplate.v4.ST;
import org.stringtemplate.v4.STGroup;
import org.stringtemplate.v4.STGroupFile;

import java.util.Date;
import java.util.List;
import java.util.Map;

import static edp.davinci.server.commons.Constants.DAVINCI_TOPIC_CHANNEL;
import static edp.davinci.server.commons.Constants.JDBC_DATASOURCE_DEFAULT_VERSION;

@Slf4j
@Service("sourceService")
public class SourceServiceImpl extends BaseEntityService implements SourceService {

	private static final Logger optLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_OPERATION.getName());

	@Autowired
	private SourceExtendMapper sourceExtendMapper;

	@Autowired
	private ViewExtendMapper viewMapper;

	@Autowired
	private ProjectService projectService;

	@Autowired
	JdbcDataSource jdbcDataSource;

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

		Source source = getSource(id, false);

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
			config.setType(sourceCreate.getType());
			
			if (!testConnection(config, user)) {
				throw new ServerException("Test source connection fail");
			}

			config.setPassword(SourcePasswordEncryptUtils.encrypt(config.getPassword()));
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
	protected void insertSource(Source source) {
		if (sourceExtendMapper.insert(source) != 1) {
			log.error("Create source({}) fail", source);
			throw new ServerException("Create source fail");
		}
	}
	
	private Source getSource(Long id, boolean decrypt) {

		Source source = sourceExtendMapper.selectByPrimaryKey(id);
		if (null == source) {
			log.error("Source({}) is not found", id);
			throw new NotFoundException("Source is not found");
		}

		if (decrypt) {
			source = SourcePasswordEncryptUtils.decryptPassword(source);
		}

		return source;
	}
	
	private boolean testConnection(SourceConfig config, User user) {
		Source source = new Source();
		source.setConfig(JSONUtils.toString(config));
		if (StringUtils.isNull(config.getType())) {
			config.setType("jdbc");
		}
		return DataProviderFactory.getProvider(config.getType()).test(source, user);
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

		Source source = getSource(sourceInfo.getId(), false);
		checkWritePermission(entity, source.getProjectId(), user, "update");

		boolean changePwd = !JdbcSourceUtils.getPassword(source.getConfig()).equals(sourceInfo.getConfig().getPassword());
		source = SourcePasswordEncryptUtils.decryptPassword(source);

		String name = sourceInfo.getName();
		Long projectId = source.getProjectId();
		checkIsExist(name, source.getId(), projectId);
		
        BaseLock lock = getLock(entity, name, projectId);
        if (!lock.getLock()) {
        	alertNameTaken(entity, name);
        }

		try {
			
			SourceConfig config = sourceInfo.getConfig();
			config.setType(sourceInfo.getType());

			// 失效的数据源
			Source sourceCopy = new Source();
			BeanUtils.copyProperties(source, sourceCopy);

			String sourceCopyConfig = sourceCopy.getConfig();
			
			String oldKey = JdbcSourceUtils.getSourceUID(
					source.getName(),
					JdbcSourceUtils.getUrl(sourceCopyConfig), 
					JdbcSourceUtils.getUsername(sourceCopyConfig),
					JdbcSourceUtils.getPassword(sourceCopyConfig), 
					JdbcSourceUtils.getVersion(sourceCopyConfig), 
					JdbcSourceUtils.isExt(sourceCopyConfig));

			String newPassword = changePwd ? config.getPassword() : SourcePasswordEncryptUtils.decrypt(config.getPassword());
			config.setPassword(newPassword);

			String newKey = JdbcSourceUtils.getSourceUID(
					sourceInfo.getName(),
					config.getUrl(), 
					config.getUsername(),
					config.getPassword(),
					config.getVersion(), 
					config.isExt());
			
			// 释放失效数据源
			if (!newKey.equals(oldKey)) {
				releaseSource(sourceCopy);
				if (!testConnection(config, user)) {
					throw new ServerException("Test source connection fail");
				}
			}
			
			BeanUtils.copyProperties(sourceInfo, source);
			source.setUpdateBy(user.getId());
			source.setUpdateTime(new Date());

			config.setPassword(SourcePasswordEncryptUtils.encrypt(config.getPassword()));
			source.setConfig(JSONUtils.toString(config));
			updateSource(source);

			optLogger.info("Source({}) is update by user({})", source.getId(), user.getId());
			return source;
			
		} finally {
			releaseLock(lock);
		}
	}
	
	@Transactional
	protected void updateSource(Source source) {
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

		Source source = getSource(id, false);

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
	 * @param config
	 * @param user
	 * @return
	 * @throws ServerException
	 */
	@Override
	public boolean testSource(SourceConfig config, User user) throws ServerException {

		boolean b = false;
		
		try {

			if (!config.isExt() || StringUtils.isEmpty(config.getVersion())
					|| JDBC_DATASOURCE_DEFAULT_VERSION.equals(config.getVersion())) {
				config.setVersion(null);
			}

			b = testConnection(config, user);

		} catch (SourceException e) {
			log.error(e.getMessage(), e);
			throw new ServerException(e.getMessage());
		}

		if (!b) {
			throw new ServerException("Test source connection fail");
		}

		return true;
	}

	/**
	 * 校验csv对应的表结构
	 *
	 * @param sourceId
	 * @param uploadMeta
	 * @param user
	 * @return
	 */
	@Override
	public void validCsvmeta(Long sourceId, UploadMeta uploadMeta, User user)
			throws NotFoundException, UnAuthorizedExecption, ServerException {

		Source source = getSource(sourceId, true);

		checkWritePermission(entity, source.getProjectId(), user, "upload csv file in");

		if (uploadMeta.getMode() == UploadModeEnum.REPLACE.getMode()) {
			return;
		}

		try {
			boolean tableIsExist = DataUtils.tableIsExist(source, uploadMeta.getTableName());
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

		Source source = getSource(sourceId, true);

		checkWritePermission(entity, source.getProjectId(), user, "upload data in");

		if (!type.equals(FileTypeEnum.CSV.getType()) && !type.equals(FileTypeEnum.XLSX.getType())
				&& !type.equals(FileTypeEnum.XLS.getType())) {
			throw new ServerException("Unsupported file format");
		}

		// 校验文件是否是csv文件
		if (type.equals(FileTypeEnum.CSV.getType()) && !FileUtils.isCsv(file)) {
			throw new ServerException("Please upload csv file");
		}

		if (type.equals(FileTypeEnum.XLSX.getType()) && !FileUtils.isExcel(file)) {
			throw new ServerException("Please upload excel file");
		}

		String config = source.getConfig();
		String url = JdbcSourceUtils.getUrl(config);
		DatabaseTypeEnum dataTypeEnum = DatabaseTypeEnum.urlOf(url);
		if (dataTypeEnum != DatabaseTypeEnum.MYSQL) {
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

			if (!CollectionUtils.isEmpty(dataUploadEntity.getHeaders())) {
				// 建表
				createTable(dataUploadEntity.getHeaders(), sourceDataUpload, source, user);
				// 传输数据
				insertData(dataUploadEntity.getHeaders(), dataUploadEntity.getValues(), sourceDataUpload, source, user);
			}
		
		} catch (Exception e) {
			throw new ServerException(e.getMessage());
		}

		return true;
	}
	
	private <T> T handleHiddenPermission(T obj, ProjectDetail projectDetail, Long sourceId, String operation,
			User user) {
		ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);
		if (projectPermission.getSourcePermission() != UserPermissionEnum.HIDDEN.getPermission()) {
			return obj;
		}

		log.info("User({}) have not permission to get {} from source({}", user.getId(), operation, sourceId);
		return null;
	}
	
	/**
	 * 获取source的database
	 *
	 * @param id
	 * @param user
	 * @return
	 * @throws NotFoundException
	 * @throws ServerException
	 */
	@Override
	public List<String> getSourceDatabases(Long id, User user) throws NotFoundException, ServerException {

		Source source = getSource(id, true);

		ProjectDetail projectDetail = projectService.getProjectDetail(source.getProjectId(), user, false);

		List<String> dbList = null;

		try {

			dbList = DataUtils.getDatabase(source, user);

		} catch (SourceException e) {
			throw new ServerException(e.getMessage());
		}

		if (null != dbList) {
			dbList = handleHiddenPermission(dbList, projectDetail, source.getId(), "databases", user);
		}

		return dbList;
	}

	/**
	 * 获取source的tables
	 *
	 * @param id
	 * @param user
	 * @return
	 */
	@Override
	public DBTables getSourceTables(Long id, String dbName, User user) throws NotFoundException {

		DBTables dbTable = new DBTables(dbName);

		Source source = getSource(id, true);

		ProjectDetail projectDetail = projectService.getProjectDetail(source.getProjectId(), user, false);

		List<QueryColumn> tableList = null;
		try {

			tableList = DataUtils.getTableList(source, dbName, user);

		} catch (SourceException e) {
			throw new ServerException(e.getMessage());
		}

		if (null != tableList) {
			handleHiddenPermission(tableList, projectDetail, source.getId(), "tables", user);
		}

		if (null != tableList) {
			dbTable.setTables(tableList);
		}

		return dbTable;
	}

	/**
	 * 获取source的table
	 *
	 * @param id
	 * @param user
	 * @return
	 */
	@Override
	public TableInfo getTableInfo(Long id, String dbName, String tableName, User user) throws NotFoundException {

		Source source = getSource(id, true);

		ProjectDetail projectDetail = projectService.getProjectDetail(source.getProjectId(), user, false);

		TableInfo tableInfo = null;
		try {

			tableInfo = DataUtils.getTableInfo(source, dbName, tableName, user);

		} catch (SourceException e) {
			throw new ServerException(e.getMessage());
		}

		if (null != tableInfo) {
			handleHiddenPermission(tableInfo, projectDetail, source.getId(), "table columns", user);
		}

		return tableInfo;
	}

	@Override
	public List<DatabaseType> getSupportDatabases() {
		return LoadSupportDatabaseRunner.getSupportDatabaseList();
	}

	@Override
	public boolean reconnect(Long id, DbBaseInfo dbBaseInfo, User user)
			throws NotFoundException, UnAuthorizedExecption, ServerException {

		Source source = getSource(id, true);

		checkWritePermission(entity, source.getProjectId(), user, "reconnect");

		String config = source.getConfig();
		if (!(dbBaseInfo.getDbUser().equals(JdbcSourceUtils.getUsername(config))
				&& dbBaseInfo.getDbPassword().equals(JdbcSourceUtils.getPassword(config)))) {
			log.error("Reconnect source({}) error, username or password is wrong", id);
			throw new ServerException("username or password is wrong");
		}

		releaseSource(source);

		return DataProviderFactory.getProvider(source.getType()).test(source, user);
	}

	/**
	 * 释放失效数据源
	 * 
	 * @param source
	 */
	private void releaseSource(Source source) {
		
		if (!SourceTypeEnum.JDBC.getType().equalsIgnoreCase(source.getType())
				&& !SourceTypeEnum.CSV.getType().equalsIgnoreCase(source.getType())) {
			return;
		}

		String url = JdbcSourceUtils.getUrl(source.getConfig());
		String config = source.getConfig();

		JdbcSourceUtils utils = new JdbcSourceUtils(jdbcDataSource);
		SourceConfig sourceConfig = SourceConfig
										.builder()
										.type(source.getType())
										.url(url)
										.username(JdbcSourceUtils.getUsername(config))
										.password(JdbcSourceUtils.getPassword(config))
										.database(JdbcSourceUtils.getDatabase(url))
										.version(JdbcSourceUtils.getVersion(config))
										.properties(JdbcSourceUtils.getProperties(config))
										.ext(JdbcSourceUtils.isExt(config))
										.name(JdbcSourceUtils.getSourceUName(source.getProjectId(), source.getName()))
										.build();

		utils.releaseDataSource(sourceConfig);

		if (redisUtils.isRedisEnable()) {
			JdbcDataSource.getReleaseSet().add(String.valueOf(source.getId()));
			publishReconnect(JSONUtils.toString(sourceConfig), source.getId());
		}
	}

	/**
	 * 向redis发布reconnect消息
	 * 
	 * @param message
	 * @param id
	 */
	private void publishReconnect(String message, Long id) {
		redisUtils.convertAndSend(DAVINCI_TOPIC_CHANNEL, new RedisMessageEntity(SourceMessageHandler.class,  message, String.valueOf(id)));
	}

	/**
	 * csv数据源建表
	 *
	 * @param fields
	 * @param sourceDataUpload
	 * @param source
	 * @throws ServerException
	 */
	private void createTable(List<QueryColumn> fields, SourceDataUpload sourceDataUpload, Source source, User user)
			throws ServerException {

		if (CollectionUtils.isEmpty(fields)) {
			throw new ServerException("There is have not any fields");
		}

		STGroup stg = new STGroupFile(Constants.SQL_TEMPLATE);

		String sql = null;

		if (sourceDataUpload.getMode() == UploadModeEnum.COVER.getMode()) {
			ST st = stg.getInstanceOf("create");
			st.add("tableName", sourceDataUpload.getTableName());
			st.add("fields", fields);
			st.add("primaryKeys", StringUtils.isEmpty(sourceDataUpload.getPrimaryKeys()) ? null
					: sourceDataUpload.getPrimaryKeys().split(","));
			st.add("indexKeys", sourceDataUpload.getIndexList());
			sql = st.render();
			String dropSql = "drop table if exists `" + sourceDataUpload.getTableName() + "`";
			// drop table first
			DataProviderFactory.getProvider(source.getType()).execute(source, dropSql, user);
			log.info("Source({}) drop table sql:{}", source.getId(), edp.davinci.data.util.SqlUtils.formatSql(dropSql));
		} else {
			boolean tableIsExist = DataUtils.tableIsExist(source, sourceDataUpload.getTableName());
			if (sourceDataUpload.getMode() == UploadModeEnum.NEW.getMode()) {
				if (!tableIsExist) {
					ST st = stg.getInstanceOf("create");
					st.add("tableName", sourceDataUpload.getTableName());
					st.add("fields", fields);
					st.add("primaryKeys", sourceDataUpload.getPrimaryKeys());
					st.add("indexKeys", sourceDataUpload.getIndexList());
					sql = st.render();
					log.info("Source({}) create table sql:{}", source.getId(), edp.davinci.data.util.SqlUtils.formatSql(sql));
					DataProviderFactory.getProvider(source.getType()).execute(source, sql, user);
				} else {
					throw new ServerException("Table " + sourceDataUpload.getTableName() + " is already exist");
				}
			} else {
				if (!tableIsExist) {
					throw new ServerException("Table " + sourceDataUpload.getTableName() + " is not exist");
				}
			}
		}
	}

	/**
	 * csv数据源插入数据
	 *
	 * @param headers
	 * @param values
	 * @param sourceDataUpload
	 * @param source
	 */
	private void insertData(List<QueryColumn> headers, List<Map<String, Object>> values,
			SourceDataUpload sourceDataUpload, Source source, User user) throws ServerException {

		if (CollectionUtils.isEmpty(values)) {
			return;
		}

		if (sourceDataUpload.getMode() == UploadModeEnum.REPLACE.getMode()) {
			DataProviderFactory.getProvider(source.getType()).execute(source, "truncate table `" + sourceDataUpload.getTableName() + "`", user);
		}

		STGroup stg = new STGroupFile(Constants.SQL_TEMPLATE);
		ST st = stg.getInstanceOf("insert");
		st.add("tableName", sourceDataUpload.getTableName());
		st.add("columns", headers);
		String sql = st.render();

		DataUtils.batchUpdate(source, sql, headers, values);
	}
}
