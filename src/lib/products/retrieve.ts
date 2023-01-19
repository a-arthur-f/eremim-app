import axios from "axios";
import axiosConfig from "../../config/axios";

const url = "https://lojaeremim.com/wp-json/wc/v3/products";

interface ProductPageFilters {
  max_price?: string;
  category?: string;
}

export async function retrieveProductsPage(
  page: number = 1,
  perPage: number = 100,
  filters?: ProductPageFilters & Record<string, string>
) {
  try {
    let params = "";
    if (filters) params = new URLSearchParams(filters).toString();
    const { data, headers } = await axios(
      url + `?page=${page}&per_page=${perPage}${filters ? "&" + params : ""}`,
      axiosConfig
    );

    return { totalPages: headers["x-wp-totalpages"], data };
  } catch (e: any) {
    throw e.response.data.message;
  }
}

export async function retrieveProductVariations(productId: number) {
  const { data } = await axios(
    url + `/${productId}/variations?per_page=100`,
    axiosConfig
  );

  return data;
}

export async function retrieveProduct(id: number) {
  try {
    const { data } = await axios(url + `/${id}`, axiosConfig);

    return data;
  } catch (e) {
    console.log(e);
  }
}
