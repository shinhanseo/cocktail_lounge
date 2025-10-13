import 'dotenv/config';
import es from '../src/lib/esClient.js';

const defs = [
  {
    index: 'posts',
    body: {
      settings: { index: { number_of_shards: 1, number_of_replicas: 0 } },
      mappings: {
        properties: {
          id:        { type: 'keyword' },
          title:     { type: 'search_as_you_type' },
          author:    { type: 'keyword' },
          tags:      { type: 'keyword' },
          desc:      { type: 'text' },       // = body
          createdAt: { type: 'date' }
        }
      }
    }
  },
  {
    index: 'cocktails',
    body: {
      settings: { index: { number_of_shards: 1, number_of_replicas: 0 } },
      mappings: {
        properties: {
          id:        { type: 'keyword' },    // slug 또는 id 문자열화
          title:     { type: 'search_as_you_type' }, // = name
          tags:      { type: 'keyword' },
          desc:      { type: 'text' },       // = comment 또는 설명
          author:    { type: 'keyword' },    // 등록자 없으면 생략 가능
          createdAt: { type: 'date' }        // 없으면 생략 가능
        }
      }
    }
  }
];

for (const { index, body } of defs) {
  const exists = await es.indices.exists({ index });
  if (!exists) {
    await es.indices.create({ index, ...body });
    console.log(`✅ created index: ${index}`);
  } else {
    console.log(`ℹ️ index already exists: ${index}`);
  }
}
