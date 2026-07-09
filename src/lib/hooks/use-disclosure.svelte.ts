export function useDisclosure({ defaultIsOpen = false }: { defaultIsOpen?: boolean } = {}) {
	let isOpen = $state(defaultIsOpen);

	return {
		get isOpen() {
			return isOpen;
		},
		// Lets the disclosure be handed straight to `bind:open` on shadcn's Dialog/Popover.
		set isOpen(value: boolean) {
			isOpen = value;
		},
		onOpen: () => (isOpen = true),
		onClose: () => (isOpen = false),
		onToggle: () => (isOpen = !isOpen)
	};
}
