
window.fetchUserRecords = async function(userId) {
    if (!userId) return [];
    try {
        if (typeof window.MingDaoYunArrayAPI === 'undefined') {
            console.warn('MingDaoYunArrayAPI not ready');
            return [];
        }
        const api = new window.MingDaoYunArrayAPI();
        const result = await api.getData({
            worksheetId: 'jilubiao',
            pageSize: 100,
            pageIndex: 1,
            filters: [
                {
                    controlId: 'peizhenshi',
                    dataType: 29,
                    spliceType: 1,
                    filterType: 24,
                    value: userId
                },
                {
                    controlId: 'del',
                    dataType: 2,
                    spliceType: 1,
                    filterType: 2,
                    value: 0
                }
            ],
            sortId: 'ctime',
            isAsc: false
        });
        
        if (result && result.data && Array.isArray(result.data.rows)) {
            console.log('Fetched records:', result.data.rows.length);
            return result.data.rows;
        }
        return [];
    } catch (error) {
        console.error('Error fetching user records:', error);
        return [];
    }
}
