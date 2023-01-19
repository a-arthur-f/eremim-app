import axios from "axios";
import axiosConfig from "../../config/axios";
import { execInAllPages } from "../core";

const url = "https://lojaeremim.com/wp-json/wc/v3/products/categories";

export async function retrieveCategoryID(name: string) {
  try {
    const id = await execInAllPages<{ name: string; id: number }, number>(
      url,
      (items) =>
        items.find(
          (item) => item.name.toLocaleLowerCase() === name.toLocaleLowerCase()
        )?.id
    );

    return id;
  } catch (e) {
    console.log(e);
  }
}
