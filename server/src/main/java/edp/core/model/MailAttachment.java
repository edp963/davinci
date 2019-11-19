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

package edp.core.model;

import lombok.Data;

import java.io.File;

@Data
public class MailAttachment {
    private String name;
    private File file;
    private String url = null;

    private boolean isImage = false;

    public MailAttachment(String name, File file, String url, boolean isImage) {
        this.name = name;
        this.file = file;
        this.url = url;
        this.isImage = isImage;
    }

    public MailAttachment(String name, File file) {
        this.name = name;
        this.file = file;
    }
}
