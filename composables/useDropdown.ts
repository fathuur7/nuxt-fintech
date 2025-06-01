import { ref, onMounted, onUnmounted } from 'vue'

export const useDropdown = () => {
  const isDropdownOpen = ref(false)
  const isMobileMenuOpen = ref(false)

  // Toggle functions
  const toggleDropdown = () => {
    isDropdownOpen.value = !isDropdownOpen.value
    if (isMobileMenuOpen.value) {
      isMobileMenuOpen.value = false
    }
  }

  const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
    if (isDropdownOpen.value) {
      isDropdownOpen.value = false
    }
  }

  const closeDropdown = () => {
    isDropdownOpen.value = false
  }

  const closeMobileMenu = () => {
    isMobileMenuOpen.value = false
  }

  const closeAll = () => {
    isDropdownOpen.value = false
    isMobileMenuOpen.value = false
  }

  // Close dropdowns when clicking outside
  const handleClickOutside = (event: Event, dropdownRef: HTMLElement | null) => {
    if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
      isDropdownOpen.value = false
    }
  }

  return {
    isDropdownOpen: readonly(isDropdownOpen),
    isMobileMenuOpen: readonly(isMobileMenuOpen),
    toggleDropdown,
    toggleMobileMenu,
    closeDropdown,
    closeMobileMenu,
    closeAll,
    handleClickOutside
  }
}