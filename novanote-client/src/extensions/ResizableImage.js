import Image from '@tiptap/extension-image'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import MediaResizeNodeView from '../components/editor/MediaResizeNodeView.vue'

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),

      width: {
        default: '420px',
        parseHTML: element => {
          return element.getAttribute('data-width') || element.style.width || '420px'
        },
        renderHTML: attributes => {
          return {
            'data-width': attributes.width,
            style: `width: ${attributes.width || '420px'}; max-width: 100%; height: auto;`
          }
        }
      }
    }
  },

  addNodeView() {
    return VueNodeViewRenderer(MediaResizeNodeView)
  }
})