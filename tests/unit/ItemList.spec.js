import { shallowMount } from '@vue/test-utils'
import ItemList from '@/components/dashboard/ItemList.vue'

jest.mock('@/api', () => ({
  getItems: jest.fn(() => Promise.resolve({ data: [] })),
  deleteItem: jest.fn((id, params) => {
    // emulate API responses based on params
    if (params && params.mode === 'export') {
      return Promise.resolve({ data: { id, availableForExports: false, availableForTransports: true } })
    }
    if (params && params.mode === 'transport') {
      return Promise.resolve({ data: { id, availableForExports: true, availableForTransports: false } })
    }
    // full delete
    return Promise.resolve({ status: 204 })
  })
}))

describe('ItemList.vue delete behavior', () => {
  it('removes availability when component mode=export', async () => {
    const wrapper = shallowMount(ItemList, { props: { mode: 'export' } })
    wrapper.vm.deleteItem = { id: 1, availableForExports: true, availableForTransports: true }
    await wrapper.vm.performDelete()
    expect(wrapper.vm.deleteItem).toBeNull()
  })

  it('deletes entirely when component mode=all', async () => {
    const wrapper = shallowMount(ItemList, { props: { mode: 'all' } })
    wrapper.vm.deleteItem = { id: 2 }
    await wrapper.vm.performDelete()
    expect(wrapper.vm.deleteItem).toBeNull()
  })
})
