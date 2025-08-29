export function mapToObject(map: Map<string, unknown>) {
    const obj: { [key: string]: unknown } = {};
    for (const [key, value] of map) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
        obj[key] = value instanceof Map ? mapToObject(value) : value;
    }
    return obj;
}
