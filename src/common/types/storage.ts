export interface FileData {
    fileName: string;
    fileData: ArrayBufferLike;
}
export interface FileStorage {
    upload(data: FileData): Promise<void>;
    delete(fileName: string): void;
    getObjectURI(filename: string): string;
}
