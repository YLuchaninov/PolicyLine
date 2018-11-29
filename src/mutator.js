function extractDate(a) {
  if (a instanceof Date) return a;
  return new Date(a);
}

const prefix = Symbol();
const postfix = Symbol();

const mutators = {
  'radius': {
    [postfix]: (data, context, key) => {
      if (data.leftIsData) {
        context.radius = data.leftValue;
      } else {
        context.radius = data.rightValue;
      }

      return true;
    }
  },
  'inArea': {
    [postfix]: (data, context, key) => {
      function deg2rad(deg) {
        return deg * (Math.PI / 180)
      }

      function getDistInKm(lat1, lon1, lat2, lon2) {
        let R = 6371; // Radius of the earth in km
        let dLat = deg2rad(lat2 - lat1);  // deg2rad below
        let dLon = deg2rad(lon2 - lon1);
        let a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
      }

      const distance = getDistInKm(data.rightValue[0], data.rightValue[1], data.leftValue[0], data.leftValue[1]);
      return context.radius >= distance;
    }
  },

  'or': {
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

  'toInt': (a) => (parseInt(a, 10)),
  'toString': (a) => (a + ''),
  'trim': (a) => (a.trim()),
  'uppercase': (a) => (a.toUpperCase()),
  'lowercase': (a) => (a.toLowerCase()),

  'minute': (a) => (extractDate(a).getMinutes()),
  'day': (a) => (extractDate(a).getDate()), // according to the local time
  'hour': (a) => (extractDate(a).getHours()), // according to the local time
  'weekday': (a) => (extractDate(a).getDay()), // according to the local time
  'month': (a) => (extractDate(a).getMonth()), // according to the local time
  'year': (a) => (extractDate(a).getFullYear()), // according to the local time

  'regExp': (a) => {
    let position = a.lastIndexOf('/');

    if (position === -1) {
      position = a.length;
    }

    const exp = a.substring(0, position);
    const flags = a.substring(position + 1, a.length);
    return flags && flags.length ? new RegExp(exp, flags) : new RegExp(exp);
  }
};

function register(name, prefixFn, postfixFn) {
  mutators[name] = {
    [prefix]: prefixFn,
    [postfix]: postfixFn
  };
}

function unregister(name) {
  delete mutators[name];
}

const Mutator = {
  prefix,
  postfix,
  register,
  unregister,
  get list() {
    return mutators;
  }
};

export default Mutator;