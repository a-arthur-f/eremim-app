import axios from "axios";
import axiosConfig from "../../config/axios";
import { ProductPageFilters, execInAllPages } from "../core";
import { retrieveProductVariations } from "./retrieve";

const url = "https://lojaeremim.com/wp-json/wc/v3/products";

interface UpdateProductData {
  regular_price?: string;
  price?: string;
}

interface UpdateProductFilters {
  [index: string]: string | undefined;
  regular_price?: string;
}

export async function updateAllSimple(
  data: UpdateProductData,
  pageFilters?: ProductPageFilters & Record<string, string>,
  prodctFilters?: UpdateProductFilters
) {
  await execInAllPages<{ id: number; regular_price: string }>(
    url,
    async (items) => {
      for (let item of items) {
        console.log(item);
        if (
          parseFloat(item.regular_price) ===
          parseFloat(prodctFilters?.regular_price || "0")
        )
          await updateProduct(item.id, data);
      }
    },
    { type: "simple", ...pageFilters }
  );
}

export async function updateAllVariations(
  data: UpdateProductData,
  pageFilters?: ProductPageFilters & Record<string, string>,
  prodctFilters?: UpdateProductFilters
) {
  await execInAllPages<{ id: number }>(
    url,
    async (items) => {
      for (let item of items) {
        const variations = await retrieveProductVariations(item.id);
        updateProductVariationList(variations, item.id, data, prodctFilters);
      }
    },
    { type: "variable", ...pageFilters }
  );
}

export async function updateProductVariationList(
  list: [{ [index: string]: string }],
  parentId: number,
  data: UpdateProductData,
  filters?: UpdateProductFilters
) {
  const updateList = [];
  if (filters) {
    for (let variation of list) {
      for (let filter in filters) {
        if (
          parseFloat(variation[filter]) === parseFloat(filters[filter] || "0")
        ) {
          updateList.push({ id: variation.id, ...data });
        }
      }
    }
  } else {
    for (let variation of list) {
      updateList.push(variation);
    }
  }

  const { data: axiosData } = await axios.post(
    url + `/${parentId}/variations/batch`,
    {
      update: updateList,
    },
    axiosConfig
  );

  return axiosData;
}

export async function updateProductVariation(
  id: number,
  parentId: number,
  data: UpdateProductData
) {
  try {
    const { data: axiosData } = await axios.post(
      url + `/${parentId}/variations/${id}`,
      data,
      axiosConfig
    );

    return axiosData;
  } catch (e) {
    console.log(e);
  }
}

export async function updateProduct(id: number, data: UpdateProductData) {
  try {
    const { data: axiosData } = await axios.post(
      url + `/${id}`,
      data,
      axiosConfig
    );

    return axiosData;
  } catch (e) {
    console.log(e);
  }
}
