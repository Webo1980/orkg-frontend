module.exports = {
    // Can be safely removed in newer versions of Next.js
    future: {
        // by default, if you customize webpack config, they switch back to version 4.
        // Looks like backward compatibility approach.
        webpack5: true,
    },

    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    compiler: {
        styledComponents: true, // to fix issue where class names on server and client don't match: https://github.com/vercel/next.js/issues/46605#issuecomment-1489135397
    },

    webpack(config) {
        config.resolve.fallback = {
            // if you miss it, all the other options in fallback, specified
            // by next.js will be dropped.
            ...config.resolve.fallback,

            fs: false, // the solution
        };
        config.module.rules.push({
            test: /\.md$/,
            // This is the asset module.
            type: 'asset/source',
        });
        config.externals = [...config.externals, 'canvas', 'jsdom']; // to fix pdf-text-annotation: https://github.com/kkomelin/isomorphic-dompurify/issues/54
        return config;
    },
};
