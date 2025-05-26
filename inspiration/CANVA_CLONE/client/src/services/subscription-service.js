import { fetchWithAuth } from "./base-service";

export async function getUserSubscription() {
  return fetchWithAuth(`/v1/subscription`);
}

export async function createPaypalOrder() {
  return fetchWithAuth(`/v1/subscription/create-order`, {
    method: "post",
  });
}

export async function capturePaypalOrder(orderId) {
  return fetchWithAuth(`/v1/subscription/capture-order`, {
    method: "post",
    body: {
      orderId,
    },
  });
}
