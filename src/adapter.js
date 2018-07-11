// todo create DI possibility for custom adapters

function extractDate(a) {
    if (a instanceof Date) return a;
    return new Date(a);
}

const adapters = {
    'or': (a, context) => (a), //todo change

    'radius': (a, context) => (a), //todo change
    'position': (a, context) => (a), //todo change

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
    adapters
};