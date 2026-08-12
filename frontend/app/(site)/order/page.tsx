import type { Metadata } from "next";
import { OrderPageContent } from "@/components/sections/order/OrderPageContent";
import { AgeGate } from "@/components/order/AgeGate";

export const metadata: Metadata = {
  title: "Order at Your Table",
  description:
    "Pick your table and order hookah and drinks straight from your seat at Alibaba Hookah Lounge.",
};

export default function OrderPage() {
  return (
    <AgeGate>
      <OrderPageContent />
    </AgeGate>
  );
}
