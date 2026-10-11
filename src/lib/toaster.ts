// app-wide toasts (rendered by <Toast.Group> in +layout.svelte)

import { createToaster } from '@skeletonlabs/skeleton-svelte';

export const toaster = createToaster({ placement: 'top' });
