package com.equipoise.backend.exception;

import com.equipoise.backend.dto.ApiError;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import jakarta.validation.ConstraintViolationException;

import java.time.Instant;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> validation(MethodArgumentNotValidException exception, HttpServletRequest request) {
        List<ApiError.ValidationError> details = exception.getBindingResult().getFieldErrors().stream()
                .map(this::validationError).toList();
        return response(HttpStatus.BAD_REQUEST, "Request validation failed.", request, details);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    ResponseEntity<ApiError> notFound(ResourceNotFoundException exception, HttpServletRequest request) {
        return response(HttpStatus.NOT_FOUND, exception.getMessage(), request, List.of());
    }

    @ExceptionHandler(BadCredentialsException.class)
    ResponseEntity<ApiError> unauthorized(BadCredentialsException exception, HttpServletRequest request) {
        return response(HttpStatus.UNAUTHORIZED, "Invalid email or password.", request, List.of());
    }

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<ApiError> status(ResponseStatusException exception, HttpServletRequest request) {
        HttpStatus status = HttpStatus.valueOf(exception.getStatusCode().value());
        return response(status, exception.getReason() == null ? status.getReasonPhrase() : exception.getReason(), request, List.of());
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    ResponseEntity<ApiError> methodNotAllowed(HttpRequestMethodNotSupportedException exception, HttpServletRequest request) {
        return response(HttpStatus.METHOD_NOT_ALLOWED, "HTTP method is not supported for this endpoint.", request, List.of());
    }

    @ExceptionHandler({IllegalArgumentException.class, DataIntegrityViolationException.class})
    ResponseEntity<ApiError> badRequest(Exception exception, HttpServletRequest request) {
        return response(HttpStatus.BAD_REQUEST, exception.getMessage(), request, List.of());
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class, ConstraintViolationException.class})
    ResponseEntity<ApiError> invalidRequest(Exception exception, HttpServletRequest request) {
        return response(HttpStatus.BAD_REQUEST, "Request body or parameter is invalid.", request, List.of());
    }

    @ExceptionHandler(JwtException.class)
    ResponseEntity<ApiError> invalidToken(JwtException exception, HttpServletRequest request) {
        return response(HttpStatus.UNAUTHORIZED, "Invalid or expired token.", request, List.of());
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiError> internalError(Exception exception, HttpServletRequest request) {
        logger.error("Unhandled API error for {} {}", request.getMethod(), request.getRequestURI(), exception);
        return response(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected server error occurred.", request, List.of());
    }

    private ApiError.ValidationError validationError(FieldError error) {
        return new ApiError.ValidationError(error.getField(), error.getRejectedValue(), error.getDefaultMessage());
    }

    private ResponseEntity<ApiError> response(
            HttpStatus status, String message, HttpServletRequest request, List<ApiError.ValidationError> details
    ) {
        return ResponseEntity.status(status).body(new ApiError(
                Instant.now(), status.value(), status.getReasonPhrase(), message, request.getRequestURI(), details
        ));
    }
}
