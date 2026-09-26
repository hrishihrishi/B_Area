import StorefrontClient from "@/components/modules/storefront/StorefrontClient";

export const metadata = {
  title: "Home | B_Area Storefront",
  description: "Personalized B2B discovery storefront with location-ranked listings.",
};

export default function HomeStorefrontPage() {
  return <StorefrontClient />;
}
