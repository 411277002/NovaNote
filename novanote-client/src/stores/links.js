import { defineStore } from 'pinia'
import api from '../services/api'

export const useLinksStore = defineStore('links', {
  state: () => ({
    links: [],
    backlinks: []
  }),

  actions: {
    async createLink(payload) {
        try {
            const res = await api.post('/links', payload)
            const newLink = res.data.link || res.data

            this.links.push(newLink)

            return newLink
        } catch (err) {
            console.error('建立連結失敗:', err)
            throw err
        }
    },

    async fetchLinks(sourceType, sourceId) {
      const res = await api.get(`/links/${sourceType}/${sourceId}`)
      this.links = res.data
      return res.data
    },

    async fetchAllLinks() {
      try {
        const res = await api.get('/links')
        this.links = res.data
        return res.data
      } catch (err) {
        console.error('讀取 links 失敗:', err)
      }
    },

    async fetchBacklinks(targetType, targetId) {
      const res = await api.get(`/links/backlinks/${targetType}/${targetId}`)
      this.backlinks = res.data
      return res.data
    },

    async deleteLink(id) {
    try {
        await api.delete(`/links/${id}`)

        this.links = this.links.filter(
        link => String(link.id) !== String(id)
        )

        return true
    } catch (err) {
        console.error('刪除連結失敗:', err)
        throw err
    }
    }
  }
})