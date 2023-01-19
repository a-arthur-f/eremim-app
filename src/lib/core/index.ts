import axios from "axios";
import axiosConfig from "../../config/axios";
import { retrieveProductsPage } from "../products";

interface ExecInAllPagesCallback<item, returnType = null> {
  (itemsList: [item]): returnType | void | Promise<returnType | void>;
}

export interface ProductPageFilters {
  max_price?: string;
  category?: string;
  type?: string;
}

export function execInAllPages<item, returnType = null>(
  path: string,
  callback: ExecInAllPagesCallback<item, returnType>,
  filters?: ProductPageFilters & Record<string, string>
) {
  return new Promise<returnType | void>(async (resolve) => {
    try {
      let params = "";
      if (filters) params = new URLSearchParams(filters).toString();
      console.log(path + "?per_page=100" + `&${params}`);
      const { headers } = await axios(
        path + "?per_page=100" + `&${params}`,
        axiosConfig
      );
      let page = 1;
      const totalPages = parseInt(headers["x-wp-totalpages"] || "0");
      let item: returnType | void;

      while (page <= totalPages) {
        const { data } = await axios(
          path + `?per_page=100&page=${page}&${params}`,
          axiosConfig
        );
        page++;
        item = await callback(data);
        if (item !== undefined) break;
      }

      resolve(item);
    } catch (e) {
      console.log(e);
    }
  });
}
