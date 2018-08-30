function isObject(item) {
    return (item
        && typeof item === 'object'
        && !Array.isArray(item)
        && !(item instanceof RegExp));
}

function mergeDeep(target, source) {
    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) {
                    target[key] = {};
                }
                mergeDeep(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }
    return target || source;
}

export {
    mergeDeep
}