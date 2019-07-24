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

import java.util.LinkedList;

public class FixSizeLinkedList<E> extends LinkedList<E> {
    private static final long serialVersionUID = -743149260899970541L;

    private int capacity;

    public FixSizeLinkedList(int capacity) {
        super();
        this.capacity = capacity;
    }

    @Override
    public synchronized void addFirst(E e) {
        if (size() + 1 > capacity && size() > 0) {
            super.removeLast();
        }
        super.addFirst(e);
    }

    @Override
    public synchronized E get(int index) {
        return super.get(index);
    }

    @Override
    public synchronized E set(int index, E element) {
        return super.set(index, element);
    }

    @Override
    public synchronized int indexOf(Object o) {
        return super.indexOf(o);
    }
}
