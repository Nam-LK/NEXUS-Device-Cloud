package com.nexus.devicecloud.exception;

import com.nexus.devicecloud.filter.CorrelationIdFilter;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Mọi lỗi trả về theo RFC 9457 (application/problem+json) kèm correlationId.
 * Thông điệp lỗi không chứa chi tiết nội bộ (SQL, stack trace).
 */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        List<Map<String, String>> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> Map.of("field", fe.getField(), "message", String.valueOf(fe.getDefaultMessage())))
                .toList();
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Request validation failed.");
        problem.setTitle("Validation failed");
        problem.setProperty("errors", errors);
        return handleExceptionInternal(ex, problem, new HttpHeaders(), HttpStatus.BAD_REQUEST, request);
    }

    @Override
    protected ResponseEntity<Object> createResponseEntity(
            Object body, HttpHeaders headers, HttpStatusCode statusCode, WebRequest request) {
        if (body instanceof ProblemDetail problem) {
            problem.setProperty("correlationId", MDC.get(CorrelationIdFilter.MDC_KEY));
        }
        return super.createResponseEntity(body, headers, statusCode, request);
    }

    @ExceptionHandler(NotFoundException.class)
    ResponseEntity<Object> handleNotFound(NotFoundException ex, WebRequest request) {
        return build(ex, HttpStatus.NOT_FOUND, "Not found", ex.getMessage(), request);
    }

    @ExceptionHandler(BadRequestException.class)
    ResponseEntity<Object> handleBadRequest(BadRequestException ex, WebRequest request) {
        return build(ex, HttpStatus.BAD_REQUEST, "Bad request", ex.getMessage(), request);
    }

    @ExceptionHandler(ConflictException.class)
    ResponseEntity<Object> handleConflict(ConflictException ex, WebRequest request) {
        return build(ex, HttpStatus.CONFLICT, "Conflict", ex.getMessage(), request);
    }

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    ResponseEntity<Object> handleOptimisticLock(ObjectOptimisticLockingFailureException ex, WebRequest request) {
        return build(ex, HttpStatus.CONFLICT, "Conflict",
                "The resource was modified by someone else. Reload it and try again.", request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<Object> handleDataIntegrity(DataIntegrityViolationException ex, WebRequest request) {
        log.warn("Data integrity violation: {}", ex.getMostSpecificCause().getClass().getSimpleName());
        return build(ex, HttpStatus.CONFLICT, "Conflict",
                "The request conflicts with existing data (for example a duplicate serial number).", request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<Object> handleAccessDenied(AccessDeniedException ex, WebRequest request) {
        return build(ex, HttpStatus.FORBIDDEN, "Forbidden",
                "You do not have permission to perform this action.", request);
    }

    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<Object> handleAuthentication(AuthenticationException ex, WebRequest request) {
        return build(ex, HttpStatus.UNAUTHORIZED, "Unauthorized",
                "Authentication is required, or the credentials are invalid.", request);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Object> handleUnexpected(Exception ex, WebRequest request) {
        log.error("Unexpected error", ex);
        return build(ex, HttpStatus.INTERNAL_SERVER_ERROR, "Internal error",
                "An unexpected error occurred. Quote the correlationId when reporting it.", request);
    }

    private ResponseEntity<Object> build(
            Exception ex, HttpStatus status, String title, String detail, WebRequest request) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setTitle(title);
        return handleExceptionInternal(ex, problem, new HttpHeaders(), status, request);
    }
}
