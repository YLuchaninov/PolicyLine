const extractDate = a => a instanceof Date ? a : new Date(a);

const prefix = Symbol();
const postfix = Symbol();

const deg2rad = deg => deg * (Math.PI / 180);

const getDistInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);  // deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const mutators = {
  'radius': {
    [postfix]: (data, context) => {
      if (data.leftIsData) {
        context.radius = data.leftValue;
      } else {
        context.radius = data.rightValue;
      }

      return true;
    }
  },
  'inArea': {
    [postfix]: (data, context) => {
      return context.radius >= getDistInKm(data.rightValue[0], data.rightValue[1], data.leftValue[0], data.leftValue[1]);
    }
  },

  'or': {
    [postfix]: (data, context, key) => {
      if (!context.container) {
        context.container = {};
      }
      context.container[key] = data.result;

      if (data.result) {
        for (let key in context.container) {
          context.container[key] = true;
        }
      }

      return context.container;
    }
  },

  'toInt': a => parseInt(a, 10),
  'toString': a => `${a}`,
  'trim': a => a.trim(),
  'uppercase': a => a.toUpperCase(),
  'lowercase': a => a.toLowerCase(),

  'minute': a => extractDate(a).getMinutes(),
  'day': a => extractDate(a).getDate(), // according to the local time
  'hour': a => extractDate(a).getHours(), // according to the local time
  'weekday': a => extractDate(a).getDay(), // according to the local time
  'month': a => extractDate(a).getMonth(), // according to the local time
  'year': a => extractDate(a).getFullYear(), // according to the local time

  'regExp': a => {
    let position = a.lastIndexOf('/');

    if (position === -1) {
      position = a.length;
    }

    const exp = a.substring(0, position);
    const flags = a.substring(position + 1, a.length);
    return flags && flags.length ? new RegExp(exp, flags) : new RegExp(exp);
  }
};

const register = (name, prefixFn, postfixFn) => {
  mutators[name] = {
    [prefix]: prefixFn,
    [postfix]: postfixFn
  }
};

const unregister = name => {
  delete mutators[name];
};

export default {
  prefix,
  postfix,
  register,
  unregister,
  get list() {
    return mutators;
  }
};