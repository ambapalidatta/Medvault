package com.medval.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    // This constructor is required by your service
    public ResourceNotFoundException(String message) {
        // 'super(message)' passes the message to the RuntimeException class
        super(message);
    }
}