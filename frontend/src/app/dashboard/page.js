import { Suspense } from "react";
import ClientDashboard from "@/components/dashboard/ClientDashboard";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientDashboard />
    </Suspense>
  );
}