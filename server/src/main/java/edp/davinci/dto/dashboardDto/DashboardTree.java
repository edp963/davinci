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
    private List<DashboardTree> childs;


    public DashboardTree(Long id, int index) {
        this.id = id;
        this.index = index;
    }

    public DashboardTree(Long id, List<DashboardTree> childs) {
        this.id = id;
        this.childs = childs;
    }

    public List<DashboardTree> traversalLeaf() {
        if (CollectionUtils.isEmpty(childs)) {
            return null;
        }
        List<DashboardTree> leafList = new ArrayList<>();
        traversalLeaf(this, leafList);
        return leafList;
    }

    private void traversalLeaf(DashboardTree node, List<DashboardTree> list) {
        if (CollectionUtils.isEmpty(childs)) {
            return;
        }
        if (CollectionUtils.isEmpty(node.getChilds())) {
            list.add(node);
            return;
        }
        for (DashboardTree child : node.getChilds()) {
            traversalLeaf(child, list);
        }
    }
}
