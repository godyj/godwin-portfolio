import Link from "next/link";
import Image from "next/image";
import { projects } from "@/data/projects";
import { getSession, redis } from "@/lib/auth";
import type { ViewerAccess } from "@/lib/auth";

// Lock icon in dark circle (restricted, no access)
function LockBadge() {
  return (
    <div className="w-8 h-8 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center">
      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    </div>
  );
}

// Checkmark in green circle (restricted, has access)
function CheckBadge() {
  return (
    <div className="w-8 h-8 rounded-full bg-green-600/90 backdrop-blur-sm flex items-center justify-center">
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </div>
  );
}

// Check if user has access to a specific locked project
async function checkProjectAccess(
  projectId: string,
  session: { email: string; role: string } | null
): Promise<boolean> {
  if (!session) return false;
  if (session.role === 'admin') return true;

  const viewer = await redis.get<ViewerAccess>(`viewer:${session.email}`);
  if (!viewer || viewer.status !== 'approved') return false;
  if (viewer.expiresAt && Date.now() > viewer.expiresAt) return false;
  if (viewer.projects.length === 0) return true;
  return viewer.projects.includes(projectId);
}

export default async function ProjectGrid() {
  const session = await getSession();

  // Pre-compute access for all locked projects
  const projectAccess = await Promise.all(
    projects.map(async (project) => ({
      id: project.id,
      hasAccess: project.locked ? await checkProjectAccess(project.id, session) : true,
    }))
  );

  const accessMap = Object.fromEntries(projectAccess.map((p) => [p.id, p.hasAccess]));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {projects.map((project) => {
        const isLocked = project.locked === true;
        const hasAccess = accessMap[project.id];

        return (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="group block"
            data-project-card
          >
            <article>
              {/* Thumbnail with hover overlay */}
              <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-background-card">
                <div className="absolute inset-0 transition-transform duration-700 ease-in-out group-hover:scale-110">
                  <Image
                    src={project.thumbnail}
                    alt={`${project.title} ${project.subtitle || ""}`}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Access status icon for restricted projects */}
                {isLocked && (
                  <div
                    className="absolute top-3 right-3 z-10"
                    title={hasAccess ? 'Access granted' : 'Restricted access'}
                  >
                    {hasAccess ? <CheckBadge /> : <LockBadge />}
                  </div>
                )}

                {/* Half overlay - slides up from bottom on hover */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-gray-100/95 via-gray-100/80 to-transparent dark:from-black/90 dark:via-black/70 dark:to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in group-hover:ease-out">
                  <div className="absolute bottom-0 inset-x-0 p-6 [text-shadow:0_1px_8px_rgb(243_244_246_/_0.9),0_1px_3px_rgb(243_244_246_/_0.9)] dark:[text-shadow:0_1px_8px_rgb(0_0_0_/_0.6),0_1px_3px_rgb(0_0_0_/_0.7)]">
                    <h2 className="text-lg font-bold mb-1 text-gray-900 dark:text-white">
                      {project.title}
                      {project.subtitle && (
                        <span className="font-normal text-gray-700 dark:text-white/80">
                          {" "}({project.subtitle})
                        </span>
                      )}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-white/60 mb-3">
                      {project.month && `${project.month}, `}{project.year}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-white/80 mb-3 line-clamp-3">
                      {project.description}
                    </p>
                    <div className="text-sm text-gray-500 dark:text-white/60">
                      {project.skills.map((skill, i) => (
                        <span key={skill}>
                          {skill}{i < project.skills.length - 1 ? " • " : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
}
