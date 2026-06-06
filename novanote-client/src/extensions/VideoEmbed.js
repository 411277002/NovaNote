import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import MediaResizeNodeView from '../components/editor/MediaResizeNodeView.vue'

const getEmbedUrl = (url) => {
  if (!url) return null

  const value = url.trim()

  const youtubeWatch = value.match(/youtube\.com\/watch\?v=([^&]+)/)
  if (youtubeWatch?.[1]) {
    return {
      type: 'iframe',
      src: `https://www.youtube.com/embed/${youtubeWatch[1]}`
    }
  }

  const youtubeShort = value.match(/youtu\.be\/([^?&]+)/)
  if (youtubeShort?.[1]) {
    return {
      type: 'iframe',
      src: `https://www.youtube.com/embed/${youtubeShort[1]}`
    }
  }

  if (value.includes('youtube.com/embed/')) {
    return {
      type: 'iframe',
      src: value
    }
  }

  const vimeo = value.match(/vimeo\.com\/(\d+)/)
  if (vimeo?.[1]) {
    return {
      type: 'iframe',
      src: `https://player.vimeo.com/video/${vimeo[1]}`
    }
  }

  if (
    value.match(/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i) ||
    value.includes('/uploads/videos/')
  ) {
    return {
      type: 'video',
      src: value
    }
  }

  return null
}

export const VideoEmbed = Node.create({
  name: 'videoEmbed',

  group: 'block',

  atom: true,

  draggable: true,

  selectable: true,

  addAttributes() {
    return {
      src: {
        default: null
      },

      embedType: {
        default: 'iframe'
      },

      width: {
        default: '560px',
        parseHTML: element => {
          const wrapper = element.closest?.('.nova-media-node, .nova-video-wrapper')
          return (
            element.getAttribute('data-width') ||
            wrapper?.getAttribute?.('data-width') ||
            wrapper?.style?.width ||
            '560px'
          )
        },
        renderHTML: attributes => {
          return {
            'data-width': attributes.width
          }
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'iframe[data-video-embed]',
        getAttrs: element => ({
          src: element.getAttribute('src'),
          embedType: 'iframe',
          width:
            element.getAttribute('data-width') ||
            element.closest?.('.nova-video-wrapper')?.style?.width ||
            '560px'
        })
      },
      {
        tag: 'video[data-video-embed]',
        getAttrs: element => ({
          src: element.getAttribute('src'),
          embedType: 'video',
          width:
            element.getAttribute('data-width') ||
            element.closest?.('.nova-video-wrapper')?.style?.width ||
            '560px'
        })
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const width = HTMLAttributes.width || '560px'

    if (HTMLAttributes.embedType === 'video') {
      return [
        'div',
        {
          class: 'nova-video-wrapper',
          'data-width': width,
          style: `width: ${width}; max-width: 100%;`
        },
        [
          'video',
          mergeAttributes(HTMLAttributes, {
            'data-video-embed': '',
            class: 'nova-video-frame',
            controls: 'true'
          })
        ]
      ]
    }

    return [
      'div',
      {
        class: 'nova-video-wrapper',
        'data-width': width,
        style: `width: ${width}; max-width: 100%;`
      },
      [
        'iframe',
        mergeAttributes(HTMLAttributes, {
          'data-video-embed': '',
          class: 'nova-video-frame',
          frameborder: '0',
          allow:
            'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
          allowfullscreen: 'true'
        })
      ]
    ]
  },

  addNodeView() {
    return VueNodeViewRenderer(MediaResizeNodeView)
  },

  addCommands() {
    return {
      setVideoEmbed:
        options =>
        ({ commands }) => {
          const result = getEmbedUrl(options.src)

          if (!result) {
            alert('目前支援 YouTube、Vimeo，或 mp4/webm/ogg/mov 影片')
            return false
          }

          return commands.insertContent({
            type: this.name,
            attrs: {
              src: result.src,
              embedType: result.type,
              width: options.width || '560px'
            }
          })
        }
    }
  }
})