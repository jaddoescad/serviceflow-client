export const formatFullName = (record: { first_name?: string | null; last_name?: string | null } | null): string => {
    if (!record) return '';
    return `${record.first_name || ''} ${record.last_name || ''}`.trim();
};
