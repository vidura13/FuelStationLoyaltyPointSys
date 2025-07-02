import { formatInTimeZone } from 'date-fns-tz';
import { getTimeZoneOffset } from 'date-fns-tz';

import { addHours, addMinutes, format } from 'date-fns';

export const convertUtcToIst = (utcDate) => {
    if (!utcDate || typeof utcDate !== 'string' || !/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?/.test(utcDate)) {
        console.error('UTC Date is null, undefined, or invalid:', utcDate);
        return 'N/A';
    }

    try {

        // Truncate high-precision fractional seconds to milliseconds
        const truncatedDate = utcDate.includes('.') ? utcDate.replace(/(\.\d{3})\d+/, '$1') : utcDate;

        // Parse the date and validate it
        const parsedDate = new Date(truncatedDate);
        if (isNaN(parsedDate.getTime())) {
            console.error('Parsed date is invalid:', parsedDate);
            return 'N/A';
        }

        // Add 5 hours and 30 minutes to the UTC date
        const istDate = addMinutes(addHours(parsedDate, 5), 30);

        // Format the IST date
        const formattedDate = format(istDate, 'dd/MM/yyyy hh:mm:ss a');
        return formattedDate;
    } catch (error) {
        console.error('Error converting UTC to IST:', error);
        return 'N/A';
    }
};