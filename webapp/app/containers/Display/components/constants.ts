/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

export { GraphTypes, SecondaryGraphTypes, slideSettings, DefaultDisplayParams } from './Setting'

export enum DisplayOperations {
  AddSlide = 1,
  Preview,
  Share
}

export enum SlideOperations {
  AddGraph = 11
}

export enum LayerOperations {
  MoveUp = 111,
  MoveDown,
  MoveLeft,
  MoveRight,

  BringToUpper,
  BringToFront,
  SendToNext,
  SendToBottom,

  Delete,
  Copy,
  Paste,

  // @TODO undo redo with slides
  Undo,
  Redo
}

export enum LayerAlignmentTypes {
  Left,
  HorizontalCenter,
  VerticalCenter,
  Right,
  Top,
  Bottom
}

export const LayerCommands = [
  {
    title: '上移一层',
    icon: 'icon-bring-upper',
    operation: LayerOperations.BringToUpper
  },
  {
    title: '下移一层',
    icon: 'icon-send-next',
    operation: LayerOperations.SendToNext
  },
  {
    title: '置顶',
    icon: 'icon-bring-front',
    operation: LayerOperations.BringToFront
  },
  {
    title: '置底',
    icon: 'icon-send-bottom',
    operation: LayerOperations.SendToBottom
  }
]
