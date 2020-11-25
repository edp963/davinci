/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2020 EDP
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
 */

package edp.davinci.dto.dashboardDto;

import edp.core.utils.CollectionUtils;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class DashboardTree {
    private Long id;
    private int index;
    private List<DashboardTree> children;


    public DashboardTree(Long id, int index) {
        this.id = id;
        this.index = index;
    }

    public DashboardTree(Long id, List<DashboardTree> children) {
        this.id = id;
        this.children = children;
    }

    public List<DashboardTree> traversalLeaf() {
        if (CollectionUtils.isEmpty(children)) {
            return null;
        }
        List<DashboardTree> leafList = new ArrayList<>();
        traversalLeaf(this, leafList);
        return leafList;
    }

    private void traversalLeaf(DashboardTree node, List<DashboardTree> list) {
        if (CollectionUtils.isEmpty(children)) {
            return;
        }
        if (CollectionUtils.isEmpty(node.getChildren())) {
            list.add(node);
            return;
        }
        for (DashboardTree child : node.getChildren()) {
            traversalLeaf(child, list);
        }
    }
}
