import moment from 'moment';

export default {
    // "HH:mm a"
    $timeBetween(time, start, end) {
        let currentTime = moment(time, "HH:mm a");
        let startTime = moment(start, "HH:mm a");
        let endTime = moment(end, "HH:mm a");

        if ((startTime.hour() >= 12 && endTime.hour() <= 12) || endTime.isBefore(startTime)) {
            endTime.add(1, "days"); // handle spanning days endTime

            if (currentTime.hour() <= 12) {
                currentTime.add(1, "days"); // handle spanning days currentTime
            }
        }

        return currentTime.isBetween(startTime, endTime);
    },

    // return moment instance for target or comparison
    $moment(date, pattern) {
        if (pattern === 'unix') {
            return moment.unix(date);
        }
        return moment(date, pattern);
    },

    // extract day number from timestamp value in 'week' or 'month'
    $day(val, param = 'month') {
        let day = moment.unix(val);
        switch (param) {
            case 'week':
                day = day.day();
                break;
            default:
                day = day.date();
        }
        return day;
    },

    // extract week number from timestamp value in 'month' or 'year'
    $week(val, param = 'month') {
        let week = moment.unix(val);
        if (param === 'year') {
            // localized week of the year
            week = week.week();
        } else {
            week = Math.ceil(week.date() / 7);
        }

        return week;
    },

    // extract month number from timestamp value
    $month(val) {
        return moment.unix(val).month();
    },

    // extract quarter number from timestamp value
    $quarter(val) {
        return moment.unix(val).quarter();
    },

    // extract year from timestamp value
    $year(val) {
        return moment.unix(val).year()
    },

    // translate data to timestamp UTC value by pattern
    $dataToTimestamp(val, pattern) {
        return parseInt(moment(val, pattern).format('X'), 10);
    }
}