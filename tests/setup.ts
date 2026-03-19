import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import { sequelize } from "../src/config/db";

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});
