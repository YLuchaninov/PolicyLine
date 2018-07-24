import Mutator from "./mutator";

function unwrapNamespace(data, namespace) {
    const path = namespace.split('.');
    let result = data;
    for (let part of path) {
        try {
            result = result[part];
        } catch (e) {
            result = null;
            break;
        }
    }
    return result;
}

function extract(data, operand, context) {
    let tmpContext, fn, value = operand.value;
    if (operand.isDIObj) {
        value = unwrapNamespace(data, value)
    }

    for (let mutator of operand.mutators) {
        if (operand.isDIObj) {
            context[operand.value] = context[operand.value] || {};
            tmpContext = context[operand.value];
        }

        fn = Mutator.list[mutator];
        if (fn && typeof fn !== 'function') {
            fn = fn[Mutator.prefix];
        }

        value = fn ? fn(value, tmpContext) : value;
    }
    return value;
}

export {
    extract
}