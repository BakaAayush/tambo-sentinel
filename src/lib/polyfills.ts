// Polyfill for crypto.randomUUID (needed for older browsers)
if (typeof window !== 'undefined' && typeof crypto !== 'undefined' && !crypto.randomUUID) {
    // @ts-expect-error - polyfill for older browsers
    crypto.randomUUID = function (): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
}

export { };
