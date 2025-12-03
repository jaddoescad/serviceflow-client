export type MonthSearchParams = {
    month?: string;
    year?: string;
};

export type MonthRange = {
    startInclusive: Date;
    endExclusive: Date;
};

export const parseMonthFromParams = (params: MonthSearchParams) => {
    const now = new Date();
    return new Date(
        parseInt(params.year || String(now.getFullYear()), 10),
        parseInt(params.month || String(now.getMonth()), 10),
        1
    );
};

export const addMonths = (date: Date, months: number) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
};

export const buildMonthHref = (path: string, date: Date) => {
    return `${path}?month=${date.getMonth()}&year=${date.getFullYear()}`;
};

export const buildMonthRange = (date: Date): MonthRange => {
    const startInclusive = new Date(date.getFullYear(), date.getMonth(), 1);
    const endExclusive = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    return { startInclusive, endExclusive };
};
