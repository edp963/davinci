package edp.davinci.server.service;

import java.util.List;

import edp.davinci.core.dao.entity.User;

public interface StatisticService {
	<T> void insert(List<T> durationInfos, Class clz, User user);
}
