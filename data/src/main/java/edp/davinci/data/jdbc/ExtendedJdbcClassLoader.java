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

package edp.davinci.data.jdbc;

import edp.davinci.commons.util.MD5Utils;
import edp.davinci.commons.util.StringUtils;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.HashMap;
import java.util.Map;

public class ExtendedJdbcClassLoader extends URLClassLoader {

	private static final String JAR_FILE_SUFFIX = ".jar";

	private static volatile Map<String, Class<?>> classMap = new HashMap<String, Class<?>>();
	private static volatile Map<String, ExtendedJdbcClassLoader> classLoaderMap = new HashMap<String, ExtendedJdbcClassLoader>();

	private ExtendedJdbcClassLoader(URL[] urls) {
		super(urls);
	}

	@Override
	public Class<?> loadClass(String name) throws ClassNotFoundException {

		Class<?> aClass = classMap.get(name);

		if (aClass != null) {
			return aClass;
		}

		try {
			aClass = findClass(name);
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		if (aClass != null) {
			classMap.put(name, aClass);
			return aClass;
		}

		return super.loadClass(name);
	}

	@Override
	protected Package getPackage(String name) {
		return null;
	}

	public static synchronized ExtendedJdbcClassLoader getExtJdbcClassLoader(String path) {
		String key = MD5Utils.getMD5(path, false, 32);
		
		if (classLoaderMap.containsKey(key) && classLoaderMap.get(key) != null) {
			return classLoaderMap.get(key);
		}
		
		if (StringUtils.isEmpty(path)) {
			return null;
		}
		
		File file = new File(path);
		if (!file.exists()) {
			return null;
		}
		
		if (file.isFile() && !file.getName().toLowerCase().endsWith(JAR_FILE_SUFFIX)) {
			return null;
		}
		
		if (file.isDirectory()) {

			File[] files = file.listFiles();
			
			if (files == null || files.length == 0) {
				return null;
			}
			
			URL[] urls = new URL[files.length];
			
			for (int i = 0; i < files.length; i++) {
				File cfile = files[i];
				if (!cfile.getName().toLowerCase().endsWith(JAR_FILE_SUFFIX)) {
					continue;
				}
				try {
					urls[i] = cfile.toURI().toURL();
				} catch (MalformedURLException e) {
					e.printStackTrace();
				}
			}
			ExtendedJdbcClassLoader extendedJdbcClassLoader = new ExtendedJdbcClassLoader(urls);
			classLoaderMap.put(key, extendedJdbcClassLoader);
			return extendedJdbcClassLoader;
		}

		return null;
	}
}
