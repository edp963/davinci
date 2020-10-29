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
import com.sun.image.codec.jpeg.JPEGCodec;
import com.sun.image.codec.jpeg.JPEGImageEncoder;
import edp.davinci.core.enums.ActionEnum;
import edp.davinci.core.enums.FileTypeEnum;
import edp.davinci.core.enums.LogNameEnum;
import edp.davinci.service.excel.MsgWrapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import javax.servlet.http.HttpServletResponse;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.charset.Charset;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.regex.Matcher;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static edp.core.consts.Consts.*;


@Component
public class FileUtils {

    private static final Logger scheduleLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_SCHEDULE.getName());

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
                byte[] buffer = null;
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
                    closeCloseable(os);
                    closeCloseable(is);
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
            return file.delete();
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
        }
        else {
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
        if(filePath == null) {
            return null;
        }
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
        ZipOutputStream out = null;
        FileInputStream in = null;
        try {
            out = new ZipOutputStream(new FileOutputStream(targetFile));
            for (File file : files) {
                try {
                    in = new FileInputStream(file);
                    out.putNextEntry(new ZipEntry(file.getName()));
                    int length;
                    while ((length = in.read(bytes)) > 0) {
                        out.write(bytes, 0, length);
                    }
                    out.closeEntry();
                    closeCloseable(in);
                }
                catch (Exception e) {
                    e.printStackTrace();
                }
                finally {
                    closeCloseable(in);
                }
            }
        }
        catch (Exception e) {
            e.printStackTrace();
        }finally {
            closeCloseable(out);
        }
    }

    /**
     * 图片压缩，图片比例按原比例输出
     * tips: 压缩后的图片会替换原有的图片
     * @param filepath
     */
    public static File compressedImage(String filepath) {
        try {
            File file = new File(filepath);
            BufferedImage img_dest= null;

            BufferedImage img_src = ImageIO.read(file);
            int width = img_src.getWidth();
            int height = img_src.getHeight();
            long imageLength = file.length();

            // 如果首次压缩图片还大于2M，则继续压缩
            while (imageLength > (2 * 1024 * 1024)) {
                // 开始读取文件并进行压缩

                // 压缩模式设置
                img_dest = new BufferedImage( width,  height, BufferedImage.TYPE_INT_RGB);
                img_dest.getGraphics().drawImage(img_src.getScaledInstance(width, height, Image.SCALE_SMOOTH), 0, 0, null);

                // 缩小
                ImageIO.write(img_dest, "jpg", file);

                // 计算图片压缩率
                float rate = calcCompressedRate(imageLength, file.length());
                // 如果压缩率小于10%，则不再进行压缩
                if (rate < 10) {
                    scheduleLogger.warn("Forced interruption, compression rate is less than {}",rate);
                    break;
                }

                imageLength = file.length();
                scheduleLogger.warn("File size after compression {},Compress again",imageLength);
            }
            imageLength = file.length();
            scheduleLogger.warn("Final compressed file size {}",imageLength);

            FileOutputStream output = new FileOutputStream(filepath);
            //将图片按JPEG压缩
            JPEGImageEncoder encoder = JPEGCodec.createJPEGEncoder(output);
            encoder.encode(img_dest);
            output.close();

            return new File(filepath);
        } catch (Exception e) {
            scheduleLogger.error("Image compression failed",e);
        }
        return null;
    }

    /**
     * 计算图片压缩率
     * @param originLength
     * @param compressedLength
     * @return
     */
    public static float calcCompressedRate(long originLength, long compressedLength) {
        DecimalFormat df = new DecimalFormat("0.000");
        String rate = df.format((float)compressedLength  / originLength);
        float result=  Float.valueOf(rate) * 100;
        scheduleLogger.info("compression {}/{}={}%",compressedLength,originLength,result);
        return result;
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
        return new File(sb.toString()).getAbsolutePath();
    }

    /**
     * Read content from file
     * @param fileName
     * @return
     */
    public static String readFileToString(String fileName, String charset) {
        File file = new File(fileName);
        BufferedReader reader = null;
        StringBuffer sbf = new StringBuffer();
        try {
            reader = new BufferedReader(new InputStreamReader(new FileInputStream(file), charset));
            String tempStr;
            while ((tempStr = reader.readLine()) != null) {
                sbf.append(tempStr);
            }
            reader.close();
            return sbf.toString();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (reader != null) {
                try {
                    reader.close();
                } catch (IOException e1) {
                    e1.printStackTrace();
                }
            }
        }
        return sbf.toString();
    }

    /**
     * Write content to file
     * @param path
     * @param fileName
     * @param content
     * @param encoding
     */
    public static void writeStringToFile(String path, String fileName, String content, Charset encoding) {
        FileOutputStream fos = null;
        OutputStreamWriter osw = null;
        try {
            File f = new File(path);
            if (!f.exists()){
                f.mkdirs();
            }
            File file = new File(path, fileName);
            if (!file.exists()){
                file.createNewFile();
            }

            fos = new FileOutputStream(file);
            osw = new OutputStreamWriter(fos, encoding);
            osw.write(content);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (osw != null){
                try {
                    osw.flush();
                } catch (IOException e1) {
                    e1.printStackTrace();
                }
            }
        }
    }

    public static boolean delete(String filePath) {
        File file = new File(filePath);
        if (file.exists() && file.isFile()) {
            return file.delete();
        }
        return false;
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

    public static int copy(File in, File out) {
        try {
            return FileCopyUtils.copy(in, out);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return -1;
    }
}
