import type { Response } from "express";

export class ApiResponse {
    static returnResults<T>(res: Response, data: T, status = 200) {
        return res.status(status).json({ data });
    }

    static operations(res: Response, message: string, status = 200) {
        res.status(status).json({ message });
    }
    static errorOperation(res: Response, message: string, status = 400) {
        return res.status(status).json({ message });
    }
}