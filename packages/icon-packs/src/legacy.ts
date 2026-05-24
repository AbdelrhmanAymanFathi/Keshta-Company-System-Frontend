import { defineComponent, h, inject } from 'vue'
import { getThemeIcon, ICON_REVISION_KEY } from './resolver'

function createThemedIcon(semanticName: string, displayName: string) {
  return defineComponent({
    name: displayName,
    inheritAttrs: true,
    setup(_, { attrs }) {
      const revision = inject(ICON_REVISION_KEY, null)
      return () => {
        if (revision) void (revision as { value: number }).value
        const Icon = getThemeIcon(semanticName)
        if (!Icon) return null
        const classes = ['theme-icon', attrs.class].filter(Boolean)
        return h(Icon, { ...attrs, class: classes.length ? classes : undefined })
      }
    }
  })
}

export const PlusIcon = createThemedIcon('add', 'PlusIcon')
export const PencilSquareIcon = createThemedIcon('edit', 'PencilSquareIcon')
export const PencilIcon = createThemedIcon('pencil', 'PencilIcon')
export const TrashIcon = createThemedIcon('delete', 'TrashIcon')
export const XMarkIcon = createThemedIcon('close', 'XMarkIcon')
export const DocumentDuplicateIcon = createThemedIcon('duplicate', 'DocumentDuplicateIcon')
export const CheckIcon = createThemedIcon('check', 'CheckIcon')
export const ArrowLeftIcon = createThemedIcon('arrowLeft', 'ArrowLeftIcon')
export const ArrowRightIcon = createThemedIcon('arrowRight', 'ArrowRightIcon')
export const ArrowsRightLeftIcon = createThemedIcon('swap', 'ArrowsRightLeftIcon')
export const DocumentTextIcon = createThemedIcon('document', 'DocumentTextIcon')
export const WalletIcon = createThemedIcon('wallet', 'WalletIcon')
export const UserIcon = createThemedIcon('user', 'UserIcon')
export const UsersIcon = createThemedIcon('users', 'UsersIcon')
export const UserGroupIcon = createThemedIcon('userGroup', 'UserGroupIcon')
export const ChartBarIcon = createThemedIcon('chart', 'ChartBarIcon')
export const ArchiveBoxIcon = createThemedIcon('archive', 'ArchiveBoxIcon')
export const BanknotesIcon = createThemedIcon('money', 'BanknotesIcon')
export const BuildingOffice2Icon = createThemedIcon('building', 'BuildingOffice2Icon')
export const ClipboardDocumentListIcon = createThemedIcon('clipboard', 'ClipboardDocumentListIcon')
export const ClockIcon = createThemedIcon('clock', 'ClockIcon')
export const MapPinIcon = createThemedIcon('mapPin', 'MapPinIcon')
export const MapIcon = createThemedIcon('map', 'MapIcon')
export const IdentificationIcon = createThemedIcon('identification', 'IdentificationIcon')
export const WrenchScrewdriverIcon = createThemedIcon('settings', 'WrenchScrewdriverIcon')
export const TruckIcon = createThemedIcon('vehicle', 'TruckIcon')
export const Squares2X2Icon = createThemedIcon('grid', 'Squares2X2Icon')
export const CubeIcon = createThemedIcon('cube', 'CubeIcon')
export const ExclamationTriangleIcon = createThemedIcon('warning', 'ExclamationTriangleIcon')
export const PlayIcon = createThemedIcon('play', 'PlayIcon')
export const InformationCircleIcon = createThemedIcon('info', 'InformationCircleIcon')
export const EnvelopeIcon = createThemedIcon('envelope', 'EnvelopeIcon')
export const ShieldCheckIcon = createThemedIcon('shield', 'ShieldCheckIcon')
export const KeyIcon = createThemedIcon('key', 'KeyIcon')
export const DevicePhoneMobileIcon = createThemedIcon('mobile', 'DevicePhoneMobileIcon')
export const ArrowPathIcon = createThemedIcon('swap', 'ArrowPathIcon')
export const ArrowUturnLeftIcon = createThemedIcon('arrowLeft', 'ArrowUturnLeftIcon')
export const ChartBarSquareIcon = createThemedIcon('chart', 'ChartBarSquareIcon')
export const DocumentArrowDownIcon = createThemedIcon('document', 'DocumentArrowDownIcon')
export const ExclamationCircleIcon = createThemedIcon('warning', 'ExclamationCircleIcon')
export const FunnelIcon = createThemedIcon('settings', 'FunnelIcon')
export const MagnifyingGlassIcon = createThemedIcon('default', 'MagnifyingGlassIcon')
export const TableCellsIcon = createThemedIcon('grid', 'TableCellsIcon')
export const CalendarDaysIcon = createThemedIcon('clock', 'CalendarDaysIcon')
export const CurrencyDollarIcon = createThemedIcon('money', 'CurrencyDollarIcon')
