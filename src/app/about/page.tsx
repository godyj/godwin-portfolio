export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-3 gap-12 items-start">
          {/* Profile Image Placeholder */}
          <div className="md:col-span-1">
            <div className="w-48 h-48 mx-auto md:mx-0 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
              <span className="text-5xl font-bold text-gray-400 dark:text-gray-500">G</span>
            </div>
          </div>

          {/* Bio Content */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                About
              </h1>
              <p className="text-lg text-gray-500 dark:text-gray-400">
                Product Designer (UI+UX)
              </p>
            </div>

            <div className="prose prose-gray dark:prose-invert max-w-none space-y-4">
              <p className="text-lg leading-normal text-gray-700 dark:text-gray-300">
                I am first and foremost a Product Designer (UI+UX) with an insatiable need to ship exciting products that humans can&apos;t live without. As a lead/principal designer I consistently aim to inspire, mentor, and lead by example while keeping myself up-to-date on the latest in design, tools and bleeding edge technology.
              </p>

              <p className="leading-normal text-gray-600 dark:text-gray-400">
                Creating a delightful, simple, intuitive and pioneering product is quite important but I fervently believe anything I design should first add value to the lives of those I design for.
              </p>

              <p className="leading-normal text-gray-600 dark:text-gray-400">
                I think the best designs materialize when a team of humans work in collaboration; like a great symphony. Complexity is a great opportunity for creating simple experiences.
              </p>
            </div>

            {/* Social Links */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Connect
              </h3>
              <div className="flex gap-4">
                <a
                  href="https://www.linkedin.com/in/godwinjohnson/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
