// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

export type Id = string
export type LanguageId = string
export type Plaintext = string
export type Markdown = string
export type Link = {
  /** Display name of the link */
  link: string
  /** Target URL of the link */
  href: string
}

export type Moniker = string | {
  name: string
  displayName?: string
  productName?: string
  order?: number
}

export type Inline = Plaintext | Link | Inline[]

export type Component =
  | Section
  | TextBlock
  | Code
  | Declaration
  | Note
  | Fact
  | JumpList
  | ParameterList
  | Tree

export type ReferencePage = {
  /** ID of the page */
  id: Id
  /** Language identifier of the page */
  languageId: LanguageId
  /** Title of the page */
  title: Plaintext
  /** A list of components to display on the page. Components are displayed from top to bottom in the order they appear on the list. */
  body: Component[]
  /** Short summary of the page */
  summary?: Plaintext
  /** A key-value pair of custom metadata of the page */
  metadata?: object
  /** Whether this page is deprecated, or the deprecation reason. */
  deprecated?: boolean | Markdown
  /** A list of monikers if this page supports versioning. */
  monikers?: Moniker[]
}

export type Section = {
  /** Section header text */
  section: Plaintext
  /** An ordered list of components in this section */
  body: Component[]
}

export type Zone = {
  moniker?: string[]
  platform?: string[]
  language?: string[]
  body: Component[]
}

export type TextBlock = {
  /** Content in markdown format */
  markdown: Markdown
}

export type Declaration = {
  /** Content in markdown format */
  declaration: Plaintext | Declaration[]
  /** Syntax highlight language id, use page language id when not specified */
  languageId?: LanguageId
  /** View Source */
  source?: string
}

export type Code = {
  /** Raw code literal */
  code: Plaintext | Code[]
  /** Syntax highlight language id, use page language id when not specified */
  languageId?: LanguageId
  /** View Source */
  source?: string
}

export type Note = {
  /** Content in markdown format */
  note: Markdown
}

export type Fact = {
  /** Key value pair of facts. */
  fact: { [key: Plaintext]: Inline }
}

export type JumpList = {
  /** An ordered list of jump list items. */
  jumplist: {
    /** Item name to jump to */
    name: Inline
    /** Item description */
    description: Markdown
    /** Whether this item is deprecated */
    deprecated: boolean
  }[]
}

export type ParameterList = {
  /** An ordered list of parameters. */
  parameters: {
    /** The parameter name formatted as code */
    name: Plaintext
    /** Description of the parameter in markdown */
    description: Markdown
    /** Parameter type */
    type?: Inline
    /** Whether this parameter is required. */
    required?: boolean
    /** Default value of this parameter */
    default?: Plaintext
    /** Whether this parameter is deprecated */
    deprecated: boolean
    /** Additional key value pair facts about this parameter. */
    fact?: { [key: Plaintext]: Inline }
  }[]
}

export type TreeNode = {
  name: Inline,
  items?: TreeNode[],
}

export type Tree = {
  tree: TreeNode[]
}
