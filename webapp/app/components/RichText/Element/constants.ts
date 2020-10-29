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

export enum HeadingElementTypes {
  HeadingOne = 'heading-one',
  HeadingTwo = 'heading-two',
  HeadingThree = 'heading-three',
  HeadingFour = 'heading-four',
  HeadingFive = 'heading-five',
  HeadingSix = 'heading-six',
  HeadingNone = 'heading-none'
}

export enum ListElementTypes {
  BulletedList = 'bulleted-list',
  NumberedList = 'numbered-list',
  ListItem = 'list-item'
}

export enum MediaElementTypes {
  Image = 'image'
}

export enum AnimationElementTypes {
  Marquee = 'marquee'
}

export enum TableElementTypes {
  Table = 'table',
  TableRow = 'table-row',
  TableCell = 'table-cell'
}

export enum BaseElementTypes {
  Paragraph = 'paragraph',
  Code = 'code',
  BlockQuote = 'block-quote',
  Link = 'link'
}

export const ElementTypes = {
  ...BaseElementTypes,
  ...HeadingElementTypes,
  ...MediaElementTypes,
  ...AnimationElementTypes,
  ...TableElementTypes,
  ...ListElementTypes
}

export type ElementType =
  | BaseElementTypes
  | HeadingElementTypes
  | MediaElementTypes
  | AnimationElementTypes
  | TableElementTypes
  | ListElementTypes

export enum TextStyles {
  Bold = 'bold',
  Italic = 'italic',
  Underline = 'underline',
  StrikeThrough = 'strike-through',
  Code = 'code'
}

export enum BlockAlignments {
  AlignLeft = 'left',
  AlignCenter = 'center',
  AlignRight = 'right'
}

export enum BlockProperties {
  TextAlign = 'textAlign'
}

export enum TextProperties {
  FontFamily = 'fontFamily',
  FontSize = 'fontSize',
  Color = 'color',
  BackgroundColor = 'backgroundColor'
}

export const ElementTags: {
  [key: string]: (
    el: HTMLElement
  ) => {
    type: ElementType
    url?: string
    textAlign?: string
  }
} = {
  A: (el) => ({ type: ElementTypes.Link, url: el.getAttribute('href') }),
  BLOCKQUOTE: () => ({ type: ElementTypes.BlockQuote }),
  H1: () => ({ type: ElementTypes.HeadingOne }),
  H2: () => ({ type: ElementTypes.HeadingTwo }),
  H3: () => ({ type: ElementTypes.HeadingThree }),
  H4: () => ({ type: ElementTypes.HeadingFour }),
  H5: () => ({ type: ElementTypes.HeadingFive }),
  H6: () => ({ type: ElementTypes.HeadingSix }),
  IMG: (el) => ({
    type: ElementTypes.Image,
    url: el.getAttribute('src'),
    width: el.getAttribute('width')
  }),
  LI: () => ({ type: ElementTypes.ListItem }),
  OL: () => ({ type: ElementTypes.NumberedList }),
  UL: () => ({ type: ElementTypes.BulletedList }),
  P: () => {
    return { type: ElementTypes.Paragraph }
  },
  PRE: () => ({ type: ElementTypes.Code }),
  TABLE: () => ({ type: ElementTypes.Table }),
  TR: () => ({ type: ElementTypes.TableRow }),
  TD: () => ({ type: ElementTypes.TableCell })
}

export const TextTags: {
  [key: string]: () => { [key in TextStyles]?: boolean } & {
    fontSize?: number
    color?: string
    backgroundColor?: string
  }
} = {
  CODE: () => ({ [TextStyles.Code]: true }),
  DEL: () => ({ [TextStyles.StrikeThrough]: true }),
  EM: () => ({ [TextStyles.Italic]: true }),
  I: () => ({ [TextStyles.Italic]: true }),
  S: () => ({ [TextStyles.StrikeThrough]: true }),
  STRONG: () => ({ [TextStyles.Bold]: true }),
  U: () => ({ [TextStyles.Underline]: true }),
  SPAN: () => ({})
}
