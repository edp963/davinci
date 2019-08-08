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

package edp.core.utils;

import com.alibaba.druid.util.StringUtils;
import edp.davinci.core.enums.ActionEnum;
import edp.davinci.core.enums.FileTypeEnum;
import edp.davinci.service.excel.MsgWrapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.regex.Matcher;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static edp.core.consts.Consts.*;


@Component
public class FileUtils {


    @Value("${file.userfiles-path}")
    public String fileBasePath;

    /**
     * 校验MultipartFile 是否图片
     *
     * @param file
     * @return
     */
    public boolean isImage(MultipartFile file) {
        Matcher matcher = PATTERN_IMG_FROMAT.matcher(file.getOriginalFilename());
        return matcher.find();
    }

    public boolean isImage(File file) {
        Matcher matcher = PATTERN_IMG_FROMAT.matcher(file.getName());
        return matcher.find();
    }

    /**
     * 校验MultipartFile 是否csv文件
     *
     * @param file
     * @return
     */
    public static boolean isCsv(MultipartFile file) {
        return file.getOriginalFilename().toLowerCase().endsWith(FileTypeEnum.CSV.getFormat());
    }


    /**
     * 校验MultipartFile 是否csv文件
     *
     * @param file
     * @return
     */
    public static boolean isExcel(MultipartFile file) {
        return file.getOriginalFilename().toLowerCase().endsWith(FileTypeEnum.XLSX.getFormat())
                || file.getOriginalFilename().toLowerCase().endsWith(FileTypeEnum.XLS.getFormat());
    }


    /**
     * 上传文件
     *
     * @param file
     * @param path     上传路径
     * @param fileName 文件名（不含文件类型）
     * @return
     * @throws IOException
     */
    public String upload(MultipartFile file, String path, String fileName) throws IOException {

        String originalFilename = file.getOriginalFilename();
        String format = originalFilename.substring(originalFilename.lastIndexOf(".") + 1);
        String newFilename = fileName + "." + format;

        String returnPath = (path.endsWith("/") ? path : path + "/") + newFilename;

        String filePath = fileBasePath + returnPath;

        File dest = new File(filePath);

        if (!dest.exists()) {
            dest.getParentFile().mkdirs();
        }

        file.transferTo(dest);

        return returnPath;
    }


    /**
     * 下载文件
     *
     * @param filePath
     * @param response
     */
    public void download(String filePath, HttpServletResponse response) {
        if (!StringUtils.isEmpty(filePath)) {
            File file = null;
            if (!filePath.startsWith(fileBasePath)) {
                file = new File(fileBasePath + filePath);
            } else {
                file = new File(filePath);
            }
            if (file.exists()) {
                byte[] buffer = new byte[0];
                InputStream is = null;
                OutputStream os = null;
                try {
                    is = new BufferedInputStream(new FileInputStream(filePath));
                    buffer = new byte[is.available()];
                    is.read(buffer);
                    response.reset();
                    response.addHeader("Content-Disposition", "attachment;filename=" + new String(file.getName().getBytes(), "UTF-8"));
                    response.addHeader("Content-Length", EMPTY + file.length());
                    os = new BufferedOutputStream(response.getOutputStream());
                    response.setContentType("application/octet-stream;charset=UTF-8");
                    os.write(buffer);
                    os.flush();
                } catch (IOException e) {
                    e.printStackTrace();
                } finally {
                    try {
                        if (null != is) {
                            is.close();
                        }
                        if (null != os) {
                            os.close();
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    remove(filePath);
                }
            }
        }
    }

    /**
     * 删除文件
     *
     * @param filePath
     * @return
     */
    public boolean remove(String filePath) {
        if (!filePath.startsWith(fileBasePath)) {
            filePath = fileBasePath + filePath;
        }
        File file = new File(filePath);
        if (file.exists() && file.isFile()) {
            file.delete();
            return true;
        }
        return false;
    }


    /**
     * 删除文件夹及其下文件
     *
     * @param dir
     * @return
     */
    public static void deleteDir(File dir) {
        if (dir.isFile() || dir.list().length == 0) {
            dir.delete();
        } else {
            for (File f : dir.listFiles()) {
                deleteDir(f);
            }
            dir.delete();
        }
    }

    /**
     * 格式化文件目录
     *
     * @param filePath
     * @return
     */
    public String formatFilePath(String filePath) {
        return filePath.replace(fileBasePath, EMPTY).replaceAll(File.separator + "{2,}", File.separator);
    }

    /**
     * 压缩文件到zip
     *
     * @param files
     * @param targetFile
     */
    public static void zipFile(List<File> files, File targetFile) {
        byte[] bytes = new byte[1024];

        try {
            ZipOutputStream out = new ZipOutputStream(new FileOutputStream(targetFile));
            for (File file : files) {
                FileInputStream in = new FileInputStream(file);
                out.putNextEntry(new ZipEntry(file.getName()));
                int length;
                while ((length = in.read(bytes)) > 0) {
                    out.write(bytes, 0, length);
                }
                out.closeEntry();
                in.close();
            }
            out.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public String getFilePath(FileTypeEnum type, MsgWrapper msgWrapper) {
        StringBuilder sb = new StringBuilder(this.fileBasePath);
        if (!sb.toString().endsWith(File.separator)) {
            sb.append(File.separator);
        }
        if (msgWrapper.getAction() == ActionEnum.DOWNLOAD) {
            sb.append(DIR_DOWNLOAD);
        } else if (msgWrapper.getAction() == ActionEnum.SHAREDOWNLOAD) {
            sb.append(DIR_SHARE_DOWNLOAD);
        } else if (msgWrapper.getAction() == ActionEnum.MAIL) {
            sb.append(DIR_EMAIL);
        }
        sb.append(new SimpleDateFormat("yyyyMMdd").format(new Date())).append(File.separator);
        sb.append(type.getType()).append(File.separator);
        File dir = new File(sb.toString());
        if (!dir.exists()) {
            dir.mkdirs();
        }
        if (msgWrapper.getAction() == ActionEnum.DOWNLOAD) {
            sb.append(msgWrapper.getxId());
        } else if (msgWrapper.getAction() == ActionEnum.SHAREDOWNLOAD || msgWrapper.getAction() == ActionEnum.MAIL) {
            sb.append(msgWrapper.getxUUID());
        }
        sb.append(UNDERLINE).append(System.currentTimeMillis()).append(type.getFormat());
        return sb.toString().replaceAll(File.separator + "{2,}", File.separator);
    }

    public static boolean delete(String filePath) {
        File file = new File(filePath);
        if (file.exists() && file.isFile()) {
            file.delete();
            return true;
        }
        return false;
    }
}
