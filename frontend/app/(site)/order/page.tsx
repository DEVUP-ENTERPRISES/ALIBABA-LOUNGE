import type { Metadata } from "next";
import { OrderPageContent } from "@/components/sections/order/OrderPageContent";

export const metadata: Metadata = {
  title: "Order at Your Table",
  description:
    "Pick your table and order hookah and drinks straight from your seat at Alibaba Hookah Lounge.",
};

export default function OrderPage() {
  return <OrderPageContent />;
}
