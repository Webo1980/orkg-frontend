module.exports = function (file, { jscodeshift: j }, options) {
    const source = j(file.source);

    const s = "'use client';";
    const root = j(file.source);

    root.get().node.program.body.unshift(s);

    return root.toSource();
};
