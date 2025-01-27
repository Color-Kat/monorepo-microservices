export interface ICourse {
    _id: string;
    title: string;
    description?: string;
    preview?: string;
    videos?: string[];
    price: number;
}
