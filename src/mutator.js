// todo create DI possibility for custom mutators

function extractDate(a) {
    if (a instanceof Date) return a;
    return new Date(a);
}

const prefix = Symbol();
const postfix = Symbol();

const mutators = {
    'radius': { //todo change
        [prefix]: (a, context) => (a),
        [postfix]: (data, context, key) => (data.result)
    },
    'position': { //todo change
        [prefix]: (a, context) => (a),
        [postfix]: (data, context, key) => (data.result)
    },

    'or': {
        [prefix]: (a, context) => (a),
        [postfix]: (data, context, key) => {
            context.container = context.container || {};
            context.container[key] = data.result;

            if (data.result) {
                for (let key in context.container) {
                    context.container[key] = true;
                }
            }

            return context.container;
        }
    },

    'minute': (a) => (extractDate(a).getMinutes()),
    'day': (a) => (extractDate(a).getDate()), // according to the local time
    'hour': (a) => (extractDate(a).getHours()), // according to the local time
    'weekday': (a) => (extractDate(a).getDay()), // according to the local time
    'month': (a) => (extractDate(a).getMonth()), // according to the local time
    'year': (a) => (extractDate(a).getFullYear()), // according to the local time

    'toInt': (a) => (parseInt(a, 10)),
    'toString': (a) => (a + ''),
    'trim': (a) => (a.trim()),
    'uppercase': (a) => (a.toUpperCase()),
    'lowercase': (a) => (a.toLowerCase()),
};

export {
    mutators,
    prefix,
    postfix
};