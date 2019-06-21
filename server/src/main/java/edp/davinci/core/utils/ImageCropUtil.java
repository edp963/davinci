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

package edp.davinci.core.utils;

import com.alibaba.druid.util.StringUtils;
import edp.core.utils.FileUtils;
import lombok.extern.slf4j.Slf4j;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import static edp.core.consts.Consts.EMPTY;


/**
 * 裁剪图片工具
 */

@Slf4j
public class ImageCropUtil {


    /**
     * 根据高度截取图片
     *
     * @param scrImagePath 源图片地址
     * @param cutHeight    最大截取高度
     * @return 截取后的图片相对地址列表
     * @throws Exception
     */
    public static List<String> cutImage(String basePath, String scrImagePath, int cutHeight) throws Exception {

        if (StringUtils.isEmpty(scrImagePath)) {
            throw new Exception("source image path is EMPTY");
        }

        List<String> files = new ArrayList<>();

        File file = new File(basePath + scrImagePath);
        String format = scrImagePath.substring(scrImagePath.lastIndexOf("."));
        String sourceImageName = file.getName().substring(0, file.getName().lastIndexOf("."));

        BufferedImage bufferedImage = ImageIO.read(file);
        int width = bufferedImage.getWidth();
        int height = bufferedImage.getHeight();
        log.info("src file width: {}", width);
        log.info("scr file height: {}", height);

        String dir = file.getParent() + File.separator + "crop_" + sourceImageName;

        if (new File(dir).exists()) {
            FileUtils.deleteDir(new File(dir));
        }
        new File(dir).mkdirs();

        if (height > cutHeight) {
            int count = (int) Math.ceil((double) height / cutHeight);
            log.info("count crop image num: {}", count);
            ExecutorService executorService = Executors.newFixedThreadPool(8);
            CountDownLatch countDownLatch = new CountDownLatch(count);

            for (int i = 0; i < count; i++) {
                int startX = 0;
                int startY = i * cutHeight;
                int endX = width;
                int endY = i + 1 == count ? height : (i + 1) * cutHeight;

                String cropPath = dir + File.separator + sourceImageName + "_" + i + format;
                File cropFile = new File(cropPath);
                cropFile.createNewFile();

                files.add(cropPath.replace(basePath, EMPTY));

                final int n = i + 1;
                executorService.execute(() -> {
                    try {
                        BufferedImage cropImage = cropImage(bufferedImage, startX, startY, endX, endY);
                        ImageIO.write(cropImage, format.substring(1, format.length()), cropFile);
                        log.info("image_{}", n);
                    } catch (Exception e) {
                        e.printStackTrace();
                        log.info("crop image error");
                        executorService.shutdownNow();
                    } finally {
                        countDownLatch.countDown();
                    }
                });
            }
            countDownLatch.await();
            log.info("finish");
            executorService.shutdown();

        } else {
            files.add(scrImagePath);
        }

        File flagFile = new File(dir + File.separator + "success");
        flagFile.createNewFile();

        //排序
        Collections.sort(files);
        return files;
    }


    private static BufferedImage cropImage(BufferedImage bufferedImage, int startX, int startY, int endX, int endY) {
        int width = bufferedImage.getWidth();
        int height = bufferedImage.getHeight();
        if (startX == -1) {
            startX = 0;
        }
        if (startY == -1) {
            startY = 0;
        }
        if (endX == -1) {
            endX = width - 1;
        }
        if (endY == -1) {
            endY = height - 1;
        }
        BufferedImage result = new BufferedImage(endX - startX, endY - startY, 4);
        for (int x = startX; x < endX; ++x) {
            for (int y = startY; y < endY; ++y) {
                int rgb = bufferedImage.getRGB(x, y);
                result.setRGB(x - startX, y - startY, rgb);
            }
        }
        return result;
    }
}
