import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";
dotenv.config();

const es = new Client({ node: process.env.ES_URL || "http://localhost:9200" });
export default es;
