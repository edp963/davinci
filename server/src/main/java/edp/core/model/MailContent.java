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

import com.alibaba.druid.util.StringUtils;
import edp.core.consts.Consts;
import edp.core.enums.MailContentTypeEnum;
import edp.core.exception.ServerException;
import edp.core.utils.CollectionUtils;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Getter
@Setter(value = AccessLevel.PRIVATE)
public class MailContent {
    private String from;
    private String nickName;

    private String subject;
    private String[] to;
    private String[] cc;
    private String[] bcc;

    private MailContentTypeEnum mailContentType;

    private String template;
    private String content;
    private String htmlContent;

    private Map<String, Object> templateContent;
    private List<MailAttachment> attachments;

    @Override
    public String toString() {
        return "MailContent{" +
                "from='" + from + '\'' +
                ", subject='" + subject + '\'' +
                ", to=" + Arrays.toString(to) +
                ", cc=" + Arrays.toString(cc) +
                ", bcc=" + Arrays.toString(bcc) +
                ", attachments.size=" + (CollectionUtils.isEmpty(attachments) ? 0 : attachments.size()) +
                '}';
    }

    public static final class MailContentBuilder {
        private String from;
        private String nickName;
        private String subject;
        private String[] to;
        private String[] cc;
        private String[] bcc;
        private MailContentTypeEnum mailContentType;
        private String template;
        private String content;
        private String htmlContent;
        private Map<String, Object> templateContent;
        private List<MailAttachment> attachments;

        private MailContentBuilder() {
        }

        public static MailContentBuilder builder() {
            return new MailContentBuilder();
        }

        public MailContentBuilder withFrom(String from) {
            this.from = from;
            return this;
        }

        public MailContentBuilder withNickName(String nickName) {
            this.nickName = nickName;
            return this;
        }

        public MailContentBuilder withSubject(String subject) {
            this.subject = subject;
            return this;
        }

        public MailContentBuilder withTo(String[] to) {
            this.to = to;
            return this;
        }

        public MailContentBuilder withTo(String to) {
            if (StringUtils.isEmpty(to)) {
                return this;
            }
            this.to = fetchAddress(to);
            return this;
        }

        public MailContentBuilder withCc(String[] cc) {
            this.cc = cc;
            return this;
        }

        public MailContentBuilder withCc(String cc) {
            if (StringUtils.isEmpty(cc)) {
                return this;
            }
            this.cc = fetchAddress(cc);
            return this;
        }

        public MailContentBuilder withBcc(String[] bcc) {
            this.bcc = bcc;
            return this;
        }

        public MailContentBuilder withBcc(String bcc) {
            if (StringUtils.isEmpty(bcc)) {
                return this;
            }
            this.bcc = fetchAddress(bcc);
            return this;
        }

        public MailContentBuilder withMainContent(MailContentTypeEnum mainContent) {
            this.mailContentType = mainContent;
            return this;
        }

        public MailContentBuilder withTemplate(String template) {
            this.template = template;
            return this;
        }

        public MailContentBuilder withContent(String content) {
            this.content = content;
            return this;
        }

        public MailContentBuilder withHtmlContent(String htmlContent) {
            this.htmlContent = htmlContent;
            return this;
        }

        public MailContentBuilder withTemplateContent(Map<String, Object> templateContent) {
            this.templateContent = templateContent;
            return this;
        }

        public MailContentBuilder withAttachments(List<MailAttachment> attachments) {
            this.attachments = attachments;
            return this;
        }

        private String[] fetchAddress(String address) {
            List<String> list = new ArrayList<>();
            String[] addresses = address.split(Consts.SEMICOLON);
            for (String s : addresses) {
                if (!StringUtils.isEmpty(s.trim())) {
                    list.add(s);
                }
            }
            return list.size() == 0 ? null : list.toArray(new String[0]);
        }

        public MailContent build() throws ServerException {

            if (StringUtils.isEmpty(subject)) {
                throw new ServerException("Email subject cannot be EMPTY");
            }
            if (to == null || to.length == 0) {
                throw new ServerException("Email receiving address cannot be EMPTY");
            }

            boolean emptyAttachments = CollectionUtils.isEmpty(attachments);

            if (emptyAttachments) {
                boolean error = false;
                switch (mailContentType) {
                    case TEXT:
                        if (StringUtils.isEmpty(content)) {
                            error = true;
                        }
                        break;
                    case HTML:
                        if (StringUtils.isEmpty(htmlContent)) {
                            error = true;
                        }
                        break;
                    case TEMPLATE:
                        if (StringUtils.isEmpty(template)) {
                            error = true;
                        }
                        break;
                }
                if (error) {
                    throw new ServerException("Mail content cannot be EMPTY");
                }
            }

            MailContent mailContent = new MailContent();
            mailContent.setFrom(from);
            mailContent.setNickName(nickName);
            mailContent.setSubject(subject);
            mailContent.setTo(to);
            mailContent.setCc(cc);
            mailContent.setBcc(bcc);
            mailContent.setMailContentType(mailContentType);
            mailContent.setTemplate(template);
            mailContent.setContent(content);
            mailContent.setHtmlContent(htmlContent);
            mailContent.setTemplateContent(templateContent);
            mailContent.setAttachments(attachments);

            if (mailContentType == MailContentTypeEnum.HTML && StringUtils.isEmpty(htmlContent)) {
                mailContent.setMailContentType(MailContentTypeEnum.TEMPLATE);
            }

            return mailContent;
        }
    }
}
