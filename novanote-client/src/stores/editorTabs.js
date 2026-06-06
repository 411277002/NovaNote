import { defineStore } from 'pinia'

const STORAGE_KEY = 'novanote-editor-tabs'
const ACTIVE_KEY = 'novanote-active-editor-tab'

export const useEditorTabsStore = defineStore('editorTabs', {
  state: () => ({
    tabs: [],
    activeTabId: null
  }),

  getters: {
    activeTab(state) {
      return state.tabs.find(tab => String(tab.id) === String(state.activeTabId)) || null
    }
  },

  actions: {
    loadTabs() {
      try {
        const rawTabs = localStorage.getItem(STORAGE_KEY)
        const rawActive = localStorage.getItem(ACTIVE_KEY)

        this.tabs = rawTabs ? JSON.parse(rawTabs) : []
        this.activeTabId = rawActive || null
      } catch (err) {
        console.warn('讀取編輯器分頁失敗:', err)
        this.tabs = []
        this.activeTabId = null
      }
    },

    saveTabs() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tabs))
      localStorage.setItem(ACTIVE_KEY, this.activeTabId ? String(this.activeTabId) : '')
    },

    openTab(note) {
      if (!note || !note.id) return

      const id = String(note.id)
      const title = note.title?.trim() || '未命名文件'

      const exists = this.tabs.find(tab => String(tab.id) === id)

      if (exists) {
        exists.title = title
        this.activeTabId = id
        this.saveTabs()
        return
      }

      this.tabs.push({
        id,
        title
      })

      this.activeTabId = id
      this.saveTabs()
    },

    updateTabTitle(id, title) {
      const tab = this.tabs.find(tab => String(tab.id) === String(id))

      if (!tab) return

      tab.title = title?.trim() || '未命名文件'
      this.saveTabs()
    },

    setActiveTab(id) {
      this.activeTabId = String(id)
      this.saveTabs()
    },

    closeTab(id) {
      const targetId = String(id)
      const index = this.tabs.findIndex(tab => String(tab.id) === targetId)

      if (index === -1) return null

      this.tabs.splice(index, 1)

      if (String(this.activeTabId) === targetId) {
        const nextTab = this.tabs[index] || this.tabs[index - 1] || null
        this.activeTabId = nextTab ? String(nextTab.id) : null
        this.saveTabs()
        return nextTab
      }

      this.saveTabs()
      return this.activeTab
    },

    removeTab(id) {
      const targetId = String(id)

      this.tabs = this.tabs.filter(tab => String(tab.id) !== targetId)

      if (String(this.activeTabId) === targetId) {
          const nextTab = this.tabs[this.tabs.length - 1] || null
          this.activeTabId = nextTab ? String(nextTab.id) : null
      }

      this.saveTabs()

      return this.activeTab
    },

    clearTabs() {
      this.tabs = []
      this.activeTabId = null
      this.saveTabs()
    }
  }
})