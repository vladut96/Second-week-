

export interface Video {
    id: number;
    title: string;
    author: string;
    canBeDownloaded?: boolean;
    minAgeRestriction?: number | null;
    createdAt?: string;
    publicationDate?: string;
    availableResolutions?: string[];
};
//export interface ICreateVideoResponseSuccess {description: string, data: Video}