/*-
 * <<
 * UAVStack
 * ==
 * Copyright (C) 2016 - 2017 UAVStack
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

package edp.davinci.commons.util;

import java.io.BufferedReader;
import java.io.Closeable;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class IOUtils {

	private IOUtils() {

	}

	/**
	 * isFile
	 * 
	 * @param path
	 * @return
	 */
	public static boolean isFile(String path) {

		File file = new File(path);

		if (file.exists() && file.isFile()) {
			return true;
		}

		return false;
	}

	/**
	 * isDirectory
	 * 
	 * @param path
	 * @return
	 */
	public static boolean isDirectory(String path) {

		File file = new File(path);

		if (file.exists() && file.isDirectory()) {
			return true;
		}

		return false;
	}

	/**
	 * writeTxtFile
	 * 
	 * @param destination
	 * @param data
	 * @param encoding
	 * @throws IOException 
	 * @throws FileNotFoundException 
	 */
	public static void writeTxtFile(String destination, String data, String encoding, boolean append)
			throws FileNotFoundException, IOException {
		writeFile(destination, data.getBytes(encoding), append);
	}

	public static void write(String line, String filename) throws IOException {
		try (FileWriter fw = new FileWriter(filename)) {
			fw.write(line);
			fw.flush();
		}
	}

	/**
	 * writeFile
	 * 
	 * @param destination
	 * @param data
	 * @param append
	 * @throws IOException 
	 * @throws FileNotFoundException 
	 */
	public static void writeFile(String destination, byte[] data, boolean append) throws FileNotFoundException, IOException {
		File temp = new File(destination);
		try (FileOutputStream fos = new FileOutputStream(temp, append)) {
			fos.write(data);
			fos.flush();
		}
	}

	/**
	 * readFile
	 * 
	 * @param destination
	 * @return
	 * @throws IOException 
	 * @throws FileNotFoundException 
	 */
	public static byte[] readFile(String destination) throws FileNotFoundException, IOException {

		File temp = new File(destination);

		if (temp.exists()) {
			byte[] data = new byte[(int) temp.length()];
			try (FileInputStream fis = new FileInputStream(temp)) {
				fis.read(data);
			}
			return data;
		}

		return new byte[0];
	}

	/**
	 * 
	 * @param path
	 * @param encoding
	 * @return
	 * @throws IOException 
	 * @throws UnsupportedEncodingException 
	 */
	public static String readTxtFile(String path, String encoding) throws UnsupportedEncodingException, IOException {

		if (!isFile(path)) {
			return null;
		}

		try (FileInputStream fstream = new FileInputStream(path)) {
			StringBuilder source = new StringBuilder();
			getStringFromStream(encoding, fstream, source);
			return source.toString();
		}

	}

	/**
	 * @param encoding
	 * @param fstream
	 * @param source
	 * @throws IOException
	 * @throws UnsupportedEncodingException
	 */
	private static void getStringFromStream(String encoding, FileInputStream fstream, StringBuilder source)
			throws IOException, UnsupportedEncodingException {
		byte[] buffer = new byte[4096];
		int readct = -1;
		while ((readct = fstream.read(buffer)) > 0) {
			if (encoding != null) {
				source.append(new String(buffer, 0, readct, encoding));
			} else {
				source.append(new String(buffer, 0, readct));
			}
		}
	}

	/**
	 * existFile
	 * 
	 * @param path
	 * @return
	 */
	public static boolean exists(String path) {
		File temp = new File(path);
		return temp.exists();
	}

	/**
	 * getCurrentPath
	 * 
	 * @return
	 */
	public static String getCurrentPath() {
		return new File("").getAbsolutePath();
	}

	/**
	 * getExt
	 * 
	 * @param path
	 * @return
	 */
	public static String getExt(String path) {

		String[] info = path.split("\\.");

		return info[info.length - 1];
	}

	public static String[] getFileNames_STR(String path) {

		List<File> al = getFiles(path);
		String[] fl = null;
		if (al != null && !al.isEmpty()) {
			fl = new String[al.size()];
			for (int i = 0; i < al.size(); i++) {
				fl[i] = al.get(i).getName();
			}
		}

		return fl;
	}

	public static String[] getFiles_STR(String path) {

		List<File> al = getFiles(path);
		String[] fl = null;
		if (al != null && !al.isEmpty()) {
			fl = new String[al.size()];
			for (int i = 0; i < al.size(); i++) {
				fl[i] = al.get(i).getAbsolutePath();
			}
		}

		return fl;
	}

	/**
	 * getFiles
	 * 
	 * @param path
	 * @return
	 */
	public static List<File> getFiles(String path) {

		File dir = new File(path);

		if (dir.exists()) {

			File[] files = dir.listFiles();

			if (files != null && files.length > 0) {
				return getFiles(files, false);
			}
		}

		return Collections.emptyList();
	}

	public static List<File> getFiles(File[] files, boolean needDirs) {

		ArrayList<File> dirs = new ArrayList<File>();

		for (int i = 0; i < files.length; i++) {
			if (needDirs == false && files[i].isFile()) {
				dirs.add(files[i]);
			} else if (needDirs == true && files[i].isDirectory()) {
				dirs.add(files[i]);
			}
		}

		return dirs;
	}

	/**
	 * getDirs
	 * 
	 * @param path
	 * @return
	 */
	public static List<File> getDirs(String path) {

		File dir = new File(path);

		if (dir.exists()) {

			File[] files = dir.listFiles();

			if (files != null && files.length > 0) {
				return getFiles(files, true);
			}
		}

		return Collections.emptyList();
	}

	/**
	 * copyFolder
	 * 
	 * @param src
	 * @param tar
	 * @return
	 * @throws IOException
	 */
	public static void copyFolder(String src, String tar) throws IOException {

		File srcFile = new File(src);

		if (srcFile.isDirectory()) {
			// create target folder
			File tarFile = new File(tar);
			if (!tarFile.exists()) {
				tarFile.mkdir();
			}

			// copy file & folder
			String[] srcfiles = srcFile.list();
			if (srcfiles != null && srcfiles.length > 0) {
				dealCopyFiles(srcfiles, srcFile, tarFile);
			}
		}
	}

	private static void dealCopyFiles(String[] srcfiles, File srcFile, File tarFile) throws IOException {

		for (int i = 0; i < srcfiles.length; i++) {

			File temp = new File(srcFile.getAbsolutePath() + File.separator + srcfiles[i]);

			if (!temp.isDirectory()) {
				copyFile(srcFile.getAbsolutePath() + File.separator + srcfiles[i], tarFile.getAbsolutePath() + File.separator + srcfiles[i]);
			} else {
				copyFolder(srcFile.getAbsolutePath() + File.separator + srcfiles[i],
						tarFile.getAbsolutePath() + File.separator + srcfiles[i]);
			}
		}
	}

	/**
	 * moveFolder
	 * 
	 * @param src
	 * @param tar
	 * @return
	 * @throws IOException 
	 */
	public static void moveFolder(String src, String tar) throws IOException {
		copyFolder(src, tar);
		deleteFolder(src);
	}

	/**
	 * copyFile
	 * 
	 * @param src
	 * @param tar
	 * @return
	 * @throws IOException 
	 * @throws FileNotFoundException 
	 */
	public static void copyFile(String src, String tar) throws FileNotFoundException, IOException {

		File srcFile = new File(src);

		if (srcFile.exists()) {

			byte[] data = readFile(src);

			writeFile(tar, data, false);
		}

	}

	/**
	 * moveFile
	 * 
	 * @param src
	 * @param tar
	 * @return
	 * @throws IOException 
	 * @throws FileNotFoundException 
	 */
	public static boolean moveFile(String src, String tar) throws FileNotFoundException, IOException {
			copyFile(src, tar);
			return deleteFile(src);
	}

	/**
	 * createFolder
	 * 
	 * @param path
	 * @return
	 */
	public static int createFolder(String path) {

		int res = 0;
		File dir = new File(path);

		if (!dir.exists()) {

			if (dir.mkdirs()) {
				res = 1;
			}
		}

		return res;
	}

	/**
	 * deleteFile
	 * 
	 * @param path
	 * @return
	 */
	public static boolean deleteFile(String path) {
		File temp = new File(path);
		return temp.exists() && temp.delete();
	}

	/**
	 * deleteFolder
	 * 
	 * @param path
	 * @return
	 */
	public static void deleteFolder(String path) {

		File dir = new File(path);

		String[] files = dir.list();

		if (files != null && files.length > 0) {

			for (int i = 0; i < files.length; i++) {

				File temp = new File(path + File.separator + files[i]);

				if (temp.isDirectory()) {
					deleteFolder(temp.getAbsolutePath());
				}

				temp.delete();
			}

		}

		dir.delete();
	}

	/**
	 * 读取取文件，获取字节
	 * 
	 * @param fileUrl
	 * @return
	 * @throws IOException 
	 */
	public static byte[] getBytes(String fileUrl) throws IOException {

		File file = new File(fileUrl);
		if (!file.exists()) {
			return null;
		}

		byte[] data = null;
		try (FileInputStream io = new FileInputStream(file)) {
			data = new byte[io.available()];
			io.read(data);
		}
		
		return data;
	}

	/**
	 * 下载文件
	 * 
	 * @param fileUrl
	 * @return
	 * @throws IOException 
	 */
	public static String downloadFile(String fileUrl) throws IOException {

		URL url = new URL(fileUrl);
		URLConnection con = url.openConnection();
		con.setConnectTimeout(30 * 1000);
		con.setRequestProperty("Charset", "UTF-8");

		StringBuilder fileContent = new StringBuilder();
		try (InputStream is = con.getInputStream(); BufferedReader br = new BufferedReader(new InputStreamReader(is))) {
			// 开始读取
			String line;
			while ((line = br.readLine()) != null) {
				fileContent.append(new String(line.getBytes(), "UTF-8"));
				fileContent.append(System.getProperty("line.separator"));
			}
		}

		return fileContent.toString();
	}

	/**
	 * copy from inputStream to outputStream
	 * 
	 * @param input
	 * @param output
	 * @return long sum
	 * @throws IOException
	 */
	public static long copyStream(InputStream input, OutputStream output) throws IOException {

		byte[] buffer = new byte[1024]; // Adjust if you want
		int bytesRead = 0;
		long count = 0;
		while ((bytesRead = input.read(buffer)) != -1) {
			output.write(buffer, 0, bytesRead);
			count += bytesRead;
		}
		return count;
	}
	
    public static void closeCloseable(Closeable c) {
        if(c != null) {
            try {
                c.close();
            }
            catch (IOException e) {
                // ignore
            }
        }
    }
}
