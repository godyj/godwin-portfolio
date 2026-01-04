"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function ResumeContent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-background-page pt-[70px]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div
          className={`transition-all duration-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {/* Download Link */}
          <div className="text-center mb-12">
            <a
              href="https://www.dropbox.com/s/rgvd5esapnhq2nl/Godwin-Resume.pdf?dl=0"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-lg text-gray-600 dark:text-stone-400 hover:text-gray-900 dark:hover:text-stone-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </a>
          </div>

          {/* Resume Images */}
          <div className="space-y-8">
            <Image
              src="/images/resume/resume-1.png"
              alt="Godwin Johnson Resume - Page 1"
              width={1920}
              height={2480}
              className="w-full h-auto"
              priority
            />
            <Image
              src="/images/resume/resume-2.png"
              alt="Godwin Johnson Resume - Page 2"
              width={1920}
              height={2480}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
