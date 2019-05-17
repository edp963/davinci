/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2018 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *       http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 * >>
 */

package edp.core.common.cache;

public enum Caches {
    datasource,
    query(10, 10000);

    private int maxSize = 1000; //默认最大缓存数量
    private int ttl = 3600;     //默认过期时间（单位：秒）

    Caches() {
    }

    Caches(int ttl, int maxSize) {
        this.ttl = ttl;
        this.maxSize = maxSize;
    }

    public int getMaxSize() {
        return maxSize;
    }

    public int getTtl() {
        return ttl;
    }
}
