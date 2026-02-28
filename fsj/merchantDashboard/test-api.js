const MingDaoYunArrayAPI = require('./wxApp/utils/MingdaoYunArrayAPI');

async function testMingdaoYunAPI() {
  console.log('========== 开始测试明道云 API ==========');
  
  const api = new MingDaoYunArrayAPI();
  
  console.log('\n1. 测试轮播图数据（带过滤条件）...');
  try {
    const carouselResult = await api.getData({
      worksheetId: 'lunbotu',
      filters: [
        {
          controlId: 'use',
          dataType: 2,
          spliceType: 1,
          filterType: 2,
          value: '1'
        }
      ],
      pageSize: 50,
      pageIndex: 1
    });
    
    console.log('轮播图 API 调用结果:');
    console.log('- success:', carouselResult.success);
    console.log('- data.rows 数量:', carouselResult.data?.rows?.length || 0);
  } catch (error) {
    console.error('轮播图测试失败:', error);
  }
  
  console.log('\n2. 测试轮播图数据（不带过滤条件）...');
  try {
    const carouselResult = await api.getData({
      worksheetId: 'lunbotu',
      filters: [],
      pageSize: 50,
      pageIndex: 1
    });
    
    console.log('轮播图 API 调用结果:');
    console.log('- success:', carouselResult.success);
    console.log('- data.rows 数量:', carouselResult.data?.rows?.length || 0);
    
    if (carouselResult.success && carouselResult.data?.rows?.length > 0) {
      console.log('\n轮播图数据样例:');
      console.log(JSON.stringify(carouselResult.data.rows[0], null, 2));
    }
  } catch (error) {
    console.error('轮播图测试失败:', error);
  }
  
  console.log('\n========== 测试结束 ==========');
}

testMingdaoYunAPI();
