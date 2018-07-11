// todo create DI possibility for custom adapters

const adapters = {
    'or': (a, context) => (a), //todo change

    'radius': (a, context) => (a), //todo change
    'position': (a, context) => (a), //todo change

    'minute': (a) => (a), //todo change
    'hour': (a) => (a), //todo change
    'weekday': (a) => (a), //todo change
    'month': (a) => (a), //todo change
    'year': (a) => (a), //todo change

    'toInt': (a) => (parseInt(a, 10)),
    'toString': (a) => (a + ''),
    'trim': (a) => (a.trim()),
    'uppercase': (a) => (a.toUpperCase()),
    'lowercase': (a) => (a.toLowerCase()),
};

export {
    adapters
};