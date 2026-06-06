import { defineStore } from 'pinia'
import api from '../services/api'

export const usePlanetsStore = defineStore('planets', {
  state: () => ({
    planets: [],
    loading: false,
    error: null
  }),

  actions: {
    normalizePlanet(planet) {
      return {
        ...planet,
        name: planet.name || '未命名星球',
        color: planet.color || '#646cff',
        texture_type: planet.texture_type || 'rocky'
      }
    },

    async fetchPlanets() {
      this.loading = true
      this.error = null

      try {
        const res = await api.get('/planets')

        const planets = Array.isArray(res.data)
          ? res.data
          : res.data.planets || []

        this.planets = planets.map(this.normalizePlanet)

        return this.planets
      } catch (err) {
        console.error('讀取星球失敗:', err)
        this.error = err
        throw err
      } finally {
        this.loading = false
      }
    },

    async createPlanet(payload) {
      this.loading = true
      this.error = null

      try {
        const res = await api.post('/planets', {
          name: payload.name || '未命名星球',
          color: payload.color || '#646cff',
          texture_type: payload.texture_type || 'rocky',
          user_id: payload.user_id || null,
          x_pos: payload.x_pos,
          y_pos: payload.y_pos
        })

        const newPlanet = this.normalizePlanet(res.data.planet || res.data)

        this.planets.push(newPlanet)

        return newPlanet
      } catch (err) {
        console.error('新增星球失敗:', err)
        this.error = err
        throw err
      } finally {
        this.loading = false
      }
    },

    async updatePlanet(id, payload) {
      this.loading = true
      this.error = null

      try {
        const res = await api.put(`/planets/${id}`, {
          name: payload.name || '未命名星球',
          color: payload.color || '#646cff',
          texture_type: payload.texture_type || 'rocky'
        })

        const updatedPlanet = this.normalizePlanet(res.data.planet || res.data)

        const index = this.planets.findIndex(
          planet => String(planet.id) === String(id)
        )

        if (index !== -1) {
          this.planets[index] = {
            ...this.planets[index],
            ...updatedPlanet
          }
        }

        return updatedPlanet
      } catch (err) {
        console.error('更新星球失敗:', err)
        this.error = err
        throw err
      } finally {
        this.loading = false
      }
    },

    async updatePlanetPosition(id, xPos, yPos) {
      this.error = null

      try {
        const res = await api.put(`/planets/${id}/position`, {
          x_pos: xPos,
          y_pos: yPos
        })

        const updatedPlanet = res.data.planet || res.data

        const index = this.planets.findIndex(
          planet => String(planet.id) === String(id)
        )

        if (index !== -1) {
          this.planets[index] = {
            ...this.planets[index],
            x_pos: xPos,
            y_pos: yPos,
            ...updatedPlanet
          }
        }

        return updatedPlanet
      } catch (err) {
        console.error('更新星球位置失敗:', err)
        this.error = err
        throw err
      }
    },

    // 移到垃圾桶，不是真的永久刪除
    async deletePlanet(id) {
      this.loading = true
      this.error = null

      try {
        await api.delete(`/planets/${id}`)

        this.planets = this.planets.filter(
          planet => String(planet.id) !== String(id)
        )

        return true
      } catch (err) {
        console.error('刪除星球失敗:', err)
        this.error = err
        throw err
      } finally {
        this.loading = false
      }
    },

    // 取得垃圾桶星球
    async fetchTrashPlanets() {
      this.loading = true
      this.error = null

      try {
        const res = await api.get('/planets/trash')

        const planets = Array.isArray(res.data)
          ? res.data
          : res.data.planets || []

        return planets.map(this.normalizePlanet)
      } catch (err) {
        console.error('取得垃圾桶星球失敗:', err)
        this.error = err
        throw err
      } finally {
        this.loading = false
      }
    },

    // 復原星球
    async restorePlanet(id) {
      this.loading = true
      this.error = null

      try {
        const res = await api.put(`/planets/${id}/restore`)

        const restoredPlanet = res.data.planet
          ? this.normalizePlanet(res.data.planet)
          : null

        if (restoredPlanet) {
          const exists = this.planets.some(
            planet => String(planet.id) === String(restoredPlanet.id)
          )

          if (!exists) {
            this.planets.push(restoredPlanet)
          }
        }

        await this.fetchPlanets()

        return res.data
      } catch (err) {
        console.error('復原星球失敗:', err)
        this.error = err
        throw err
      } finally {
        this.loading = false
      }
    },

    // 永久刪除星球
    async permanentDeletePlanet(id) {
      this.loading = true
      this.error = null

      try {
        const res = await api.delete(`/planets/${id}/permanent`)

        this.planets = this.planets.filter(
          planet => String(planet.id) !== String(id)
        )

        return res.data
      } catch (err) {
        console.error('永久刪除星球失敗:', err)
        this.error = err
        throw err
      } finally {
        this.loading = false
      }
    }
  }
})