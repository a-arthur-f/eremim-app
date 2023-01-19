import dotenv from "dotenv";
import { retrieveCategoryID } from "./lib/categories";
import { updateAllSimple, updateAllVariations } from "./lib/products/update";
import { createProduct, renameFiles } from "./lib/products";
import path from "node:path";

dotenv.config();

(async function () {
  await createProduct(path.resolve("../produtosnovos"), "camisetas");
})();
