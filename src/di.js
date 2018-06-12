import files from "./external";

const namespace = 'abac_di';

const DI = {
    register(name, fn) {
        if (global[namespace] === undefined) {
            global[namespace] = {};
        }

        if (typeof name === 'function') {
            global[namespace][name.name] = name;
        } else {
            global[namespace][name] = fn;
        }
    },

    unregister(name) {
        if (global[namespace] === undefined) {
            return;
        }

        delete global[namespace][(typeof name === 'function') ? name.name : name];
    },

    clear() {
        delete global[namespace];
    },

    loadPresets() {
        for (const fileName in files) {
            for (const fnName in files[fileName]) {
                DI.register(fnName, files[fileName][fnName]);
            }
        }
    }
};

export {
    DI,
    namespace
};