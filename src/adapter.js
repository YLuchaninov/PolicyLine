// todo create DI possibility for custom adapters

const adapters = {
    'or': (a, context) => (a), //todo change

    'radius': (a, context) => (a), //todo change
    'position': (a, context) => (a), //todo change

    'minute': (a) => ((new Date(a)).getMinutes()),
    'day': (a) => ((new Date(a)).getDate()), // according to the local time
    'hour': (a) => ((new Date(a)).getHours()), // according to the local time
    'weekday': (a) => ((new Date(a)).getDay()), // according to the local time
    'month': (a) => ((new Date(a)).getMonth()), // according to the local time
    'year': (a) => ((new Date(a)).getFullYear()), // according to the local time

    'toInt': (a) => (parseInt(a, 10)),
    'toString': (a) => (a + ''),
    'trim': (a) => (a.trim()),
    'uppercase': (a) => (a.toUpperCase()),
    'lowercase': (a) => (a.toLowerCase()),
};

export {
    adapters
};