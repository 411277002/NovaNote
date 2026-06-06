import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: false,
        command: ({ editor, range, props }) => {
          props.command({ editor, range })
        }
      }
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion
      })
    ]
  }
})

export const getSlashCommandItems = ({ query }) => {
  const items = [
    {
      title: '一般文字',
      description: '轉換成普通段落文字',
      icon: 'fa-align-left',
      keywords: ['text', 'paragraph', '文字', '段落'],
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setParagraph()
          .run()
      }
    },
    {
      title: '標題 1',
      description: 'H1',
      icon: 'fa-heading',
      keywords: ['h1', 'title', '標題一'],
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleHeading({ level: 1 })
          .run()
      }
    },
    {
      title: '標題 2',
      description: 'H2',
      icon: 'fa-heading',
      keywords: ['h2', 'subtitle', '標題二'],
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleHeading({ level: 2 })
          .run()
      }
    },
    {
      title: '標題 3',
      description: 'H3',
      icon: 'fa-heading',
      keywords: ['h3', '標題三'],
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleHeading({ level: 3 })
          .run()
      }
    },
    {
      title: '標題 4',
      description: 'H4',
      icon: 'fa-heading',
      keywords: ['h4', '標題四'],
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleHeading({ level: 4 })
          .run()
      }
    },
    {
      title: '標題 5',
      description: 'H5',
      icon: 'fa-heading',
      keywords: ['h5', '標題五'],
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleHeading({ level: 5 })
          .run()
      }
    },
    {
      title: '標題 6',
      description: 'H6',
      icon: 'fa-heading',
      keywords: ['h6', '標題六'],
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleHeading({ level: 6 })
          .run()
      }
    },
    {
      title: '項目符號清單',
      description: '建立 bullet list',
      icon: 'fa-list-ul',
      keywords: ['bullet', 'list', '清單', '項目'],
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleBulletList()
          .run()
      }
    },
    {
      title: '編號清單',
      description: '建立 numbered list',
      icon: 'fa-list-ol',
      keywords: ['ordered', 'number', '編號', '數字'],
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleOrderedList()
          .run()
      }
    },
    {
      title: '分隔線',
      description: '插入水平分隔線',
      icon: 'fa-minus',
      keywords: ['line', 'divider', '分隔線'],
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setHorizontalRule()
          .run()
      }
    },
    {
        title: '貼上媒體網址',
        description: '插入圖片、YouTube、Vimeo 或影片網址',
        icon: 'fa-solid fa-link',
        keywords: ['media', 'image', 'video', 'url', '圖片', '影片', '媒體', '網址'],
        command: ({ editor, range }) => {
            editor
            .chain()
            .focus()
            .deleteRange(range)
            .run()

            const url = window.prompt('請貼上圖片、YouTube、Vimeo 或影片網址')

            if (!url) return

            window.dispatchEvent(
            new CustomEvent('novanote:insert-media-url', {
                detail: {
                url: url.trim()
                }
            })
            )
        }
        },
        {
        title: '上傳本機媒體',
        description: '從電腦上傳圖片或影片',
        icon: 'fa-solid fa-upload',
        keywords: ['media', 'upload', 'image', 'video', '圖片', '影片', '上傳', '本機'],
        command: ({ editor, range }) => {
            editor
            .chain()
            .focus()
            .deleteRange(range)
            .run()

            window.dispatchEvent(new CustomEvent('novanote:open-media-upload'))
        }
        }
  ]

  const normalizedQuery = query.toLowerCase().trim()

  if (!normalizedQuery) return items

  return items.filter(item => {
    const titleMatched = item.title.toLowerCase().includes(normalizedQuery)
    const descMatched = item.description.toLowerCase().includes(normalizedQuery)
    const keywordMatched = item.keywords.some(keyword =>
      keyword.toLowerCase().includes(normalizedQuery)
    )

    return titleMatched || descMatched || keywordMatched
  })
}