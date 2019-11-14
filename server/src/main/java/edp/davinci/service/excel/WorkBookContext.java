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

package edp.davinci.service.excel;

import edp.davinci.model.User;
import lombok.Data;
import org.slf4j.Logger;

import java.io.Serializable;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 *
 * @Author daemon
 * @Date 19/5/29 19:26
 * To change this template use File | Settings | File Templates.
 */
@Data
public class WorkBookContext implements Serializable {

    private MsgWrapper wrapper;

    private List<WidgetContext> widgets;

    private User user;

    private int resultLimit;

    private String taskKey;

    private Logger customLogger;

    private WorkBookContext() {
    }

    public static final class WorkBookContextBuilder {
        private MsgWrapper wrapper;
        private List<WidgetContext> widgets;
        private User user;
        private int resultLimit;
        private String taskKey;
        private Logger customLogger;

        private WorkBookContextBuilder() {
        }

        public static WorkBookContextBuilder newBuildder() {
            return new WorkBookContextBuilder();
        }

        public WorkBookContextBuilder withWrapper(MsgWrapper wrapper) {
            this.wrapper = wrapper;
            return this;
        }

        public WorkBookContextBuilder withWidgets(List<WidgetContext> widgets) {
            this.widgets = widgets;
            return this;
        }

        public WorkBookContextBuilder withUser(User user) {
            this.user = user;
            return this;
        }

        public WorkBookContextBuilder withResultLimit(int resultLimit) {
            this.resultLimit = resultLimit;
            return this;
        }

        public WorkBookContextBuilder withTaskKey(String taskKey) {
            this.taskKey = taskKey;
            return this;
        }

        public WorkBookContextBuilder withCustomLogger(Logger customLogger) {
            this.customLogger = customLogger;
            return this;
        }

        public WorkBookContext build() {
            WorkBookContext workBookContext = new WorkBookContext();
            workBookContext.setWrapper(wrapper);
            workBookContext.setWidgets(widgets);
            workBookContext.setUser(user);
            workBookContext.setResultLimit(resultLimit);
            workBookContext.setTaskKey(taskKey);
            workBookContext.setCustomLogger(customLogger);
            return workBookContext;
        }
    }
}
