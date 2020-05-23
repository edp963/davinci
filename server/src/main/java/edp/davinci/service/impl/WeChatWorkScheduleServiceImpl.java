package edp.davinci.service.impl;

import com.alibaba.druid.util.StringUtils;
import com.alibaba.fastjson.JSONObject;
import edp.core.common.quartz.ScheduleService;
import edp.core.utils.CollectionUtils;
import edp.core.utils.FileUtils;
import edp.core.utils.MD5Util;
import edp.davinci.core.enums.CronJobMediaType;
import edp.davinci.dao.CronJobMapper;
import edp.davinci.dao.UserMapper;
import edp.davinci.dto.cronJobDto.CronJobConfig;
import edp.davinci.model.CronJob;
import edp.davinci.model.User;
import edp.davinci.service.screenshot.ImageContent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.*;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service("weChatWorkScheduleService")
public class WeChatWorkScheduleServiceImpl extends BaseScheduleService implements ScheduleService {
    @Autowired
    private CronJobMapper cronJobMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private RestTemplate restTemplate;

    @Override
    public void execute(long jobId) throws Exception {
        CronJob cronJob = cronJobMapper.getById(jobId);
        if (null == cronJob || StringUtils.isEmpty(cronJob.getConfig())) {
            scheduleLogger.error("CronJob({}) config is empty", jobId);
            return;
        }
        cronJobMapper.updateExecLog(jobId, "");
        CronJobConfig cronJobConfig = null;
        try {
            cronJobConfig = JSONObject.parseObject(cronJob.getConfig(), CronJobConfig.class);
        } catch (Exception e) {
            scheduleLogger.error("Cronjob({}) parse config({}) error:{}", jobId, cronJob.getConfig(), e.getMessage());
            return;
        }

        if (StringUtils.isEmpty(cronJobConfig.getType())) {
            scheduleLogger.error("Cronjob({}) config type is empty", jobId);
            return;
        }

        scheduleLogger.info("CronJob({}) is start! --------------", jobId);

        List<ImageContent> images = null;
        User creater = userMapper.getById(cronJob.getCreateBy());

        if (cronJobConfig.getType().equals(CronJobMediaType.IMAGE.getType())) {
            images = generateImages(jobId, cronJobConfig, creater.getId());
        }

        if (CollectionUtils.isEmpty(images)) {
            scheduleLogger.warn("CronJob({}) image is empty", jobId);
            return;
        }

        String url = cronJobConfig.getWebHookUrl();

        for (ImageContent imageContent : images) {
            if (null == imageContent) {
                log.error("CronJob({}) image is null !", cronJob.getId());
                return;
            }
            File imageContentFile = imageContent.getImageFile();
            // 将大于2M的图片进行压缩
            if (imageContentFile.length() > (2 * 1024 * 1024)) {
                log.warn("image size must be less than 2M, the size is {} !", imageContentFile.length());
                scheduleLogger.info("image size must be less than 2M, the size is {} !", imageContentFile.length());

                scheduleLogger.info("image start to compressed!", imageContentFile.getPath());
                File file = FileUtils.compressedImage(imageContent.getImageFile().getPath());

                log.info("image compressed successfully!, the size is {}.", file.length());
                scheduleLogger.info("image compressed successfully! the size is: {}.", file.length());
                imageContent.setImageFile(file);

                log.info("the original image has been replaced with a new image(path: {})!", imageContentFile.getPath());
                scheduleLogger.info("the original image has been replaced with a new image(path: {})!", imageContentFile.getPath());
            }
            scheduleLogger.info("CronJob({}) is ready to request WeChatWork API", cronJob.getId());

            Map mbMap = getMD5AndBase64(imageContent.getImageFile());

            Map weChatWorkMap = new HashMap();
            weChatWorkMap.put("msgtype", "image");

            Map imageMap = new HashMap();
            imageMap.put("base64", mbMap.get("base64"));
            imageMap.put("md5", mbMap.get("md5"));
            weChatWorkMap.put("image", imageMap);

            restTemplate.postForEntity(url, weChatWorkMap, null).toString();

            scheduleLogger.info("CronJob({}) is success to request WeChatWork API", cronJob.getId());
        }

        scheduleLogger.info("CronJob({}) is finish! --------------", jobId);
    }

    /**
     * 根据图片地址获取MD5和Base64
     *
     * @param file 图片
     * @return
     */
    public static Map getMD5AndBase64(File file) {
        Map resMap = new HashMap();
        InputStream in = null;
        ByteArrayOutputStream bytesOut = null;
        try {
            in = new FileInputStream(file);
            bytesOut = new ByteArrayOutputStream((int) file.length());

            byte[] buf = new byte[1024];
            int len = -1;
            while ((len = in.read(buf)) != -1) {
                bytesOut.write(buf, 0, len);
            }

            bytesOut.flush();

            // 图片内容的base64编码
            String base64 = encode(bytesOut.toByteArray());
            resMap.put("base64", base64);

            // 图片内容（base64编码前）的md5值
            MessageDigest md = MessageDigest.getInstance("md5");
            md.update(bytesOut.toByteArray());

            byte b[] = md.digest();
            resMap.put("md5", MD5Util.byteToString(b));
            return resMap;
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        } finally {
            close(in);
            close(bytesOut);
        }
        return null;
    }

    private static String encode(byte[] data) {
        return Base64.getEncoder().encodeToString(data);
    }

    private static void close(Closeable c) {
        if (c != null) {
            try {
                c.close();
            } catch (IOException e) {
                // nothing
            }
        }
    }

}
