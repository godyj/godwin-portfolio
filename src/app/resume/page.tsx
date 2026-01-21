import Image from "next/image";
import { getSession, redis } from "@/lib/auth";
import type { ViewerAccess } from "@/lib/auth";
import ProtectedProject from "@/components/ProtectedProject";
import ResumeContent from "./ResumeContent";

// Check if user has access to locked content
async function checkAccess(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;

  // Admins have access to everything
  if (session.role === 'admin') return true;

  // Check if viewer is approved
  const viewer = await redis.get<ViewerAccess>(`viewer:${session.email}`);
  if (!viewer || viewer.status !== 'approved') return false;

  // Check if access has expired
  if (viewer.expiresAt && Date.now() > viewer.expiresAt) return false;

  // Approved viewers have access to resume
  return true;
}

export default async function ResumePage() {
  const hasAccess = await checkAccess();

  // If user doesn't have access, show protected view
  if (!hasAccess) {
    return (
      <ProtectedProject
        projectId="resume"
        projectTitle="Résumé"
        hasAccess={false}
      >
        {null}
      </ProtectedProject>
    );
  }

  return <ResumeContent />;
}
