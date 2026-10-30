import LabClient from "./LabClient";
import { isGateId } from "@/lib/data/gates";

export default async function LabPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const raw = params.gate;
  const gateParam = typeof raw === "string" ? raw : undefined;
  const initialGate = gateParam && isGateId(gateParam) ? gateParam : "and";
  return <LabClient initialGate={initialGate} />;
}
