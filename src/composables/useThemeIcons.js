import { computed, inject } from 'vue'
import {
  getThemeIcon,
  getMenuIcon,
  getActiveIconPackId,
  getIconPackOptions,
  iconRevision,
  ICON_REVISION_KEY
} from '@/theme/icons'

export function useThemeIcons() {
  const revision = inject(ICON_REVISION_KEY, iconRevision)

  const packId = computed(() => {
    void revision.value
    return getActiveIconPackId()
  })

  function icon(name) {
    void revision.value
    return getThemeIcon(name)
  }

  function menuIcon(menuName) {
    void revision.value
    return getMenuIcon(menuName)
  }

  return {
    packId,
    iconRevision: revision,
    icon,
    menuIcon,
    getThemeIcon: icon,
    getMenuIcon: menuIcon,
    iconPackOptions: getIconPackOptions
  }
}
