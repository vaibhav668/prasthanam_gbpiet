import { localDb } from '../lib/local-db'
import type { HomepageData } from '../types/api'

export const homepageService = {
  async getHomepageData(): Promise<HomepageData> {
    // Return direct from local client-side database
    return localDb.getHomepageBundle()
  },
}
