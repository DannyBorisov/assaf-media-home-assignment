// current php API router based on path param

export const TokenName = "Nothing-to-see-here";

class ApiClient {
  #baseUrl = "http://localhost:8080";
  #defaultEndpoint = "/auth.php";
  #defaultHeaders = {
    "Content-Type": "application/json",
    Authorization: `${localStorage.get(TokenName)}`,
  };

  constructor() {}

  #buildUrl(endpoint: string, queryParams: Record<string, string> = {}) {
    const url = new URL(endpoint, this.#baseUrl);
    Object.keys(queryParams).forEach((key) => {
      url.searchParams.append(key, queryParams[key]);
    });
    return url.href;
  }

  async get(params: Record<string, string> = {}) {
    const url = this.#buildUrl(this.#defaultEndpoint, params);
    const response = await fetch(url, { headers: this.#defaultHeaders });
    if (!response.ok) {
      throw new Error(`GET request failed: ${response.statusText}`);
    }
    return response.json();
  }

  // data in json format, param path
  async post(
    data: any = {},
    params: Record<string, string> & { path: string }
  ) {
    if (!params.path) {
      throw new Error("Missing required 'path' parameter in params.");
    }
    const url = this.#buildUrl(this.#defaultEndpoint, params);

    const formdata = new FormData();

    for (const key in data) {
      formdata.append(key, data[key]);
    }

    const response = await fetch(url, {
      method: "POST",
      headers: this.#defaultHeaders,
      body: formdata,
    });
    if (!response.ok) {
      throw new Error(`POST request failed: ${response.statusText}`);
    }
    return response.json();
  }
}

const apiClient = new ApiClient();
export default apiClient;
