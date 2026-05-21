package com.medval.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

/**
 * Custom deserializer that handles multiple time formats:
 * - 24-hour format: "14:30", "09:00"
 * - 12-hour format: "2:30 PM", "9:00 AM", "11:30 AM"
 */
public class FlexibleLocalTimeDeserializer extends JsonDeserializer<LocalTime> {
    
    private static final List<DateTimeFormatter> FORMATTERS = Arrays.asList(
        DateTimeFormatter.ofPattern("HH:mm"),           // 14:30
        DateTimeFormatter.ofPattern("HH:mm:ss"),        // 14:30:00
        DateTimeFormatter.ofPattern("H:mm:ss"),         // 9:30:00
        new DateTimeFormatterBuilder()
            .parseCaseInsensitive()
            .appendPattern("h:mm a")
            .toFormatter(Locale.ENGLISH),               // 2:30 PM (case insensitive)
        new DateTimeFormatterBuilder()
            .parseCaseInsensitive()
            .appendPattern("hh:mm a")
            .toFormatter(Locale.ENGLISH),               // 02:30 PM (case insensitive)
        new DateTimeFormatterBuilder()
            .parseCaseInsensitive()
            .appendPattern("h:mm:ss a")
            .toFormatter(Locale.ENGLISH),               // 2:30:00 PM
        DateTimeFormatter.ISO_LOCAL_TIME                // ISO format
    );

    @Override
    public LocalTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String timeStr = p.getText().trim();
        
        if (timeStr == null || timeStr.isEmpty()) {
            return null;
        }
        
        for (DateTimeFormatter formatter : FORMATTERS) {
            try {
                return LocalTime.parse(timeStr, formatter);
            } catch (DateTimeParseException e) {
                // Try next formatter
            }
        }
        
        throw new IOException("Unable to parse time: " + timeStr + 
            ". Expected formats: HH:mm (24-hour) or h:mm a (12-hour like '2:30 PM')");
    }
}
