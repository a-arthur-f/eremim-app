import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { Buffer } from "node:buffer";
import { retrieveCategoryID } from "../categories";

type ProductType = "simple" | "camisetas";

interface VariableAndVariations {
  name: string;
  category: string;
  variations: [{ name: string }];
}

const url = "https://lojaeremim.com/wp-json/wc/v3/products";

export async function createProduct(src: string, type: ProductType) {
  switch (type) {
    case "camisetas":
      await createTshirt(src);
      break;
  }
}

async function createTshirt(src: string) {
  try {
    const files = await fs.readdir(src, { withFileTypes: true });
    let variables = [];
    let products = [];
    const sizes = ["P", "M", "G", "GG", "XGG", "XXGG"];
    const description =
      "<b>Camiseta de material 100% poliéster.</b><br/>\
    Ideal para espalhar o amor pelo sagrado em qualquer lugar!";

    for (let file of files) {
      if (file.isDirectory()) await createTshirt(path.resolve(src, file.name));
      else {
        const [_, id, name] = file.name.split("_");
        const price = !isNaN(
          parseFloat(file.name.split("_")[3].replace(/\D/g, ""))
        )
          ? file.name.split("_")[3].replace(/\D/g, "")
          : "40";
        if (name === "regata")
          variables.push({
            src,
            name,
            type: "variation",
            id,
            file: file.name,
            color: file.name.split("_").at(-1)?.replace(/\.\D*/, ""),
          });
        else if (name === "camiseta")
          variables.push({
            src,
            name,
            type: "variation",
            id,
            file: file.name,
            color: file.name.split("_").at(-1)?.replace(/\.\D*/, ""),
          });
        else
          variables.push({
            src,
            type: "variable",
            id,
            name,
            file: file.name,
            categories: [
              await retrieveCategoryID("Camisetas"),
              await retrieveCategoryID(getCategory(src) || ""),
            ],
            price,
          });
      }
    }

    for (let product of variables) {
      const colors = [];
      if (product.type === "variable") {
        const variations = [];
        for (let p of variables) {
          if (p.type === "variation" && p.id === product.id) {
            variations.push(p);
            colors.push(p.file.split("_").at(-1)?.replace(/\.\D*/, ""));
          }
        }
        products.push({ ...product, variations, colors });
      }
    }

    for (let product of products) {
      const variations = [];
      for (let variation of product.variations) {
        for (let size of sizes) {
          if (size === "XXGG" && variation.name === "regata") continue;

          const model =
            variation.name === "regata"
              ? "Regata masculina"
              : "Camiseta unissex";
          let regular_price = product.price;

          if (size === "XGG")
            regular_price = (parseFloat(product.price || "0") + 5).toString();
          if (size === "XXGG") regular_price = "70";

          variations.push({
            regular_price,
            image: {
              name: variation.file,
            },
            attributes: [
              {
                name: "Tamanho",
                option: size,
              },
              {
                name: "Cor",
                option: variation.color,
              },
              {
                name: "Modelo",
                option: model,
              },
            ],
          });
        }
      }
      console.log(variations);
      const variableProduct = {
        name: product.name,
        type: "variable",
        short_description: description,
        images: [{ name: product.file }],
        categories: product.categories,
        catalog_visibility: "hidden",
        dimensions: {
          width: "5",
          height: "10",
          length: "20",
        },
        weight: "0.3",
        attributes: [
          { name: "Tamanho", visible: true, variation: true, options: sizes },
          {
            name: "Cor",
            visible: true,
            variation: true,
            options: product.colors,
          },
          {
            name: "Modelo",
            visible: true,
            variation: true,
            options: ["Camiseta unissex", "Regata masculina"],
          },
        ],
      };
    }
  } catch (e) {
    console.log(e);
  }
}

function getCategory(src: string) {
  return src.split(/\/|\\/).at(-1);
}

export async function renameFiles(src: string, dest: string): Promise<void> {
  try {
    console.log(dest);
    const files = await fs.readdir(src, { withFileTypes: true });
    const uniqueCode = Buffer.from(Date.now().toString())
      .toString("base64")
      .replace("==", "");
    if (existsSync(dest)) {
      await fs.rm(dest, { recursive: true });
    }

    await fs.mkdir(dest);
    for (let file of files) {
      if (file.isDirectory()) {
        await renameFiles(
          getNextDirectory(src, file.name),
          path.resolve(dest, file.name)
        );
      } else {
        await fs.copyFile(
          path.resolve(path.resolve(src, file.name)),
          path.resolve(
            dest,
            `${uniqueCode}_${file.name.replace(/(\d)([a-z]|[A-Z])/, "$1")}`
          )
        );
      }
    }
  } catch (e) {
    console.log(e);
  }
}

function getNextDirectory(
  currentDirectory: string,
  nextDirectoryName: string
): string {
  return path.resolve(currentDirectory, `${nextDirectoryName}`);
}
