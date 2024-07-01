import { FN, TS } from "@healthcare-interoperability/hl7v2-datatypes";
import { ComplexDataType, PrimitiveDataType } from "@healthcare-interoperability/hl7v2-core";

export class HL7v2MySQLUtils {
    /**
   * Validates and formats HL7 date/time to MySQL-compatible format.
   * @param {ComplexDataType|PrimitiveDataType} inputDateTime - HL7 date/time to validate and format.
   * @param {boolean} [ignoreTimeZone=true] - Flag to ignore time zone offset.
   * @returns {string|null} Formatted MySQL-compatible date/time string or null if input is invalid.
   * @throws {Error} If input is not in valid HL7 date/time format.
   */
    static validateDTM(inputDateTime, ignoreTimeZone = true) {
        if (inputDateTime instanceof ComplexDataType) {
            if (inputDateTime instanceof TS) {
                inputDateTime = inputDateTime.Time?.toString();
            } else {
                throw new Error(`Not a valid Complex Data Type`);
            }
        } else if (inputDateTime instanceof PrimitiveDataType) {
            inputDateTime = inputDateTime?.toString();
        }

        inputDateTime = inputDateTime?.trim();

        if (inputDateTime) {
            // Regular expression to match the provided format


            const regex = /^(\d{4})(\d{2})?(\d{2})?(\d{2})?(\d{2})?(\d{2})?(\.?\d+)?([+-]\d{4})?$/;
            const match = inputDateTime.match(regex);
            if (!match) {
                console.log(`Not a valid HL7 TimeFormat ${inputDateTime} YYYY[MM[DD[HH[MM[SS[.S[S[S[S]]]]]]]]][+/-ZZZZ]`);
                return null;
            }


            // Extract the components from the match
            const year = match[1];
            const month = match[2] || '01';
            const day = match[3] || '01';
            const hour = match[4] || '00';
            const minute = match[5] || '00';
            const second = match[6] || '00';
            const millisecond = match[7] ? (match[7].includes('.') ? match[7].slice(1) : match[7]) : '000';
            let timezone = ``;
            if (match[8] || !ignoreTimeZone) {
                timezone = match[8] || '+0000';
            }

            // Construct the date string in MySQL format
            const mysqlDateTime = `${year}-${month}-${day} ${hour}:${minute}:${second}.${millisecond} ${timezone}`;

            // Validate the constructed date using JavaScript's Date object
            const dateObj = new Date(mysqlDateTime);
            if (isNaN(dateObj.getTime())) {
                console.log(`Invalid Date Time ${mysqlDateTime} ${inputDateTime}`);
                return null;
            }

            // Return the formatted date time
            return mysqlDateTime;
        }
        return null;
    }

    /**
     * Validates and trims a string value.
     * @param {ComplexDataType|PrimitiveDataType|string} value - Value to validate and trim.
     * @returns {string|null} Trimmed string or null if value is not a string.
     * @throws {Error} If value is a complex data type.
     */
    static validateString(value) {
        if (value instanceof ComplexDataType) {
            throw new Error(`Complex Data Type is not supported`);
        } else if (value instanceof PrimitiveDataType) {
            value = value?.toString();
        }
        if (typeof value === 'string') {
            value = value.trim();
        }
        return value;
    }

    /**
     * Validates and formats HL7 full name to a single string.
     * @param {ComplexDataType|PrimitiveDataType|string} value - Value to validate and format.
     * @returns {string|null} Formatted full name or null if input is invalid.
     * @throws {Error} If input is not a valid full name.
     */
    static validateFullName(value) {
        if (value instanceof ComplexDataType) {
            if (value instanceof FN) {
                value = value.toArray()?.join(' ');
            } else {
                throw new Error(`Not a valid Complex Data Type`);
            }
        } else if (value instanceof PrimitiveDataType) {
            value = value?.toString();
        }
        if (typeof value === 'string') {
            value = value.trim();
        }
        return value;
    }


    /**
     * Prepares complex data for database storage.
     * @param {ComplexDataType|PrimitiveDataType|string} value - Value to prepare.
     * @returns {string|null} Prepared value or null if input is invalid.
     */
    static prepareComplexData(value) {
        if (value instanceof ComplexDataType) {
            value = value.toArray()?.join(' ');
        } else if (value instanceof PrimitiveDataType) {
            value = value?.toString();
        }
        if (typeof value === 'string') {
            value = value.trim();
        }
        return value;
    }
}
