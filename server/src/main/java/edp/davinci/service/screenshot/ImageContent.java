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

package edp.davinci.service.screenshot;

import lombok.Data;

import java.io.File;

@Data
public class ImageContent {
    private int order;


    private Long cId;

    private String desc;
    private File imageFile;
    private String url;

    public ImageContent(int order, Long cid, String desc, String url) {
        this.cId = cid;
        this.order = order;
        this.desc = desc;
        this.url = url;
    }

    public void setContent(File file) {
        this.imageFile = file;
    }

    public ImageContent() {
    }
}
