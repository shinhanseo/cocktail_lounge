import { Client } from '@elastic/elasticsearch';

// v9를 쓰는 현재 상태에서도 ES 8.x와 호환되게 헤더 부여
const client = new Client({
  node: process.env.ES_NODE ?? 'http://localhost:9200'
});

// named + default 둘 다 export (기존 seed 스크립트 호환)
export const es = client;
export default client;
