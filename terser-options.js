module.exports = {
    mangle: {
        toplevel: true,
        eval: true,
    },

    compress: {
        dead_code: true,

        drop_console: false,

        drop_debugger: true,

        reduce_vars: true,

        if_return: true,
        loops: true,

        collapse_vars: true,

        unused: true,

        keep_infinity: true,
        passes: 2,
    },

    nameCache: {},

    output: {
        comments: false,
    },
}